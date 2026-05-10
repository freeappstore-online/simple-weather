import { useState, useEffect, useCallback } from "react";
import { Shell } from "./components/Shell";
import { SearchBar } from "./components/SearchBar";
import { CurrentWeatherCard } from "./components/CurrentWeatherCard";
import { HourlyForecast } from "./components/HourlyForecast";
import { DailyForecast } from "./components/DailyForecast";
import { WeatherDetails } from "./components/WeatherDetails";
import { SavedLocations } from "./components/SavedLocations";
import { fetchWeather, type GeoResult, type WeatherData } from "./lib/weather";

const STORAGE_KEY = "simple_weather_data";
const NAV_ITEMS = [
  { id: "weather", label: "Weather", icon: "🌤️" },
  { id: "locations", label: "Locations", icon: "📍" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

interface SavedState {
  locations: GeoResult[];
  lastLocation?: GeoResult;
  unit: "celsius" | "fahrenheit";
}

function loadState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { locations: [], unit: "celsius" };
}

function saveState(state: SavedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function App() {
  const [page, setPage] = useState("weather");
  const [state, setState] = useState<SavedState>(loadState);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeoResult | undefined>(state.lastLocation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((updates: Partial<SavedState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      saveState(next);
      return next;
    });
  }, []);

  const loadWeather = useCallback(
    async (loc: GeoResult) => {
      setLoading(true);
      setError(null);
      setCurrentLocation(loc);
      persist({ lastLocation: loc });
      try {
        const data = await fetchWeather(loc.latitude, loc.longitude, state.unit);
        setWeather(data);
      } catch {
        setError("Failed to fetch weather data. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [state.unit, persist]
  );

  // On mount, try to load last location or use geolocation
  useEffect(() => {
    if (state.lastLocation) {
      loadWeather(state.lastLocation);
    } else {
      // Try geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc: GeoResult = {
              name: "Current Location",
              country: "",
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
            loadWeather(loc);
          },
          () => {
            // Geolocation denied - show search prompt
          }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload weather when unit changes
  useEffect(() => {
    if (currentLocation) {
      loadWeather(currentLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.unit]);

  const handleSelectCity = (result: GeoResult) => {
    loadWeather(result);
    setPage("weather");
  };

  const isSaved =
    currentLocation &&
    state.locations.some(
      (l) =>
        Math.abs(l.latitude - currentLocation.latitude) < 0.01 &&
        Math.abs(l.longitude - currentLocation.longitude) < 0.01
    );

  const toggleSave = () => {
    if (!currentLocation) return;
    if (isSaved) {
      persist({
        locations: state.locations.filter(
          (l) =>
            Math.abs(l.latitude - currentLocation.latitude) >= 0.01 ||
            Math.abs(l.longitude - currentLocation.longitude) >= 0.01
        ),
      });
    } else {
      persist({ locations: [...state.locations, currentLocation] });
    }
  };

  return (
    <Shell navItems={NAV_ITEMS} activeNav={page} onNav={setPage}>
      {page === "weather" && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <SearchBar onSelect={handleSelectCity} />
            {currentLocation && (
              <button
                onClick={toggleSave}
                className="text-2xl shrink-0 transition-transform hover:scale-110"
                title={isSaved ? "Remove from saved" : "Save location"}
              >
                {isSaved ? "⭐" : "☆"}
              </button>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-4xl mb-3 animate-pulse">🌤️</p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Fetching weather...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              className="p-4 border text-center"
              style={{
                borderRadius: "1.25rem",
                borderColor: "var(--error)",
                background: "var(--panel)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--error)" }}>
                {error}
              </p>
            </div>
          )}

          {!loading && !weather && !error && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-5xl mb-4">🌍</p>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  Simple Weather
                </h2>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Search for a city or allow location access to get started
                </p>
              </div>
            </div>
          )}

          {!loading && weather && (
            <>
              <CurrentWeatherCard
                weather={weather.current}
                locationName={
                  currentLocation
                    ? `${currentLocation.name}${currentLocation.country ? `, ${currentLocation.country}` : ""}`
                    : "Unknown"
                }
                unit={state.unit}
              />
              <HourlyForecast hourly={weather.hourly} unit={state.unit} />
              <WeatherDetails daily={weather.daily} />
              <DailyForecast daily={weather.daily} unit={state.unit} />
            </>
          )}
        </div>
      )}

      {page === "locations" && (
        <div className="max-w-2xl mx-auto space-y-4">
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Saved Locations
          </h2>
          <SearchBar onSelect={handleSelectCity} />
          <SavedLocations
            locations={state.locations}
            onSelect={handleSelectCity}
            onRemove={(idx) => {
              const next = [...state.locations];
              next.splice(idx, 1);
              persist({ locations: next });
            }}
            currentLat={currentLocation?.latitude}
            currentLon={currentLocation?.longitude}
          />
        </div>
      )}

      {page === "settings" && (
        <div className="max-w-md mx-auto space-y-6">
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Settings
          </h2>

          <div
            className="p-5 border"
            style={{
              borderRadius: "1.25rem",
              borderColor: "var(--line)",
              background: "var(--panel)",
            }}
          >
            <p className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>
              Temperature Unit
            </p>
            <div className="flex gap-2">
              {(["celsius", "fahrenheit"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => persist({ unit: u })}
                  className="flex-1 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    borderRadius: "0.75rem",
                    background: state.unit === u ? "var(--accent)" : "var(--paper)",
                    color: state.unit === u ? "#fff" : "var(--ink)",
                    border: `1px solid ${state.unit === u ? "var(--accent)" : "var(--line)"}`,
                  }}
                >
                  {u === "celsius" ? "°C Celsius" : "°F Fahrenheit"}
                </button>
              ))}
            </div>
          </div>

          <div
            className="p-5 border"
            style={{
              borderRadius: "1.25rem",
              borderColor: "var(--line)",
              background: "var(--panel)",
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>
              About
            </p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Simple Weather uses the free{" "}
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}
                className="hover:underline"
              >
                Open-Meteo API
              </a>{" "}
              for weather data. No account required, no tracking, no ads — just weather.
            </p>
          </div>

          <div
            className="p-5 border"
            style={{
              borderRadius: "1.25rem",
              borderColor: "var(--line)",
              background: "var(--panel)",
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>
              Data
            </p>
            <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
              All your data is stored locally on your device.
            </p>
            <button
              onClick={() => {
                if (confirm("Clear all saved locations and settings?")) {
                  localStorage.removeItem(STORAGE_KEY);
                  setState({ locations: [], unit: "celsius" });
                  setWeather(null);
                  setCurrentLocation(undefined);
                  setPage("weather");
                }
              }}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                borderRadius: "0.75rem",
                background: "var(--error)",
                color: "#fff",
              }}
            >
              Clear All Data
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}
