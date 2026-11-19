-- Tabela para rate limiting (5 tentativas por 15 minutos)
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Índice para limpeza automática
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

-- Função para limpar registos expirados
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE reset_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE rate_limits IS 'Registos de rate limiting para protecção contra brute force (5 tentativas / 15 minutos)';
COMMENT ON COLUMN rate_limits.key IS 'Identificador único (email ou IP para login)';
COMMENT ON COLUMN rate_limits.attempts IS 'Número de tentativas no intervalo atual';
COMMENT ON COLUMN rate_limits.reset_at IS 'Data/hora quando o limite será resetado';
