import type { GeoResult } from "../lib/weather";

interface Props {
  locations: GeoResult[];
  onSelect: (loc: GeoResult) => void;
  onRemove: (idx: number) => void;
  currentLat?: number;
  currentLon?: number;
}

export function SavedLocations({ locations, onSelect, onRemove, currentLat, currentLon }: Props) {
  if (locations.length === 0) {
    return (
      <div
        className="p-6 border text-center"
        style={{
          borderRadius: "1.25rem",
          borderColor: "var(--line)",
          background: "var(--panel)",
        }}
      >
        <p className="text-3xl mb-3">📌</p>
        <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          No saved locations
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          Search for a city and tap the ⭐ to save it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {locations.map((loc, i) => {
        const isActive =
          currentLat !== undefined &&
          currentLon !== undefined &&
          Math.abs(loc.latitude - currentLat) < 0.01 &&
          Math.abs(loc.longitude - currentLon) < 0.01;

        return (
          <div
            key={`${loc.latitude}-${loc.longitude}-${i}`}
            className="flex items-center gap-3 p-4 border transition-colors cursor-pointer"
            style={{
              borderRadius: "1.25rem",
              borderColor: isActive ? "var(--accent)" : "var(--line)",
              background: isActive ? "var(--accent)" : "var(--panel)",
              color: isActive ? "#fff" : "var(--ink)",
            }}
            onClick={() => onSelect(loc)}
          >
            <span className="text-lg">📍</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{loc.name}</p>
              <p
                className="text-xs truncate"
                style={{ color: isActive ? "rgba(255,255,255,0.7)" : "var(--muted)" }}
              >
                {loc.admin1 ? `${loc.admin1}, ` : ""}{loc.country}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(i);
              }}
              className="text-sm opacity-60 hover:opacity-100 transition-opacity p-1"
              title="Remove"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
