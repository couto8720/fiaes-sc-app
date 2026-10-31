import { test } from "node:test";
import assert from "node:assert/strict";
import { agruparPorSemana, segundaDaSemana } from "../src/lib/jogos.ts";

test("segunda-feira da semana", () => {
  assert.equal(segundaDaSemana("2026-10-31"), "2026-10-26"); // sábado
  assert.equal(segundaDaSemana("2026-11-01"), "2026-10-26"); // domingo ainda é desta semana
  assert.equal(segundaDaSemana("2026-11-02"), "2026-11-02"); // segunda
  assert.equal(segundaDaSemana("2027-01-01"), "2026-12-28"); // muda de ano
});

const j = (id: string, data_hora: string, estado = "agendado") => ({ id, data_hora, estado: estado as never });

test("feed agrupado: ao vivo, esta semana, próxima semana, anteriores", () => {
  // Sábado, 31/10/2026, 10:00 em Lisboa.
  const agora = Date.parse("2026-10-31T10:00:00Z");
  const g = agruparPorSemana(
    [
      j("domingo-1-11", "2026-11-01T15:30:00Z"),
      j("ao-vivo", "2026-10-31T09:00:00Z", "segunda_parte"),
      j("sabado-final", "2026-10-31T08:00:00Z", "final"),
      j("segunda-27-terminado", "2026-10-27T19:00:00Z", "final"),
      j("proxima-quarta", "2026-11-04T19:00:00Z"),
      j("proximo-domingo", "2026-11-08T15:00:00Z"),
      j("daqui-a-2-semanas", "2026-11-09T19:00:00Z"),
      j("domingo-passado", "2026-10-25T15:30:00Z", "final"),
      j("ha-15-dias", "2026-10-17T15:30:00Z", "final"),
      j("passado-sem-resultado", "2026-10-24T09:00:00Z"),
    ],
    agora,
  );
  assert.deepEqual(g.aoVivo.map((x) => x.id), ["ao-vivo"]);
  assert.deepEqual(g.estaSemana.map((x) => x.id), ["segunda-27-terminado", "sabado-final", "domingo-1-11"]);
  assert.deepEqual(g.proximaSemana.map((x) => x.id), ["proxima-quarta", "proximo-domingo"]);
  assert.deepEqual(g.anteriores.map((x) => x.id), ["domingo-passado", "ha-15-dias"]);
});

test("domingo à noite em Lisboa ainda conta como esta semana", () => {
  // 01/11/2026 23:30 em Lisboa = 23:30Z (inverno).
  const g = agruparPorSemana([j("jogo-domingo", "2026-11-01T23:00:00Z")], Date.parse("2026-11-01T23:30:00Z"));
  assert.equal(g.estaSemana.length, 1);
});
