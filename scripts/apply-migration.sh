#!/bin/bash

# Extrai informações do Supabase
SUPABASE_URL="https://yxbrnfcvmkctrcgexmld.supabase.co"
PROJECT_ID="yxbrnfcvmkctrcgexmld"

# Obtém a password do database da variável de ambiente ou usa a default
# Para Supabase, a connection string é: postgresql://postgres:[password]@[host]:[port]/postgres
# Host padrão do Supabase: db.[project-ref].supabase.co

echo "Tentando aplicar migration ao Supabase..."
echo "Projeto: $PROJECT_ID"
echo ""

# Lê o arquivo da migration
MIGRATION_FILE="supabase/migrations/20261118000013_torneios.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Arquivo da migration não encontrado: $MIGRATION_FILE"
  exit 1
fi

echo "✓ Arquivo da migration encontrado"
echo ""

# Tenta com psql (requer postgres client instalado)
if command -v psql &> /dev/null; then
  echo "Usando psql para conectar ao Supabase..."

  # Para Supabase, precisa da connection string
  # Format: postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres

  # Como não temos a password explicitamente, o utilizador vai precisar de executar manualmente
  # ou configurá-la nas variáveis de ambiente

  if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "⚠️  SUPABASE_DB_PASSWORD não está configurada"
    echo ""
    echo "Para executar a migration manualmente:"
    echo "1. Vá para https://app.supabase.com/project/$PROJECT_ID/sql/new"
    echo "2. Copie o conteúdo de $MIGRATION_FILE"
    echo "3. Cole no editor SQL e execute"
    echo ""
    exit 1
  fi

  PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h "db.$PROJECT_ID.supabase.co" -U postgres -d postgres -f "$MIGRATION_FILE"

  if [ $? -eq 0 ]; then
    echo "✓ Migration aplicada com sucesso!"
    exit 0
  else
    echo "❌ Erro ao aplicar migration"
    exit 1
  fi
else
  echo "⚠️  postgres client (psql) não instalado"
  echo ""
  echo "Para executar a migration manualmente:"
  echo "1. Vá para https://app.supabase.com/project/$PROJECT_ID/sql/new"
  echo "2. Copie o conteúdo de $MIGRATION_FILE"
  echo "3. Cole no editor SQL e execute"
  echo ""
  exit 1
fi
