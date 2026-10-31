import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ACAO_SEGUINTE,
  ESTADO_ANTERIOR,
  esperaNovaTentativa,
  marcarGolo,
  mudarEstado,
  type ValoresMarcador,
} from "../src/lib/marcador.ts";

const agendado: ValoresMarcador = { estado: "agendado", golos_clube: null, golos_adversario: null };

test("o botão principal percorre o jogo todo e para no fim", () => {
  let v = agendado;
  const percurso: string[] = [];
  for (let acao = ACAO_SEGUINTE[v.estado]; acao; acao = ACAO_SEGUINTE[v.estado]) {
    percurso.push(acao.rotulo);
    v = mudarEstado(v, acao.seguinte);
  }
  assert.deepEqual(percurso, ["Começar jogo", "Intervalo", "Começar 2.ª parte", "Terminar jogo"]);
  assert.equal(v.estado, "final");
  assert.ok(ACAO_SEGUINTE.segunda_parte?.confirmar, "terminar pede confirmação");
});

test("começar o jogo põe 0-0", () => {
  assert.deepEqual(mudarEstado(agendado, "primeira_parte"), { estado: "primeira_parte", golos_clube: 0, golos_adversario: 0 });
});

test("não se marcam golos antes de começar, nem em jogos adiados", () => {
  assert.equal(marcarGolo(agendado, "clube", 1), null);
  assert.equal(marcarGolo({ ...agendado, estado: "adiado" }, "clube", 1), null);
});

test("golos sobem, descem e não ficam negativos", () => {
  let v = mudarEstado(agendado, "primeira_parte");
  v = marcarGolo(v, "clube", 1)!;
  v = marcarGolo(v, "clube", 1)!;
  v = marcarGolo(v, "adversario", 1)!;
  assert.deepEqual([v.golos_clube, v.golos_adversario], [2, 1]);
  v = marcarGolo(v, "adversario", -1)!;
  assert.equal(v.golos_adversario, 0);
  assert.equal(marcarGolo(v, "adversario", -1), null);
});

test("no intervalo e depois do final ainda se corrige o resultado", () => {
  const intervalo = { estado: "intervalo", golos_clube: 1, golos_adversario: 0 } as const;
  assert.equal(marcarGolo(intervalo, "adversario", 1)?.golos_adversario, 1);
  assert.equal(marcarGolo({ ...intervalo, estado: "final" }, "clube", -1)?.golos_clube, 0);
});

test("voltar atrás desfaz um toque por engano", () => {
  const comecado = mudarEstado(agendado, "primeira_parte");
  assert.deepEqual(mudarEstado(comecado, ESTADO_ANTERIOR.primeira_parte!), agendado);
  // Mas se já havia golos, não se perdem.
  const comGolo = marcarGolo(comecado, "clube", 1)!;
  assert.equal(mudarEstado(comGolo, "agendado").golos_clube, 1);
  assert.equal(ESTADO_ANTERIOR.final, "segunda_parte");
});

test("espera entre tentativas cresce até 30 s", () => {
  assert.deepEqual([0, 1, 2, 5, 10].map(esperaNovaTentativa), [1000, 2000, 4000, 30000, 30000]);
});
