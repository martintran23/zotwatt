const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export const handler = async (event) => {
  // Match Lambda 1's output shape exactly
  const forecast = event.forecast ?? [];
  const locationObj = event.location ?? {};
  const latitude = locationObj.latitude ?? 33.6839;
  const longitude = locationObj.longitude ?? -117.8265;
  const location = `${latitude}, ${longitude}`;
  const appliances = event.appliances ?? [
    "EV charger",
    "dishwasher",
    "washing machine",
  ];

  // Filter to daylight hours only (solar_radiation > 0)
  const daylightHours = forecast.filter((h) => h.solar_radiation > 0);

  // Group by day
  const byDay = {};
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

  const prompt = `
    You are a solar energy efficiency assistant. A user at coordinates ${location} wants to know the best times over the next 7 days to run high-electricity appliances based on their solar panel output.

    Here is the hourly solar radiation forecast (daylight hours only):
    ${weatherSummary}

    The user has these appliances: ${appliances.join(", ")}.

    For each appliance, recommend the best time windows across the 7 days to maximize solar energy usage.
    Be specific with dates and times. Keep each recommendation to 1-2 sentences.
    Format your response as JSON like this:
    {
      "recommendations": [
        { "appliance": "EV charger", "bestTime": "2024-01-15 11:00 - 14:00", "reason": "..." },
        { "appliance": "dishwasher", "bestTime": "2024-01-16 12:00 - 13:00", "reason": "..." }
      ],
      "summary": "One sentence overall summary of the week's solar conditions"
    }
    Return only valid JSON, no markdown, no explanation outside the JSON.
  `;

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
