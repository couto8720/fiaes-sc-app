import { test } from "node:test";
import assert from "node:assert/strict";
import { eOClube, lerTabelaColada, problemasLinha } from "../src/lib/colarTabela.ts";

const CLUBE = ["CD Exemplo", "Clube Desportivo Exemplo"];
const resumo = (t: string) =>
  lerTabelaColada(t, CLUBE).linhas.map((l) =>
    [l.posicao, l.equipa, l.jogos, l.vitorias, l.empates, l.derrotas, l.golos_marcados, l.golos_sofridos, l.pontos, l.e_o_clube ? "★" : ""].join(" "),
  );

test("tabela HTML copiada (tabulações) com cabeçalho e golos juntos", () => {
  const texto = [
    "Pos\tEquipa\tJ\tV\tE\tD\tGolos\tPts",
    "1\tCD Exemplo\t5\t4\t1\t0\t14:4\t13",
    "2\tAcadémico Norte\t5\t4\t0\t1\t11:5\t12",
    "3\tAtlético Vale\t5\t2\t1\t2\t8:9\t7",
  ].join("\n");
  assert.deepEqual(resumo(texto), [
    "1 CD Exemplo 5 4 1 0 14 4 13 ★",
    "2 Académico Norte 5 4 0 1 11 5 12 ",
    "3 Atlético Vale 5 2 1 2 8 9 7 ",
  ]);
});

test("sem cabeçalho e com pontos logo a seguir ao nome: descobre a ordem pelas contas", () => {
  const texto = [
    "1. União da Serra 15 5 5 0 0 16 2 14",
    "2. Outro SC 10 5 3 1 1 9 6 3",
    "3. C.D. Exemplo 9 5 3 0 2 10 7 3",
  ].join("\n");
  assert.deepEqual(resumo(texto), [
    "1 União da Serra 5 5 0 0 16 2 15 ",
    "2 Outro SC 5 3 1 1 9 6 10 ",
    "3 C.D. Exemplo 5 3 0 2 10 7 9 ★",
  ]);
});

test("diferença de golos negativa e pontos no fim", () => {
  const r = resumo("4\tVizinhos AD\t5\t1\t1\t3\t4\t9\t-5\t4");
  assert.deepEqual(r, ["4 Vizinhos AD 5 1 1 3 4 9 4 "]);
});

test("células em linhas separadas (cópia de algumas tabelas) são juntas", () => {
  const texto = ["1", "CD Exemplo", "5\t4\t1\t0\t14\t4\t13", "2", "Outro SC", "5\t3\t1\t1\t9\t6\t10"].join("\n");
  assert.deepEqual(resumo(texto), ["1 CD Exemplo 5 4 1 0 14 4 13 ★", "2 Outro SC 5 3 1 1 9 6 10 "]);
});

test("ignora lixo à volta da tabela e avisa quando não há nada", () => {
  const r = lerTabelaColada("Classificação\nÚltima atualização: 27/10\n\n1 CD Exemplo 5 4 1 0 14 4 13\nVer mais", CLUBE);
  assert.equal(r.linhas.length, 1);
  const vazio = lerTabelaColada("olá", CLUBE);
  assert.equal(vazio.linhas.length, 0);
  assert.match(vazio.avisos[0], /Não encontrei/);
});

test("penalização de pontos: grava, mas avisa", () => {
  const r = lerTabelaColada("1 CD Exemplo 5 4 1 0 14 4 10\n2 Outro SC 5 3 1 1 9 6 10\n3 Rio FC 5 1 0 4 3 9 3", CLUBE);
  assert.equal(r.linhas[0].pontos, 10);
  assert.deepEqual(problemasLinha(r.linhas[0]), ["Pts ≠ 3V+E"]);
  assert.match(r.avisos.join(" "), /não batem certo/);
});

test("reconhece a equipa do clube sem confundir com nomes parecidos", () => {
  assert.ok(eOClube("C.D. Exemplo", CLUBE));
  assert.ok(eOClube("CD Exemplo B", CLUBE));
  assert.ok(eOClube("Clube Desportivo Exemplo", CLUBE));
  assert.ok(!eOClube("Exemplo Futebol Clube", CLUBE));
  assert.ok(!eOClube("Académico Norte", CLUBE));
});
