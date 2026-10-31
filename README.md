# App do Fiães Sport Clube

Calendário, resultados em tempo real, marcadores e classificações de todos os escalões do **Fiães Sport Clube** (verde e amarelo).
Stack: Next.js 16 (App Router) + Supabase (Postgres, Auth, Realtime) + Tailwind. Desenho completo em `docs/desenho-app-clube.md`.

## Estado

| Fase | Estado |
|---|---|
| 1. Base do projeto (Next.js, Tailwind, ligação Supabase, `proxy.ts` a proteger `/admin`) | ✅ |
| 2. Base de dados (esquema, triggers, RLS, tempo real, seed, testes de RLS) | ✅ |
| 3. Área pública (início, calendário, resultados, classificação, escalão, jogo; tempo real; filtro por escalão; modo demonstração) | ✅ |
| 4. Painel: login, recuperação e convites; jogos (com "Duplicar"), locais, escalões, utilizadores | ✅ (por testar com Supabase real) |
| 5. Marcador ao vivo (`/admin/jogos/[id]/marcador`): golos ±, estado seguinte, desfazer, gravação otimista com novas tentativas, ecrã sempre ligado | ✅ (por testar com Supabase real) |
| 6. Classificação (`/admin/classificacao`): "Colar tabela" do site com deteção automática das colunas, editor, ordenar, gravação tudo-ou-nada | ✅ (gravação por testar com Supabase real) |
| 7. Post de resultados (`/admin/post`): imagem PNG feed/story com as cores do clube, carrossel se houver muitos jogos, legenda, descarregar/partilhar | ✅ |
| 8. PWA (instalável, ícones com as cores do clube, abre sem rede), dica de instalação, cabeçalhos de segurança, robots, tarefa anti-pausa do Supabase | ✅ |
| 9. Piloto com 2–3 treinadores num fim de semana real | ⏳ (precisa do Supabase e do deploy) |

## Fiães Sport Clube: identidade e marcadores

- **Identidade:** nome "Fiães Sport Clube" / "Fiães SC", verde `#0B6B35`, amarelo `#FFD100`, texto branco, hashtag `#FiaesSC`. Vêm da migração `20261029000007` e mudam-se no painel em **Clube** (só super-admin): nome, cores (com pré-visualização), hashtag e link do símbolo. Tudo (site, ícones da app, post) usa estes valores.
- **Símbolo oficial:** `public/simbolo-fiaes.png` (escudo, 425×512, fundo transparente), obtido do site oficial do clube (fiaessc.s7.emjogo.pt) e recortado. Usado no cabeçalho, nos ícones da app (`/icones/*`) e na imagem do post (`src/lib/simbolo.ts`). Para trocar por outra versão, substituir o ficheiro (mesmo nome) ou pôr um link em **Clube → Logótipo**.
- **Marcadores:** cada golo do Fiães SC pode ter o nome de quem marcou, o minuto e se foi de penálti (tabela `golos`).
  - No **marcador ao vivo**, depois de tocar em **+** do Fiães, o cursor salta para "Quem marcou?"; há atalhos com os nomes já usados no escalão e "Autogolo". Também se corrigem depois, na página de editar o jogo.
  - **Proteção dos atletas (muitos são menores):** o nome fica **sempre** guardado na forma curta — "João Pedro Silva" → "João S." — pela própria BD (`public.abreviar_nome`), por isso o nome completo nunca fica acessível no site nem na API.
  - Aparecem nos cartões dos jogos, na página do jogo (com minutos), no novo separador **Marcadores** do escalão (melhores marcadores da época), na legenda e na imagem do post.
- **Página do escalão:** destaque com a posição e os pontos do Fiães SC no topo; separadores Próximos · Resultados · Tabela · Marcadores.

## Base de dados no Supabase (projeto `fiaes-sc`, Frankfurt)

- **Instalação:** a rede onde a app foi montada bloqueia a porta 5432 da CLI do Supabase, por isso as migrações foram aplicadas no **SQL Editor** com `supabase/instalar/instalar-tudo.sql` (as 7 migrações juntas, que também as regista como aplicadas). Teste: `tests/instalar.test.mjs`.
- **Dados do zerozero (2026/27):** `supabase/importar/zerozero-2026-27.json` tem os 14 escalões, 317 jogos e 13 classificações recolhidos do zerozero.pt a 30/10/2026. `npm run importar:gerar` cria `supabase/importar/importar-zerozero.sql`, que se cola no SQL Editor. Pode correr várias vezes: não duplica e nunca apaga jogos que o staff alterou no painel.
- **Super-admin:** gabrielcoutoassuncao@gmail.com.

## Publicar (Vercel)

1. Instalar o Git e pôr o projeto num repositório no GitHub (privado).
2. Em <https://vercel.com> → *Add New → Project* → importar o repositório (deteta o Next.js sozinho).
3. Em *Settings → Environment Variables*, criar as variáveis do `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
   - `SUPABASE_SECRET_KEY` (só servidor);
   - `SITE_URL` (ex.: `https://clube.pt`);
   - `CRON_SECRET` (valor aleatório comprido; a Vercel usa-o para chamar `/api/manter-ativo` de 3 em 3 dias, ver `vercel.json`).
4. Ligar o domínio em *Settings → Domains* e pôr o mesmo endereço no *Site URL* do Supabase.
5. Cada `git push` para o ramo principal publica uma nova versão.

## App no telemóvel (PWA)

- **Android/Chrome:** aparece "Instalar" na página inicial (ou no menu ⋮ → Instalar app).
- **iPhone/Safari:** a página inicial explica: Partilhar → Adicionar ao ecrã principal.
- Ícones gerados com as cores e o logótipo do clube (`/icones/192`, `/icones/512`, `/icones/maskable`, `/icones/apple`); manifest em `src/app/manifest.ts`.
- Sem rede (`public/sw.js`): as páginas públicas já abertas continuam disponíveis com o último estado; as outras mostram "Sem ligação". O painel e os dados do Supabase nunca passam pela cache.
- Ao mudar o `sw.js`, aumentar `VERSAO` no topo do ficheiro para limpar as caches antigas.

## Estrutura

```
supabase/
  migrations/              esquema, RLS e tempo real (aplicadas por ordem)
  seed.sql                 dados de exemplo (datas relativas a "agora")
  promover-super-admin.sql torna o teu utilizador super-admin
  config.toml              registo público desativado; palavra-passe ≥ 8 caracteres
src/
  proxy.ts                 renova a sessão e redireciona /admin para o login
  lib/supabase/            clientes browser/servidor, tipos da BD
  lib/jogos.ts             rótulos dos estados, próximo estado, datas em Europe/Lisbon
tests/rls.test.mjs         testes das regras de acesso num Postgres embebido
```

## Experimentar já (modo demonstração)

Sem `.env.local`, a app usa dados de exemplo (ver `src/lib/demo.ts`) e mostra uma faixa amarela a avisar.
```bash
npm run dev
```
Abre <http://localhost:3000>. O tempo real só funciona com o Supabase configurado.

## Páginas públicas

| Rota | Conteúdo |
|---|---|
| `/` | Ao vivo, hoje, próximos dias e últimos resultados (janela de ±7 dias) |
| `/calendario` | Todos os jogos a partir de hoje, agrupados por dia |
| `/resultados` | Jogos terminados, do mais recente para o mais antigo |
| `/classificacao` | Tabelas de todos os escalões, com o clube destacado |
| `/escaloes/[slug]` | Separadores Próximos / Resultados / Classificação |
| `/jogos/[id]` | Marcador grande, detalhes, "Como chegar" e partilha (com pré-visualização do link) |

O filtro por escalão fica guardado no browser. Os marcadores atualizam-se em tempo real (`src/lib/useJogosAoVivo.ts`) e a página volta a pedir os dados quando o separador volta a ficar visível.

## Primeiros passos (uma vez)

1. **Criar o projeto Supabase** em <https://supabase.com/dashboard> → *New project*, região **Europe (Frankfurt)**. Guarda a palavra-passe da base de dados.
2. **Desativar o registo público:** *Authentication → Sign In / Providers →* desligar **Allow new users to sign up**. (Os convites continuam a funcionar.)
3. **Configurar as variáveis:** copia `.env.example` para `.env.local` e preenche o URL e a *publishable key* (*Project Settings → API Keys*).
4. **Aplicar as migrações** (precisa de iniciar sessão na CLI e ligar o projeto):
   ```bash
   npx supabase login
   ```
   ```bash
   npx supabase link --project-ref O_TEU_PROJECT_REF
   ```
   ```bash
   npm run db:push
   ```
   Para dados de exemplo, cola o conteúdo de `supabase/seed.sql` no *SQL Editor* (só em desenvolvimento).
5. **Criar o teu utilizador:** *Authentication → Users → Add user* (email + palavra-passe). Depois, no *SQL Editor*, corre `supabase/promover-super-admin.sql` com o teu email.
6. **Regenerar os tipos** (opcional, sempre que mudares o esquema): `npm run db:tipos`.
7. **Arrancar:**
   ```bash
   npm run dev
   ```
   Abre <http://localhost:3000>; deves ver a lista de jogos do seed.

## Painel de administração (`/admin`)

| Rota | Quem | O que faz |
|---|---|---|
| `/admin/login`, `/admin/recuperar` | todos | Entrar; pedir link para nova palavra-passe |
| `/admin` | staff | Jogos dos seus escalões (hoje e próximos / anteriores), filtro por escalão, "Duplicar" para a jornada seguinte |
| `/admin/jogos/novo`, `/admin/jogos/[id]` | staff | Criar, editar e apagar jogos; criar um local novo no próprio formulário |
| `/admin/locais` | staff | Locais com link do Google Maps (só o super-admin apaga) |
| `/admin/escaloes` | super-admin | Criar e editar escalões; desativar no fim da época |
| `/admin/utilizadores` | super-admin | Convidar staff por email, atribuir escalões, mudar papel, desativar |

### Marcador ao vivo

Na lista de jogos, os jogos de hoje têm o botão **Marcador** (fica verde, e com aviso, se já passou da hora e o jogo continua "Agendado").
- Botões grandes **+** e **−** por equipa (a da casa à esquerda); o **−** serve para corrigir.
- O botão principal avança sempre para o passo seguinte: Começar jogo → Intervalo → Começar 2.ª parte → Terminar jogo (pede confirmação).
- "Outras opções": voltar ao estado anterior (toque por engano), adiar ou cancelar.
- Cada toque aparece logo e grava em segundo plano (`src/lib/useGravacaoMarcador.ts`). Sem rede, o aviso "Sem rede · a tentar de novo" fica visível e a app volta a tentar sozinha; nada se perde enquanto a página estiver aberta. Grava sempre o resultado completo, por isso repetir um envio não duplica golos.
- Dois delegados no mesmo jogo veem as alterações um do outro em tempo real.
- O ecrã do telemóvel não se apaga enquanto o marcador está aberto (onde o browser o permite).

### Classificação

Em **Classificação**, cada treinador vê os seus escalões (com o lugar do clube e a data da última atualização).
1. No site da associação, seleciona a tabela inteira, copia e cola em "Colar tabela".
2. A app (`src/lib/colarTabela.ts`) lê o cabeçalho se existir; senão descobre a ordem das colunas pelas contas do futebol (J = V+E+D, Pts = 3V+E). Aceita golos juntos ("14:4"), diferença de golos, posições com "1." e células partidas em várias linhas.
3. Confere na tabela: o clube vem marcado com ★ e as linhas cujas contas não batem ficam assinaladas (pode ser uma penalização).
4. **Guardar** substitui a tabela inteira numa só operação na BD (`substituir_classificacao`): ou fica tudo gravado, ou nada.

### Post de resultados

Em **Post**, a página propõe o fim de semana mais recente (sábado e domingo); pode escolher-se outro intervalo e o formato **Feed (4:5, 1080×1350)** ou **Story (9:16, 1080×1920)**.
- Entram os jogos de todos os escalões com "Final do Jogo", "Adiado" ou "Cancelado", por ordem de escalão.
- A imagem (`/admin/post/imagem`, desenhada em `src/components/admin/ImagemPost.tsx`) usa as cores, o logótipo e a hashtag da configuração do clube. Com mais de 7 jogos (10 no story) divide-se em várias imagens para um carrossel.
- **Partilhar** abre a folha de partilha do telemóvel com as imagens e a legenda; **Descarregar** guarda o PNG; **Copiar texto** copia a legenda com o balanço (vitórias/empates/derrotas).
- Fonte: Barlow Condensed (licença OFL, `assets/fontes/`).

As horas são escritas e mostradas na hora de Lisboa e guardadas em UTC (`src/lib/datas.ts`, com testes para a mudança de hora).

### Emails (convites e recuperação)

No Supabase, em *Authentication → URL Configuration*, põe o **Site URL** igual ao endereço do site (ex.: `https://clube.pt`) e acrescenta `http://localhost:3000/**` aos *Redirect URLs*. Depois, em *Authentication → Emails*, troca o link dos modelos:

- **Invite user:** `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/admin/definir-palavra-passe`
- **Reset password:** `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/admin/definir-palavra-passe`

O envio de convites precisa da `SUPABASE_SECRET_KEY` no `.env.local` (*Project Settings → API Keys → Secret keys*). O email incluído no Supabase gratuito envia poucas mensagens por hora; para o lançamento convém configurar um SMTP próprio (ex.: Resend, Brevo).

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run test:db` | Testa esquema, triggers e RLS num Postgres embebido (não precisa de Supabase nem Docker) |
| `npm run db:push` | Aplica as migrações ao projeto Supabase ligado |
| `npm run db:tipos` | Regenera `src/lib/supabase/database.types.ts` |

## Regras de acesso (resumo)

- **Público:** lê configuração, escalões, locais, jogos e classificações. Não vê perfis.
- **Treinador:** cria, edita e apaga jogos e linhas de classificação **só dos escalões atribuídos**. Não pode mudar um jogo para outro escalão nem alterar o próprio papel.
- **Super-admin:** gere tudo (escalões, perfis, atribuições, configuração do clube).
- **Perfil desativado** (`ativo = false`): perde logo o acesso de escrita.
- Cada utilizador novo recebe automaticamente um perfil de treinador sem escalões; o super-admin atribui-os.

## Notas

- No plano gratuito, o Supabase pausa o projeto ao fim de 7 dias sem atividade (fase 8: *cron* semanal).
- Next 16: o antigo `middleware.ts` chama-se agora `proxy.ts`, e com *Cache Components* as leituras por pedido ficam dentro de `<Suspense>`.
