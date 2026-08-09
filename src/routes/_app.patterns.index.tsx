import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { GitBranch, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getMasteryLevel } from "@/lib/mastery-util";
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

export const Route = createFileRoute("/_app/patterns/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Patterns — LearnNova" }] }),
  component: PatternsPage,
});

interface PatternData {
  name: string;
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
}

function PatternsPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [patternsList, setPatternsList] = useState<PatternData[]>([]);

  const loadPatternsData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: problems, error } = await supabase
      .from("problems")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to load problems for patterns calculation:", error);
      setLoading(false);
      return;
    }

    const probs = problems || [];

    // Map to aggregate stats per unique pattern (tag)
    const patternsMap: Record<
      string,
      {
        name: string;
        problemsCount: number;
        solvedCount: number;
        easySolved: number;
        easyTotal: number;
        mediumSolved: number;
        mediumTotal: number;
        hardSolved: number;
        hardTotal: number;
      }
    > = {};

    probs.forEach((p) => {
      const tags = p.tags || [];
      tags.forEach((tag: string) => {
        const cleanTag = tag.trim();
        if (!cleanTag) return;

        if (!patternsMap[cleanTag]) {
          patternsMap[cleanTag] = {
            name: cleanTag,
            problemsCount: 0,
            solvedCount: 0,
            easySolved: 0,
            easyTotal: 0,
            mediumSolved: 0,
            mediumTotal: 0,
            hardSolved: 0,
            hardTotal: 0,
          };
        }

        const pat = patternsMap[cleanTag];
        pat.problemsCount += 1;

        const isSolved = p.status === "Solved";
        if (isSolved) {
          pat.solvedCount += 1;
        }

        if (p.difficulty === "Easy") {
          pat.easyTotal += 1;
          if (isSolved) pat.easySolved += 1;
        } else if (p.difficulty === "Medium") {
          pat.mediumTotal += 1;
          if (isSolved) pat.mediumSolved += 1;
        } else if (p.difficulty === "Hard") {
          pat.hardTotal += 1;
          if (isSolved) pat.hardSolved += 1;
        }
      });
    });

    const calculated: PatternData[] = Object.values(patternsMap)
      .map((pat) => {
        const progressPct =
          pat.problemsCount > 0 ? Math.round((pat.solvedCount / pat.problemsCount) * 100) : 0;

        return {
          name: pat.name,
          problemsCount: pat.problemsCount,
          solvedCount: pat.solvedCount,
          progressPct,
          masteryLevel: getMasteryLevel(progressPct),
          easySolved: pat.easySolved,
          easyTotal: pat.easyTotal,
          mediumSolved: pat.mediumSolved,
          mediumTotal: pat.mediumTotal,
          hardSolved: pat.hardSolved,
          hardTotal: pat.hardTotal,
        };
      })
      .sort((a, b) => b.problemsCount - a.problemsCount || a.name.localeCompare(b.name));

    setPatternsList(calculated);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPatternsData();
  }, [loadPatternsData]);

  const filteredList = useMemo(() => {
    return patternsList.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  }, [patternsList, q]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title="DSA Patterns"
          subtitle="Analyze and track your mastery across custom patterns and aggregated tags from your second brain."
        />
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
        <PageHeader
          title="DSA Patterns"
          subtitle="Analyze and track your mastery across custom patterns and aggregated tags from your second brain."
        />
      </FadeIn>

      <div className="relative max-w-md">
        <SearchInput
          placeholder="Search patterns…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onClear={() => setQ("")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredList.map((pattern, index) => (
          <SlideUp key={pattern.name} delay={index * 40}>
            <Link
              to="/patterns/$pattern"
              params={{ pattern: pattern.name }}
              className="block h-full"
            >
              <ActionCard className="h-full flex flex-col justify-between" hoverEffect>
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <GitBranch className="h-4 w-4" />
                      </div>
                      <MasteryBadge level={pattern.masteryLevel} />
                    </div>

                    <div>
                      <h3
                        className="text-sm font-semibold tracking-tight text-foreground truncate"
                        title={pattern.name}
                      >
                        {pattern.name}
                      </h3>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground font-medium">Mastery</span>
                        <span className="font-semibold text-foreground">
                          {pattern.progressPct}%
                        </span>
                      </div>
                      <Progress value={pattern.progressPct} className="h-1.5 bg-muted/40" />
                    </div>

                    {/* Solved Ratio */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          Solved / Total
                        </span>
                        <span className="text-sm font-semibold text-foreground mt-0.5">
                          {pattern.solvedCount} / {pattern.problemsCount}
                        </span>
                      </div>
                    </div>

                    {/* Difficulty Breakdown Grid */}
                    <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center pt-1">
                      <div className="bg-background/40 py-1.5 px-1.5 rounded-lg border border-border/20">
                        <span className="text-muted-foreground block text-[8px] uppercase tracking-wider font-semibold">
                          Easy
                        </span>
                        <span className="font-bold text-success">
                          {pattern.easySolved} / {pattern.easyTotal}
                        </span>
                      </div>
                      <div className="bg-background/40 py-1.5 px-1.5 rounded-lg border border-border/20">
                        <span className="text-muted-foreground block text-[8px] uppercase tracking-wider font-semibold">
                          Med
                        </span>
                        <span className="font-bold text-warning">
                          {pattern.mediumSolved} / {pattern.mediumTotal}
                        </span>
                      </div>
                      <div className="bg-background/40 py-1.5 px-1.5 rounded-lg border border-border/20">
                        <span className="text-muted-foreground block text-[8px] uppercase tracking-wider font-semibold">
                          Hard
                        </span>
                        <span className="font-bold text-destructive">
                          {pattern.hardSolved} / {pattern.hardTotal}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* View Pattern Link */}
                  <div className="pt-2 border-t border-border/10 flex items-center justify-between mt-auto text-xs text-primary font-medium hover:text-primary-glow transition-colors group-hover:translate-x-0.5 duration-200">
                    <span>View Pattern details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </ActionCard>
            </Link>
          </SlideUp>
        ))}

        {filteredList.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={<GitBranch className="h-5 w-5" />}
              title="No patterns found"
              description={
                q
                  ? "Try refining your search query."
                  : "Start categorizing your problems with tag patterns to view them here."
              }
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
