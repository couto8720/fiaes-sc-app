-- Atualizar classificação dos Seniores (época atual)
-- Com os dados da tabela fornecida

-- Primeiro, obter o escalão_id dos Seniores
WITH escalao_seniores AS (
  SELECT id FROM escaloes WHERE LOWER(nome) LIKE '%senior%' LIMIT 1
)

-- Chamar a função substituir_classificacao com os dados
SELECT substituir_classificacao(
  (SELECT id FROM escalao_seniores),
  '[
    {"posicao": 1, "equipa": "Argoncilhe", "pontos": 23, "jogos": 10, "vitorias": 7, "empates": 2, "derrotas": 1},
    {"posicao": 2, "equipa": "Fermentelos", "pontos": 19, "jogos": 10, "vitorias": 6, "empates": 1, "derrotas": 3},
    {"posicao": 3, "equipa": "Anadia FC", "pontos": 17, "jogos": 10, "vitorias": 4, "empates": 5, "derrotas": 1},
    {"posicao": 4, "equipa": "SC Espinho", "pontos": 17, "jogos": 10, "vitorias": 4, "empates": 5, "derrotas": 1},
    {"posicao": 5, "equipa": "ADC Lobão", "pontos": 17, "jogos": 10, "vitorias": 4, "empates": 5, "derrotas": 1},
    {"posicao": 6, "equipa": "CD Estarreja", "pontos": 17, "jogos": 10, "vitorias": 5, "empates": 2, "derrotas": 3},
    {"posicao": 7, "equipa": "RD Águeda", "pontos": 16, "jogos": 10, "vitorias": 4, "empates": 4, "derrotas": 2},
    {"posicao": 8, "equipa": "Cesarense", "pontos": 16, "jogos": 10, "vitorias": 4, "empates": 4, "derrotas": 2},
    {"posicao": 9, "equipa": "Fiães SC", "pontos": 15, "jogos": 10, "vitorias": 4, "empates": 3, "derrotas": 3},
    {"posicao": 10, "equipa": "São Roque", "pontos": 15, "jogos": 10, "vitorias": 4, "empates": 3, "derrotas": 3},
    {"posicao": 11, "equipa": "S. Vicente Pereira", "pontos": 14, "jogos": 10, "vitorias": 4, "empates": 2, "derrotas": 4},
    {"posicao": 12, "equipa": "Vista Alegre", "pontos": 10, "jogos": 10, "vitorias": 2, "empates": 4, "derrotas": 4},
    {"posicao": 13, "equipa": "Oliveira do Bairro", "pontos": 10, "jogos": 10, "vitorias": 2, "empates": 4, "derrotas": 4},
    {"posicao": 14, "equipa": "Paços de Brandão", "pontos": 10, "jogos": 10, "vitorias": 2, "empates": 4, "derrotas": 4},
    {"posicao": 15, "equipa": "UD Mourisquense", "pontos": 8, "jogos": 10, "vitorias": 1, "empates": 5, "derrotas": 4},
    {"posicao": 16, "equipa": "AD Valonguense", "pontos": 6, "jogos": 10, "vitorias": 1, "empates": 3, "derrotas": 6},
    {"posicao": 17, "equipa": "Carregosense", "pontos": 6, "jogos": 10, "vitorias": 1, "empates": 3, "derrotas": 6},
    {"posicao": 18, "equipa": "Relâmpago Nogueirense", "pontos": 3, "jogos": 10, "vitorias": 0, "empates": 3, "derrotas": 7}
  ]'::jsonb
);
