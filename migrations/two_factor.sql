-- Tabela para armazenar secrets TOTP
CREATE TABLE IF NOT EXISTS two_factor_secrets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar backup codes
CREATE TABLE IF NOT EXISTS backup_codes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_two_factor_secrets_user_id ON two_factor_secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_secrets_enabled ON two_factor_secrets(enabled);
CREATE INDEX IF NOT EXISTS idx_backup_codes_user_id ON backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_codes_code ON backup_codes(code);
CREATE INDEX IF NOT EXISTS idx_backup_codes_used ON backup_codes(used);

-- RLS (Row Level Security)
ALTER TABLE two_factor_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_codes ENABLE ROW LEVEL SECURITY;

-- Utilizadores só podem ler sua própria config 2FA
CREATE POLICY "Users can read own 2FA config" ON two_factor_secrets
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid() AND perfis.papel = 'super_admin'
  ));

CREATE POLICY "Users can update own 2FA config" ON two_factor_secrets
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own backup codes" ON backup_codes
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid() AND perfis.papel = 'super_admin'
  ));

-- Comentários para documentação
COMMENT ON TABLE two_factor_secrets IS 'Armazena secrets TOTP para autenticação de dois fatores';
COMMENT ON COLUMN two_factor_secrets.secret IS 'Secret base32 para geração de tokens TOTP';
COMMENT ON COLUMN two_factor_secrets.enabled IS 'Se 2FA está ativado para o utilizador';
COMMENT ON COLUMN two_factor_secrets.verified IS 'Se o utilizador confirmou o 2FA com um token válido';

COMMENT ON TABLE backup_codes IS 'Códigos de backup para recuperação em caso de perda do dispositivo 2FA';
COMMENT ON COLUMN backup_codes.code IS 'Código de backup no formato XXXX-XXXX';
COMMENT ON COLUMN backup_codes.used IS 'Se o código foi já utilizado';
COMMENT ON COLUMN backup_codes.used_at IS 'Data e hora de utilização do código';
