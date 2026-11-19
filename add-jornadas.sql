-- Adicionar Jornada 2 duplicando os jogos de Jornada 1
INSERT INTO jogos_torneio (torneio_id, equipa_1_id, equipa_2_id, golos_equipa_1, golos_equipa_2, data_hora, grupo, fase, jornada)
SELECT torneio_id, equipa_1_id, equipa_2_id, NULL, NULL, data_hora + interval '7 days', grupo, fase, 2
FROM jogos_torneio
WHERE jornada = 1 OR jornada IS NULL AND fase LIKE '%grupo%';

-- Adicionar Jornada 3 duplicando os jogos de Jornada 1
INSERT INTO jogos_torneio (torneio_id, equipa_1_id, equipa_2_id, golos_equipa_1, golos_equipa_2, data_hora, grupo, fase, jornada)
SELECT torneio_id, equipa_1_id, equipa_2_id, NULL, NULL, data_hora + interval '14 days', grupo, fase, 3
FROM jogos_torneio
WHERE jornada = 1 OR jornada IS NULL AND fase LIKE '%grupo%';
