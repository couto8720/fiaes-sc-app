// Service worker da App do Clube.
// - Ficheiros estáticos do Next (/_next/static, com nome versionado): cache primeiro.
// - Páginas públicas: rede primeiro; sem rede, mostra a última versão vista ou a página "Sem ligação".
// - Painel (/admin), autenticação, API e dados do Supabase: nunca passam pela cache.
const VERSAO = "app-clube-v1";
const ESTATICOS = `${VERSAO}-estaticos`;
const PAGINAS = `${VERSAO}-paginas`;
const OFFLINE = "/offline";
const MAX_PAGINAS = 30;

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(PAGINAS)
      .then((cache) => cache.add(new Request(OFFLINE, { cache: "reload" })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((c) => !c.startsWith(VERSAO)).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

const privado = (url) =>
  url.pathname.startsWith("/admin") || url.pathname.startsWith("/auth") || url.pathname.startsWith("/api");

async function limitar(nomeCache, maximo) {
  const cache = await caches.open(nomeCache);
  const chaves = await cache.keys();
  await Promise.all(chaves.slice(0, Math.max(0, chaves.length - maximo)).map((k) => cache.delete(k)));
}

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin || privado(url)) return;

  // Ficheiros estáticos versionados: nunca mudam, por isso a cópia em cache serve sempre.
  if (url.pathname.startsWith("/_next/static/")) {
    evento.respondWith(
      caches.open(ESTATICOS).then(async (cache) => {
        const guardado = await cache.match(pedido);
        if (guardado) return guardado;
        const resposta = await fetch(pedido);
        if (resposta.ok) cache.put(pedido, resposta.clone());
        return resposta;
      }),
    );
    return;
  }

  // Abrir uma página (não as navegações internas do Next, que pedem só dados).
  if (pedido.mode === "navigate") {
    evento.respondWith(
      (async () => {
        try {
          const resposta = await fetch(pedido);
          if (resposta.ok && resposta.type === "basic") {
            const cache = await caches.open(PAGINAS);
            await cache.put(pedido, resposta.clone());
            limitar(PAGINAS, MAX_PAGINAS);
          }
          return resposta;
        } catch {
          const cache = await caches.open(PAGINAS);
          return (await cache.match(pedido, { ignoreSearch: false })) || (await cache.match(OFFLINE)) || Response.error();
        }
      })(),
    );
  }
});
