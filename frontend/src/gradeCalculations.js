// Letter grade scale, as confirmed for GIU: percentage cutoffs, highest first.
export const GRADE_SCALE = [
  { letter: "A+", min: 94 },
  { letter: "A", min: 90 },
  { letter: "A-", min: 86 },
  { letter: "B+", min: 82 },
  { letter: "B", min: 78 },
  { letter: "B-", min: 74 },
  { letter: "C+", min: 70 },
  { letter: "C", min: 65 },
  { letter: "C-", min: 60 },
  { letter: "D+", min: 55 },
  { letter: "D", min: 50 },
];

export function letterForPercentage(pct) {
  if (pct === null || pct === undefined || isNaN(pct)) return "-";
  for (const g of GRADE_SCALE) {
    if (pct >= g.min) return g.letter;
  }
  return "F";
}

// Given a category and the grade items belonging to it, returns:
// { scorePercent, countedItemIds } where scorePercent is null if there are no items yet.
export function computeCategoryScore(category, items) {
  if (category.isMidterm) {
    const item = items[0];
    if (!item || item.percentage === null || item.percentage === undefined) {
      return { scorePercent: null, countedItemIds: [] };
    }
    return { scorePercent: item.percentage, countedItemIds: [item._id] };
  }

  if (items.length === 0) return { scorePercent: null, countedItemIds: [] };

  const withPct = items
    .filter((i) => i.max)
    .map((i) => ({ ...i, pct: (i.obtained / i.max) * 100 }))
    .sort((a, b) => b.pct - a.pct);

  const n = category.keepBestN || withPct.length;
  const kept = withPct.slice(0, n);
  const avg = kept.reduce((sum, i) => sum + i.pct, 0) / kept.length;

  return {
    scorePercent: avg,
    countedItemIds: kept.map((i) => i._id),
  };
}

// Given all categories and all items (grouped), returns overall % and letter,
// only counting categories that have at least one item so far.
export function computeOverall(categories, itemsByCategoryId) {
  let weightedSum = 0;
  let weightCounted = 0;
  const perCategory = {};

  for (const cat of categories) {
    const items = itemsByCategoryId[cat._id] || [];
    const { scorePercent, countedItemIds } = computeCategoryScore(cat, items);
    perCategory[cat._id] = { scorePercent, countedItemIds };
    if (scorePercent !== null) {
      weightedSum += scorePercent * (cat.weight / 100);
      weightCounted += cat.weight;
    }
  }

  const overall = weightCounted > 0 ? weightedSum : null;
  return {
    overall,
    letter: overall === null ? "-" : letterForPercentage(overall),
    weightCounted,
    perCategory,
  };
}

// --- Reverse calculator (Sprint 6) ---
// Everything below assumes exactly one category is flagged isFinal, and treats
// every OTHER category's current score as locked in (already graded).

function achievedExcludingFinal(categories, itemsByCategoryId, finalCategory) {
  const otherCategories = categories.filter((c) => c._id !== finalCategory._id);
  const { overall } = computeOverall(otherCategories, itemsByCategoryId);
  return overall || 0;
}

// For each letter grade, the raw % needed on the Final category to reach it.
export function computeAchievableGrades(categories, itemsByCategoryId) {
  const finalCategory = categories.find((c) => c.isFinal);
  if (!finalCategory) return null;

  const achieved = achievedExcludingFinal(categories, itemsByCategoryId, finalCategory);

  return GRADE_SCALE.map((g) => {
    const neededRaw =
      finalCategory.weight > 0
        ? ((g.min - achieved) / finalCategory.weight) * 100
        : Infinity;
    return {
      letter: g.letter,
      neededRaw: Math.max(0, neededRaw),
      achievable: neededRaw <= 100,
    };
  });
}

// The specific pass condition: overall course total >= 50% AND Final itself >= 30%.
// Returns the raw % needed on the Final to satisfy BOTH rules at once, and whether
// that's still possible (<=100%).
export function computePassRequirement(categories, itemsByCategoryId) {
  const finalCategory = categories.find((c) => c.isFinal);
  if (!finalCategory) return null;

  const achieved = achievedExcludingFinal(categories, itemsByCategoryId, finalCategory);

  const neededFor50Overall =
    finalCategory.weight > 0
      ? ((50 - achieved) / finalCategory.weight) * 100
      : Infinity;

  // Must satisfy both: >=30% on the final itself, AND enough to reach 50% overall.
  const neededFinalRaw = Math.max(30, neededFor50Overall);

  const finalItems = itemsByCategoryId[finalCategory._id] || [];
  const { scorePercent: finalScoreSoFar } = computeCategoryScore(finalCategory, finalItems);

  return {
    finalCategory,
    achievedExcludingFinal: achieved,
    neededFinalRaw,
    possible: neededFinalRaw <= 100,
    finalScoreSoFar, // null if the final hasn't been graded yet
    currentlyPassing:
      finalScoreSoFar !== null
        ? finalScoreSoFar >= 30 &&
          achieved + (finalScoreSoFar * finalCategory.weight) / 100 >= 50
        : null,
  };
}
