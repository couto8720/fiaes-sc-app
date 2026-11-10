// Testes das regras de acesso (RLS) e dos triggers, num Postgres embebido (PGlite).
// Simula o mínimo do Supabase (papéis anon/authenticated, auth.users, auth.uid()).
// Correr com: npm run test:db
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const raiz = join(import.meta.dirname, "..", "supabase");
const db = new PGlite();

const SUB13 = "00000000-0000-4000-a000-000000000013";
const SENIORES = "00000000-0000-4000-a000-000000000099";
const U = {
  super: "11111111-1111-4111-8111-111111111111",
  treinador13: "22222222-2222-4222-8222-222222222222",
  inativo: "33333333-3333-4333-8333-333333333333",
};

// Executa SQL como um papel do Supabase: "anon" ou o id de um utilizador autenticado.
async function como(quem, sql, params) {
  await db.exec("reset role");
  if (quem === "anon") {
    await db.query("select set_config('request.jwt.claim.sub', '', false)");
    await db.exec("set role anon");
  } else {
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [quem]);
    await db.exec("set role authenticated");
  }
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec("reset role");
  }
}

const umJogo = async (escalao) =>
  (await db.query("select id from public.jogos where escalao_id = $1 order by data_hora limit 1", [escalao])).rows[0].id;

before(async () => {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb, invited_at timestamptz);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create publication supabase_realtime;
    grant usage on schema auth, public to anon, authenticated;
    -- Permissões por omissão do Supabase (tudo para anon/authenticated); as migrações restringem-nas.
    alter default privileges in schema public grant all on tables to anon, authenticated;
  `);

  const migracoes = readdirSync(join(raiz, "migrations")).filter((f) => f.endsWith(".sql")).sort();
  for (const f of migracoes) await db.exec(readFileSync(join(raiz, "migrations", f), "utf8"));
  await db.exec(readFileSync(join(raiz, "seed.sql"), "utf8"));

  await db.query(
    `insert into auth.users (id, email, raw_user_meta_data, invited_at) values
       ($1, 'super@clube.pt', '{"nome":"Super"}', now()),
       ($2, 'sub13@clube.pt', '{"nome":"Treinador Sub-13"}', now()),
       ($3, 'saiu@clube.pt',  null, now())`,
    [U.super, U.treinador13, U.inativo],
  );
  await db.query("update public.perfis set papel = 'super_admin' where id = $1", [U.super]);
  await db.query("update public.perfis set ativo = false where id = $1", [U.inativo]);
  await db.query(
    "insert into public.perfis_escaloes values ($1, $3), ($2, $3)",
    [U.treinador13, U.inativo, SUB13],
  );
});

test("novo utilizador recebe perfil de treinador automaticamente", async () => {
  const { rows } = await db.query("select nome, email, papel from public.perfis where id = $1", [U.inativo]);
  assert.deepEqual(rows[0], { nome: "saiu@clube.pt", email: "saiu@clube.pt", papel: "treinador" });
});

test("público lê jogos, escalões e classificações", async () => {
  assert.ok((await como("anon", "select * from public.jogos")).rows.length > 0);
  assert.equal((await como("anon", "select * from public.escaloes")).rows.length, 4);
  assert.ok((await como("anon", "select * from public.classificacoes")).rows.length > 0);
});

test("público não vê perfis nem atribuições", async () => {
  await assert.rejects(como("anon", "select * from public.perfis"), /permission denied/);
  await assert.rejects(como("anon", "select * from public.perfis_escaloes"), /permission denied/);
});

test("público não altera, cria nem apaga jogos", async () => {
  const id = await umJogo(SUB13);
  await assert.rejects(como("anon", "update public.jogos set golos_clube = 99 where id = $1", [id]), /permission denied/);
  await assert.rejects(
    como("anon", "insert into public.jogos (escalao_id, data_hora, em_casa, adversario) values ($1, now(), true, 'X')", [SUB13]),
    /permission denied/,
  );
  await assert.rejects(como("anon", "delete from public.jogos where id = $1", [id]), /permission denied/);
  const { rows } = await db.query("select golos_clube from public.jogos where id = $1", [id]);
  assert.notEqual(rows[0].golos_clube, 99);
});

test("treinador edita jogos do seu escalão", async () => {
  const id = await umJogo(SUB13);
  const r = await como(U.treinador13, "update public.jogos set golos_clube = 4 where id = $1", [id]);
  assert.equal(r.affectedRows, 1);
});

test("treinador não edita jogos de outro escalão", async () => {
  const id = await umJogo(SENIORES);
  const r = await como(U.treinador13, "update public.jogos set golos_clube = 9 where id = $1", [id]);
  assert.equal(r.affectedRows, 0);
  await assert.rejects(
    como(U.treinador13, "insert into public.jogos (escalao_id, data_hora, em_casa, adversario) values ($1, now(), true, 'X')", [SENIORES]),
  );
});

test("treinador não move um jogo seu para outro escalão (erro de RLS, não outro)", async () => {
  const id = await umJogo(SUB13);
  await assert.rejects(
    como(U.treinador13, "update public.jogos set escalao_id = $2 where id = $1", [id, SENIORES]),
    /row-level security/,
  );
  // Controlo: a mesma operação feita pelo super-admin funciona.
  assert.equal((await como(U.super, "update public.jogos set escalao_id = $2 where id = $1", [id, SENIORES])).affectedRows, 1);
  await como(U.super, "update public.jogos set escalao_id = $2 where id = $1", [id, SUB13]);
});

test("treinador cria jogos e classificações só no seu escalão", async () => {
  const r = await como(
    U.treinador13,
    "insert into public.jogos (escalao_id, data_hora, em_casa, adversario) values ($1, now() + interval '20 days', true, 'Novo FC') returning id",
    [SUB13],
  );
  assert.equal(r.rows.length, 1);
  await como(U.treinador13, "insert into public.classificacoes (escalao_id, posicao, equipa) values ($1, 9, 'Novo FC')", [SUB13]);
  await assert.rejects(
    como(U.treinador13, "insert into public.classificacoes (escalao_id, posicao, equipa) values ($1, 9, 'Novo FC')", [SENIORES]),
  );
});

test("treinador não se promove a super-admin nem mexe em escalões", async () => {
  const r = await como(U.treinador13, "update public.perfis set papel = 'super_admin' where id = $1", [U.treinador13]);
  assert.equal(r.affectedRows, 0);
  const e = await como(U.treinador13, "update public.escaloes set nome = 'X' where id = $1", [SUB13]);
  assert.equal(e.affectedRows, 0);
  await assert.rejects(
    como(U.treinador13, "insert into public.perfis_escaloes values ($1, $2)", [U.treinador13, SENIORES]),
  );
});

test("treinador só vê o seu perfil", async () => {
  const { rows } = await como(U.treinador13, "select id from public.perfis");
  assert.deepEqual(rows.map((r) => r.id), [U.treinador13]);
});

test("treinador desativado perde o acesso", async () => {
  const id = await umJogo(SUB13);
  const r = await como(U.inativo, "update public.jogos set golos_clube = 7 where id = $1", [id]);
  assert.equal(r.affectedRows, 0);
});

test("super-admin edita tudo e gere escalões e perfis", async () => {
  const id = await umJogo(SENIORES);
  assert.equal((await como(U.super, "update public.jogos set notas = 'ok' where id = $1", [id])).affectedRows, 1);
  assert.equal((await como(U.super, "update public.escaloes set ordem = 9 where id = $1", [SENIORES])).affectedRows, 1);
  assert.equal((await como(U.super, "select * from public.perfis")).rows.length, 3);
  await como(U.super, "insert into public.perfis_escaloes values ($1, $2)", [U.treinador13, SENIORES]);
  await como(U.super, "delete from public.perfis_escaloes where perfil_id = $1 and escalao_id = $2", [U.treinador13, SENIORES]);
});

test("trigger: começar o jogo põe 0-0, muda estado_desde e regista o autor", async () => {
  const { rows } = await db.query(
    "select id, estado_desde from public.jogos where escalao_id = $1 and estado = 'agendado' and golos_clube is null limit 1",
    [SUB13],
  );
  const antes = rows[0];
  await new Promise((r) => setTimeout(r, 20));
  await como(U.treinador13, "update public.jogos set estado = 'primeira_parte' where id = $1", [antes.id]);
  const depois = (await db.query("select * from public.jogos where id = $1", [antes.id])).rows[0];
  assert.equal(depois.golos_clube, 0);
  assert.equal(depois.golos_adversario, 0);
  assert.equal(depois.atualizado_por, U.treinador13);
  assert.ok(depois.estado_desde > antes.estado_desde);
});

const linha = (posicao, equipa, extra = {}) => ({
  posicao, equipa, e_o_clube: false, jogos: 5, vitorias: 3, empates: 1, derrotas: 1,
  golos_marcados: 9, golos_sofridos: 6, pontos: 10, ...extra,
});
const classificacaoDe = async (escalao) =>
  (await db.query("select posicao, equipa from public.classificacoes where escalao_id = $1 order by posicao", [escalao])).rows;

test("substituir classificação: treinador no seu escalão troca a tabela inteira", async () => {
  const nova = [linha(1, "CD Exemplo", { e_o_clube: true }), linha(2, "Novo Rival")];
  await como(U.treinador13, "select public.substituir_classificacao($1, $2::jsonb)", [SUB13, JSON.stringify(nova)]);
  assert.deepEqual(await classificacaoDe(SUB13), [
    { posicao: 1, equipa: "CD Exemplo" },
    { posicao: 2, equipa: "Novo Rival" },
  ]);
});

test("substituir classificação: noutro escalão é recusado e nada muda", async () => {
  const antes = await classificacaoDe(SENIORES);
  await assert.rejects(
    como(U.treinador13, "select public.substituir_classificacao($1, $2::jsonb)", [SENIORES, JSON.stringify([linha(1, "X")])]),
    /Sem permissão/,
  );
  assert.deepEqual(await classificacaoDe(SENIORES), antes);
});

test("substituir classificação: o público não pode chamar a função", async () => {
  await assert.rejects(
    como("anon", "select public.substituir_classificacao($1, $2::jsonb)", [SUB13, "[]"]),
    /permission denied/,
  );
});

test("substituir classificação: uma linha inválida desfaz tudo (equipa repetida)", async () => {
  const antes = await classificacaoDe(SUB13);
  await assert.rejects(
    como(U.treinador13, "select public.substituir_classificacao($1, $2::jsonb)", [
      SUB13,
      JSON.stringify([linha(1, "Repetida"), linha(2, "Repetida")]),
    ]),
  );
  assert.deepEqual(await classificacaoDe(SUB13), antes);
});

test("configuração do Fiães SC vem da migração (verde e amarelo)", async () => {
  const { rows } = await como("anon", "select nome_curto, cor_primaria, cor_destaque, hashtag from public.clube_config");
  assert.deepEqual(rows, [{ nome_curto: "Fiães SC", cor_primaria: "#0B6B35", cor_destaque: "#FFD100", hashtag: "#FiaesSC" }]);
});

test("nome do marcador fica sempre na forma curta", async () => {
  const casos = {
    "Tiago Martins Costa": "Tiago C.",
    "  joão   pedro silva ": "joão S.",
    "Rui": "Rui",
    "Rui p.": "Rui P.",
    "Autogolo": "Autogolo",
    "Ana Sofia Ávila": "Ana Á.",
  };
  for (const [entrada, esperado] of Object.entries(casos)) {
    const { rows } = await db.query("select public.abreviar_nome($1) as n", [entrada]);
    assert.equal(rows[0].n, esperado, entrada);
  }
  // O seed escreveu nomes completos; na tabela só ficaram os curtos.
  const { rows } = await como("anon", "select distinct marcador from public.golos order by 1");
  assert.ok(rows.every((r) => /^\S+( \S\.)?$/.test(r.marcador)), JSON.stringify(rows));
});

test("golos: público lê; treinador grava no seu escalão; noutro não", async () => {
  const jogo13 = "00000000-0000-4000-c000-000000000001";
  const jogoSen = "00000000-0000-4000-c000-000000000004";
  assert.ok((await como("anon", "select * from public.golos")).rows.length >= 8);
  await assert.rejects(como("anon", "insert into public.golos (jogo_id, marcador) values ($1, 'X Y')", [jogo13]), /permission denied/);

  const r = await como(U.treinador13, "insert into public.golos (jogo_id, marcador, minuto) values ($1, 'Pedro Nuno Gomes', 70) returning marcador", [jogo13]);
  assert.equal(r.rows[0].marcador, "Pedro G.");
  await assert.rejects(
    como(U.treinador13, "insert into public.golos (jogo_id, marcador) values ($1, 'Intruso Teste')", [jogoSen]),
    /row-level security/,
  );
  const apagar = await como(U.treinador13, "delete from public.golos where jogo_id = $1", [jogoSen]);
  assert.equal(apagar.affectedRows, 0);
  await assert.rejects(como(U.treinador13, "insert into public.golos (jogo_id, marcador) values ($1, '   ')", [jogo13]));
});

test("expulsões: público lê; treinador regista no seu escalão com nome curto; noutro não", async () => {
  const jogo13 = "00000000-0000-4000-c000-000000000001";
  const jogoSen = "00000000-0000-4000-c000-000000000004";
  await assert.rejects(como("anon", "insert into public.expulsoes (jogo_id, lado) values ($1, 'clube')", [jogo13]), /permission denied/);

  const r = await como(
    U.treinador13,
    "insert into public.expulsoes (jogo_id, lado, atleta, minuto) values ($1, 'clube', 'Rui Miguel Pinto', 67), ($1, 'adversario', null, 80), ($1, 'clube', '   ', null) returning lado, atleta, minuto",
    [jogo13],
  );
  assert.deepEqual(r.rows, [
    { lado: "clube", atleta: "Rui P.", minuto: 67 },
    { lado: "adversario", atleta: null, minuto: 80 },
    { lado: "clube", atleta: null, minuto: null },
  ]);
  assert.equal((await como("anon", "select * from public.expulsoes where jogo_id = $1", [jogo13])).rows.length, 3);
  await assert.rejects(como(U.treinador13, "insert into public.expulsoes (jogo_id, lado) values ($1, 'arbitro')", [jogo13]));
  await assert.rejects(
    como(U.treinador13, "insert into public.expulsoes (jogo_id, lado) values ($1, 'clube')", [jogoSen]),
    /row-level security/,
  );
  const apagar = await como(U.treinador13, "delete from public.expulsoes where jogo_id = $1", [jogo13]);
  assert.equal(apagar.affectedRows, 3);
});

test("funções internas: sem sessão não se chamam; o staff continua a usá-las nas regras", async () => {
  for (const f of ["is_super_admin()", "is_admin_ativo()", "criar_perfil_novo_utilizador()"]) {
    await assert.rejects(como("anon", `select public.${f}`), /permission denied/, f);
  }
  await assert.rejects(como("anon", "select public.pode_editar_jogo('00000000-0000-4000-c000-000000000001')"), /permission denied/);
  await assert.rejects(como(U.treinador13, "select public.criar_perfil_novo_utilizador()"), /permission denied/);
  const r = await como(U.treinador13, "select public.pode_editar_jogo('00000000-0000-4000-c000-000000000001') as pode");
  assert.equal(r.rows[0].pode, true);
  // O público continua a ler tudo o que é público.
  assert.ok((await como("anon", "select * from public.jogos")).rows.length > 0);
});

test("adeptos: registo cria conta de adepto (nunca staff) e só altera a sua", async () => {
  const A1 = "55555555-5555-4555-8555-555555555555";
  const A2 = "66666666-6666-4666-8666-666666666666";
  await db.query(
    `insert into auth.users (id, email, raw_user_meta_data) values ($1, 'pai@mail.pt', '{"nome":"Pai do Tiago"}'), ($2, 'socia@mail.pt', null)`,
    [A1, A2],
  );
  // Não ganham perfil de staff: não criam locais nem mexem em jogos.
  assert.equal((await db.query("select count(*)::int n from public.perfis where id in ($1, $2)", [A1, A2])).rows[0].n, 0);
  await assert.rejects(como(A1, "insert into public.locais (nome) values ('Campo pirata')"), /row-level security/);
  const jogo = await como(A1, "update public.jogos set golos_clube = 9 returning id");
  assert.equal(jogo.rows.length, 0);

  // Conta de adepto criada, com o nome (ou a parte do email antes do @).
  const { rows: contas } = await db.query("select id, nome from public.adeptos where id in ($1, $2) order by nome", [A1, A2]);
  assert.deepEqual(contas.map((c) => c.nome), ["Pai do Tiago", "socia"]);

  // Cada um vê e altera só a sua conta.
  assert.equal((await como(A1, "select * from public.adeptos")).rows.length, 1);
  const r = await como(A1, "update public.adeptos set numero_socio = '1234', escaloes = '{sub-13,seniores}' where id = $1 returning numero_socio", [A1]);
  assert.equal(r.rows[0].numero_socio, "1234");
  const alheio = await como(A1, "update public.adeptos set nome = 'Hacker' where id = $1", [A2]);
  assert.equal(alheio.affectedRows, 0);
  await assert.rejects(como(A1, "update public.adeptos set id = $2 where id = $1", [A1, A2]), /permission denied/);
  await assert.rejects(como("anon", "select * from public.adeptos"), /permission denied/);
  // O super-admin vê todas as contas de adeptos.
  assert.ok((await como(U.super, "select * from public.adeptos")).rows.length >= 2);
});

test("adeptos: convite depois do registo passa a pessoa a staff", async () => {
  const id = "77777777-7777-4777-8777-777777777777";
  await db.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, 'treinador@mail.pt', '{\"nome\":\"Novo Treinador\"}')", [id]);
  assert.equal((await db.query("select count(*)::int n from public.adeptos where id = $1", [id])).rows[0].n, 1);
  await db.query("update auth.users set invited_at = now() where id = $1", [id]);
  assert.equal((await db.query("select count(*)::int n from public.adeptos where id = $1", [id])).rows[0].n, 0);
  const { rows } = await db.query("select nome, papel from public.perfis where id = $1", [id]);
  assert.deepEqual(rows, [{ nome: "Novo Treinador", papel: "treinador" }]);
});

test("apagar conta: o adepto apaga só a sua; o staff e o público não podem", async () => {
  const A = "88888888-8888-4888-8888-888888888888";
  const B = "99999999-9999-4999-8999-999999999999";
  await db.query(
    `insert into auth.users (id, email, raw_user_meta_data) values ($1, 'apaga@mail.pt', '{"nome":"Vai Sair"}'), ($2, 'fica@mail.pt', '{"nome":"Fica"}')`,
    [A, B],
  );
  await assert.rejects(como("anon", "select public.apagar_minha_conta()"), /permission denied/);
  await assert.rejects(como(U.treinador13, "select public.apagar_minha_conta()"), /staff/);

  await como(A, "select public.apagar_minha_conta()");
  const conta = async (id) => (await db.query(
    "select (select count(*)::int from auth.users where id = $1) + (select count(*)::int from public.adeptos where id = $1) as n", [id],
  )).rows[0].n;
  assert.equal(await conta(A), 0); // login e dados de adepto apagados
  assert.equal(await conta(B), 2); // a conta dos outros fica
  // O staff continua lá.
  assert.equal((await db.query("select count(*)::int n from auth.users where id = $1", [U.treinador13])).rows[0].n, 1);
});

test("cor do clube tem de ser hexadecimal", async () => {
  await assert.rejects(como(U.super, "update public.clube_config set cor_primaria = 'azul'"));
});
