// Testes das datas (Lisboa ↔ UTC) e da validação dos formulários do painel.
// O Node 24 corre TypeScript diretamente: npm run test:db
import { test } from "node:test";
import assert from "node:assert/strict";
import { isoParaLisboa, lisboaParaISO } from "../src/lib/datas.ts";
import {
  destinoSeguro,
  slugificar,
  validarClassificacao,
  validarClube,
  validarConvite,
  validarEscalao,
  validarJogo,
  validarLocal,
} from "../src/lib/validacao.ts";

const linhaC = (posicao: number, equipa: string, extra = {}) => ({
  posicao, equipa, e_o_clube: false, jogos: 5, vitorias: 3, empates: 1, derrotas: 1,
  golos_marcados: 9, golos_sofridos: 6, pontos: 10, ...extra,
});

test("classificação válida fica ordenada por posição; penalização (pontos negativos) é aceite", () => {
  const r = validarClassificacao([linhaC(2, " Outro  SC "), linhaC(1, "CD Exemplo", { e_o_clube: true, pontos: -3 })]);
  assert.ok(r.ok);
  assert.deepEqual(r.dados.map((l) => [l.posicao, l.equipa, l.pontos]), [[1, "CD Exemplo", -3], [2, "Outro SC", 10]]);
});

test("classificação: equipas e posições repetidas, campos vazios e dois clubes são recusados", () => {
  const r = validarClassificacao([
    linhaC(1, "A", { e_o_clube: true }),
    linhaC(1, "a", { e_o_clube: true }),
    linhaC(3, "", { jogos: "" }),
  ]);
  assert.ok(!r.ok);
  const msg = r.erros.tabela;
  assert.match(msg, /linha 2: “a” aparece repetida/);
  assert.match(msg, /posição 1 repetida/);
  assert.match(msg, /linha 3: falta o nome/);
  assert.ok(!validarClassificacao("x").ok);
});

test("hora de Lisboa → UTC, no inverno e no verão", () => {
  assert.equal(lisboaParaISO("2026-11-07", "15:00"), "2026-11-07T15:00:00.000Z"); // inverno: UTC+0
  assert.equal(lisboaParaISO("2026-07-04", "15:00"), "2026-07-04T14:00:00.000Z"); // verão: UTC+1
  // Dia da mudança de hora (25/10/2026, 02:00 → 01:00): de manhã já é inverno.
  assert.equal(lisboaParaISO("2026-10-25", "11:00"), "2026-10-25T11:00:00.000Z");
  assert.equal(lisboaParaISO("2026-03-29", "11:00"), "2026-03-29T10:00:00.000Z");
});

test("datas inválidas são recusadas", () => {
  assert.equal(lisboaParaISO("2026-02-31", "15:00"), null);
  assert.equal(lisboaParaISO("2026-13-01", "15:00"), null);
  assert.equal(lisboaParaISO("2026-11-07", "25:00"), null);
  assert.equal(lisboaParaISO("", ""), null);
});

test("UTC → hora de Lisboa e ida-e-volta", () => {
  assert.deepEqual(isoParaLisboa("2026-07-04T14:00:00.000Z"), { data: "2026-07-04", hora: "15:00" });
  assert.deepEqual(isoParaLisboa("2026-11-07T23:30:00.000Z"), { data: "2026-11-07", hora: "23:30" });
  const { data, hora } = isoParaLisboa("2026-08-15T18:45:00.000Z");
  assert.equal(lisboaParaISO(data, hora), "2026-08-15T18:45:00.000Z");
});

const jogoBase = {
  escalao_id: "e1", data: "2026-11-07", hora: "15:00", em_casa: "1", adversario: "  Outro SC ", estado: "agendado",
};

test("jogo válido é normalizado", () => {
  const r = validarJogo({ ...jogoBase, jornada: "6", local_id: "l1", competicao: "" });
  assert.ok(r.ok);
  assert.equal(r.dados.adversario, "Outro SC");
  assert.equal(r.dados.jornada, 6);
  assert.equal(r.dados.competicao, null);
  assert.equal(r.dados.em_casa, true);
  assert.equal(r.dados.data_hora, "2026-11-07T15:00:00.000Z");
});

test("jogo: erros nos campos obrigatórios e nos golos", () => {
  const r = validarJogo({ em_casa: "x", golos_clube: "2" });
  assert.ok(!r.ok);
  assert.deepEqual(Object.keys(r.erros).sort(), ["adversario", "data", "em_casa", "escalao_id", "golos"]);
  const f = validarJogo({ ...jogoBase, estado: "final" });
  assert.ok(!f.ok && f.erros.golos);
  const n = validarJogo({ ...jogoBase, golos_clube: "-1", golos_adversario: "0" });
  assert.ok(!n.ok && n.erros.golos);
});

test("jogo: um local novo substitui o escolhido na lista", () => {
  const r = validarJogo({ ...jogoBase, local_id: "l1", novo_local: "Campo Novo" });
  assert.ok(r.ok);
  assert.equal(r.dados.local_id, null);
  assert.equal(r.dados.novo_local, "Campo Novo");
});

test("local: link do Maps tem de ser https", () => {
  assert.ok(!validarLocal({ nome: "Campo", maps_url: "javascript:alert(1)" }).ok);
  assert.ok(validarLocal({ nome: "Campo", maps_url: "https://maps.google.com/?q=x" }).ok);
});

test("escalão: endereço gerado a partir do nome", () => {
  assert.equal(slugificar("Sub-13 Feminino Ação"), "sub-13-feminino-acao");
  const r = validarEscalao({ nome: "Sub-11", epoca: "2026/27", ordem: "", ativo: "on" });
  assert.ok(r.ok);
  assert.deepEqual(r.dados, { nome: "Sub-11", slug: "sub-11", ordem: 0, epoca: "2026/27", competicao: null, ativo: true });
  assert.ok(!validarEscalao({ nome: "Sub-11", epoca: "26/27" }).ok);
});

test("convite: email e papel", () => {
  assert.ok(!validarConvite({ nome: "Ana", email: "ana@", papel: "treinador" }).ok);
  assert.ok(!validarConvite({ nome: "Ana", email: "ana@clube.pt", papel: "dono" }).ok);
  const r = validarConvite({ nome: "Ana", email: " Ana@Clube.PT " });
  assert.ok(r.ok);
  assert.equal(r.dados.email, "ana@clube.pt");
  assert.equal(r.dados.papel, "treinador");
});

test("configuração do clube: cores, hashtag e logótipo", () => {
  const base = { nome: "Fiães Sport Clube", nome_curto: "Fiães SC", cor_primaria: "#0b6b35", cor_secundaria: "#ffffff", cor_destaque: "#FFD100" };
  const r = validarClube({ ...base, hashtag: "FiãesSC", logo_url: "" });
  assert.ok(r.ok);
  assert.equal(r.dados.cor_primaria, "#0B6B35");
  assert.equal(r.dados.hashtag, "#FiãesSC");
  assert.equal(r.dados.logo_url, null);
  const mau = validarClube({ ...base, cor_destaque: "amarelo", hashtag: "#Fiães SC", logo_url: "http://x.pt/l.png" });
  assert.ok(!mau.ok);
  assert.deepEqual(Object.keys(mau.erros).sort(), ["cor_destaque", "hashtag", "logo_url"]);
});

test("redirecionamento após login só para o painel", () => {
  assert.equal(destinoSeguro("/admin/jogos"), "/admin/jogos");
  assert.equal(destinoSeguro("https://mau.site"), "/admin");
  assert.equal(destinoSeguro("//mau.site"), "/admin");
  assert.equal(destinoSeguro("/admin/../../x"), "/admin");
  assert.equal(destinoSeguro(null), "/admin");
});
