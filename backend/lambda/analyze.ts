import dotenv from "dotenv";
dotenv.config({ path: ".env" });

interface WeatherHour {
  time: string;
  score: number;
  cloudcover: number;
  temp?: number;
}

interface IncomingEvent {
  hours: WeatherHour[];
  location: string;
  appliances?: string[];
}

export const handler = async (event: IncomingEvent) => {
  // .env should be located in root directory
  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
  const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

  const {
    hours,
    location,
    appliances = ["EV charger", "dishwasher", "washing machine"],
  } = event;

  const weatherSummary = hours
    .map(
      (h) =>
        `${h.time}: solar score ${h.score} W/m², cloud cover ${h.cloudcover}%`,
    )
    .join("\n");

  const prompt = `
    You are a solar energy efficiency assistant. A user in ${location} wants to know the best times today to run high-electricity appliances based on their solar panel output.

    Here is today's hourly solar radiation data:
    ${weatherSummary}

    The user has these appliances: ${appliances.join(", ")}.

    For each appliance, recommend the best 1-2 hour windows to use it today to maximize solar energy usage.
    Be specific with times. Keep each recommendation to 1-2 sentences.
    Format your response as JSON like this:
    {
      "recommendations": [
        { "appliance": "EV charger", "bestTime": "11:00 AM - 2:00 PM", "reason": "..." },
        { "appliance": "dishwasher", "bestTime": "12:00 PM - 1:00 PM", "reason": "..." }
      ],
      "summary": "One sentence overall summary of today's solar conditions"
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

  return {
    statusCode: 200,
    rawText,
  };
};
