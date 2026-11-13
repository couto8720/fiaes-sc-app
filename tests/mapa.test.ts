import { test } from "node:test";
import assert from "node:assert/strict";
import { linkSeguro, pesquisaDoMapa, urlMapaEmbutido } from "../src/lib/mapa.ts";

test("mapa: usa a pesquisa do link do Google Maps (query ou q)", () => {
  assert.equal(
    pesquisaDoMapa("https://www.google.com/maps/search/?api=1&query=Est%C3%A1dio+Marcolino+de+Castro+Santa+Maria+da+Feira", "X"),
    "Estádio Marcolino de Castro Santa Maria da Feira",
  );
  assert.equal(pesquisaDoMapa("https://maps.google.com/?q=Est%C3%A1dio+do+Bolh%C3%A3o+Fi%C3%A3es", "X"), "Estádio do Bolhão Fiães");
  assert.equal(pesquisaDoMapa("https://maps.app.goo.gl/abc123", "Campo de Treinos Fiães SC"), "Campo de Treinos Fiães SC");
  assert.equal(pesquisaDoMapa(null, "Campo X"), "Campo X");
});

test("mapa: endereço embutido e link seguro", () => {
  assert.equal(urlMapaEmbutido(null, "Estádio do Bolhão"), "https://www.google.com/maps?q=Est%C3%A1dio%20do%20Bolh%C3%A3o&output=embed");
  assert.equal(linkSeguro("javascript:alert(1)", "Campo"), "https://www.google.com/maps/dir/?api=1&destination=Campo");
  assert.equal(linkSeguro("https://maps.google.com/?q=Estádio", "Campo"), "https://www.google.com/maps/dir/?api=1&destination=Est%C3%A1dio");
});

test("mapa: endereço com chave da API oficial do Google", () => {
  const chave = "AIzaSyDummyKey123";
  assert.equal(
    urlMapaEmbutido(null, "Estádio do Bolhão", chave),
    "https://www.google.com/maps/embed/v1/search?key=AIzaSyDummyKey123&q=Est%C3%A1dio%20do%20Bolh%C3%A3o",
  );
  assert.equal(
    urlMapaEmbutido("https://maps.google.com/?q=Campo+de+Treinos", "X", chave),
    "https://www.google.com/maps/embed/v1/search?key=AIzaSyDummyKey123&q=Campo%20de%20Treinos",
  );
});

test("mapa: chave vazia ou whitespace ignora-se", () => {
  assert.equal(
    urlMapaEmbutido(null, "Estádio do Bolhão", ""),
    "https://www.google.com/maps?q=Est%C3%A1dio%20do%20Bolh%C3%A3o&output=embed",
  );
  assert.equal(
    urlMapaEmbutido(null, "Estádio do Bolhão", "   "),
    "https://www.google.com/maps?q=Est%C3%A1dio%20do%20Bolh%C3%A3o&output=embed",
  );
});
