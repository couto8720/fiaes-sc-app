import { test } from "node:test";
import assert from "node:assert/strict";
import { fimDeSemanaAte, formatarIntervalo, intervaloUTC, somarDias } from "../src/lib/datas.ts";
import { itensPost, paginar, textoPost, type JogoPost } from "../src/lib/post.ts";

test("fim de semana por omissão: o mais recente até hoje", () => {
  assert.deepEqual(fimDeSemanaAte("2026-10-28"), { de: "2026-10-24", ate: "2026-10-25" }); // quarta
  assert.deepEqual(fimDeSemanaAte("2026-10-25"), { de: "2026-10-24", ate: "2026-10-25" }); // domingo
  assert.deepEqual(fimDeSemanaAte("2026-10-24"), { de: "2026-10-24", ate: "2026-10-25" }); // sábado
  assert.deepEqual(fimDeSemanaAte("2026-10-30"), { de: "2026-10-24", ate: "2026-10-25" }); // sexta
  assert.deepEqual(fimDeSemanaAte("2026-11-02"), { de: "2026-10-31", ate: "2026-11-01" }); // segunda, muda de mês
});

test("intervalo em UTC cobre os dois dias inteiros em Lisboa (com mudança de hora)", () => {
  assert.equal(somarDias("2026-12-31", 1), "2027-01-01");
  // 25/10/2026: muda a hora; sábado ainda é verão (UTC+1)
  assert.deepEqual(intervaloUTC("2026-10-24", "2026-10-25"), {
    desde: "2026-10-23T23:00:00.000Z",
    ateExclusivo: "2026-10-26T00:00:00.000Z",
  });
});

test("datas do cabeçalho", () => {
  assert.equal(formatarIntervalo("2026-10-24", "2026-10-25"), "24–25 out. 2026");
  assert.equal(formatarIntervalo("2026-10-31", "2026-11-01"), "31 out. – 1 nov. 2026");
  assert.equal(formatarIntervalo("2026-12-31", "2027-01-01"), "31 dez. 2026 – 1 jan. 2027");
});

const jogo = (escalao: string, ordem: number, extra: Partial<JogoPost>): JogoPost => ({
  id: `${escalao}-${extra.adversario}`, em_casa: true, adversario: "X", golos_clube: null, golos_adversario: null,
  estado: "final", data_hora: "2026-10-24T15:00:00Z", escalao: { nome: escalao, ordem }, ...extra,
});

const JOGOS: JogoPost[] = [
  jogo("Seniores", 4, { adversario: "Vizinhos AD", em_casa: false, golos_clube: 1, golos_adversario: 0 }),
  jogo("Sub-13", 1, { adversario: "Atlético Vale", golos_clube: 3, golos_adversario: 1 }),
  jogo("Sub-15", 2, { adversario: "União da Serra", em_casa: false, golos_clube: 0, golos_adversario: 2 }),
  jogo("Sub-17", 3, { adversario: "Recreativo Sul", estado: "adiado" }),
  jogo("Sub-17", 3, { adversario: "Agendado FC", estado: "agendado" }),
  jogo("Sub-11", 0, { adversario: "Rio FC", golos_clube: 2, golos_adversario: 2 }),
];

test("o post tem só jogos terminados/adiados, por ordem de escalão, com a casa primeiro", () => {
  const itens = itensPost(JOGOS, "CD Exemplo");
  assert.deepEqual(
    itens.map((i) => `${i.escalao}: ${i.casa.nome} ${i.casa.golos ?? ""}-${i.fora.golos ?? ""} ${i.fora.nome} ${i.desfecho ?? i.nota}`),
    [
      "Sub-11: CD Exemplo 2-2 Rio FC empate",
      "Sub-13: CD Exemplo 3-1 Atlético Vale vitoria",
      "Sub-15: União da Serra 2-0 CD Exemplo derrota",
      "Sub-17: CD Exemplo - Recreativo Sul Adiado",
      "Seniores: Vizinhos AD 0-1 CD Exemplo vitoria",
    ],
  );
});

test("legenda pronta a colar", () => {
  const texto = textoPost(itensPost(JOGOS, "CD Exemplo"), { de: "2026-10-24", ate: "2026-10-25", hashtag: "#VamosExemplo" });
  assert.equal(
    texto,
    [
      "⚽ Resultados do fim de semana (24–25 out. 2026)",
      "",
      "🤝 Sub-11: CD Exemplo 2–2 Rio FC",
      "✅ Sub-13: CD Exemplo 3–1 Atlético Vale",
      "❌ Sub-15: União da Serra 2–0 CD Exemplo",
      "Sub-17: adiado (vs Recreativo Sul)",
      "✅ Seniores: Vizinhos AD 0–1 CD Exemplo",
      "",
      "Balanço: 2 vitórias, 1 empate, 1 derrota.",
      "Obrigado a todos pelo apoio! 💪",
      "#VamosExemplo",
    ].join("\n"),
  );
  assert.match(textoPost([], { de: "2026-10-24", ate: "2026-10-25", hashtag: null }), /Sem jogos/);
});

test("marcadores do Fiães SC entram na legenda", () => {
  const comGolos = [
    jogo("Sub-13", 1, {
      adversario: "Atlético Vale", golos_clube: 3, golos_adversario: 1,
      golos: [{ marcador: "Tiago C.", minuto: 40, penalti: false }, { marcador: "Rui P.", minuto: 55, penalti: true }, { marcador: "Tiago C.", minuto: 12, penalti: false }],
    }),
  ];
  const itens = itensPost(comGolos, "Fiães SC");
  assert.equal(itens[0].marcadores, "Tiago C. (2), Rui P.");
  assert.match(
    textoPost(itens, { de: "2026-10-24", ate: "2026-10-25", hashtag: "#FiaesSC" }),
    /✅ Sub-13: Fiães SC 3–1 Atlético Vale \(⚽ Tiago C\. \(2\), Rui P\.\)/,
  );
});

test("muitos jogos dividem-se em várias imagens", () => {
  assert.deepEqual(paginar([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(paginar([], 7), [[]]);
});
