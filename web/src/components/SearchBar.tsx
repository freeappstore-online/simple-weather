import { useState, useEffect, useRef, useCallback } from "react";
import { searchCities, type GeoResult } from "../lib/weather";

interface SearchBarProps {
  onSelect: (result: GeoResult) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const r = await searchCities(q);
      setResults(r);
      setIsOpen(r.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div
        className="flex items-center gap-2 px-4 py-3 border"
        style={{
          borderRadius: "0.75rem",
          borderColor: "var(--line)",
          background: "var(--panel)",
        }}
      >
        <span style={{ color: "var(--muted)" }}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search city..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--ink)" }}
        />
        {loading && (
          <span className="text-xs animate-pulse" style={{ color: "var(--muted)" }}>
            ...
          </span>
        )}
      </div>
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 border overflow-hidden shadow-lg"
          style={{
            borderRadius: "0.75rem",
            borderColor: "var(--line)",
            background: "var(--panel)",
          }}
        >
          {results.map((r, i) => (
            <button
              key={`${r.latitude}-${r.longitude}-${i}`}
              onClick={() => {
                onSelect(r);
                setQuery("");
                setIsOpen(false);
                setResults([]);
              }}
              className="w-full text-left px-4 py-3 text-sm transition-colors hover:opacity-80"
              style={{
                borderBottom: i < results.length - 1 ? "1px solid var(--line)" : undefined,
                color: "var(--ink)",
              }}
            >
              <span className="font-medium">{r.name}</span>
              <span style={{ color: "var(--muted)" }}>
                {r.admin1 ? `, ${r.admin1}` : ""} — {r.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
