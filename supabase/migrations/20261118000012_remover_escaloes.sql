-- Remover escalões Sub-12, Sub-12 B e Veteranos
-- Primeiro, remover dados relacionados (cascata automática)
delete from public.escaloes where nome in ('Sub-12', 'Sub-12 B', 'Veteranos');
