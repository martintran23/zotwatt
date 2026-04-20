import { analyze_prompt } from "./prompts";

interface ForecastHour {
  time: string;
  temperature: number;
  cloud_cover: number;
  solar_radiation: number;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface IncomingEvent {
  forecast: ForecastHour[];
  location: Location;
  appliances?: string[];
}

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export const handler = async (event: IncomingEvent) => {
  const forecast = event.forecast ?? [];
  // const locationObj = event.location ?? {};
  // const location = `lat ${locationObj.latitude ?? 33.6839}, lon ${locationObj.longitude ?? -117.8265}`;
  const appliances = event.appliances ?? [
    "EV charger",
    "dishwasher",
    "washing machine",
  ];

  // Filter to daylight hours only (solar_radiation > 0)
  const daylightHours = forecast.filter((h) => h.solar_radiation > 0);

  // Group by day
  const byDay: Record<string, ForecastHour[]> = {};
  for (const h of daylightHours) {
    const day = h.time.split("T")[0];
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(h);
  }

  const weatherSummary = Object.entries(byDay)
    .map(([day, dayHours]) => {
      const hourLines = dayHours
        .map(
          (h) =>
            `  ${h.time.split("T")[1]}: ${h.solar_radiation} W/m², cloud cover ${h.cloud_cover}%, temp ${h.temperature}°C`,
        )
        .join("\n");
      return `${day}:\n${hourLines}`;
    })
    .join("\n\n");

  const prompt = analyze_prompt(weatherSummary, appliances);

  const nimRes = await fetch(NVIDIA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-8b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  const nimData = await nimRes.json();
  console.log("NIM response:", JSON.stringify(nimData, null, 2));

  if (!nimRes.ok || nimData.error) {
    throw new Error(
      `NVIDIA NIM error ${nimData.error?.code ?? nimRes.status}: ${nimData.error?.message ?? "Unknown error"}`,
    );
  }

  const rawText = nimData.choices[0].message.content;

  // Strip markdown backticks if model added them
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  // Validate JSON before passing to Lambda 3
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`NVIDIA returned invalid JSON: ${cleaned}`);
  }

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      recommendations: parsed.recommendations,
      summary: parsed.summary,
    }),
  };
};
