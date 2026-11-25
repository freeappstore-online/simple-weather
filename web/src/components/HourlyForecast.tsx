import { useMemo } from "react";
import { getWeatherInfo, type HourlyForecast as HourlyData } from "../lib/weather";

interface Props {
  hourly: HourlyData;
  currentTime: string;
  unit: "celsius" | "fahrenheit";
}

export function HourlyForecast({ hourly, currentTime, unit }: Props) {
  const tempSymbol = unit === "fahrenheit" ? "°F" : "°C";

  const hours = useMemo(() => {
    // Times are location-local ("2026-11-25T22:00"); match the location's current hour
    const currentHour = currentTime.slice(0, 13);
    const startIdx = hourly.time.findIndex((t) => t.slice(0, 13) === currentHour);

    if (startIdx === -1) return [];

    return Array.from({ length: 24 }, (_, i) => {
      const idx = startIdx + i;
      if (idx >= hourly.time.length) return null;
      const d = new Date(hourly.time[idx]);
      return {
        time: i === 0 ? "Now" : d.toLocaleTimeString([], { hour: "numeric" }),
        temp: Math.round(hourly.temperature_2m[idx]),
        code: hourly.weathercode[idx],
        precip: hourly.precipitation_probability[idx],
      };
    }).filter(Boolean);
  }, [hourly, currentTime]);

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
          🕐 Hourly Forecast
        </h3>
      </div>
      <div className="flex overflow-x-auto gap-1 px-3 pb-4 scrollbar-hide">
        {hours.map((h: any, i: number) => {
          const info = getWeatherInfo(h.code);
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 px-3 py-2 shrink-0"
              style={{ minWidth: "4rem" }}
            >
              <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                {h.time}
              </span>
              <span className="text-xl">{info.icon}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                {h.temp}{tempSymbol}
              </span>
              {h.precip > 0 && (
                <span className="text-xs" style={{ color: "var(--accent)" }}>
                  💧{h.precip}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
