import { getWeatherInfo, type DailyForecast as DailyData } from "../lib/weather";

interface Props {
  daily: DailyData;
  unit: "celsius" | "fahrenheit";
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DailyForecast({ daily, unit }: Props) {
  const tempSymbol = unit === "fahrenheit" ? "°F" : "°C";

  return (
    <div
      className="border"
      style={{
        borderRadius: "1.25rem",
        borderColor: "var(--line)",
        background: "var(--panel)",
      }}
    >
      <div className="px-5 pt-4 pb-2">
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
          📅 7-Day Forecast
        </h3>
      </div>
      <div className="px-3 pb-3">
        {daily.time.map((t, i) => {
          const date = new Date(t + "T00:00:00");
          const info = getWeatherInfo(daily.weathercode[i]);
          const isToday = i === 0;

          return (
            <div
              key={t}
              className="flex items-center gap-3 px-3 py-3"
              style={{
                borderBottom: i < daily.time.length - 1 ? "1px solid var(--line)" : undefined,
              }}
            >
              <span
                className="text-sm font-medium w-10 shrink-0"
                style={{ color: isToday ? "var(--accent)" : "var(--ink)" }}
              >
                {isToday ? "Today" : dayNames[date.getDay()]}
              </span>
              <span className="text-xl shrink-0">{info.icon}</span>
              {daily.precipitation_probability_max[i] > 0 ? (
                <span className="text-xs w-10 shrink-0" style={{ color: "var(--accent)" }}>
                  💧{daily.precipitation_probability_max[i]}%
                </span>
              ) : (
                <span className="w-10 shrink-0" />
              )}
              <div className="flex-1 flex items-center justify-end gap-2">
                <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                  {Math.round(daily.temperature_2m_max[i])}{tempSymbol}
                </span>
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  {Math.round(daily.temperature_2m_min[i])}{tempSymbol}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
