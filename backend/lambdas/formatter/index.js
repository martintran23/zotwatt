exports.handler = async (event) => {
  // =========================
  // INPUT FROM ANALYZE DATA
  // =========================
  const recommendations = event.recommendations ?? [];
  const summary = event.summary ?? "No summary available";

  // =========================
  // BASIC VALIDATION (SAFE GUARD)
  // =========================
  if (!Array.isArray(recommendations)) {
    throw new Error("Invalid input: recommendations must be an array");
  }

  if (typeof summary !== "string") {
    throw new Error("Invalid input: summary must be a string");
  }

  // =========================
  // OPTIONAL NORMALIZATION
  // (ensures consistent schema)
  // =========================
  const normalizedRecommendations = recommendations.map((r) => ({
    appliance: r.appliance ?? "unknown",
    bestTime: r.bestTime ?? "N/A",
    reason: r.reason ?? "No reason provided",
  }));

  // =========================
  // CLEAN OUTPUT FOR STEP FUNCTIONS
  // =========================
  return {
    recommendations: normalizedRecommendations,
    summary,
  };
};
