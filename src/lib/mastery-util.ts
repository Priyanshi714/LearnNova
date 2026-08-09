export interface TopicMastery {
  total: number;
  solved: number;
  pct: number;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
  lastRevisionDate: string | null;
  masteryLevel: "Beginner" | "Learning" | "Intermediate" | "Advanced" | "Master";
}

export function getMasteryLevel(
  pct: number,
): "Beginner" | "Learning" | "Intermediate" | "Advanced" | "Master" {
  if (pct <= 20) return "Beginner";
  if (pct <= 40) return "Learning";
  if (pct <= 60) return "Intermediate";
  if (pct <= 80) return "Advanced";
  return "Master";
}

export function calculateTopicMastery(
  topicId: string,
  problems: any[],
  problemTopics: any[],
  revisions: any[],
): TopicMastery {
  // Find problems associated with this topic (primary topic or secondary mapping)
  const topicProbs = problems.filter(
    (p) =>
      p.primary_topic_id === topicId ||
      problemTopics.some((pt) => pt.problem_id === p.id && pt.topic_id === topicId),
  );

  const total = topicProbs.length;
  const solved = topicProbs.filter((p) => p.status === "Solved").length;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  const easyTotal = topicProbs.filter((p) => p.difficulty === "Easy").length;
  const easySolved = topicProbs.filter(
    (p) => p.difficulty === "Easy" && p.status === "Solved",
  ).length;

  const mediumTotal = topicProbs.filter((p) => p.difficulty === "Medium").length;
  const mediumSolved = topicProbs.filter(
    (p) => p.difficulty === "Medium" && p.status === "Solved",
  ).length;

  const hardTotal = topicProbs.filter((p) => p.difficulty === "Hard").length;
  const hardSolved = topicProbs.filter(
    (p) => p.difficulty === "Hard" && p.status === "Solved",
  ).length;

  // Last revision date
  const topicProblemIds = new Set(topicProbs.map((p) => p.id));
  const topicRevisions = revisions.filter((r) => topicProblemIds.has(r.problem_id));
  let lastRevisionDate: string | null = null;
  if (topicRevisions.length > 0) {
    const sorted = [...topicRevisions].sort(
      (a, b) =>
        new Date(b.revised_at || b.created_at).getTime() -
        new Date(a.revised_at || a.created_at).getTime(),
    );
    lastRevisionDate = sorted[0].revised_at || sorted[0].created_at || null;
  }

  return {
    total,
    solved,
    pct,
    easySolved,
    easyTotal,
    mediumSolved,
    mediumTotal,
    hardSolved,
    hardTotal,
    lastRevisionDate,
    masteryLevel: getMasteryLevel(pct),
  };
}
