"use client";

import { useState, useMemo } from "react";
import { SearchFilter } from "@/components/SearchFilter";
import { searchStandings } from "@/lib/search-filter";

interface StandingsAdminListProps {
  standings: any[];
  escalaoNome?: string;
}

export function StandingsAdminList({ standings, escalaoNome }: StandingsAdminListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStandings = useMemo(() => {
    return searchStandings(standings, searchQuery);
  }, [standings, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <SearchFilter
        placeholder="Pesquisar por equipa..."
        onSearch={setSearchQuery}
      />

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-suave">
          {filteredStandings.length} de {standings.length} equipa(s)
        </p>
      )}

      {/* Standings table */}
      <div className="overflow-x-auto">
        {filteredStandings.length === 0 ? (
          <div className="rounded-lg border border-borda bg-superficie p-6 text-center text-suave">
            {searchQuery ? "Nenhuma equipa encontrada" : "Nenhuma classificação"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-borda">
              <tr className="text-suave text-xs font-semibold">
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Equipa</th>
                <th className="text-center p-3">J</th>
                <th className="text-center p-3">V</th>
                <th className="text-center p-3">E</th>
                <th className="text-center p-3">D</th>
                <th className="text-center p-3">Pts</th>
              </tr>
            </thead>
            <tbody>
              {filteredStandings.map((item, idx) => (
                <tr key={item.id} className="border-b border-borda hover:bg-corpo/5 transition-colors">
                  <td className="p-3 font-semibold text-clube">{idx + 1}º</td>
                  <td className="p-3 font-semibold">{item.nome}</td>
                  <td className="p-3 text-center">{item.jogos || 0}</td>
                  <td className="p-3 text-center text-vitoria">{item.vitorias || 0}</td>
                  <td className="p-3 text-center text-empate">{item.empates || 0}</td>
                  <td className="p-3 text-center text-derrota">{item.derrotas || 0}</td>
                  <td className="p-3 text-center font-bold text-clube">{item.pontos || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
