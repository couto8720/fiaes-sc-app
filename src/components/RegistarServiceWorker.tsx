"use client";

import { useEffect } from "react";

// Regista o service worker (public/sw.js) só em produção: em desenvolvimento a cache só atrapalharia.
export function RegistarServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // Sem service worker a app funciona na mesma (só não abre sem rede).
    });
  }, []);
  return null;
}
