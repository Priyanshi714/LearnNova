import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CodeBlock } from "@/components/editor/code-block";
import { MarkdownRenderer } from "@/components/editor/markdown-renderer";
import {
  ArrowLeft,
  GitBranch,
  Lightbulb,
  AlertTriangle,
  Code2,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Play,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getMasteryLevel } from "@/lib/mastery-util";
import { getPatternMetadata } from "@/lib/patterns-data";
import {
  PageContainer,
  PageHeader,
  GlassCard,
  MasteryBadge,
  DifficultyBadge,
  EmptyState,
  ListSkeleton,
  FadeIn,
  SlideUp,
} from "@/components/design-system";

export const Route = createFileRoute("/_app/patterns/$pattern")({
  ssr: false,
  head: ({ params }) => ({ meta: [{ title: `${params.pattern} Pattern — LearnNova` }] }),
  loader: async ({ params }) => {
    return { patternName: params.pattern };
  },
  component: PatternDetailPage,
});

interface PatternProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: string;
  platform: string;
  primaryTopic: string;
}

function PatternDetailPage() {
  const { patternName } = Route.useLoaderData() as { patternName: string };
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<PatternProblem[]>([]);

  const loadPatternProblems = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: problemsRes, error } = await supabase
      .from("problems")
      .select("*, primary_topic:topics(name)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to load problems for pattern detail:", error);
      setLoading(false);
      return;
    }

    const matching = (problemsRes || [])
      .filter((p) => {
        const tags = p.tags || [];
        return tags
          .map((t: string) => t.trim().toLowerCase())
          .includes(patternName.trim().toLowerCase());
      })
      .map((p) => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty as "Easy" | "Medium" | "Hard",
        status: p.status,
        platform: p.platform,
        primaryTopic: p.primary_topic?.name || "Arrays",
      }));

    setProblems(matching);
    setLoading(false);
  }, [patternName]);

  useEffect(() => {
    loadPatternProblems();
  }, [loadPatternProblems]);

  // Aggregate calculations
  const stats = useMemo(() => {
    const total = problems.length;
    const solved = problems.filter((p) => p.status === "Solved").length;
    const remaining = total - solved;
    const progressPct = total > 0 ? Math.round((solved / total) * 100) : 0;
    const masteryLevel = getMasteryLevel(progressPct);

    const easyTotal = problems.filter((p) => p.difficulty === "Easy").length;
    const easySolved = problems.filter(
      (p) => p.difficulty === "Easy" && p.status === "Solved",
    ).length;

    const mediumTotal = problems.filter((p) => p.difficulty === "Medium").length;
    const mediumSolved = problems.filter(
      (p) => p.difficulty === "Medium" && p.status === "Solved",
    ).length;

    const hardTotal = problems.filter((p) => p.difficulty === "Hard").length;
    const hardSolved = problems.filter(
      (p) => p.difficulty === "Hard" && p.status === "Solved",
    ).length;

    return {
      total,
      solved,
      remaining,
      progressPct,
      masteryLevel,
      easyTotal,
      easySolved,
      mediumTotal,
      mediumSolved,
      hardTotal,
      hardSolved,
    };
  }, [problems]);

  // Retrieve data-driven clues/templates/mistakes/resources
  const metadata = useMemo(() => getPatternMetadata(patternName), [patternName]);

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="h-6 w-32 bg-muted/20 animate-pulse rounded" />
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/20 animate-pulse rounded-xl" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted/20 animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted/20 animate-pulse rounded" />
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] mt-6">
          <div className="space-y-6">
            <div className="h-32 bg-muted/20 animate-pulse rounded-xl" />
            <div className="h-64 bg-muted/20 animate-pulse rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-muted/20 animate-pulse rounded-xl" />
            <ListSkeleton count={4} />
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Back Link */}
      <Link
        to="/patterns"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-2"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to patterns
      </Link>

      <FadeIn>
        {/* Header Panel */}
        <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-ds-sm">
                <GitBranch className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl text-foreground">
                  {patternName}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dynamic pattern catalog index
                </p>
              </div>
              <div className="ml-1 md:ml-2">
                <MasteryBadge level={stats.masteryLevel} />
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-2 bg-card/45 border border-border/40 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Overall Progress</span>
                <span className="font-bold text-foreground">{stats.progressPct}%</span>
              </div>
              <Progress value={stats.progressPct} className="h-2 bg-muted/40" />
              <div className="flex justify-between text-[11px] text-muted-foreground/80 pt-1">
                <span>
                  Solved: <strong className="text-success">{stats.solved}</strong>
                </span>
                <span>
                  Remaining: <strong className="text-foreground">{stats.remaining}</strong>
                </span>
                <span>
                  Total: <strong className="text-primary-glow">{stats.total}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Difficulty Breakdown Grid */}
          <GlassCard className="border-border/40 bg-card/25 flex flex-col justify-center">
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Difficulty Distribution
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-background/40 py-2.5 px-2 rounded-xl border border-border/20 space-y-1">
                  <span className="text-success block text-[9px] uppercase tracking-wider font-bold">
                    Easy
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {stats.easySolved}{" "}
                    <span className="text-xs text-muted-foreground">/ {stats.easyTotal}</span>
                  </span>
                </div>
                <div className="bg-background/40 py-2.5 px-2 rounded-xl border border-border/20 space-y-1">
                  <span className="text-warning block text-[9px] uppercase tracking-wider font-bold">
                    Medium
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {stats.mediumSolved}{" "}
                    <span className="text-xs text-muted-foreground">/ {stats.mediumTotal}</span>
                  </span>
                </div>
                <div className="bg-background/40 py-2.5 px-2 rounded-xl border border-border/20 space-y-1">
                  <span className="text-destructive block text-[9px] uppercase tracking-wider font-bold">
                    Hard
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {stats.hardSolved}{" "}
                    <span className="text-xs text-muted-foreground">/ {stats.hardTotal}</span>
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </FadeIn>

      {/* Accordions and Associated Problems */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] items-start mt-6">
        {/* Accordions */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <Accordion type="single" collapsible className="w-full divide-y divide-border/20">
              {/* Recognition Clues */}
              <AccordionItem value="clues" className="border-0 pb-2">
                <AccordionTrigger className="hover:no-underline font-semibold text-foreground text-sm flex gap-2">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary shrink-0" /> Recognition Clues
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-1.5">
                  <ul className="list-disc pl-5 space-y-2 text-xs leading-normal">
                    {metadata.recognitionClues.map((clue, idx) => (
                      <li key={idx}>{clue}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Common Mistakes */}
              <AccordionItem value="mistakes" className="border-0 py-2">
                <AccordionTrigger className="hover:no-underline font-semibold text-foreground text-sm flex gap-2">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0" /> Common Mistakes
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-1.5">
                  <ul className="list-disc pl-5 space-y-2 text-xs leading-normal">
                    {metadata.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="hover:text-warning transition-colors">
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Code Template */}
              <AccordionItem value="template" className="border-0 py-2">
                <AccordionTrigger className="hover:no-underline font-semibold text-foreground text-sm flex gap-2">
                  <span className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-success shrink-0" /> Standard Template
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-1.5">
                  <div className="text-xs">
                    <CodeBlock value={metadata.codeTemplate} language={metadata.codeLanguage} />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Learning Resources */}
              <AccordionItem value="resources" className="border-0 pt-2">
                <AccordionTrigger className="hover:no-underline font-semibold text-foreground text-sm flex gap-2">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-400 shrink-0" /> Learning Resources
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  <div className="flex flex-col gap-2.5">
                    {metadata.learningResources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-glow font-medium transition-colors w-fit border-b border-transparent hover:border-primary-glow"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> {res.title}
                      </a>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </GlassCard>
        </div>

        {/* Problems List & Practice Button */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Pattern Problems
            </h3>
            <Link to="/problems" search={{ q: patternName }}>
              <Button
                size="sm"
                className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold h-8 cursor-pointer flex items-center gap-1.5 text-[10px]"
              >
                <Play className="h-3 w-3 fill-primary-foreground" /> Practice Problems
              </Button>
            </Link>
          </div>

          <GlassCard className="p-0">
            <div className="divide-y divide-border/20 max-h-[50vh] overflow-y-auto">
              {problems.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    title="No problems linked"
                    description="No problems are currently tagged under this pattern."
                  />
                </div>
              ) : (
                problems.map((p) => (
                  <Link
                    key={p.id}
                    to="/problems/$id"
                    params={{ id: p.id }}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 transition hover:bg-muted/10"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        {p.status === "Solved" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                        )}
                        <span className="truncate text-xs font-medium text-foreground hover:text-primary transition-colors">
                          {p.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground pl-6">
                        {p.platform} · {p.primaryTopic}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <DifficultyBadge difficulty={p.difficulty} />
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
}
