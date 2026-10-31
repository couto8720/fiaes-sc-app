# App do Clube — Desenho e Plano de MVP

> Modalidade: **futebol** · Classificação: **introduzida à mão pelo staff** · Notificações push: **fase 2** · Permissões: **treinador edita só os seus escalões; super-admin gere tudo**

## Pressupostos (alteráveis)

| Tema | Valor assumido |
|---|---|
| Cores do clube | Primária `#0B3D91` (azul), secundária `#FFFFFF`, destaque `#F2C200`. Ficam numa tabela de configuração e podem ser mudadas no painel sem tocar no código. |
| Logótipo | PNG com fundo transparente, carregado pelo super-admin. |
| Fuso horário | `Europe/Lisbon`; datas guardadas em `timestamptz`. |
| "Fim de semana" no gerador | Sábado e domingo da semana atual (ou da anterior, se for segunda a quarta). O admin pode mudar o intervalo de datas. |
| Dados pessoais | O MVP não guarda nomes de atletas (muitos são menores; evita trabalho de RGPD). Só equipas, jogos e resultados. |
| Estados extra | Além dos 5 pedidos, **Adiado** e **Cancelado**, que acontecem com frequência no futebol de formação. |
| Orçamento | Escalões gratuitos (Supabase Free + Vercel) mais um domínio (~10–15 €/ano). |

---

## 1. Arquitetura e stack

### Web App/PWA ou app nativa → **PWA**

| | PWA (recomendado) | App nativa |
|---|---|---|
| Acesso do público | Abre um link (Instagram, WhatsApp), sem instalar nada | Exige ir à loja e instalar, e muitos adeptos não o fazem |
| Custo | Um só código; alojamento gratuito | Duas lojas (99 USD/ano na Apple), revisões, duas plataformas |
| Atualizações | Imediatas | Passam por revisão |
| Instalação | "Adicionar ao ecrã principal" (ícone, ecrã inteiro) | Nativa |
| Push (fase 2) | Web Push funciona em Android; em iPhone só com a PWA instalada (iOS 16.4+) | Total |

A maior parte do tráfego vai chegar por links partilhados, por isso a PWA ganha com folga. Se mais tarde as notificações em iPhone forem críticas, dá para embrulhar a mesma app com Capacitor.

### Stack

| Camada | Escolha | Porquê |
|---|---|---|
| Frontend | **Next.js (App Router) + TypeScript + Tailwind CSS** | SSR rápido e bom para SEO e pré-visualizações de links; o mesmo projeto serve o público e o admin |
| Base de dados, autenticação e tempo real | **Supabase** (Postgres + Auth + Realtime + Storage) | Ver comparação abaixo |
| Alojamento | **Vercel** (ou Netlify) | Deploy a cada `git push`, HTTPS e domínio próprio |
| Imagem do post | **`next/og` (Satori)** numa *route handler* | PNG 1080×1350 gerado no servidor, com fontes e cores sempre iguais |
| PWA | `manifest.webmanifest` + service worker simples (ex.: Serwist) | Instalação e cache do "shell" da app |

### Supabase ou Firebase → **Supabase**

| Critério | Supabase | Firebase |
|---|---|---|
| Modelo de dados | Relacional (escalões → jogos → classificação): encaixa naturalmente, com chaves estrangeiras e *joins* | Documentos NoSQL: obriga a desnormalizar |
| Regras de acesso | **RLS em SQL** ("treinador só edita o seu escalão" escreve-se numa linha) | Security Rules, mais difíceis de testar |
| Tempo real | `postgres_changes` na tabela `jogos`, que respeita o RLS | Excelente (Firestore listeners) |
| Consultas ("resultados do fim de semana de todos os escalões") | Um `SELECT` com filtro de datas | Exige índices compostos |
| Custo | Free: 500 MB de BD, 50k utilizadores ativos/mês, 200 ligações em tempo real simultâneas | Free generoso, mas cobra por leitura |
| Saída | É Postgres standard, exportável | Dependência forte do fornecedor |

**Atenção:** no plano gratuito o projeto Supabase é **pausado ao fim de 7 dias sem atividade**, o que pode acontecer na pausa de verão. Há duas soluções: um *cron* semanal (GitHub Actions ou Vercel Cron) que faz um pedido à API, ou o plano Pro (25 USD/mês) quando a app tiver uso real.

**200 ligações em tempo real:** chega para um clube. Se num sábado houver mais do que isso, o cliente cai para *polling* de 30 s (ver §1.3).

### 1.1 Autenticação
- Supabase Auth com email e palavra-passe; **registo público desativado**.
- O super-admin convida staff pelo painel (`auth.admin.inviteUserByEmail`, executado numa Server Action com a *service role key*, que nunca chega ao browser).
- Cada utilizador autenticado tem uma linha em `perfis` (papel) e as suas linhas em `perfis_escaloes`.
- O *middleware* do Next.js protege `/admin/*`, mas **a segurança real está no RLS**: mesmo que alguém contorne a interface, a BD recusa a escrita.

### 1.2 Tempo real
- A tabela `jogos` é adicionada à publicação `supabase_realtime`.
- O cliente público subscreve `postgres_changes` (UPDATE) em `jogos`, filtrado por `escalao_id` na página de um escalão ou sem filtro na página inicial.
- Quando chega uma alteração, o cartão do jogo atualiza-se com uma pequena animação no marcador.
- Robustez: ao voltar ao separador (`visibilitychange`) ou ao reconectar, a página volta a pedir os dados, para não ficar com um marcador antigo depois de o telemóvel estar bloqueado.

### 1.3 Gerador de post para Instagram e Facebook
**Abordagem recomendada:** uma *route handler* `GET /admin/post/imagem?de=2026-10-25&ate=2026-10-26&formato=4x5`, protegida por sessão, que:
1. lê os jogos com `estado in ('final','adiado')` no intervalo, agrupados por escalão;
2. desenha com `ImageResponse` (de `next/og`) um PNG de **1080×1350** (4:5, o melhor formato para o feed do Instagram) e, opcionalmente, um de **1080×1920** (stories);
3. devolve `Content-Disposition: attachment; filename="resultados-2026-10-25.png"`.

No painel, o botão **"Gerar post"** mostra a pré-visualização (`<img src=...>`) e dá três ações:
- **Descarregar PNG**: link direto para a rota;
- **Partilhar** (telemóvel): `navigator.share({ files: [png] })` abre a folha de partilha do sistema, com o Instagram lá dentro;
- **Copiar texto**: legenda gerada no servidor, por exemplo:

```
⚽ Resultados do fim de semana
Sub-13: Clube 3-1 Adversário FC (C)
Sub-15: Outro SC 0-2 Clube (F)
Sub-17: Adiado
Seniores: Clube 1-1 Vizinhos AD (C)
💙 Obrigado a todos pelo apoio! #VamosClube
```

Porquê no servidor (Satori) e não `html-to-image` no browser: o resultado é igual em todos os telemóveis, não depende de fontes instaladas nem de CORS nas imagens, e o mesmo URL serve para pré-visualização e para download. Limitação: o Satori só suporta *flexbox* e um subconjunto de CSS, o que chega para um cartaz de resultados. As fontes (ex.: Inter ou Bebas Neue) são incluídas como ficheiro.

Se houver mais escalões do que cabem numa imagem (mais de 8), a rota gera um carrossel (`?pagina=1`, `?pagina=2`).

---

## 2. Modelo de dados (Postgres / Supabase)

### Diagrama

```
clube_config (1 linha)

escaloes 1──N jogos N──1 locais
   │
   ├──N classificacoes
   │
   └──N perfis_escaloes N──1 perfis 1──1 auth.users
```

### Tabelas

```sql
-- Tipos
create type estado_jogo as enum
  ('agendado','primeira_parte','intervalo','segunda_parte','final','adiado','cancelado');
create type papel_admin as enum ('super_admin','treinador');

-- Configuração do clube (uma única linha)
create table clube_config (
  id              boolean primary key default true check (id),  -- garante uma só linha
  nome            text not null,
  nome_curto      text not null,          -- usado no marcador e no post
  logo_url        text,
  cor_primaria    text not null default '#0B3D91',
  cor_secundaria  text not null default '#FFFFFF',
  cor_destaque    text not null default '#F2C200',
  hashtag         text default '#VamosClube'
);

create table escaloes (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,               -- "Sub-13"
  slug        text not null unique,        -- "sub-13"
  ordem       smallint not null default 0, -- ordem de apresentação
  epoca       text not null,               -- "2026/27"
  competicao  text,                        -- "Distrital AF Lisboa — Série B"
  ativo       boolean not null default true
);

create table locais (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,                 -- "Campo Municipal X"
  morada    text,
  maps_url  text                           -- link Google Maps
);

create table jogos (
  id                   uuid primary key default gen_random_uuid(),
  escalao_id           uuid not null references escaloes(id) on delete cascade,
  competicao           text,               -- herda do escalão, mas pode ser Taça
  jornada              smallint,
  data_hora            timestamptz not null,
  local_id             uuid references locais(id) on delete set null,
  em_casa              boolean not null,   -- o clube joga em casa?
  adversario           text not null,
  adversario_logo_url  text,
  golos_clube          smallint check (golos_clube >= 0),
  golos_adversario     smallint check (golos_adversario >= 0),
  estado               estado_jogo not null default 'agendado',
  estado_desde         timestamptz not null default now(), -- para mostrar "2ª parte há 12 min"
  notas                text,               -- "Jogo antecipado", "à porta fechada"
  atualizado_por       uuid references auth.users(id),
  atualizado_em        timestamptz not null default now()
);
create index on jogos (data_hora);
create index on jogos (escalao_id, data_hora);

create table classificacoes (
  id               uuid primary key default gen_random_uuid(),
  escalao_id       uuid not null references escaloes(id) on delete cascade,
  posicao          smallint not null,
  equipa           text not null,
  e_o_clube        boolean not null default false,  -- destaca a linha do clube
  jogos            smallint not null default 0,
  vitorias         smallint not null default 0,
  empates          smallint not null default 0,
  derrotas         smallint not null default 0,
  golos_marcados   smallint not null default 0,
  golos_sofridos   smallint not null default 0,
  pontos           smallint not null default 0,
  atualizado_em    timestamptz not null default now(),
  unique (escalao_id, equipa)
);

create table perfis (
  id      uuid primary key references auth.users(id) on delete cascade,
  nome    text not null,
  papel   papel_admin not null default 'treinador',
  ativo   boolean not null default true
);

create table perfis_escaloes (
  perfil_id   uuid references perfis(id) on delete cascade,
  escalao_id  uuid references escaloes(id) on delete cascade,
  primary key (perfil_id, escalao_id)
);
```

**Triggers:**
- `before update on jogos`: se o `estado` mudou, `estado_desde = now()`; sempre `atualizado_em = now()` e `atualizado_por = auth.uid()`.
- `before update on jogos`: se o estado passa de `agendado` para `primeira_parte` e os golos são `null`, põe `0-0`.

### Regras de acesso (RLS)

```sql
-- Funções auxiliares (security definer para não entrar em recursão com o RLS)
create function is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfis
                 where id = auth.uid() and ativo and papel = 'super_admin');
$$;

create function pode_editar_escalao(e uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_super_admin() or exists (
    select 1 from perfis p join perfis_escaloes pe on pe.perfil_id = p.id
    where p.id = auth.uid() and p.ativo and pe.escalao_id = e);
$$;

alter table clube_config     enable row level security;
alter table escaloes         enable row level security;
alter table locais           enable row level security;
alter table jogos            enable row level security;
alter table classificacoes   enable row level security;
alter table perfis           enable row level security;
alter table perfis_escaloes  enable row level security;

-- Leitura pública (anon + authenticated)
create policy "leitura publica" on clube_config   for select using (true);
create policy "leitura publica" on escaloes       for select using (true);
create policy "leitura publica" on locais         for select using (true);
create policy "leitura publica" on jogos          for select using (true);
create policy "leitura publica" on classificacoes for select using (true);

-- Jogos e classificação: só quem tem o escalão (o WITH CHECK impede mover um jogo para outro escalão)
create policy "editar jogos" on jogos for all to authenticated
  using (pode_editar_escalao(escalao_id)) with check (pode_editar_escalao(escalao_id));
create policy "editar classificacao" on classificacoes for all to authenticated
  using (pode_editar_escalao(escalao_id)) with check (pode_editar_escalao(escalao_id));

-- Estrutura do clube: só super-admin
create policy "gerir config"   on clube_config for all to authenticated using (is_super_admin()) with check (is_super_admin());
create policy "gerir escaloes" on escaloes     for all to authenticated using (is_super_admin()) with check (is_super_admin());
-- Locais: qualquer admin ativo pode criar (um treinador pode precisar de um campo novo)
create policy "gerir locais" on locais for all to authenticated
  using (exists (select 1 from perfis where id = auth.uid() and ativo))
  with check (exists (select 1 from perfis where id = auth.uid() and ativo));

-- Perfis: cada um vê o seu; o super-admin vê e gere todos
create policy "ver perfil"  on perfis for select to authenticated using (id = auth.uid() or is_super_admin());
create policy "gerir perfis" on perfis for all to authenticated using (is_super_admin()) with check (is_super_admin());
create policy "ver atribuicoes" on perfis_escaloes for select to authenticated using (perfil_id = auth.uid() or is_super_admin());
create policy "gerir atribuicoes" on perfis_escaloes for all to authenticated using (is_super_admin()) with check (is_super_admin());
```

As políticas de `for all` também cobrem a leitura para `authenticated`, mas como a leitura já é pública isso não muda nada.

O RLS deve ser testado com dois utilizadores de teste (um treinador do Sub-13 a tentar editar um jogo dos Seniores tem de falhar), por exemplo com pgTAP ou um script simples com dois clientes Supabase.

---

## 3. UX/UI

Princípios: **mobile-first** (90% dos acessos serão no telemóvel, muitas vezes à beira do campo), letra grande no marcador, cores do clube e respeito pelo modo escuro do sistema.

### 3.1 Público

**Navegação (barra inferior):** Início · Calendário · Resultados · Classificação

**Início — "Este fim de semana"**
```
┌──────────────────────────────┐
│ [logo] Clube              ☰  │
├──────────────────────────────┤
│ ● AO VIVO                    │
│ ┌──────────────────────────┐ │
│ │ SUB-15 · Jornada 6       │ │
│ │ Clube        2           │ │
│ │ Outro SC     1           │ │
│ │ 🟢 2ª PARTE · há 12 min  │ │
│ └──────────────────────────┘ │
│                              │
│ HOJE                         │
│ ┌──────────────────────────┐ │
│ │ SENIORES · 15:00         │ │
│ │ Clube vs Vizinhos AD     │ │
│ │ 📍 Campo Municipal X  ↗  │ │
│ └──────────────────────────┘ │
│ AMANHÃ ...                   │
│ ÚLTIMOS RESULTADOS ...       │
├──────────────────────────────┤
│ Início Calend. Result. Class.│
└──────────────────────────────┘
```
- *Chips* de filtro por escalão no topo ("Todos", "Sub-13", "Sub-15"…), com a escolha guardada em `localStorage`. Um pai só quer ver o escalão do filho.
- Jogos ao vivo aparecem sempre primeiro, com um ponto a pulsar e o estado escrito ("1ª PARTE", "INTERVALO").
- Cartão do jogo: escalão, competição/jornada, equipas (o clube sempre em destaque, com C/F para casa/fora), marcador, estado, hora e local com link para o Maps.
- Adiado e Cancelado aparecem riscados ou num *badge* cinzento.

**Página do escalão (`/escaloes/sub-15`):** três separadores, **Próximos**, **Resultados** e **Classificação**. A tabela tem a linha do clube destacada e colunas reduzidas no telemóvel (Pos · Equipa · J · Pts · DG), que se expandem em ecrãs largos.

**Página do jogo (`/jogos/[id]`):** marcador grande, mapa e link para partilhar. As *meta tags* Open Graph geram uma pré-visualização com o resultado quando o link é colado no WhatsApp.

### 3.2 Painel de admin (`/admin`)

**Painel inicial — "Os meus jogos de hoje"** (só os escalões do utilizador)

O ecrã de marcador ao vivo é o mais importante: usa-se de pé, com uma mão, ao sol.
```
┌──────────────────────────────┐
│ SUB-15 vs Outro SC     ✕     │
├──────────────────────────────┤
│   CLUBE          OUTRO SC    │
│    [ − ]  2   :   1  [ − ]   │
│    [ + ]             [ + ]   │
│                              │
│ Estado atual: 2ª PARTE       │
│ ┌──────────────────────────┐ │
│ │   ▶ TERMINAR JOGO        │ │  ← botão principal = próximo estado
│ └──────────────────────────┘ │
│ Outro estado ▾ (Adiado, ...) │
└──────────────────────────────┘
```
- Botões de pelo menos 56 px; o "+" grava logo (atualização otimista, com reversão e aviso se falhar).
- O botão principal avança sempre para o **estado seguinte** (Agendado → 1ª Parte → Intervalo → 2ª Parte → Final). Os outros estados ficam num menu secundário.
- "Terminar jogo" pede confirmação.
- Indicador de ligação ("A gravar…", "Guardado ✓", "Sem rede — a tentar de novo").

**Menu lateral:**
- **Jogos**: lista filtrável por escalão e data; criar/editar (formulário: escalão, competição, jornada, data e hora, local com pesquisa e "+ novo", casa/fora, adversário). Ação "Duplicar" para a jornada seguinte.
- **Classificação**: por escalão, tabela editável. Inclui **"Colar tabela"**: o treinador copia a tabela do site da associação, cola, e a app interpreta as colunas e mostra uma pré-visualização antes de gravar. Poupa muitos minutos por semana.
- **Gerar post**: seletor de datas (pré-preenchido com o fim de semana), pré-visualização da imagem e botões Descarregar / Partilhar / Copiar texto.
- **Só super-admin:** Escalões, Locais, Utilizadores (convidar, atribuir escalões, desativar) e Configuração do clube (nome, logo, cores, hashtag, com pré-visualização do post).

---

## 4. Plano de ação até ao MVP

Estimativa para uma pessoa a tempo parcial (~10 h/semana): **6–8 semanas**.

| # | Fase | Tarefas | Resultado |
|---|---|---|---|
| 0 | Preparação (½ semana) | Confirmar com a direção: lista de escalões, competições, campos/pavilhões, quem são os admins, logo e cores. Criar contas: GitHub, Supabase (região UE, Frankfurt), Vercel. Comprar o domínio. | Decisões fechadas |
| 1 | Base do projeto (½ semana) | `npx create-next-app` (TS, Tailwind, App Router), ESLint/Prettier, `@supabase/ssr`, ligação ao repositório e deploy automático na Vercel. | "Hello world" online |
| 2 | Base de dados (1 semana) | Migrações SQL (§2) com a Supabase CLI, triggers, RLS, *seed* com dados de teste, tipos TS gerados (`supabase gen types`). Testes de RLS com dois perfis. | Esquema seguro e versionado |
| 3 | Área pública (1–1,5 semanas) | Início, Calendário, Resultados, página do escalão com separadores, página do jogo, filtro por escalão, links para o Maps, Open Graph. | Público consegue consultar tudo |
| 4 | Autenticação e CRUD (1–1,5 semanas) | Login, *middleware*, perfis, convites, CRUD de jogos, locais e escalões, gestão de utilizadores e atribuição de escalões. | Staff gere o calendário |
| 5 | Marcador ao vivo (1 semana) | Ecrã de marcador, transições de estado, atualização otimista, subscrição Realtime no público, refetch ao reconectar. | Resultados em tempo real |
| 6 | Classificação (½ semana) | Editor de tabela e "Colar tabela" com pré-visualização. | Classificações atualizadas |
| 7 | Gerador de post (1 semana) | Rota `next/og` 4:5 (+ stories opcional), paginação se houver muitos escalões, legenda de texto, download e `navigator.share`. | Post num clique |
| 8 | PWA e acabamentos (½ semana) | Manifest, ícones, service worker, modo escuro, acessibilidade (contraste, tamanhos), páginas de erro, *cron* anti-pausa do Supabase. | App instalável |
| 9 | Piloto (1 fim de semana) | 2–3 treinadores usam o marcador em jogos reais; recolher problemas (rede fraca no campo, botões, fluxo). | Correções finais |
| 10 | Lançamento | Carregar o calendário real da época, convidar todos os admins, anunciar nas redes do clube (link na bio do Instagram, QR code no bar e no campo). | MVP no ar |

### Depois do MVP (fase 2)
1. **Notificações Web Push** (início, golo, final) com subscrição por escalão. Em iPhone exigem a PWA instalada.
2. **Eventos do jogo** (quem marcou, minuto). Implica nomes de atletas, por isso consentimento RGPD dos encarregados de educação.
3. Importação do calendário por CSV no início da época.
4. Estatísticas da época por escalão e galeria de fotos.
5. Multi-modalidade (se o clube crescer para futsal, etc.): adicionar `modalidade` a `escaloes` e estados configuráveis.

### Riscos e mitigação
| Risco | Mitigação |
|---|---|
| Rede fraca no campo | Atualização otimista com nova tentativa; UI mínima e leve no ecrã do marcador |
| Staff esquece-se de atualizar | Lembrete no painel ("Jogo das 15:00 ainda está Agendado"); fluxo de um toque |
| Pausa do Supabase gratuito no verão | *Cron* semanal ou plano Pro |
| Treinador sai do clube | Super-admin desativa o perfil (`ativo = false`), o que corta logo o acesso via RLS |
