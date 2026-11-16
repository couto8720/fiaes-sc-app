-- Adicionar novos escalões Sub-15, Sub-15 B, Sub-13, Sub-13 B
INSERT INTO escaloes (nome, slug, competicao, ordem, epoca, ativo) VALUES
('Sub-15', 'sub-15', 'AF Aveiro - Campeonato', 5, 'atual', true),
('Sub-15 B', 'sub-15-b', 'AF Aveiro - Campeonato', 6, 'atual', true),
('Sub-13', 'sub-13', 'AF Aveiro - Campeonato', 7, 'atual', true),
('Sub-13 B', 'sub-13-b', 'AF Aveiro - Campeonato', 8, 'atual', true)
ON CONFLICT (slug, epoca) DO NOTHING;

-- Verificar escalões adicionados
SELECT id, nome, slug FROM escaloes ORDER BY ordem;
