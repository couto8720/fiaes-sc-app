#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;
const ADMIN_EMAIL = 'gabrielcoutoassuncao@gmail.com';

if (!SUPABASE_URL || !SUPABASE_SECRET) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SECRET_KEY não estão configurados');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function reativarAdmin() {
  try {
    console.log(`🔍 Procurando conta: ${ADMIN_EMAIL}`);

    // Buscar o utilizador no Auth
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    const user = users.find(u => u.email === ADMIN_EMAIL);
    if (!user) {
      console.error(`❌ Utilizador não encontrado: ${ADMIN_EMAIL}`);
      process.exit(1);
    }

    console.log(`✅ Utilizador encontrado: ${user.id}`);

    // Atualizar o perfil para ativo = true
    console.log(`🔄 Reativando perfil...`);
    const { data, error } = await supabase
      .from('perfis')
      .update({ ativo: true })
      .eq('id', user.id)
      .select();

    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`✅ Conta reativada com sucesso!`);
      console.log(`📋 Dados: `, data[0]);
    } else {
      console.error(`❌ Perfil não encontrado ou não foi possível atualizar`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`❌ Erro:`, error.message);
    process.exit(1);
  }
}

reativarAdmin();
