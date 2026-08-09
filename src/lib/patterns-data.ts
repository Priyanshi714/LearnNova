export interface PatternMetadata {
  recognitionClues: string[];
  commonMistakes: string[];
  codeTemplate: string;
  codeLanguage: string;
  learningResources: { title: string; url: string }[];
}

export const PATTERNS_METADATA: Record<string, PatternMetadata> = {
  "Sliding Window": {
    recognitionClues: [
      "The input is a linear data structure like an array, string, or linked list.",
      "The problem asks to find a subarray, substring, or subsegment that meets a certain constraint.",
      "You need to optimize (maximize/minimize) target criteria relative to a contiguous window size.",
      "A brute-force O(N^2) solution involves nested loops scanning all subarrays.",
    ],
    commonMistakes: [
      "Off-by-one errors when computing the window length: remember the formula is `right - left + 1`.",
      "Forgetting to update/reset frequency maps or state parameters when shrinking the left boundary.",
      "Failing to check edge cases, such as an empty array or cases where the window size exceeds the input length.",
      "Failing to shrink the window completely when invalid (use a `while` loop instead of `if` for conditional shrink).",
    ],
    codeTemplate: `function slidingWindow(arr, target) {
  let left = 0;
  let right = 0;
  let result = 0;
  const windowState = new Map();

  while (right < arr.length) {
    // 1. Expand the window
    const current = arr[right];
    windowState.set(current, (windowState.get(current) || 0) + 1);
    right++;

    // 2. Shrink window if state becomes invalid
    while (/* condition is invalid */) {
      const leftElement = arr[left];
      windowState.set(leftElement, windowState.get(leftElement) - 1);
      if (windowState.get(leftElement) === 0) {
        windowState.delete(leftElement);
      }
      left++;
    }

    // 3. Update the optimal result
    result = Math.max(result, right - left);
  }

  return result;
}`,
    codeLanguage: "javascript",
    learningResources: [
      {
        title: "LeetCode Sliding Window General Template Discussion",
        url: "https://leetcode.com/discuss/general-discussion/657507/sliding-window-for-beginners-problems-template-sample-solutions",
      },
      {
        title: "Sliding Window Technique - GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/window-sliding-technique/",
      },
    ],
  },
  "Two Pointers": {
    recognitionClues: [
      "The input is a sorted array or string, and you need to find pairs/triplets meeting a target condition.",
      "The task requires comparing elements at opposite ends of the structure (e.g. Palindrome detection).",
      "You are merging two sorted lists or searching for intersection points.",
      "The search space can be pruned linearly by moving pointers from both ends towards the center.",
    ],
    commonMistakes: [
      "Assuming the array is sorted when it is not (always sort first if needed).",
      "Index out-of-bound errors due to missing pointers intersection safety checks (always maintain `left < right`).",
      "Incorrect increment/decrement triggers leading to infinite loops.",
      "Failing to skip duplicate values when searching for unique pairs/triplets.",
    ],
    codeTemplate: `function twoPointers(sortedArr, target) {
  let left = 0;
  let right = sortedArr.length - 1;

  while (left < right) {
    const sum = sortedArr[left] + sortedArr[right];
    if (sum === target) {
      return [left, right]; // Found target
    } else if (sum < target) {
      left++; // Need a larger sum
    } else {
      right--; // Need a smaller sum
    }
  }
  return []; // No pair found
}`,
    codeLanguage: "javascript",
    learningResources: [
      {
        title: "Two Pointers Technique - GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/two-pointers-technique/",
      },
      {
        title: "LeetCode Two Pointers Tag Summary Card",
        url: "https://leetcode.com/tag/two-pointers/",
      },
    ],
  },
  "Binary Search": {
    recognitionClues: [
      "The input sequence is sorted, or the query search space is monotonic.",
      "You are optimizing for a threshold value (e.g., 'minimize the maximum' or 'maximize the minimum').",
      "An O(N) linear scan is too slow, and you need O(log N) runtime efficiency.",
    ],
    commonMistakes: [
      "Incorrect division boundary updates leading to infinite loop: use `low = mid + 1` or `high = mid - 1`.",
      "Integer overflow during mid calculation: use `low + Math.floor((high - low) / 2)` instead of `Math.floor((low + high) / 2)`.",
      "Setting incorrect initial boundaries for search space (e.g. leaving out negative values or extreme bounds).",
      "Off-by-one errors when checking loop completion criterion `low <= high` vs `low < high`.",
    ],
    codeTemplate: `function binarySearch(sortedArr, target) {
  let low = 0;
  let high = sortedArr.length - 1;

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (sortedArr[mid] === target) {
      return mid; // Element found
    } else if (sortedArr[mid] < target) {
      low = mid + 1; // Search right half
    } else {
      high = mid - 1; // Search left half
    }
  }
  return -1; // Element not found
}`,
    codeLanguage: "javascript",
    learningResources: [
      {
        title: "Powerful Binary Search Template - LeetCode",
        url: "https://leetcode.com/discuss/general-discussion/786126/detailed-binary-search-introduction-template-and-problems",
      },
      {
        title: "Binary Search Guide - TopCoder",
        url: "https://www.topcoder.com/community/competitive-programming/tutorials/binary-search-guide/",
      },
    ],
  },
  DFS: {
    recognitionClues: [
      "The problem asks to traverse all vertices/nodes in a graph or tree.",
      "You need to find a path from source to destination, or check connectivity.",
      "The solution structure naturally fits recursion or backtracking (trying all decisions).",
      "You need to compute properties like maximum depth, height, or cycles.",
    ],
    commonMistakes: [
      "Forgetting to mark visited nodes, resulting in infinite recursion or Stack Overflow on cyclic graphs.",
      "Failing to restore state during backtracking (not popping from current path).",
      "Incorrect base cases in recursion leading to infinite loops.",
    ],
    codeTemplate: `function dfs(node, visited = new Set()) {
  if (!node || visited.has(node.id)) return;
  
  // 1. Mark node as visited
  visited.add(node.id);
  console.log("Visiting node:", node.id);

  // 2. Recurse for all unvisited neighbors
  for (const neighbor of node.neighbors) {
    if (!visited.has(neighbor.id)) {
      dfs(neighbor, visited);
    }
  }
}`,
    codeLanguage: "javascript",
    learningResources: [
      {
        title: "Depth First Search - GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/",
      },
      {
        title: "DFS Tutorial - HackerEarth",
        url: "https://www.hackerearth.com/practice/algorithms/graphs/depth-first-search/tutorial/",
      },
    ],
  },
  BFS: {
    recognitionClues: [
      "You need to find the shortest path or minimum steps in an unweighted graph/grid.",
      "The traversal needs to explore nodes level-by-level (e.g. level order traversal of a tree).",
      "The problem space simulates a spreading process (like fire, water, or infection).",
    ],
    commonMistakes: [
      "Forgetting to mark nodes as visited *at the time of pushing to queue* (doing it at pop time causes duplicate additions).",
      "Using standard Arrays as queues in JavaScript for large N (causes O(N) shift operations; use a custom Queue class if needed for production).",
      "Incorrect queue size caching during level-by-level traversal.",
    ],
    codeTemplate: `function bfs(startNode) {
  const queue = [startNode];
  const visited = new Set([startNode.id]);
  let steps = 0;

  while (queue.length > 0) {
    const levelSize = queue.length;
    // Process current level
    for (let i = 0; i < levelSize; i++) {
      const current = queue.shift();
      console.log("Visiting node:", current.id);
      
      for (const neighbor of current.neighbors) {
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          queue.push(neighbor);
        }
      }
    }
    steps++;
  }
  return steps;
}`,
    codeLanguage: "javascript",
    learningResources: [
      {
        title: "Breadth First Search - GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/",
      },
    ],
  },
};

export function getPatternMetadata(name: string): PatternMetadata {
  const normalized = Object.keys(PATTERNS_METADATA).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  if (normalized && PATTERNS_METADATA[normalized]) {
    return PATTERNS_METADATA[normalized];
  }

  // Styled Generic Fallback
  return {
    recognitionClues: [
      `A custom tag pattern from your second brain catalog.`,
      `Problems matching this pattern contain the "${name}" tag.`,
      `Look for shared structures, inputs, or properties among the problems listed below.`,
    ],
    commonMistakes: [
      "Not writing down template boilerplates once you optimize an approach.",
      "Failing to review logged mistakes after solving problems inside this pattern.",
      "Forgetting to log spaced recall repetitions to strengthen your memory.",
    ],
    codeTemplate: `// Add code solutions or a template for "${name}" below.
// Reusable template structures save time in assessments.
function myTemplate() {
  // TODO: Add code logic
}`,
    codeLanguage: "javascript",
    learningResources: [
      {
        title: "Search LeetCode Discussions for Pattern",
        url: `https://leetcode.com/discuss/general-discussion?query=${encodeURIComponent(name)}`,
      },
      {
        title: "Google Search Pattern Guidelines",
        url: `https://www.google.com/search?q=${encodeURIComponent(name + " coding pattern dsa")}`,
      },
    ],
  };
}
