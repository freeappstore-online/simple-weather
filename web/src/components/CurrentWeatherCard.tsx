import { getWeatherInfo, type CurrentWeather } from "../lib/weather";

interface Props {
  weather: CurrentWeather;
  locationName: string;
  unit: "celsius" | "fahrenheit";
}

export function CurrentWeatherCard({ weather, locationName, unit }: Props) {
  const info = getWeatherInfo(weather.weathercode);
  const tempSymbol = unit === "fahrenheit" ? "°F" : "°C";
  const windUnit = unit === "fahrenheit" ? "mph" : "km/h";

  return (
    <div
      className="p-6 border"
      style={{
        borderRadius: "1.25rem",
        borderColor: "var(--line)",
        background: "var(--panel)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            📍 {locationName}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {info.description}
          </p>
        </div>
        <span className="text-5xl">{info.icon}</span>
      </div>

      <div className="flex items-baseline gap-2 mb-6">
        <span
          className="text-6xl font-bold tracking-tight"
          style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}
        >
          {Math.round(weather.temperature)}
        </span>
        <span className="text-2xl font-medium" style={{ color: "var(--muted)" }}>
          {tempSymbol}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Feels like" value={`${Math.round(weather.apparent_temperature)}${tempSymbol}`} />
        <StatBox label="Humidity" value={`${weather.humidity}%`} />
        <StatBox label="Wind" value={`${Math.round(weather.windspeed)} ${windUnit}`} />
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="p-3 text-center"
      style={{
        borderRadius: "0.75rem",
        background: "var(--paper)",
        border: "1px solid var(--line)",
      }}
    >
      <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
        {value}
      </p>
    </div>
  );
}
