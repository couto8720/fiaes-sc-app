-- Limpar todos os jogos, resultados e marcadores da base de dados

-- Deletar os marcadores (gols) primeiro (referência externa)
DELETE FROM golos;

-- Deletar as expulsões
DELETE FROM expulsoes;

-- Deletar todos os jogos
DELETE FROM jogos;

-- Resultado: Todos os jogos, resultados, marcadores e expulsões foram deletados
-- A tabela de classificações não é deletada para manter o histórico de standings
