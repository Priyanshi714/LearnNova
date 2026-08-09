import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/topics/$topic")({
  ssr: false,
  head: ({ params }) => ({ meta: [{ title: `${params.topic} — LearnNova` }] }),
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("topics")
      .select("id, name, description, difficulty")
      .eq("name", params.topic)
      .maybeSingle();

    if (error || !data) {
      throw notFound();
    }
    return {
      topicName: data.name,
      topicId: data.id,
      description: data.description,
      difficulty: data.difficulty,
    };
  },
  component: TopicDetail,
  notFoundComponent: () => (
    <div className="p-8 text-sm text-muted-foreground">Topic not found.</div>
  ),
});

interface TopicProblem {
  id: string;
  title: string;
  platform: string;
  difficulty: "Easy" | "Medium" | "Hard";
  primaryTopic: string;
  secondaryTopics: string[];
  solutionsCount: number;
  learningOrder?: number;
  createdAt: string;
}

function TopicDetail() {
  const { topicName, topicId, description, difficulty } = Route.useLoaderData() as {
    topicName: string;
    topicId: string;
    description?: string;
    difficulty?: string;
  };
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<TopicProblem[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("learning_order");

  const loadTopicProblems = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [problemsRes, solutionsRes] = await Promise.all([
      supabase
        .from("problems")
        .select("*, primary_topic:topics(name)")
        .eq("user_id", user.id)
        .eq("primary_topic_id", topicId),
      supabase.from("solutions").select("id, problem_id").eq("user_id", user.id),
    ]);

    const mapped: TopicProblem[] = (problemsRes.data || []).map((p) => {
      const pSols = (solutionsRes.data || []).filter(
        (s: { problem_id: string }) => s.problem_id === p.id,
      );
      return {
        id: p.id,
        title: p.title,
        platform: p.platform,
        difficulty: p.difficulty as "Easy" | "Medium" | "Hard",
        primaryTopic: (p.primary_topic as { name: string } | null)?.name || "Arrays",
        secondaryTopics: [],
        solutionsCount: pSols.length,
        learningOrder: p.learning_order || 0,
        createdAt: p.created_at,
      };
    });

    setProblems(mapped);
    setLoading(false);
  }, [topicId]);

  useEffect(() => {
    loadTopicProblems();
  }, [loadTopicProblems]);

  const patterns = useMemo(() => {
    const set = new Set<string>();
    set.add("All Problems");
    set.add(`Pure ${topicName}`);
    problems.forEach((p) => {
      const others = [p.primaryTopic, ...p.secondaryTopics].filter((t) => t !== topicName);
      others.forEach((o) => set.add(`${topicName} + ${o}`));
    });
    return Array.from(set);
  }, [topicName, problems]);

  const filtered = useMemo(() => {
    const list = problems.filter((p) => {
      if (filter === "All" || filter === "All Problems") return true;
      if (filter === `Pure ${topicName}`) {
        return p.primaryTopic === topicName && p.secondaryTopics.length === 0;
      }
      const other = filter.replace(`${topicName} + `, "");
      return [p.primaryTopic, ...p.secondaryTopics].includes(other);
    });

    // Apply sorting
    if (sortBy === "learning_order") {
      return [...list].sort((a, b) => {
        const orderA = a.learningOrder || 999999;
        const orderB = b.learningOrder || 999999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    }
    if (sortBy === "recently_solved") {
      return [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    if (sortBy === "difficulty") {
      const diffWeight = { Easy: 1, Medium: 2, Hard: 3 };
      return [...list].sort((a, b) => {
        const wA = diffWeight[a.difficulty] || 1;
        const wB = diffWeight[b.difficulty] || 1;
        if (wA !== wB) return wA - wB;
        return (a.learningOrder || 999999) - (b.learningOrder || 999999);
      });
    }
    if (sortBy === "alphabetical") {
      return [...list].sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      );
    }

    return list;
  }, [filter, topicName, problems, sortBy]);

  const related = useMemo(() => {
    return Array.from(
      new Set(problems.flatMap((p) => [p.primaryTopic, ...p.secondaryTopics])),
    ).filter((t) => t !== topicName);
  }, [topicName, problems]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading topic details...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
      <Link
        to="/topics"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to topics
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{topicName}</h1>
            {difficulty && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase mt-1",
                  difficulty === "Beginner" && "bg-success/10 text-success border-success/20",
                  difficulty === "Intermediate" && "bg-warning/10 text-warning border-warning/20",
                  difficulty === "Advanced" &&
                    "bg-purple-500/10 text-purple-400 border-purple-500/20",
                )}
              >
                {difficulty}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">{description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">{problems.length}</span> problems ·{" "}
            <span>Related: {related.slice(0, 4).join(", ") || "—"}</span>
          </p>
        </div>
        <Link
          to="/problems/new"
          search={{ topic: topicName }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          Add Problem
        </Link>
      </div>

      {/* Pattern filters and Sort By */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {patterns.map((p) => {
            const active = filter === p || (filter === "All" && p === "All Problems");
            return (
              <button
                key={p}
                onClick={() => setFilter(p === "All Problems" ? "All" : p)}
                className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto min-w-[170px]">
          <span className="text-xs text-muted-foreground font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 text-xs border-border/60 bg-card/40 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="learning_order">Learning Order</SelectItem>
              <SelectItem value="recently_solved">Recently Solved</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Problem list */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="divide-y divide-border/50 p-0">
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No problems match this filter.
            </div>
          )}
          {filtered.map((p) => (
            <Link
              key={p.id}
              to="/problems/$id"
              params={{ id: p.id }}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition hover:bg-background/30"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="truncate font-medium">
                    {p.learningOrder ? `#${p.learningOrder} ` : ""}
                    {p.title}
                  </span>
                  <DifficultyBadge difficulty={p.difficulty} />
                </div>
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {p.primaryTopic}
                  {p.secondaryTopics.length > 0 && ` + ${p.secondaryTopics.join(", ")}`} ·{" "}
                  {p.platform}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  {p.solutionsCount} {p.solutionsCount === 1 ? "solution" : "solutions"}
                </span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
