import type { DailyForecast } from "../lib/weather";

interface Props {
  daily: DailyForecast;
}

export function WeatherDetails({ daily }: Props) {
  const today = daily;
  const sunrise = today.sunrise[0]
    ? new Date(today.sunrise[0]).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "--";
  const sunset = today.sunset[0]
    ? new Date(today.sunset[0]).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "--";
  const uvIndex = today.uv_index_max[0] ?? 0;

  let uvLabel = "Low";
  let uvColor = "var(--success)";
  if (uvIndex >= 8) {
    uvLabel = "Very High";
    uvColor = "var(--error)";
  } else if (uvIndex >= 6) {
    uvLabel = "High";
    uvColor = "var(--warning)";
  } else if (uvIndex >= 3) {
    uvLabel = "Moderate";
    uvColor = "var(--warning)";
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <DetailCard emoji="🌅" label="Sunrise" value={sunrise} />
      <DetailCard emoji="🌇" label="Sunset" value={sunset} />
      <DetailCard
        emoji="☀️"
        label="UV Index"
        value={`${Math.round(uvIndex)} — ${uvLabel}`}
        valueColor={uvColor}
      />
    </div>
  );
}

function DetailCard({
  emoji,
  label,
  value,
  valueColor,
}: {
  emoji: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      className="p-4 border"
      style={{
        borderRadius: "1.25rem",
        borderColor: "var(--line)",
        background: "var(--panel)",
      }}
    >
      <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
        {emoji} {label}
      </p>
      <p className="text-sm font-semibold" style={{ color: valueColor || "var(--ink)" }}>
        {value}
      </p>
    </div>
  );
}
