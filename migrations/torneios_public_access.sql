-- Ativar leitura pública na tabela de torneios para a página pública

-- Garantir que a tabela tem RLS ativada
ALTER TABLE torneios ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública de todos os torneios
CREATE POLICY "Torneios: Leitura Pública"
ON torneios
FOR SELECT
USING (true);

-- Criar política para permitir que equipas_torneio sejam lidas publicamente
ALTER TABLE equipas_torneio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipas Torneio: Leitura Pública"
ON equipas_torneio
FOR SELECT
USING (true);

-- Criar política para permitir que jogos_torneio sejam lidos publicamente
ALTER TABLE jogos_torneio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jogos Torneio: Leitura Pública"
ON jogos_torneio
FOR SELECT
USING (true);

-- Criar política para permitir que fases_torneio sejam lidas publicamente
ALTER TABLE fases_torneio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fases Torneio: Leitura Pública"
ON fases_torneio
FOR SELECT
USING (true);
