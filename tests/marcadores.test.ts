import { test } from "node:test";
import assert from "node:assert/strict";
import { abreviarNome, melhoresMarcadores, resumoExpulsoes, resumoMarcadores, type Expulsao } from "../src/lib/marcadores.ts";

test("nome curto igual ao da base de dados", () => {
  assert.equal(abreviarNome("Tiago Martins Costa"), "Tiago C.");
  assert.equal(abreviarNome("  joão   pedro silva "), "joão S.");
  assert.equal(abreviarNome("Rui"), "Rui");
  assert.equal(abreviarNome("Rui p."), "Rui P.");
  assert.equal(abreviarNome("Ana Sofia Ávila"), "Ana Á.");
  assert.equal(abreviarNome("   "), "");
});

const g = (marcador: string, minuto: number | null, penalti = false) => ({ marcador, minuto, penalti });

test("resumo dos marcadores de um jogo", () => {
  const golos = [g("Rui P.", 55, true), g("Tiago C.", 40), g("Tiago C.", 12)];
  assert.equal(resumoMarcadores(golos), "Tiago C. 12' 40', Rui P. 55' (pen.)");
  assert.equal(resumoMarcadores(golos, { minutos: false }), "Tiago C. (2), Rui P.");
  assert.equal(resumoMarcadores([g("Hugo A.", null), g("Hugo A.", null)]), "Hugo A. (2)");
  assert.equal(resumoMarcadores([]), "");
});

test("melhores marcadores ignoram autogolos", () => {
  const r = melhoresMarcadores([g("Tiago C.", 1), g("Rui P.", 2), g("Tiago C.", 3), g("Autogolo", 4), g("André S.", 5)]);
  assert.deepEqual(r, [
    { marcador: "Tiago C.", golos: 2 },
    { marcador: "André S.", golos: 1 },
    { marcador: "Rui P.", golos: 1 },
  ]);
});

test("expulsões: texto por equipa, ordenado pelo minuto", () => {
  const exp: Expulsao[] = [
    { lado: "clube", atleta: "Rui P.", minuto: 67 },
    { lado: "adversario", atleta: null, minuto: 80 },
    { lado: "clube", atleta: null, minuto: 30 },
    { lado: "adversario", atleta: null, minuto: null },
  ];
  assert.equal(resumoExpulsoes(exp, "clube"), "30', Rui P. 67'");
  assert.equal(resumoExpulsoes(exp, "adversario"), "80', Expulsão");
  assert.equal(resumoExpulsoes([], "clube"), "");
});
