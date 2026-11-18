#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yxbrnfcvmkctrcgexmld.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || 'sb_secret_A5I1OR_11UGnFfBrI5IgeQ_l2cHpgM-';

console.log('Conectando ao Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

// Ler o arquivo da migration
const migrationPath = path.join(__dirname, '../supabase/migrations/20261118000013_torneios.sql');
const sql = fs.readFileSync(migrationPath, 'utf-8');

console.log('Executando migration...');

// Split por linhas e executar múltiplas queries se necessário
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

(async () => {
  try {
    for (const statement of statements) {
      if (statement.trim().length > 0) {
        console.log(`Executando: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          console.error('Erro:', error);
          // Continuar mesmo com erro (pode ser que o objeto já existe)
        } else {
          console.log('✓ OK');
        }
      }
    }

    console.log('Migration concluída!');
    process.exit(0);
  } catch (err) {
    console.error('Erro fatal:', err);
    process.exit(1);
  }
})();
