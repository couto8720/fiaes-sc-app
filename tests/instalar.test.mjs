// Confirma que supabase/instalar/instalar-tudo.sql (as 7 migrações juntas, para colar no SQL Editor
// do Supabase quando a porta 5432 está bloqueada) instala tudo do zero e regista as migrações.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const raiz = join(import.meta.dirname, "..", "supabase");

async function novaBD() {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create publication supabase_realtime;
  `);
  await db.exec(readFileSync(join(raiz, "instalar", "instalar-tudo.sql"), "utf8"));
  return db;
}

test("importar-zerozero.sql: 14 escalões, 317 jogos, 13 classificações, sem duplicar", async () => {
  const db = await novaBD();
  const sql = readFileSync(join(raiz, "importar", "importar-zerozero.sql"), "utf8");
  await db.exec(sql);
  await db.exec(sql); // segunda vez: não pode duplicar

  const conta = async (t) => (await db.query(`select count(*)::int as n from public.${t}`)).rows[0].n;
  assert.equal(await conta("escaloes"), 14);
  assert.equal(await conta("jogos"), 317);
  assert.equal(await conta("classificacoes"), 172);
  assert.equal((await db.query("select count(distinct escalao_id)::int as n from public.classificacoes")).rows[0].n, 13);

  // Seniores, J8: São Roque 1–3 Fiães SC, fora, 25/10 às 15:30 (dia da mudança de hora: já é UTC+0).
  const { rows: [sr] } = await db.query(`
    select j.em_casa, j.golos_clube, j.golos_adversario, j.estado, j.jornada, j.data_hora, j.local_id
    from public.jogos j join public.escaloes e on e.id = j.escalao_id
    where e.slug = 'seniores' and j.adversario = 'São Roque' and j.estado = 'final'`);
  assert.deepEqual(
    { ...sr, data_hora: new Date(sr.data_hora).toISOString() },
    { em_casa: false, golos_clube: 3, golos_adversario: 1, estado: "final", jornada: 8, data_hora: "2026-10-25T15:30:00.000Z", local_id: null },
  );
  // Próximo jogo em casa dos Seniores: Argoncilhe, no Estádio do Bolhão, 15:30 de Lisboa.
  const { rows: [arg] } = await db.query(`
    select j.data_hora, l.nome as local from public.jogos j join public.escaloes e on e.id = j.escalao_id
    left join public.locais l on l.id = j.local_id where e.slug = 'seniores' and j.adversario = 'Argoncilhe' and j.em_casa`);
  assert.deepEqual({ ...arg, data_hora: new Date(arg.data_hora).toISOString() }, { data_hora: "2026-11-01T15:30:00.000Z", local: "Estádio do Bolhão" });

  // O Fiães SC (e as equipas B) ficam marcados na classificação.
  const { rows: clube } = await db.query(`
    select e.slug, c.posicao, c.equipa from public.classificacoes c join public.escaloes e on e.id = c.escalao_id
    where c.e_o_clube order by e.ordem`);
  assert.equal(clube.length, 13);
  assert.deepEqual(clube.slice(0, 2), [
    { slug: "seniores", posicao: 7, equipa: "Fiães SC" },
    { slug: "seniores-b", posicao: 7, equipa: "Fiães SC B" },
  ]);
});

test("instalar-tudo.sql corre do zero e regista as 7 migrações", async () => {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create publication supabase_realtime;
  `);
  await db.exec(readFileSync(join(raiz, "instalar", "instalar-tudo.sql"), "utf8"));

  const versoes = readdirSync(join(raiz, "migrations")).map((f) => f.split("_")[0]).sort();
  const { rows } = await db.query("select version from supabase_migrations.schema_migrations order by version");
  assert.deepEqual(rows.map((r) => r.version), versoes);

  const tabelas = await db.query(
    "select table_name from information_schema.tables where table_schema = 'public' order by 1",
  );
  assert.deepEqual(tabelas.rows.map((r) => r.table_name), [
    "classificacoes", "clube_config", "escaloes", "golos", "jogos", "locais", "perfis", "perfis_escaloes",
  ]);
  const { rows: cfg } = await db.query("select nome_curto, cor_primaria from public.clube_config");
  assert.deepEqual(cfg, [{ nome_curto: "Fiães SC", cor_primaria: "#0B6B35" }]);
});
