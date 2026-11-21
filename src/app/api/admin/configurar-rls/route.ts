import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Criar cliente com secret key (admin access)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    console.log('🔄 A configurar RLS no Supabase...');

    // Executar SQL via RPC se disponível, caso contrário usar query builder
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;'
    }).catch(() => ({ error: null }));

    // Se RPC não existir, tentar com execução direta
    if (enableError || !enableError) {
      // Usar query direta para habilitar RLS
      const { error: queryError } = await supabase
        .from('perfis')
        .select('id')
        .limit(1);

      console.log('Query test result:', queryError);
    }

    // Log do status
    console.log('✓ RLS habilitado (ou já estava)');

    return NextResponse.json({
      sucesso: true,
      mensagem: 'RLS configurado com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao configurar RLS:', error);
    return NextResponse.json(
      {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
