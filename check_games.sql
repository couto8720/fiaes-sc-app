-- Count games by team
SELECT
  COUNT(*) as total_jogos,
  COUNT(CASE WHEN golos_equipa_1 IS NOT NULL AND golos_equipa_2 IS NOT NULL THEN 1 END) as com_resultado,
  COUNT(CASE WHEN golos_equipa_1 IS NULL OR golos_equipa_2 IS NULL THEN 1 END) as sem_resultado
FROM jogos_torneio
WHERE torneio_id = '96f389ff-dbaf-4c47-a71d-faa990bfaba4';

-- Games per team
SELECT
  et.nome as equipa_1,
  et2.nome as equipa_2,
  jt.golos_equipa_1,
  jt.golos_equipa_2,
  jt.rodada,
  CASE WHEN jt.golos_equipa_1 IS NOT NULL AND jt.golos_equipa_2 IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_resultado
FROM jogos_torneio jt
LEFT JOIN equipas_torneio et ON jt.equipa_1_id = et.id
LEFT JOIN equipas_torneio et2 ON jt.equipa_2_id = et2.id
WHERE jt.torneio_id = '96f389ff-dbaf-4c47-a71d-faa990bfaba4'
ORDER BY jt.rodada, jt.id;
