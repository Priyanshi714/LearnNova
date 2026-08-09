export interface SearchResult {
  id: string;
  problemId: string;
  problemTitle: string;
  category:
    | "Problems"
    | "Solutions"
    | "Extra Notes"
    | "Related Problems"
    | "Journal"
    | "Revision History";
  title: string;
  snippet: string;
  tab: "info" | "solutions" | "notes" | "related_problems" | "journal" | "revisions";
}

export function getSnippet(text: string, query: string, maxLength = 100): string {
  if (!text) return "";
  const cleanText = text.replace(/[\n\r]+/g, " ");
  const idx = cleanText.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) {
    return cleanText.length > maxLength ? cleanText.slice(0, maxLength) + "..." : cleanText;
  }
  const start = Math.max(0, idx - 30);
  const end = Math.min(cleanText.length, idx + query.length + 60);
  let snippet = cleanText.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < cleanText.length) snippet = snippet + "...";
  return snippet;
}

export function searchLocalIndex(
  query: string,
  data: {
    problems: any[];
    solutions: any[];
    notes: any[];
    related: any[];
    journals: any[];
    revisions: any[];
  },
): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];

  // Helper map to quickly find problem titles
  const problemMap = new Map<string, string>();
  data.problems.forEach((p) => {
    problemMap.set(p.id, p.title);
  });

  // 1. Search Problems
  data.problems.forEach((p) => {
    const titleMatch = p.title?.toLowerCase().includes(q);
    // Supposed description/content matching
    const descMatch = p.description?.toLowerCase().includes(q) || false;

    if (titleMatch || descMatch) {
      results.push({
        id: p.id,
        problemId: p.id,
        problemTitle: p.title,
        category: "Problems",
        title: p.title,
        snippet: titleMatch
          ? `Problem on ${p.platform} (${p.difficulty})`
          : getSnippet(p.description || "", q),
        tab: "info",
      });
    }
  });

  // 2. Search Solutions
  data.solutions.forEach((s) => {
    const nameMatch = s.solution_name?.toLowerCase().includes(q);
    const approachMatch = s.approach?.toLowerCase().includes(q);
    const mistakesMatch = s.mistakes?.toLowerCase().includes(q);
    const notesMatch = s.notes?.toLowerCase().includes(q);

    if (nameMatch || approachMatch || mistakesMatch || notesMatch) {
      let snippet = "";
      if (approachMatch) snippet = `Approach: ${getSnippet(s.approach, q)}`;
      else if (mistakesMatch) snippet = `Mistakes: ${getSnippet(s.mistakes, q)}`;
      else if (notesMatch) snippet = `Notes: ${getSnippet(s.notes, q)}`;
      else
        snippet = `Language: ${s.language} · Complexity: ${s.time_complexity || s.timeComplexity || "O(N)"}`;

      results.push({
        id: s.id,
        problemId: s.problem_id,
        problemTitle: problemMap.get(s.problem_id) || "Unknown Problem",
        category: "Solutions",
        title: s.solution_name || "Solution",
        snippet,
        tab: "solutions",
      });
    }
  });

  // 3. Search Extra Notes
  data.notes.forEach((n) => {
    const titleMatch = n.title?.toLowerCase().includes(q);
    const contentMatch = n.content?.toLowerCase().includes(q);

    if (titleMatch || contentMatch) {
      results.push({
        id: n.id,
        problemId: n.problem_id,
        problemTitle: problemMap.get(n.problem_id) || "Unknown Problem",
        category: "Extra Notes",
        title: n.title || "Note",
        snippet: getSnippet(n.content, q),
        tab: "notes",
      });
    }
  });

  // 4. Search Related Problems
  data.related.forEach((r) => {
    const titleMatch = r.title?.toLowerCase().includes(q);
    const solMatch = r.solution?.toLowerCase().includes(q);
    const notesMatch = r.notes?.toLowerCase().includes(q);

    if (titleMatch || solMatch || notesMatch) {
      let snippet = "";
      if (solMatch) snippet = `Solution: ${getSnippet(r.solution, q)}`;
      else if (notesMatch) snippet = `Notes: ${getSnippet(r.notes, q)}`;
      else snippet = "Linked related question";

      results.push({
        id: r.id,
        problemId: r.problem_id,
        problemTitle: problemMap.get(r.problem_id) || "Unknown Problem",
        category: "Related Problems",
        title: r.title || "Related Problem",
        snippet,
        tab: "related_problems",
      });
    }
  });

  // 5. Search Journal
  data.journals.forEach((j) => {
    const learnedMatch = j.learned?.toLowerCase().includes(q);
    const mistakesMatch = j.mistakes?.toLowerCase().includes(q);
    const revNotesMatch = j.revision_notes?.toLowerCase().includes(q);

    if (learnedMatch || mistakesMatch || revNotesMatch) {
      let snippet = "";
      if (learnedMatch) snippet = `Learned: ${getSnippet(j.learned, q)}`;
      else if (mistakesMatch) snippet = `Mistakes: ${getSnippet(j.mistakes, q)}`;
      else if (revNotesMatch) snippet = `Revision Notes: ${getSnippet(j.revision_notes, q)}`;

      results.push({
        id: j.id,
        problemId: j.problem_id,
        problemTitle: problemMap.get(j.problem_id) || "Unknown Problem",
        category: "Journal",
        title: "Personal Journal",
        snippet,
        tab: "journal",
      });
    }
  });

  // 6. Search Revision History
  data.revisions.forEach((r) => {
    const notesMatch = r.notes?.toLowerCase().includes(q);

    if (notesMatch) {
      results.push({
        id: r.id,
        problemId: r.problem_id,
        problemTitle: problemMap.get(r.problem_id) || "Unknown Problem",
        category: "Revision History",
        title: `Revision Log (${r.revision_type || "Review"})`,
        snippet: getSnippet(r.notes, q),
        tab: "revisions",
      });
    }
  });

  return results;
}
