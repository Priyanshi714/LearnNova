import { createFileRoute } from "@tanstack/react-router";
import { Flame, Target, RefreshCw, TrendingUp, BarChart2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getTopics } from "@/lib/topics";
import {
  PageContainer,
  PageHeader,
  GlassCard,
  StatCard,
  MetricCard,
  EmptyState,
  PageSkeleton,
  FadeIn,
  SlideUp,
} from "@/components/design-system";

export const Route = createFileRoute("/_app/analytics")({
  ssr: false,
  head: () => ({ meta: [{ title: "Analytics — LearnNova" }] }),
  component: AnalyticsPage,
});

interface Topic {
  id: string;
  name: string;
}

interface DBProblem {
  id: string;
  primary_topic_id: string;
  difficulty: "Easy" | "Medium" | "Hard";
  platform: string;
  status: string;
  created_at: string;
}

interface DBSolution {
  id: string;
  created_at: string;
}

interface DBRevision {
  id: string;
  revised_at: string;
}

function calculateStreak(activityDates: string[]) {
  if (activityDates.length === 0) return 0;

  const dates = Array.from(new Set(activityDates.filter(Boolean).map((d) => d.split("T")[0]))).sort(
    (a, b) => b.localeCompare(a),
  );

  if (dates.length === 0) return 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(dates[0]);

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i]);
    const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else if (diffDays > 1) {
      break;
    }
  }
  return streak;
}

function calculateLongestStreak(activityDates: string[]) {
  if (activityDates.length === 0) return 0;

  const dates = Array.from(new Set(activityDates.filter(Boolean).map((d) => d.split("T")[0]))).sort(
    (a, b) => a.localeCompare(b),
  );

  if (dates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;
  let currentDate = new Date(dates[0]);

  for (let i = 1; i < dates.length; i++) {
    const nextDate = new Date(dates[i]);
    const diffTime = Math.abs(nextDate.getTime() - currentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
    } else if (diffDays > 1) {
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
      currentStreak = 1;
    }
    currentDate = nextDate;
  }

  if (currentStreak > maxStreak) {
    maxStreak = currentStreak;
  }

  return maxStreak;
}

function buildUserHeatmap(activityDates: string[]) {
  const weeks = 18;
  const days = 7;

  const dateCounts: Record<string, number> = {};
  activityDates.forEach((d) => {
    if (!d) return;
    const formatted = d.split("T")[0];
    dateCounts[formatted] = (dateCounts[formatted] || 0) + 1;
  });

  const data: { date: string; count: number }[][] = [];

  const now = new Date();
  const start = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  start.setDate(start.getDate() - start.getDay());

  for (let w = 0; w < weeks; w++) {
    const col: { date: string; count: number }[] = [];
    for (let d = 0; d < days; d++) {
      const targetDate = new Date(start.getTime() + (w * 7 + d) * 24 * 60 * 60 * 1000);
      const dateStr = targetDate.toISOString().split("T")[0];
      const count = dateCounts[dateStr] || 0;
      col.push({ date: dateStr, count });
    }
    data.push(col);
  }
  return data;
}

function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalRevisions, setTotalRevisions] = useState(0);
  const [goalHitRate, setGoalHitRate] = useState(0);

  const [byTopic, setByTopic] = useState<{ t: string; n: number }[]>([]);
  const [maxTopic, setMaxTopic] = useState(1);
  const [byPlatform, setByPlatform] = useState<{ p: string; n: number }[]>([]);
  const [totalP, setTotalP] = useState(0);
  const [byDiff, setByDiff] = useState<{ d: "Easy" | "Medium" | "Hard"; n: number }[]>([]);
  const [totalD, setTotalD] = useState(0);

  const [revisionsThisWeek, setRevisionsThisWeek] = useState(0);
  const [weekSub, setWeekSub] = useState("0 vs last week");
  const [revisionsThisMonth, setRevisionsThisMonth] = useState(0);
  const [monthSub, setMonthSub] = useState("Steady");
  const [avgPerDay, setAvgPerDay] = useState("0.0");
  const [patternsCovered, setPatternsCovered] = useState(0);
  const [totalPatterns, setTotalPatterns] = useState(17);

  const [heatmap, setHeatmap] = useState<{ date: string; count: number }[][]>([]);

  const diffColors = { Easy: "bg-success", Medium: "bg-warning", Hard: "bg-destructive" };

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [problemsRes, solutionsRes, revisionsRes, topicsRes] = await Promise.all([
      supabase.from("problems").select("*").eq("user_id", user.id),
      supabase.from("solutions").select("id, created_at").eq("user_id", user.id),
      supabase.from("revisions").select("id, revised_at").eq("user_id", user.id),
      getTopics(),
    ]);

    const problems: DBProblem[] = problemsRes.data || [];
    const solutions: DBSolution[] = solutionsRes.data || [];
    const revisions: DBRevision[] = revisionsRes.data || [];
    const dbTopics: Topic[] = topicsRes || [];

    // Streak calculations
    const activityDates: string[] = [
      ...problems.map((p) => p.created_at),
      ...solutions.map((s) => s.created_at),
      ...revisions.map((r) => r.revised_at),
    ];

    const cStreak = calculateStreak(activityDates);
    const lStreak = calculateLongestStreak(activityDates);
    setCurrentStreak(cStreak);
    setLongestStreak(lStreak);
    setTotalRevisions(revisions.length);

    const solvedCount = problems.filter((p) => p.status === "Solved").length;
    const hitRate = problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0;
    setGoalHitRate(hitRate);

    // Topics Breakdown
    const topicsMap = dbTopics
      .map((t) => {
        const n = problems.filter((p) => p.primary_topic_id === t.id).length;
        return { t: t.name, n };
      })
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n);
    setByTopic(topicsMap);
    setMaxTopic(Math.max(...topicsMap.map((x) => x.n), 1));

    // Platform Breakdown
    const uniquePlatforms = Array.from(new Set(problems.map((p) => p.platform).filter(Boolean)));
    const platformsMap = uniquePlatforms
      .map((p) => ({
        p,
        n: problems.filter((x) => x.platform === p).length,
      }))
      .sort((a, b) => b.n - a.n);
    setByPlatform(platformsMap);
    setTotalP(platformsMap.reduce((a, b) => a + b.n, 0));

    // Difficulty Breakdown
    const diffMap = (["Easy", "Medium", "Hard"] as const).map((d) => ({
      d,
      n: problems.filter((p) => p.difficulty === d).length,
    }));
    setByDiff(diffMap);
    setTotalD(diffMap.reduce((a, b) => a + b.n, 0));

    // Revision statistics
    const now = Date.now();
    const revsThisWeek = revisions.filter((r) => {
      const diffMs = now - new Date(r.revised_at).getTime();
      return diffMs < 7 * 24 * 60 * 60 * 1000;
    });
    const revsLastWeek = revisions.filter((r) => {
      const diffMs = now - new Date(r.revised_at).getTime();
      return diffMs >= 7 * 24 * 60 * 60 * 1000 && diffMs < 14 * 24 * 60 * 60 * 1000;
    });
    const revsThisMonth = revisions.filter((r) => {
      const diffMs = now - new Date(r.revised_at).getTime();
      return diffMs < 30 * 24 * 60 * 60 * 1000;
    });
    const revsLastMonth = revisions.filter((r) => {
      const diffMs = now - new Date(r.revised_at).getTime();
      return diffMs >= 30 * 24 * 60 * 60 * 1000 && diffMs < 60 * 24 * 60 * 60 * 1000;
    });

    setRevisionsThisWeek(revsThisWeek.length);
    const wDiff = revsThisWeek.length - revsLastWeek.length;
    setWeekSub(wDiff >= 0 ? `+${wDiff} vs last week` : `${wDiff} vs last week`);

    setRevisionsThisMonth(revsThisMonth.length);
    const mDiff = revsThisMonth.length - revsLastMonth.length;
    setMonthSub(mDiff > 0 ? "Trending up" : mDiff < 0 ? "Trending down" : "Steady");

    setAvgPerDay((revsThisMonth.length / 30).toFixed(1));

    const uniqueCoveredTopicIds = new Set(problems.map((p) => p.primary_topic_id).filter(Boolean));
    setPatternsCovered(uniqueCoveredTopicIds.size);
    setTotalPatterns(dbTopics.length || 17);

    // Heatmap
    setHeatmap(buildUserHeatmap(activityDates));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  if (loading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  const noData = byTopic.length === 0 && byPlatform.length === 0 && totalRevisions === 0;

  return (
    <PageContainer>
      <FadeIn>
        <PageHeader title="Analytics" subtitle="Measure progress. Spot weak patterns." />
      </FadeIn>

      {noData ? (
        <EmptyState
          icon={<BarChart2 className="h-6 w-6" />}
          title="No analytics data available"
          description="Solve problems and complete revisions to populate your insights dashboard."
        />
      ) : (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label="Current Streak"
              value={`${currentStreak} days`}
              trend={<Flame className="h-4 w-4 text-destructive animate-pulse" />}
            />
            <StatCard
              label="Longest Streak"
              value={`${longestStreak} days`}
              trend={<TrendingUp className="h-4 w-4 text-primary" />}
            />
            <StatCard
              label="Total Revisions"
              value={totalRevisions.toString()}
              trend={<RefreshCw className="h-4 w-4 text-success" />}
            />
            <StatCard
              label="Goal Hit Rate"
              value={`${goalHitRate}%`}
              trend={<Target className="h-4 w-4 text-warning" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Topic chart */}
            <GlassCard title="Problems per Topic">
              <div className="space-y-3">
                {byTopic.map((row) => (
                  <div
                    key={row.t}
                    className="grid grid-cols-[8rem_minmax(0,1fr)_2rem] items-center gap-3"
                  >
                    <span className="truncate text-xs text-muted-foreground">{row.t}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
                        style={{ width: `${(row.n / maxTopic) * 100}%` }}
                      />
                    </div>
                    <span className="text-right text-xs font-semibold text-foreground">
                      {row.n}
                    </span>
                  </div>
                ))}
                {byTopic.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    No topic data available.
                  </p>
                )}
              </div>
            </GlassCard>

            {/* Platform chart */}
            <GlassCard title="Problems per Platform">
              <div className="space-y-4">
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/40">
                  {byPlatform.map((p, i) => {
                    const colors = [
                      "bg-primary",
                      "bg-primary-glow",
                      "bg-success",
                      "bg-warning",
                      "bg-destructive",
                      "bg-muted-foreground",
                    ];
                    return (
                      <div
                        key={p.p}
                        className={colors[i % colors.length]}
                        style={{ width: totalP > 0 ? `${(p.n / totalP) * 100}%` : "0%" }}
                      />
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {byPlatform.map((p, i) => {
                    const colors = [
                      "bg-primary",
                      "bg-primary-glow",
                      "bg-success",
                      "bg-warning",
                      "bg-destructive",
                      "bg-muted-foreground",
                    ];
                    return (
                      <div
                        key={p.p}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/20 bg-background/40 px-3 py-1.5"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className={`h-2 w-2 rounded-full ${colors[i % colors.length]}`} />
                          {p.p}
                        </span>
                        <span className="font-semibold text-foreground">{p.n}</span>
                      </div>
                    );
                  })}
                  {byPlatform.length === 0 && (
                    <p className="col-span-full py-6 text-center text-xs text-muted-foreground">
                      No platform data available.
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Difficulty */}
            <GlassCard title="Difficulty Breakdown">
              <div className="space-y-4">
                {byDiff.map((d) => (
                  <div key={d.d} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{d.d}</span>
                      <span className="text-muted-foreground">
                        {d.n} ({totalD > 0 ? Math.round((d.n / totalD) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                      <div
                        className={`h-full ${diffColors[d.d]} rounded-full`}
                        style={{ width: totalD > 0 ? `${(d.n / totalD) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Revision stats */}
            <GlassCard title="Revision Statistics">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="This Week"
                  value={revisionsThisWeek.toString()}
                  subValue={weekSub}
                />
                <MetricCard
                  label="This Month"
                  value={revisionsThisMonth.toString()}
                  subValue={monthSub}
                />
                <MetricCard label="Avg / Day" value={avgPerDay} subValue="Last 30 days" />
                <MetricCard
                  label="Patterns Mastered"
                  value={patternsCovered.toString()}
                  subValue={`of ${totalPatterns}`}
                />
              </div>
            </GlassCard>
          </div>

          {/* Heatmap */}
          <GlassCard title="Contribution Heatmap">
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-1.5 min-w-max">
                {heatmap.map((col, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    {col.map((d, j) => {
                      const bg =
                        d.count === 0
                          ? "bg-muted/30 border border-border/10"
                          : d.count < 2
                            ? "bg-primary/20 border border-primary/10"
                            : d.count < 4
                              ? "bg-primary/45 border border-primary/20"
                              : d.count < 6
                                ? "bg-primary/70 border border-primary/30"
                                : "bg-primary border border-primary/40";
                      return (
                        <div
                          key={j}
                          className={`h-3.5 w-3.5 rounded-[4px] transition-all duration-200 hover:scale-110 cursor-pointer ${bg}`}
                          title={`${d.date}: ${d.count} activities`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </PageContainer>
  );
}
