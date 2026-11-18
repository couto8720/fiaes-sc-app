-- Adicionar campos para configuração da fase eliminatória

alter table public.torneios
  add column tem_terceiro_lugar boolean not null default false;

-- Atualizar a descrição dos comentários para clareza
comment on column public.torneios.tem_terceiro_lugar is 'Se o torneio tem jogo por terceiro lugar na fase eliminatória';
