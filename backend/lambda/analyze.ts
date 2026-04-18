// backend/lambda/analyze.ts
// import { APIGatewayProxyHandler } from "aws-lambda";

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const {
    hours,
    location,
    appliances = ["EV charger", "dishwasher", "washing machine"],
  } = event;

  // Build a clean summary of the weather data to send to Gemini
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

  const geminiRes = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3 }, // lower = more consistent output
    }),
  });

  const geminiData = await geminiRes.json();

  console.log("Gemini response:", JSON.stringify(geminiData, null, 2)); // ADD THIS

  const rawText = geminiData.candidates[0].content.parts[0].text;

  return {
    statusCode: 200,
    rawText, // function 3 cleans this up
  };
};
