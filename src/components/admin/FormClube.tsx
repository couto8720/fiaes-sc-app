"use client";

import { useActionState, useState } from "react";
import { guardarClube } from "@/app/admin/acoes/clube";
import { ESTADO_INICIAL } from "@/app/admin/acoes/tipos";
import { BotaoSubmeter, Campo, Mensagem, classeInput } from "./ui";

const CORES = [
  ["cor_primaria", "Cor principal", "Fundo do cabeçalho, botões e do post (verde)."],
  ["cor_destaque", "Cor de destaque", "Realces e o nome do clube no post (amarelo)."],
  ["cor_secundaria", "Cor do texto sobre a principal", "Normalmente branco."],
] as const;

export function FormClube({ inicial }: { inicial: Record<string, string> }) {
  const [estado, acao] = useActionState(guardarClube, ESTADO_INICIAL);
  const v = (k: string) => estado.valores?.[k] ?? inicial[k] ?? "";
  const e = estado.erros ?? {};
  // Pré-visualização das cores enquanto se escolhem.
  const [cores, setCores] = useState({ cor_primaria: v("cor_primaria"), cor_destaque: v("cor_destaque"), cor_secundaria: v("cor_secundaria") });

  return (
    <form action={acao} className="space-y-4" noValidate>
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      {estado.ok && <Mensagem tipo="ok">{estado.ok}</Mensagem>}

      <div
        className="flex items-center gap-3 rounded-2xl p-4"
        style={{ background: cores.cor_primaria, color: cores.cor_secundaria }}
        aria-label="Pré-visualização das cores"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- pré-visualização do símbolo */}
        <img src={v("logo_url") || "/simbolo-fiaes.png"} alt="" className="h-14 w-auto object-contain drop-shadow" />
        <span>
          <span className="block font-bold">{v("nome_curto") || "Fiães SC"}</span>
          <span className="block text-sm font-semibold" style={{ color: cores.cor_destaque }}>
            3 – 1 · Vitória
          </span>
        </span>
      </div>

      <Campo rotulo="Nome completo" nome="nome" erro={e.nome}>
        <input id="nome" name="nome" defaultValue={v("nome")} maxLength={80} className={classeInput} />
      </Campo>
      <Campo rotulo="Nome curto" nome="nome_curto" erro={e.nome_curto} ajuda="Usado nos cartões dos jogos, no marcador e no post.">
        <input id="nome_curto" name="nome_curto" defaultValue={v("nome_curto")} maxLength={24} className={classeInput} />
      </Campo>

      {CORES.map(([nome, rotulo, ajuda]) => (
        <Campo key={nome} rotulo={rotulo} nome={nome} erro={e[nome]} ajuda={ajuda}>
          <div className="flex gap-2">
            <input
              type="color"
              aria-label={`${rotulo} (seletor)`}
              value={HEX(cores[nome])}
              onChange={(ev) => setCores((c) => ({ ...c, [nome]: ev.target.value.toUpperCase() }))}
              className="h-12 w-14 cursor-pointer rounded-xl border border-borda bg-superficie p-1"
            />
            <input
              id={nome}
              name={nome}
              value={cores[nome]}
              onChange={(ev) => setCores((c) => ({ ...c, [nome]: ev.target.value }))}
              className={`${classeInput} font-mono uppercase`}
            />
          </div>
        </Campo>
      ))}

      <Campo rotulo="Hashtag" nome="hashtag" erro={e.hashtag} ajuda="Aparece no fim do post e da legenda.">
        <input id="hashtag" name="hashtag" defaultValue={v("hashtag")} placeholder="#FiaesSC" className={classeInput} />
      </Campo>
      <Campo rotulo="Logótipo (opcional)" nome="logo_url" erro={e.logo_url} ajuda="Vazio = símbolo oficial do Fiães SC incluído na app. Só é preciso para usar outra imagem (link https:// para um PNG com fundo transparente).">
        <input id="logo_url" name="logo_url" type="url" defaultValue={v("logo_url")} placeholder="https://…/simbolo-fiaes.png" className={classeInput} />
      </Campo>

      <BotaoSubmeter>Guardar</BotaoSubmeter>
    </form>
  );
}

/** O seletor de cor só aceita #rrggbb; enquanto se escreve um valor incompleto, mostra preto. */
const HEX = (v: string) => (/^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : "#000000");
