export interface ConceptMapping {
  prerequisites: string[];
}

export const TOPIC_PREREQUISITES: Record<string, ConceptMapping> = {
  "Linked List": {
    prerequisites: ["Arrays", "Pointers"],
  },
  "Binary Tree": {
    prerequisites: ["Recursion", "Queue"],
  },
  "Binary Search Tree": {
    prerequisites: ["Binary Tree", "Recursion"],
  },
  Graph: {
    prerequisites: ["Recursion", "Queue", "Stack"],
  },
  "Dynamic Programming": {
    prerequisites: ["Recursion", "Arrays", "Memoization"],
  },
  Trie: {
    prerequisites: ["Trees", "Hash Map"],
  },
  Heap: {
    prerequisites: ["Trees", "Arrays"],
  },
  "Sliding Window": {
    prerequisites: ["Arrays", "Two Pointers"],
  },
  Recursion: {
    prerequisites: ["Arrays"],
  },
  Strings: {
    prerequisites: ["Arrays"],
  },
  Sorting: {
    prerequisites: ["Arrays"],
  },
  "Matrices (2D Arrays)": {
    prerequisites: ["Arrays"],
  },
  "Bit Manipulation": {
    prerequisites: ["Math & Number Theory"],
  },
  Intervals: {
    prerequisites: ["Arrays", "Sorting"],
  },
  "Math & Number Theory": {
    prerequisites: ["Arrays"],
  },
  "Union Find (DSU)": {
    prerequisites: ["Graph", "Trees"],
  },
};

export function getPrerequisitesForTopic(topicName: string): string[] {
  const cleanName = topicName.trim().toLowerCase();

  // Find substring matches to handle variations in DB topic naming (e.g. "Linked List" vs "Linked Lists")
  if (cleanName.includes("linked list")) {
    return TOPIC_PREREQUISITES["Linked List"].prerequisites;
  }
  if (cleanName.includes("binary search tree") || cleanName === "bst") {
    return TOPIC_PREREQUISITES["Binary Search Tree"].prerequisites;
  }
  if (cleanName.includes("binary tree") || cleanName === "trees" || cleanName === "tree") {
    return TOPIC_PREREQUISITES["Binary Tree"].prerequisites;
  }
  if (cleanName.includes("graph")) {
    return TOPIC_PREREQUISITES["Graph"].prerequisites;
  }
  if (cleanName.includes("dynamic programming") || cleanName === "dp") {
    return TOPIC_PREREQUISITES["Dynamic Programming"].prerequisites;
  }
  if (cleanName.includes("trie")) {
    return TOPIC_PREREQUISITES["Trie"].prerequisites;
  }
  if (cleanName.includes("heap") || cleanName.includes("priority queue")) {
    return TOPIC_PREREQUISITES["Heap"].prerequisites;
  }
  if (cleanName.includes("sliding window")) {
    return TOPIC_PREREQUISITES["Sliding Window"].prerequisites;
  }
  if (cleanName.includes("recursion")) {
    return TOPIC_PREREQUISITES["Recursion"].prerequisites;
  }
  if (cleanName.includes("string")) {
    return TOPIC_PREREQUISITES["Strings"].prerequisites;
  }
  if (cleanName.includes("sorting")) {
    return TOPIC_PREREQUISITES["Sorting"].prerequisites;
  }
  if (
    cleanName.includes("matrix") ||
    cleanName.includes("2d array") ||
    cleanName.includes("matrices")
  ) {
    return TOPIC_PREREQUISITES["Matrices (2D Arrays)"].prerequisites;
  }
  if (cleanName.includes("bit manipulation") || cleanName.includes("bit")) {
    return TOPIC_PREREQUISITES["Bit Manipulation"].prerequisites;
  }
  if (cleanName.includes("interval")) {
    return TOPIC_PREREQUISITES["Intervals"].prerequisites;
  }
  if (cleanName.includes("math") || cleanName.includes("number theory")) {
    return TOPIC_PREREQUISITES["Math & Number Theory"].prerequisites;
  }
  if (cleanName.includes("union find") || cleanName.includes("dsu")) {
    return TOPIC_PREREQUISITES["Union Find (DSU)"].prerequisites;
  }

  // Exact lookup fallback
  const matchedKey = Object.keys(TOPIC_PREREQUISITES).find(
    (key) => key.toLowerCase() === cleanName,
  );
  if (matchedKey && TOPIC_PREREQUISITES[matchedKey]) {
    return TOPIC_PREREQUISITES[matchedKey].prerequisites;
  }

  return [];
}
