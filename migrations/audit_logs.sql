-- Tabela de logs de auditoria (retenção: 90 dias)
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Índices para queries comuns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- RLS (Row Level Security) - apenas admins podem ler logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs readable by admins only" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfis
      WHERE perfis.id = auth.uid()
      AND perfis.papel = 'super_admin'
    )
  );

-- Função para limpar logs com mais de 90 dias
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE audit_logs IS 'Logs de auditoria de todas as ações do sistema (retenção: 90 dias para conformidade GDPR)';
COMMENT ON COLUMN audit_logs.user_id IS 'ID do utilizador que realizou a ação';
COMMENT ON COLUMN audit_logs.action IS 'Tipo de ação realizada (login, password_change, etc)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Tipo de recurso afetado (torneio, jogo, etc)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID do recurso específico afetado';
COMMENT ON COLUMN audit_logs.details IS 'Detalhes adicionais em formato JSON';
COMMENT ON COLUMN audit_logs.status IS 'Status da ação (success ou failure)';
