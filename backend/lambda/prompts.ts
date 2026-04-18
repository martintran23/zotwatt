export const analyze: (
  weatherSummary: string,
  appliances: string[],
) => string = (weatherSummary, appliances) => {
  return `
    You are a solar energy efficiency assistant. A user wants to know the best times over the next 7 days to run high-electricity appliances based on their solar panel output.

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
};
