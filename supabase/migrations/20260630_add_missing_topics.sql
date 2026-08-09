-- 1. Alter public.topics table to add difficulty column if it doesn't exist
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS difficulty TEXT;

-- 2. Update existing topics descriptions and difficulty levels
UPDATE public.topics SET description = 'Basic linear data structure storing elements in contiguous memory locations.', difficulty = 'Beginner' WHERE name = 'Arrays';
UPDATE public.topics SET description = 'Sequential nodes linked by pointers, ideal for dynamic insertions/deletions.', difficulty = 'Beginner' WHERE name = 'Linked List';
UPDATE public.topics SET description = 'Last-In, First-Out (LIFO) structure useful for backtrack tracking and parsing.', difficulty = 'Beginner' WHERE name = 'Stack';
UPDATE public.topics SET description = 'First-In, First-Out (FIFO) structure commonly used for level-order BFS traversals.', difficulty = 'Beginner' WHERE name = 'Queue';
UPDATE public.topics SET description = 'Hierarchical non-linear structure of parent and child nodes representing relations.', difficulty = 'Intermediate' WHERE name = 'Trees';
UPDATE public.topics SET description = 'Sorted binary tree offering average O(log N) lookup, insertion, and deletion.', difficulty = 'Intermediate' WHERE name = 'BST';
UPDATE public.topics SET description = 'Tree-based structure maintaining min/max properties, perfect for priority queues.', difficulty = 'Intermediate' WHERE name = 'Heap';
UPDATE public.topics SET description = 'Network of vertices connected by edges representing arbitrary relationship maps.', difficulty = 'Advanced' WHERE name = 'Graph';
UPDATE public.topics SET description = 'Prefix tree structure optimizing retrieval and searches of string keys.', difficulty = 'Advanced' WHERE name = 'Trie';
UPDATE public.topics SET description = 'Key-value mapping using hash functions to achieve O(1) average lookup times.', difficulty = 'Beginner' WHERE name = 'Hashing';
UPDATE public.topics SET description = 'Efficient divide-and-conquer lookup algorithm running in O(log N) time on sorted data.', difficulty = 'Intermediate' WHERE name = 'Binary Search';
UPDATE public.topics SET description = 'Technique utilizing multiple references to scan array elements from different offsets.', difficulty = 'Beginner' WHERE name = 'Two Pointers';
UPDATE public.topics SET description = 'Subarray/substring optimization technique using sliding boundaries to track states.', difficulty = 'Intermediate' WHERE name = 'Sliding Window';
UPDATE public.topics SET description = 'Pre-computation technique enabling O(1) range sum queries on linear data.', difficulty = 'Beginner' WHERE name = 'Prefix Sum';
UPDATE public.topics SET description = 'Heuristic-based optimization making locally optimal choices at each decision step.', difficulty = 'Intermediate' WHERE name = 'Greedy';
UPDATE public.topics SET description = 'Recursive search algorithm exploring all pathways and discarding dead ends.', difficulty = 'Intermediate' WHERE name = 'Backtracking';
UPDATE public.topics SET description = 'Optimization solving complex problems by combining overlapping subproblems solutions.', difficulty = 'Advanced' WHERE name = 'Dynamic Programming';

-- 3. Insert the 8 missing DSA topics
INSERT INTO public.topics (name, description, difficulty)
SELECT 'Recursion', 'Programming technique where a function solves a problem by calling itself recursively.', 'Beginner'
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE name = 'Recursion');

INSERT INTO public.topics (name, description, difficulty)
SELECT 'Strings', 'Sequence of characters representing textual data, heavily tested with substring/matching algorithms.', 'Beginner'
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE name = 'Strings');

INSERT INTO public.topics (name, description, difficulty)
SELECT 'Sorting', 'Rearranging array elements into a specific order (ascending/descending) using O(N log N) algorithms.', 'Beginner'
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE name = 'Sorting');

INSERT INTO public.topics (name, description, difficulty)
SELECT 'Matrices (2D Arrays)', 'Two-dimensional grid structures representing tables, board games, or grid graphs.', 'Beginner'
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE name = 'Matrices (2D Arrays)');

INSERT INTO public.topics (name, description, difficulty)
SELECT 'Bit Manipulation', 'Low-level operations performing bitwise operations to solve mathematical/masking tasks.', 'Intermediate'
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE name = 'Bit Manipulation');

INSERT INTO public.topics (name, description, difficulty)
SELECT 'Intervals', 'Problems involving overlapping numerical ranges, heavily utilizing sorting and greedy sweeps.', 'Intermediate'
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE name = 'Intervals');

INSERT INTO public.topics (name, description, difficulty)
SELECT 'Math & Number Theory', 'Mathematical concepts including GCD, prime factorization, modular arithmetic, and algebra.', 'Intermediate'
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE name = 'Math & Number Theory');

INSERT INTO public.topics (name, description, difficulty)
SELECT 'Union Find (DSU)', 'Disjoint Set Union structure tracking partitioned elements and connectivity in O(alpha(N)).', 'Advanced'
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE name = 'Union Find (DSU)');
