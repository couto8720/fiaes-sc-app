-- Dados de exemplo para desenvolvimento (não usar em produção).
-- As datas são relativas a "agora", por isso o seed tem sempre jogos passados, de hoje e futuros.
-- A configuração do Fiães Sport Clube (nome, cores, hashtag) já vem da migração 20261029000007.

insert into public.escaloes (id, nome, slug, ordem, epoca, competicao) values
  ('00000000-0000-4000-a000-000000000013', 'Sub-13',   'sub-13',   1, '2026/27', 'Distrital Sub-13 — Série B'),
  ('00000000-0000-4000-a000-000000000015', 'Sub-15',   'sub-15',   2, '2026/27', 'Distrital Sub-15 — Série A'),
  ('00000000-0000-4000-a000-000000000017', 'Sub-17',   'sub-17',   3, '2026/27', 'Distrital Sub-17 — Série A'),
  ('00000000-0000-4000-a000-000000000099', 'Seniores', 'seniores', 4, '2026/27', '1.ª Divisão Distrital');

insert into public.locais (id, nome, morada, maps_url) values
  ('00000000-0000-4000-b000-000000000001', 'Campo do Fiães SC',     'Fiães',                  'https://maps.google.com/?q=Fiães+Sport+Clube'),
  ('00000000-0000-4000-b000-000000000002', 'Campo Municipal Norte', 'Avenida Norte, 200',     'https://maps.google.com/?q=Campo+Municipal+Norte'),
  ('00000000-0000-4000-b000-000000000003', 'Complexo Desportivo Sul','Estrada Sul, km 3',     'https://maps.google.com/?q=Complexo+Desportivo+Sul');

-- Jogos já realizados (jornadas anteriores)
insert into public.jogos (id, escalao_id, competicao, jornada, data_hora, local_id, em_casa, adversario, golos_clube, golos_adversario, estado) values
  ('00000000-0000-4000-c000-000000000001', '00000000-0000-4000-a000-000000000013', null, 5, now() - interval '7 days',         '00000000-0000-4000-b000-000000000001', true,  'Atlético Vale',  3, 1, 'final'),
  ('00000000-0000-4000-c000-000000000002', '00000000-0000-4000-a000-000000000015', null, 5, now() - interval '7 days 2 hours', '00000000-0000-4000-b000-000000000002', false, 'União da Serra', 0, 2, 'final'),
  ('00000000-0000-4000-c000-000000000003', '00000000-0000-4000-a000-000000000017', null, 5, now() - interval '6 days',         '00000000-0000-4000-b000-000000000001', true,  'Sporting Rio',   2, 2, 'final'),
  ('00000000-0000-4000-c000-000000000004', '00000000-0000-4000-a000-000000000099', null, 5, now() - interval '6 days 3 hours', '00000000-0000-4000-b000-000000000003', false, 'Vizinhos AD',    1, 0, 'final');

-- Jogos de hoje (um ao vivo, um ainda agendado)
insert into public.jogos (id, escalao_id, competicao, jornada, data_hora, local_id, em_casa, adversario, golos_clube, golos_adversario, estado) values
  ('00000000-0000-4000-c000-000000000005', '00000000-0000-4000-a000-000000000015', null, 6, now() - interval '50 minutes', '00000000-0000-4000-b000-000000000001', true, 'Outro SC',         2, 1, 'segunda_parte'),
  ('00000000-0000-4000-c000-000000000006', '00000000-0000-4000-a000-000000000099', null, 6, now() + interval '3 hours',    '00000000-0000-4000-b000-000000000001', true, 'Desportivo Leste', null, null, 'agendado');

-- Próximos jogos
insert into public.jogos (escalao_id, competicao, jornada, data_hora, local_id, em_casa, adversario, estado, notas) values
  ('00000000-0000-4000-a000-000000000013', null, 6, now() + interval '1 day',   '00000000-0000-4000-b000-000000000002', false, 'Académico Norte', 'agendado', null),
  ('00000000-0000-4000-a000-000000000017', null, 6, now() + interval '1 day 2 hours', '00000000-0000-4000-b000-000000000003', false, 'Recreativo Sul', 'adiado', 'Adiado por indisponibilidade do campo'),
  ('00000000-0000-4000-a000-000000000013', 'Taça Distrital', null, now() + interval '8 days', '00000000-0000-4000-b000-000000000001', true, 'Benfica Aldeia', 'agendado', null);

-- Marcadores (o nome fica sempre na forma curta: "Tiago Martins Costa" → "Tiago C.")
insert into public.golos (jogo_id, marcador, minuto, penalti) values
  ('00000000-0000-4000-c000-000000000001', 'Tiago Martins Costa', 12, false),
  ('00000000-0000-4000-c000-000000000001', 'Tiago Martins Costa', 40, false),
  ('00000000-0000-4000-c000-000000000001', 'Rui Pinto',           55, true),
  ('00000000-0000-4000-c000-000000000003', 'André Sousa',         23, false),
  ('00000000-0000-4000-c000-000000000003', 'Diogo Ferreira',      78, false),
  ('00000000-0000-4000-c000-000000000004', 'Hugo Almeida',        88, false),
  ('00000000-0000-4000-c000-000000000005', 'Gonçalo Rocha',       18, false),
  ('00000000-0000-4000-c000-000000000005', 'Martim Lopes',        51, false);

-- Classificações (introduzidas à mão pelo staff)
insert into public.classificacoes (escalao_id, posicao, equipa, e_o_clube, jogos, vitorias, empates, derrotas, golos_marcados, golos_sofridos, pontos) values
  ('00000000-0000-4000-a000-000000000013', 1, 'Fiães SC',        true,  5, 4, 1, 0, 14, 4, 13),
  ('00000000-0000-4000-a000-000000000013', 2, 'Académico Norte', false, 5, 4, 0, 1, 11, 5, 12),
  ('00000000-0000-4000-a000-000000000013', 3, 'Atlético Vale',   false, 5, 2, 1, 2,  8, 9,  7),
  ('00000000-0000-4000-a000-000000000015', 1, 'União da Serra',  false, 5, 5, 0, 0, 16, 2, 15),
  ('00000000-0000-4000-a000-000000000015', 2, 'Outro SC',        false, 5, 3, 1, 1,  9, 6, 10),
  ('00000000-0000-4000-a000-000000000015', 3, 'Fiães SC',        true,  5, 3, 0, 2, 10, 7,  9),
  ('00000000-0000-4000-a000-000000000017', 1, 'Sporting Rio',    false, 5, 3, 2, 0, 12, 5, 11),
  ('00000000-0000-4000-a000-000000000017', 2, 'Fiães SC',        true,  5, 3, 1, 1,  9, 6, 10),
  ('00000000-0000-4000-a000-000000000099', 1, 'Vizinhos AD',     false, 5, 3, 1, 1,  8, 4, 10),
  ('00000000-0000-4000-a000-000000000099', 2, 'Fiães SC',        true,  5, 3, 0, 2,  7, 5,  9);
