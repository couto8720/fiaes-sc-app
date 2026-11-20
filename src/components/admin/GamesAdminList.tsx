"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SearchFilter } from "@/components/SearchFilter";
import { searchGames } from "@/lib/search-filter";
import { isoParaLisboa } from "@/lib/datas";

interface GamesAdminListProps {
  games: any[];
  equipasMap: Record<string, string>;
}

export function GamesAdminList({ games, equipasMap }: GamesAdminListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = useMemo(() => {
    return searchGames(games, searchQuery, equipasMap);
  }, [games, searchQuery, equipasMap]);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex justify-between items-center gap-4">
        <SearchFilter
          placeholder="Pesquisar por equipa ou local..."
          onSearch={setSearchQuery}
        />
        <Link
          href="/admin/jogos/novo"
          className="rounded-lg bg-clube px-4 py-2 font-semibold text-clube-texto hover:opacity-80"
        >
          + Novo Jogo
        </Link>
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-suave">
          {filteredGames.length} de {games.length} jogo(s)
        </p>
      )}

      {/* Games list */}
      <div className="space-y-3">
        {filteredGames.length === 0 ? (
          <div className="rounded-lg border border-borda bg-superficie p-6 text-center text-suave">
            {searchQuery ? "Nenhum jogo encontrado" : "Nenhum jogo"}
          </div>
        ) : (
          filteredGames.map((game) => {
            const nome1 = equipasMap[game.equipa_1_id] || "Equipa 1";
            const nome2 = equipasMap[game.equipa_2_id] || "Equipa 2";

            return (
              <Link
                key={game.id}
                href={`/admin/jogos/${game.id}`}
                className="block rounded-lg border border-borda bg-superficie p-4 hover:bg-corpo/5 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{nome1}</span>
                      <span className="text-suave text-sm">vs</span>
                      <span className="font-semibold text-sm">{nome2}</span>
                    </div>
                    <p className="text-xs text-suave mt-1">
                      {game.local && `📍 ${game.local}`}
                      {game.data_hora && ` • ${isoParaLisboa(game.data_hora)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {game.golos_equipa_1 !== null ? (
                      <p className="text-lg font-bold text-clube">
                        {game.golos_equipa_1} - {game.golos_equipa_2}
                      </p>
                    ) : (
                      <p className="text-sm text-suave">Agendado</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
