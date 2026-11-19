"use client";

import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";

interface SearchFilterProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  delay?: number;
}

export function SearchFilter({ placeholder = "Pesquisar...", onSearch, delay = 300 }: SearchFilterProps) {
  const [query, setQuery] = useState("");
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      // Debounce search
      clearTimeout(timer);
      const newTimer = setTimeout(() => {
        onSearch(value);
      }, delay);
      setTimer(newTimer);
    },
    [onSearch, delay, timer]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onSearch("");
  }, [onSearch]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-suave" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          className="w-full pl-9 pr-9 py-2 rounded-lg border border-borda bg-superficie text-sm focus:outline-none focus:ring-2 focus:ring-clube/50"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-suave hover:text-corpo transition-colors"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
