import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FolderTree,
  ArrowRight,
  Clock,
  Columns,
  Link2,
  Layers,
  ArrowRightLeft,
  GitFork,
  Binary,
  ChevronDownSquare,
  Network,
  GitBranch,
  Hash,
  Search,
  ArrowLeftRight,
  RectangleHorizontal,
  PlusCircle,
  Coins,
  RotateCcw,
  TrendingUp,
  Repeat,
  Type,
  Sliders,
  Grid,
  Cpu,
  Calendar,
  Percent,
  Merge,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getTopics } from "@/lib/topics";
import { calculateTopicMastery } from "@/lib/mastery-util";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  PageContainer,
  PageHeader,
  SearchInput,
  ActionCard,
  EmptyState,
  CardSkeleton,
  MasteryBadge,
  SlideUp,
  FadeIn,
} from "@/components/design-system";

export const Route = createFileRoute("/_app/topics/")({
  head: () => ({ meta: [{ title: "Topics — LearnNova" }] }),
  component: TopicsPage,
});

interface TopicData {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  problemsCount: number;
  solvedCount: number;
  progressPct: number;
  masteryLevel: string;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
  lastRevision: string;
  dueCount: number;
}

const getTopicIcon = (name: string) => {
  const clean = name.toLowerCase();
  if (clean.includes("array") && !clean.includes("2d")) return Columns;
  if (clean.includes("linked list")) return Link2;
  if (clean.includes("stack")) return Layers;
  if (clean.includes("queue") && !clean.includes("priority")) return ArrowRightLeft;
  if (clean.includes("bst") || clean.includes("binary search tree")) return Binary;
  if (clean.includes("tree")) return GitFork;
  if (clean.includes("heap") || clean.includes("priority queue")) return ChevronDownSquare;
  if (clean.includes("graph")) return Network;
  if (clean.includes("trie")) return GitBranch;
  if (clean.includes("hash")) return Hash;
  if (clean.includes("binary search")) return Search;
  if (clean.includes("two pointer")) return ArrowLeftRight;
  if (clean.includes("sliding window")) return RectangleHorizontal;
  if (clean.includes("prefix sum")) return PlusCircle;
  if (clean.includes("greedy")) return Coins;
  if (clean.includes("backtrack")) return RotateCcw;
  if (clean.includes("dynamic programming") || clean === "dp") return TrendingUp;
  if (clean.includes("recursion")) return Repeat;
  if (clean.includes("string")) return Type;
  if (clean.includes("sort")) return Sliders;
  if (clean.includes("matrix") || clean.includes("2d array") || clean.includes("matrices"))
    return Grid;
  if (clean.includes("bit manipulation") || clean.includes("bit")) return Cpu;
  if (clean.includes("interval")) return Calendar;
  if (clean.includes("math") || clean.includes("number theory")) return Percent;
  if (clean.includes("union find") || clean.includes("dsu")) return Merge;
  return FolderTree;
};

function TopicsPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [topicsList, setTopicsList] = useState<TopicData[]>([]);

  const loadTopicsData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [dbTopics, problemsRes, problemTopicsRes, revisionsRes] = await Promise.all([
      getTopics(),
      supabase.from("problems").select("*").eq("user_id", user.id),
      supabase.from("problem_topics").select("*"),
      supabase.from("revisions").select("*").eq("user_id", user.id),
    ]);

    const problems = problemsRes.data || [];
    const problemTopics = problemTopicsRes.data || [];
    const revisions = revisionsRes.data || [];

    const calculated: TopicData[] = dbTopics.map((t) => {
      const mastery = calculateTopicMastery(t.id, problems, problemTopics, revisions);

      const topicProbs = problems.filter(
        (p) =>
          p.primary_topic_id === t.id ||
          problemTopics.some((pt) => pt.problem_id === p.id && pt.topic_id === t.id),
      );
      const dueCount = topicProbs.filter((p) => p.status === "Revising").length;

      let lastRevision = "No revision yet";
      if (mastery.lastRevisionDate) {
        lastRevision = new Date(mastery.lastRevisionDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }

      return {
        id: t.id,
        name: t.name,
        description: t.description || "",
        difficulty: t.difficulty || "Beginner",
        problemsCount: mastery.total,
        solvedCount: mastery.solved,
        progressPct: mastery.pct,
        masteryLevel: mastery.masteryLevel,
        easySolved: mastery.easySolved,
        easyTotal: mastery.easyTotal,
        mediumSolved: mastery.mediumSolved,
        mediumTotal: mastery.mediumTotal,
        hardSolved: mastery.hardSolved,
        hardTotal: mastery.hardTotal,
        lastRevision,
        dueCount,
      };
    });

    setTopicsList(calculated);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTopicsData();
  }, [loadTopicsData]);

  const filteredList = useMemo(() => {
    return topicsList.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));
  }, [topicsList, q]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Topics" subtitle="Pattern-based learning. Master groups, not lists." />
        <div className="h-10 w-full max-w-md bg-muted/20 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <FadeIn>
        <PageHeader title="Topics" subtitle="Pattern-based learning. Master groups, not lists." />
      </FadeIn>

      <div className="relative max-w-md">
        <SearchInput
          placeholder="Search topics…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onClear={() => setQ("")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredList.map((topic, index) => {
          const TopicIcon = getTopicIcon(topic.name);
          return (
            <SlideUp key={topic.id} delay={index * 40}>
              <Link to="/topics/$topic" params={{ topic: topic.name }} className="block h-full">
                <ActionCard className="h-full flex flex-col justify-between" hoverEffect>
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                          <TopicIcon className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase",
                              topic.difficulty === "Beginner" &&
                                "bg-success/10 text-success border-success/20",
                              topic.difficulty === "Intermediate" &&
                                "bg-warning/10 text-warning border-warning/20",
                              topic.difficulty === "Advanced" &&
                                "bg-purple-500/10 text-purple-400 border-purple-500/20",
                            )}
                          >
                            {topic.difficulty}
                          </span>
                          <MasteryBadge level={topic.masteryLevel} />
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                        </div>
                      </div>

                      <div>
                        <h3
                          className="text-sm font-semibold tracking-tight text-foreground truncate"
                          title={topic.name}
                        >
                          {topic.name}
                        </h3>
                        {topic.description && (
                          <p
                            className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed"
                            title={topic.description}
                          >
                            {topic.description}
                          </p>
                        )}
                      </div>
                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground font-medium">Progress</span>
                          <span className="font-semibold text-foreground">
                            {topic.progressPct}%
                          </span>
                        </div>
                        <Progress value={topic.progressPct} className="h-1.5 bg-muted/40" />
                      </div>

                      {/* Solved ratio & due */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            Solved / Total
                          </span>
                          <span className="text-sm font-semibold text-foreground mt-0.5">
                            {topic.solvedCount} / {topic.problemsCount}
                          </span>
                        </div>
                        {topic.dueCount > 0 && (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                              Due
                            </span>
                            <span className="text-sm font-semibold text-warning mt-0.5 animate-pulse">
                              {topic.dueCount}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Difficulty Breakdown Grid */}
                      <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center pt-1">
                        <div className="bg-background/40 py-1.5 px-1.5 rounded-lg border border-border/20">
                          <span className="text-muted-foreground block text-[8px] uppercase tracking-wider font-semibold">
                            Easy
                          </span>
                          <span className="font-bold text-success">
                            {topic.easySolved} / {topic.easyTotal}
                          </span>
                        </div>
                        <div className="bg-background/40 py-1.5 px-1.5 rounded-lg border border-border/20">
                          <span className="text-muted-foreground block text-[8px] uppercase tracking-wider font-semibold">
                            Med
                          </span>
                          <span className="font-bold text-warning">
                            {topic.mediumSolved} / {topic.mediumTotal}
                          </span>
                        </div>
                        <div className="bg-background/40 py-1.5 px-1.5 rounded-lg border border-border/20">
                          <span className="text-muted-foreground block text-[8px] uppercase tracking-wider font-semibold">
                            Hard
                          </span>
                          <span className="font-bold text-destructive">
                            {topic.hardSolved} / {topic.hardTotal}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Last Revision */}
                    <div className="border-t border-border/10 pt-3 text-[10px] text-muted-foreground flex items-center justify-between mt-auto">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5 opacity-70" /> Last Revision
                      </span>
                      <span className="text-foreground font-semibold">{topic.lastRevision}</span>
                    </div>
                  </div>
                </ActionCard>
              </Link>
            </SlideUp>
          );
        })}
        {filteredList.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={<FolderTree className="h-5 w-5" />}
              title="No topics found"
              description={
                q ? "Try refining your search query." : "No topics are currently available."
              }
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
