import { test } from "node:test";
import assert from "node:assert/strict";
import { filtrarJogos, filtroAtivo } from "../src/lib/filtroJogos.ts";

const esc = [{ slug: "seniores" }, { slug: "sub-13" }, { slug: "sub-15" }];
const jogos = [{ id: 1, escalao: { slug: "seniores" } }, { id: 2, escalao: { slug: "sub-13" } }, { id: 3, escalao: { slug: "sub-15" } }, { id: 4, escalao: null }];

test("filtro: todos, um escalão e 'os meus'", () => {
  assert.equal(filtroAtivo("", esc, null), "");
  assert.equal(filtroAtivo("sub-13", esc, null), "sub-13");
  assert.equal(filtroAtivo("inventado", esc, null), "");
  // "Os meus" só vale com adepto com escalões escolhidos.
  assert.equal(filtroAtivo("meus", esc, null), "");
  assert.equal(filtroAtivo("meus", esc, []), "");
  assert.equal(filtroAtivo("meus", esc, ["sub-13"]), "meus");

  assert.deepEqual(filtrarJogos(jogos, "", null).map((j) => j.id), [1, 2, 3, 4]);
  assert.deepEqual(filtrarJogos(jogos, "sub-15", null).map((j) => j.id), [3]);
  assert.deepEqual(filtrarJogos(jogos, "meus", ["seniores", "sub-13"]).map((j) => j.id), [1, 2]);
});
