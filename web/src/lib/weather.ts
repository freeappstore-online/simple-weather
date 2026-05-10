// Weather code to description & emoji mapping
export const weatherCodes: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Mainly clear", icon: "🌤️" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Overcast", icon: "☁️" },
  45: { description: "Foggy", icon: "🌫️" },
  48: { description: "Depositing rime fog", icon: "🌫️" },
  51: { description: "Light drizzle", icon: "🌦️" },
  53: { description: "Moderate drizzle", icon: "🌦️" },
  55: { description: "Dense drizzle", icon: "🌧️" },
  56: { description: "Light freezing drizzle", icon: "🌧️" },
  57: { description: "Dense freezing drizzle", icon: "🌧️" },
  61: { description: "Slight rain", icon: "🌧️" },
  63: { description: "Moderate rain", icon: "🌧️" },
  65: { description: "Heavy rain", icon: "🌧️" },
  66: { description: "Light freezing rain", icon: "🌧️" },
  67: { description: "Heavy freezing rain", icon: "🌧️" },
  71: { description: "Slight snowfall", icon: "🌨️" },
  73: { description: "Moderate snowfall", icon: "🌨️" },
  75: { description: "Heavy snowfall", icon: "❄️" },
  77: { description: "Snow grains", icon: "❄️" },
  80: { description: "Slight rain showers", icon: "🌦️" },
  81: { description: "Moderate rain showers", icon: "🌧️" },
  82: { description: "Violent rain showers", icon: "⛈️" },
  85: { description: "Slight snow showers", icon: "🌨️" },
  86: { description: "Heavy snow showers", icon: "🌨️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
  96: { description: "Thunderstorm with slight hail", icon: "⛈️" },
  99: { description: "Thunderstorm with heavy hail", icon: "⛈️" },
};

export function getWeatherInfo(code: number) {
  return weatherCodes[code] || { description: "Unknown", icon: "🌡️" };
}

export interface GeoResult {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
  humidity: number;
  apparent_temperature: number;
  is_day: number;
}

export interface HourlyForecast {
  time: string[];
  temperature_2m: number[];
  weathercode: number[];
  precipitation_probability: number[];
}

export interface DailyForecast {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
}

export async function searchCities(query: string): Promise<GeoResult[]> {
  if (query.length < 2) return [];
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  );
  const data = await res.json();
  return (data.results || []).map((r: any) => ({
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export async function fetchWeather(lat: number, lon: number, unit: "celsius" | "fahrenheit" = "celsius"): Promise<WeatherData> {
  const tempUnit = unit === "fahrenheit" ? "&temperature_unit=fahrenheit" : "";
  const windUnit = unit === "fahrenheit" ? "&wind_speed_unit=mph" : "";
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=7${tempUnit}${windUnit}`
  );
  const data = await res.json();
  return {
    current: {
      temperature: data.current.temperature_2m,
      windspeed: data.current.wind_speed_10m,
      weathercode: data.current.weather_code,
      humidity: data.current.relative_humidity_2m,
      apparent_temperature: data.current.apparent_temperature,
      is_day: data.current.is_day,
    },
    hourly: {
      time: data.hourly.time,
      temperature_2m: data.hourly.temperature_2m,
      weathercode: data.hourly.weather_code,
      precipitation_probability: data.hourly.precipitation_probability,
    },
    daily: {
      time: data.daily.time,
      weathercode: data.daily.weather_code,
      temperature_2m_max: data.daily.temperature_2m_max,
      temperature_2m_min: data.daily.temperature_2m_min,
      precipitation_probability_max: data.daily.precipitation_probability_max,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
      uv_index_max: data.daily.uv_index_max,
    },
  };
}
