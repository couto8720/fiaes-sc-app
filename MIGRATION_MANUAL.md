# Aplicar Migration de Torneios Manualmente

A migration `20261118000013_torneios.sql` precisa ser aplicada ao Supabase para que o sistema de torneios funcione.

## Passos:

### 1. Acesse o Supabase SQL Editor
Vá para: https://app.supabase.com/project/yxbrnfcvmkctrcgexmld/sql/new

(Ou: Dashboard → seu projeto → SQL Editor → New Query)

### 2. Copie o SQL da migration
Abra o arquivo `supabase/migrations/20261118000013_torneios.sql` desta pasta e copie TODO o conteúdo.

### 3. Cole no editor SQL do Supabase
Cola no editor SQL que abriu no passo 1.

### 4. Execute
Clique em "RUN" ou pressione `Ctrl+Enter` / `Cmd+Enter`

### 5. Verifique
Vá para o SQL Editor do Supabase e execute:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Deve ver as seguintes tabelas:
- `torneios`
- `fases_torneio`
- `equipas_torneio`
- `jogos_torneio`
- `criterios_torneio`

## Depois de aplicar a migration

Volta à aplicação e tenta criar um torneio em:
- Painel de Admin → Torneios → Criar Novo Torneio

## Problemas?

Se a migration falhar:
1. Verifica se já existem tabelas com o mesmo nome (elas vão ter erros de conflito)
2. Se existem, apaga-as primeiro:
   ```sql
   DROP TABLE IF EXISTS public.jogos_torneio CASCADE;
   DROP TABLE IF EXISTS public.equipas_torneio CASCADE;
   DROP TABLE IF EXISTS public.fases_torneio CASCADE;
   DROP TABLE IF EXISTS public.criterios_torneio CASCADE;
   DROP TABLE IF EXISTS public.torneios CASCADE;
   DROP TYPE IF EXISTS public.formato_torneio;
   DROP TYPE IF EXISTS public.tipo_fase;
   DROP TYPE IF EXISTS public.criterio_classificacao;
   DROP TYPE IF EXISTS public.estado_torneio;
   ```
3. Depois tenta a migration de novo
