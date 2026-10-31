"use client";

import { useState } from "react";

/** Número de golos que pisca brevemente quando muda (golo em tempo real), mas não ao abrir a página. */
export function NumeroGolos({ valor, className = "" }: { valor: number | null; className?: string }) {
  const [anterior, setAnterior] = useState(valor);
  const [mudancas, setMudancas] = useState(0);

  if (valor !== anterior) {
    setAnterior(valor);
    setMudancas((n) => n + 1);
  }

  return (
    // A key muda a cada golo: o elemento é recriado e a animação volta a correr.
    <span key={mudancas} className={`${className} ${mudancas > 0 ? "golo-novo" : ""}`}>
      {valor}
    </span>
  );
}
