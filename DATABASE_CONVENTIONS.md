# Convenções de Base de Dados - Fiães SC App

## 🔴 IMPORTANTE: Campo de Rodadas

Ao trabalhar com a tabela `jogos_torneio`, **sempre use o campo `rodada`**, não `jornada`.

### Regra
```typescript
// ✅ CORRETO
const rodada = jogo.rodada || 1;

// ❌ ERRADO
const jornada = jogo.jornada || 1;
```

### Tabelas Afetadas
- `jogos_torneio` → coluna `rodada`

### Arquivos que Usam Esta Regra
- `src/app/torneios/[id]/tabs.tsx` - Agrupamento de jogos por rodada (linha 213+)

### Por Que?
O campo na base de dados Supabase chama-se `rodada`, não `jornada`. Usar o nome correto garante que:
1. Os dados são buscados corretamente
2. As múltiplas rodadas aparecem na interface
3. A aplicação funciona sem erros

---

**Mantém este arquivo atualizado com novas convenções conforme forem descobertas.**
