import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { getTopics } from "@/lib/topics";
import { getUserDisplayName } from "@/lib/user-display-name";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  FolderTree,
  RefreshCw,
  Flame,
  Layers,
  Plus,
  Play,
  ArrowRight,
  Activity,
  FileCode2,
  BookMarked,
  CircleCheck,
  Trophy,
  Award,
  Zap,
  Calendar,
  ChevronRight,
  Sparkles,
  PlusCircle,
  Brain,
  History,
  TrendingUp,
  LineChart,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  SectionHeader,
  GlassCard,
  StatCard,
  MetricCard,
  ProgressCard,
  ActionCard,
  AnimatedCounter,
  DifficultyBadge,
  StatusChip,
  EmptyState,
  FadeIn,
  SlideUp,
  MutedText,
  Subtitle,
  Button,
} from "@/components/design-system";

export const Route = createFileRoute("/_app/home")({
  head: () => ({ meta: [{ title: "Home — LearnNova" }] }),
  component: HomePage,
});

interface Stat {
  label: string;
  value: string;
  icon: typeof BookOpen;
  sub: string;
  trend?: string;
  trendDirection?: "up" | "flat";
  tone: string;
  glowColor?: string;
}

interface ActivityItem {
  type: "Problem Added" | "Solution Added" | "Journal Updated" | "Revision Completed";
  target: string;
  at: string;
}

interface HomeProblem {
  id: string;
  title: string;
  platform: string;
  difficulty: "Easy" | "Medium" | "Hard";
  primaryTopic: string;
  secondaryTopics: string[];
  journalLearned: string;
}

interface TopicMastery {
  id: string;
  name: string;
  solved: number;
  percentage: number;
}

interface ForecastProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  primaryTopic: string;
  dueInDays: number;
  platform: string;
}

const ACTIVITY_ICON: Record<string, typeof Plus> = {
  "Problem Added": Plus,
  "Solution Added": FileCode2,
  "Journal Updated": BookMarked,
  "Revision Completed": CircleCheck,
};

const MOTIVATION_QUOTES = [
  "Consistency beats intensity.",
  "Every solved problem compounds your knowledge.",
  "Small progress every day wins.",
  "Master the patterns, not just the problems.",
  "Focus on understanding, speed will follow.",
  "Progress, not perfection.",
];

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
    (a, b) => b.localeCompare(a),
  );

  if (dates.length === 0) return 0;

  let longestStreak = 0;
  let currentStreak = 1;
  let currentDate = new Date(dates[0]);

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i]);
    const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      currentDate = prevDate;
    } else if (diffDays > 1) {
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      currentStreak = 1;
      currentDate = prevDate;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return longestStreak;
}

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [lastProblem, setLastProblem] = useState<HomeProblem | null>(null);
  const [recentProblems, setRecentProblems] = useState<HomeProblem[]>([]);
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[][]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [userName, setUserName] = useState("Developer");

  // Motivational quote
  const motivationQuote = useMemo(() => {
    return MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
  }, []);

  // Time of day greeting
  const timeGreeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // New visual and mastery tracking states
  const [patternMastery, setPatternMastery] = useState<TopicMastery[]>([]);
  const [forecast, setForecast] = useState<{
    today: ForecastProblem[];
    tomorrow: ForecastProblem[];
    upcoming: ForecastProblem[];
    later: ForecastProblem[];
  }>({ today: [], tomorrow: [], upcoming: [], later: [] });
  const [streakMetrics, setStreakMetrics] = useState({
    current: 0,
    longest: 0,
    totalContributions: 0,
    consistency: 0,
  });
  const [userLevel, setUserLevel] = useState({
    level: 1,
    rank: "DSA Initiate",
    solved: 0,
    nextLevelSolved: 5,
    percent: 0,
  });
  const [weeklyGoal, setWeeklyGoal] = useState({
    solved: 0,
    target: 5,
    percent: 0,
  });

  // Insights calculations states
  const [insights, setInsights] = useState({
    strongestTopic: "None yet",
    weakestTopic: "None yet",
    mostPracticedPattern: "None yet",
    needsRevisionTopic: "All caught up",
    revisionsCount: 0,
    topicsMastered: 0,
  });

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const displayName = getUserDisplayName(user, profile?.full_name);
    setUserName(displayName);

    const [
      problemsRes,
      solutionsCountRes,
      revisionsCountRes,
      topicsRes,
      lastProblemRes,
      probsRes,
      solsRes,
      revsRes,
      allRevisionsRes,
    ] = await Promise.all([
      supabase
        .from("problems")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("solutions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("revisions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      getTopics(),
      supabase
        .from("problems")
        .select("*, primary_topic:topics(name)")
        .eq("user_id", user.id)
        .neq("status", "Solved") // Sprint 5.2: Most recently active unfinished problem
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("problems")
        .select("title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("solutions")
        .select("solution_name, created_at, problem:problems(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("revisions")
        .select("revision_type, revised_at, problem:problems(title)")
        .eq("user_id", user.id)
        .order("revised_at", { ascending: false })
        .limit(5),
      supabase
        .from("revisions")
        .select("problem_id, revised_at")
        .eq("user_id", user.id)
        .order("revised_at", { ascending: false }),
    ]);

    const problems = problemsRes.data || [];
    const totalProblems = problems.length;
    const totalSolutions = solutionsCountRes.count || 0;
    const allTopics = topicsRes || [];
    const allRevisions = allRevisionsRes.data || [];

    const uniqueTopicIds = new Set(problems.map((p) => p.primary_topic_id));
    const topicsCovered = uniqueTopicIds.size;
    const topicsTotal = allTopics.length || 17;
    const topicsPercent = Math.round((topicsCovered / topicsTotal) * 100);

    const dueTodayProbs = problems.filter((p) => p.status === "Revising");
    const revisionsDueCount = dueTodayProbs.length;

    const activityDates: string[] = [
      ...problems.map((p) => p.created_at),
      ...(solsRes.data || []).map((s: { created_at: string }) => s.created_at),
      ...allRevisions.map((r: { revised_at: string }) => r.revised_at),
    ];

    const currentStreak = calculateStreak(activityDates);
    const longestStreak = calculateLongestStreak(activityDates);
    const uniqueActiveDays = new Set(activityDates.filter(Boolean).map((d) => d.split("T")[0]))
      .size;
    const consistency = Math.min(100, Math.round((uniqueActiveDays / 126) * 100)); // 18 weeks * 7 days

    setStreakMetrics({
      current: currentStreak,
      longest: longestStreak,
      totalContributions: activityDates.length,
      consistency,
    });

    // Level calculation
    const totalSolvedCount = problems.filter((p) => p.status === "Solved").length;
    let level = 1;
    let rank = "Initiate";
    let nextLevelSolved = 5;
    let prevLevelSolved = 0;
    if (totalSolvedCount <= 5) {
      level = 1;
      rank = "DSA Initiate";
      nextLevelSolved = 5;
      prevLevelSolved = 0;
    } else if (totalSolvedCount <= 15) {
      level = 2;
      rank = "DSA Explorer";
      nextLevelSolved = 15;
      prevLevelSolved = 5;
    } else if (totalSolvedCount <= 30) {
      level = 3;
      rank = "DSA Specialist";
      nextLevelSolved = 30;
      prevLevelSolved = 15;
    } else if (totalSolvedCount <= 50) {
      level = 4;
      rank = "DSA Master";
      nextLevelSolved = 50;
      prevLevelSolved = 30;
    } else {
      level = 5;
      rank = "DSA Grandmaster";
      nextLevelSolved = 100;
      prevLevelSolved = 50;
    }
    const levelPercent = Math.min(
      100,
      Math.round(
        ((totalSolvedCount - prevLevelSolved) / (nextLevelSolved - prevLevelSolved)) * 100,
      ),
    );

    setUserLevel({
      level,
      rank,
      solved: totalSolvedCount,
      nextLevelSolved,
      percent: levelPercent,
    });

    // Weekly Goal
    const solvedThisWeek = problems.filter((p) => {
      const diffMs = Date.now() - new Date(p.created_at).getTime();
      return diffMs < 7 * 24 * 60 * 60 * 1000 && p.status === "Solved";
    }).length;
    const weeklyGoalPercent = Math.min(100, Math.round((solvedThisWeek / 5) * 100));

    setWeeklyGoal({
      solved: solvedThisWeek,
      target: 5,
      percent: weeklyGoalPercent,
    });

    // Topic solves & Pattern Mastery
    const topicSolveCount: Record<string, number> = {};
    problems.forEach((p) => {
      if (p.status === "Solved" || p.status === "Revising") {
        topicSolveCount[p.primary_topic_id] = (topicSolveCount[p.primary_topic_id] || 0) + 1;
      }
    });

    const masteryList: TopicMastery[] = allTopics
      .map((topic) => {
        const solved = topicSolveCount[topic.id] || 0;
        const percentage = Math.min(100, Math.round((solved / 5) * 100));
        return {
          id: topic.id,
          name: topic.name,
          solved,
          percentage,
        };
      })
      .filter((t) => t.solved > 0)
      .sort((a, b) => b.solved - a.solved)
      .slice(0, 5);

    if (masteryList.length === 0) {
      allTopics.slice(0, 5).forEach((t) => {
        masteryList.push({
          id: t.id,
          name: t.name,
          solved: 0,
          percentage: 0,
        });
      });
    }
    setPatternMastery(masteryList);

    // Insights Calculations (Sprint 5.2 Section 5)
    const sortedByMastery = [...allTopics]
      .map((t) => {
        const solved = topicSolveCount[t.id] || 0;
        const pct = Math.min(100, Math.round((solved / 5) * 100));
        return { name: t.name, pct, solved };
      })
      .filter((t) => t.solved > 0)
      .sort((a, b) => b.pct - a.pct || b.solved - a.solved);

    const strongestTopic = sortedByMastery[0]?.name || "None yet";
    const weakestTopic = [...sortedByMastery].reverse()[0]?.name || "None yet";

    // Most Practiced Pattern
    const patternCounts: Record<string, number> = {};
    problems.forEach((p) => {
      if (p.status === "Solved") {
        (p.tags || []).forEach((tag: string) => {
          const clean = tag.trim();
          if (clean) {
            patternCounts[clean] = (patternCounts[clean] || 0) + 1;
          }
        });
      }
    });
    const sortedPatterns = Object.entries(patternCounts).sort((a, b) => b[1] - a[1]);
    const mostPracticedPattern = sortedPatterns[0]?.[0] || "None yet";

    // Needs Revision Topic
    const topicRevisionsCount: Record<string, number> = {};
    problems
      .filter((p) => p.status === "Revising")
      .forEach((p) => {
        topicRevisionsCount[p.primary_topic_id] =
          (topicRevisionsCount[p.primary_topic_id] || 0) + 1;
      });
    const sortedNeedsRevision = Object.entries(topicRevisionsCount)
      .map(([id, count]) => {
        const topic = allTopics.find((t) => t.id === id);
        return { name: topic?.name || "Unknown", count };
      })
      .sort((a, b) => b.count - a.count);
    const needsRevisionTopic = sortedNeedsRevision[0]?.name || "All caught up";

    // Mastered Topics count
    const topicsMastered = allTopics.filter((t) => {
      const solved = topicSolveCount[t.id] || 0;
      const percentage = Math.min(100, Math.round((solved / 5) * 100));
      return percentage >= 80;
    }).length;

    setInsights({
      strongestTopic,
      weakestTopic,
      mostPracticedPattern,
      needsRevisionTopic,
      revisionsCount: revisionsDueCount,
      topicsMastered,
    });

    // Revision Forecast
    const latestRevsMap: Record<string, string> = {};
    allRevisions.forEach((r: { problem_id: string; revised_at: string }) => {
      if (
        r.problem_id &&
        (!latestRevsMap[r.problem_id] ||
          new Date(r.revised_at) > new Date(latestRevsMap[r.problem_id]))
      ) {
        latestRevsMap[r.problem_id] = r.revised_at;
      }
    });

    const todayList: ForecastProblem[] = [];
    const tomorrowList: ForecastProblem[] = [];
    const upcomingList: ForecastProblem[] = [];
    const laterList: ForecastProblem[] = [];

    problems.forEach((p) => {
      const topicObj = allTopics.find((t) => t.id === p.primary_topic_id);
      const primaryTopicName = topicObj ? topicObj.name : "Arrays";

      let dueInDays = 0;
      if (p.status === "Revising") {
        dueInDays = 0;
      } else {
        const lastRev = latestRevsMap[p.id];
        if (lastRev) {
          const diffMs = Date.now() - new Date(lastRev).getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          dueInDays = Math.max(1, 3 + (diffDays % 5));
        } else {
          const diffMs = Date.now() - new Date(p.created_at).getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          dueInDays = Math.max(1, 3 - diffDays);
        }
      }

      const mapped: ForecastProblem = {
        id: p.id,
        title: p.title,
        difficulty: p.difficulty as "Easy" | "Medium" | "Hard",
        primaryTopic: primaryTopicName,
        dueInDays,
        platform: p.platform,
      };

      if (p.status === "Revising" || dueInDays <= 0) {
        todayList.push(mapped);
      } else if (dueInDays === 1) {
        tomorrowList.push(mapped);
      } else if (dueInDays <= 3) {
        upcomingList.push(mapped);
      } else {
        laterList.push(mapped);
      }
    });

    setForecast({
      today: todayList.slice(0, 3),
      tomorrow: tomorrowList.slice(0, 3),
      upcoming: upcomingList.slice(0, 3),
      later: laterList.slice(0, 3),
    });

    // Last problem loading (Sprint 5.2: active unfinished problem query result)
    if (lastProblemRes.data) {
      const p = lastProblemRes.data;
      const journalRes = await supabase
        .from("journals")
        .select("learned")
        .eq("problem_id", p.id)
        .eq("user_id", user.id)
        .maybeSingle();
      setLastProblem({
        id: p.id,
        title: p.title,
        platform: p.platform,
        difficulty: p.difficulty as "Easy" | "Medium" | "Hard",
        primaryTopic: (p.primary_topic as { name: string } | null)?.name || "Arrays",
        secondaryTopics: [],
        journalLearned:
          journalRes.data?.learned || "No notes yet. Click continue to add notes to your journal.",
      });
    } else {
      setLastProblem(null);
    }

    const recentProblemsMapped = problems.slice(0, 5).map((p) => {
      const topicObj = allTopics.find((t) => t.id === p.primary_topic_id);
      return {
        id: p.id,
        title: p.title,
        platform: p.platform,
        difficulty: p.difficulty as "Easy" | "Medium" | "Hard",
        primaryTopic: topicObj ? topicObj.name : "Arrays",
        secondaryTopics: [],
        journalLearned: "",
      };
    });
    setRecentProblems(recentProblemsMapped);

    setHeatmapData(buildUserHeatmap(activityDates));

    const combined = [
      ...(probsRes.data || []).map((p) => ({
        type: "Problem Added" as const,
        target: p.title,
        dateObj: new Date(p.created_at),
      })),
      ...(solsRes.data || []).map(
        (s: {
          created_at: string;
          solution_name: string;
          problem: { title: string }[] | { title: string } | null;
        }) => {
          const title = Array.isArray(s.problem)
            ? s.problem[0]?.title
            : (s.problem as { title: string } | null)?.title;
          return {
            type: "Solution Added" as const,
            target: title ? `${title} — ${s.solution_name}` : s.solution_name,
            dateObj: new Date(s.created_at),
          };
        },
      ),
      ...(revsRes.data || []).map(
        (r: {
          revised_at: string;
          revision_type: string;
          problem: { title: string }[] | { title: string } | null;
        }) => {
          const title = Array.isArray(r.problem)
            ? r.problem[0]?.title
            : (r.problem as { title: string } | null)?.title;
          return {
            type: "Revision Completed" as const,
            target: title || r.revision_type,
            dateObj: new Date(r.revised_at),
          };
        },
      ),
    ];

    const mappedActivity = combined
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .slice(0, 5)
      .map((act) => {
        const diffMs = Date.now() - act.dateObj.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        let at = act.dateObj.toLocaleDateString();
        if (diffHrs < 1) at = "Just now";
        else if (diffHrs < 24) at = `${diffHrs} hours ago`;
        else if (diffHrs < 48) at = "Yesterday";
        else {
          const days = Math.floor(diffHrs / 24);
          at = `${days} days ago`;
        }
        return {
          type: act.type,
          target: act.target,
          at,
        };
      });
    setRecentActivity(mappedActivity);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadHomeData();

    const handleProfileUpdate = () => {
      loadHomeData();
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, [loadHomeData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-6 w-6 text-primary animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <PageContainer className="pb-16">
      {/* SECTION 1 — Greeting Hero */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/25 bg-gradient-to-br from-[#121026]/40 via-[#07060f]/85 to-primary/5 p-6 md:p-8 shadow-[0_0_30px_-5px_rgba(168,85,247,0.15)] shadow-2xl shadow-purple-950/20 backdrop-blur-md group">
          <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-primary/15 to-primary-glow/5 blur-[90px] rounded-full pointer-events-none opacity-80" />

          <div className="relative flex flex-col lg:flex-row items-stretch justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase text-primary-glow shadow-[0_0_12px_-3px_var(--primary-glow)]">
                <Trophy className="h-3 w-3" /> {userLevel.rank}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-none">
                {timeGreeting}, <span className="gradient-text">{userName}</span> 👋
              </h1>
              <p className="text-sm md:text-base text-muted-foreground/80 max-w-xl font-normal leading-relaxed">
                Welcome back to LearnNova. Keep learning. Keep building.
              </p>

              {/* Dynamic Level Progress */}
              <div className="max-w-md pt-2 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">
                    Level {userLevel.level} Rank Progress
                  </span>
                  <span className="text-primary-glow">
                    {userLevel.solved} / {userLevel.nextLevelSolved} Solved
                  </span>
                </div>
                <Progress value={userLevel.percent} className="h-2 bg-muted/40" />
              </div>
            </div>

            {/* Statistic indicators with Animated Counters */}
            <div className="grid grid-cols-2 gap-4 shrink-0 sm:min-w-[340px]">
              <StatCard
                label="Current Streak"
                value={
                  <span className="flex items-center gap-1">
                    <Flame className="h-5 w-5 fill-destructive text-destructive" />{" "}
                    <AnimatedCounter value={streakMetrics.current} />
                  </span>
                }
                className="bg-background/40 backdrop-blur-sm border-border/20 p-4"
              />
              <StatCard
                label="Problems Solved"
                value={<AnimatedCounter value={userLevel.solved} />}
                className="bg-background/40 backdrop-blur-sm border-border/20 p-4"
              />
              <StatCard
                label="Revision Due"
                value={<AnimatedCounter value={insights.revisionsCount} />}
                className="bg-background/40 backdrop-blur-sm border-border/20 p-4"
              />
              <StatCard
                label="Topics Mastered"
                value={<AnimatedCounter value={insights.topicsMastered} />}
                className="bg-background/40 backdrop-blur-sm border-border/20 p-4"
              />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* SECTION 2 — Quick Actions */}
      <SlideUp delay={100}>
        <div className="space-y-4">
          <SectionHeader title="Quick Navigation" subtitle="Speed dial to active workspaces" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Link to="/problems/new" className="block">
              <ActionCard
                hoverEffect
                className="text-center p-6 flex flex-col items-center justify-center h-32"
              >
                <PlusCircle className="size-8 text-primary-glow mb-2" />
                <span className="text-sm font-bold text-foreground">Add Problem</span>
              </ActionCard>
            </Link>

            <Link to="/problems" className="block">
              <ActionCard
                hoverEffect
                className="text-center p-6 flex flex-col items-center justify-center h-32"
              >
                <BookOpen className="size-8 text-primary-glow mb-2" />
                <span className="text-sm font-bold text-foreground">Browse Problems</span>
              </ActionCard>
            </Link>

            <Link to="/patterns" className="block">
              <ActionCard
                hoverEffect
                className="text-center p-6 flex flex-col items-center justify-center h-32"
              >
                <Brain className="size-8 text-primary-glow mb-2" />
                <span className="text-sm font-bold text-foreground">Patterns</span>
              </ActionCard>
            </Link>

            <Link to="/topics" className="block">
              <ActionCard
                hoverEffect
                className="text-center p-6 flex flex-col items-center justify-center h-32"
              >
                <FolderTree className="size-8 text-primary-glow mb-2" />
                <span className="text-sm font-bold text-foreground">Topics</span>
              </ActionCard>
            </Link>

            <Link to="/revisions" className="block">
              <ActionCard
                hoverEffect
                className="text-center p-6 flex flex-col items-center justify-center h-32"
              >
                <History className="size-8 text-primary-glow mb-2" />
                <span className="text-sm font-bold text-foreground">Revision Queue</span>
              </ActionCard>
            </Link>
          </div>
        </div>
      </SlideUp>

      {/* Grid: Continue Learning and Today's Revision */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* SECTION 3 — Continue Learning */}
        <SlideUp delay={200}>
          <div className="space-y-4 h-full flex flex-col">
            <SectionHeader title="Continue Learning" subtitle="Pick up right where you left off" />
            <div className="flex-1 flex flex-col">
              {lastProblem ? (
                <GlassCard
                  hoverEffect
                  className="flex-1 flex flex-col justify-between border-primary/10"
                  header={
                    <div className="flex w-full items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-glow">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary-glow animate-ping shrink-0" />
                          Most Recent Active Problem
                        </span>
                        <h3 className="mt-1.5 text-xl font-bold tracking-tight text-foreground">
                          {lastProblem.title}
                        </h3>
                      </div>
                      <DifficultyBadge difficulty={lastProblem.difficulty} />
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground text-xs font-semibold">
                        {lastProblem.primaryTopic}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-card/80 border border-border/40 text-muted-foreground text-xs font-semibold">
                        {lastProblem.platform}
                      </span>
                    </div>
                    <MutedText className="line-clamp-3 text-sm">
                      {lastProblem.journalLearned}
                    </MutedText>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/10">
                    <Link to="/problems/$id" params={{ id: lastProblem.id }}>
                      <Button
                        variant="primary"
                        iconRight={<ArrowRight className="size-4" />}
                        className="w-full sm:w-auto"
                      >
                        Resume Session
                      </Button>
                    </Link>
                  </div>
                </GlassCard>
              ) : (
                <EmptyState
                  icon={<BookOpen className="size-5" />}
                  title="No Active Unfinished Problems"
                  description="Great work! You have finished all problems in your queue. Add or select another problem to continue learning."
                  actionButton={
                    <Link to="/problems">
                      <Button variant="outline">Browse Problems</Button>
                    </Link>
                  }
                  className="flex-1 flex flex-col justify-center"
                />
              )}
            </div>
          </div>
        </SlideUp>

        {/* SECTION 4 — Today's Revision */}
        <SlideUp delay={250}>
          <div className="space-y-4 h-full flex flex-col">
            <SectionHeader title="Today's Revision" subtitle="Spaced repetition schedule status" />
            <div className="flex-1 flex flex-col">
              {insights.revisionsCount > 0 ? (
                <GlassCard
                  className="flex-1 flex flex-col justify-between border-warning/10"
                  header={
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-warning">
                        <span className="h-1.5 w-1.5 rounded-full bg-warning animate-ping shrink-0" />
                        Revisions Scheduled Today
                      </span>
                      <h3 className="mt-1.5 text-xl font-bold tracking-tight text-foreground">
                        {insights.revisionsCount}{" "}
                        {insights.revisionsCount === 1 ? "Problem" : "Problems"} Due
                      </h3>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                      <MutedText className="text-sm leading-relaxed text-warning/80">
                        Completing your daily revision cycle helps reinforce code structures and
                        mistakes, locking the patterns in long-term memory.
                      </MutedText>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                      <span>Estimated Time:</span>
                      <span className="text-foreground">{insights.revisionsCount * 15} Mins</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/10">
                    <Link to="/revisions">
                      <Button
                        variant="success"
                        iconRight={<Play className="size-4 fill-primary-foreground" />}
                        className="w-full"
                      >
                        Start Revision
                      </Button>
                    </Link>
                  </div>
                </GlassCard>
              ) : (
                <EmptyState
                  icon={<CircleCheck className="size-5 text-success" />}
                  title="All Caught Up!"
                  description="No revisions are due today. Keep checking in daily to maintain topic retention."
                  actionButton={
                    <Link to="/problems">
                      <Button variant="outline">Browse All Problems</Button>
                    </Link>
                  }
                  className="flex-1 flex flex-col justify-center"
                />
              )}
            </div>
          </div>
        </SlideUp>
      </div>

      {/* SECTION 5 — Learning Insights */}
      <SlideUp delay={300}>
        <div className="space-y-4">
          <SectionHeader title="Learning Insights" subtitle="Dynamic skill analytics summary" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <MetricCard
              label="Strongest Topic"
              value={insights.strongestTopic}
              subValue="Highest mastery"
              className="border-success/10 bg-success/5"
            />
            <MetricCard
              label="Weakest Topic"
              value={insights.weakestTopic}
              subValue="Needs focus"
              className="border-destructive/10 bg-destructive/5"
            />
            <MetricCard
              label="Most Practiced Pattern"
              value={insights.mostPracticedPattern}
              subValue="High frequency"
              className="border-primary/10 bg-primary/5"
            />
            <MetricCard
              label="Needs Revision"
              value={insights.needsRevisionTopic}
              subValue="Longest time since review"
              className="border-warning/10 bg-warning/5"
            />
          </div>
        </div>
      </SlideUp>

      {/* Main Grid: Recent Problems & ForeCast / Mastery */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* SECTION 6 — Recent Problems (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader
            title="Recent Problems"
            subtitle="Last five problems opened in your workspace"
          />
          <div className="space-y-3">
            {recentProblems.map((p, index) => (
              <SlideUp key={p.id} delay={350 + index * 50}>
                <Link to="/problems/$id" params={{ id: p.id }} className="block">
                  <ActionCard
                    hoverEffect
                    className="flex items-center justify-between p-4 bg-card/25 border-border/30 hover:border-primary/20 group"
                  >
                    <div className="min-w-0 flex items-center gap-3.5">
                      <div className="size-9 rounded-lg bg-background/50 border border-border/30 flex items-center justify-center font-bold text-[10px] text-primary-glow shrink-0">
                        {p.platform.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary-glow transition-colors block truncate">
                          {p.title}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground/60 flex items-center gap-1.5 mt-0.5">
                          <span className="text-primary-glow/85">{p.platform}</span>
                          <span>·</span>
                          <span>{p.primaryTopic}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <DifficultyBadge difficulty={p.difficulty} />
                      <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </ActionCard>
                </Link>
              </SlideUp>
            ))}
            {recentProblems.length === 0 && (
              <EmptyState
                icon={<BookOpen className="size-4" />}
                title="No Problems Loaded"
                description="Your problem archive is empty. Add a new problem to start tracking."
              />
            )}
          </div>
        </div>

        {/* Right Sidebar Details */}
        <div className="space-y-6">
          {/* Revision Forecast */}
          <div className="space-y-4">
            <SectionHeader title="Revision Forecast" subtitle="Predictive spaced repetitions" />
            <GlassCard className="space-y-5 border-border/30">
              {/* Today */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-destructive uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-ping shrink-0" />
                  Today ({forecast.today.length})
                </div>
                <div className="space-y-2 pl-3 border-l border-destructive/20">
                  {forecast.today.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background/30 hover:bg-background/50 transition border border-border/20 text-xs"
                    >
                      <Link
                        to="/problems/$id"
                        params={{ id: p.id }}
                        className="truncate font-semibold text-foreground hover:text-primary-glow transition-colors max-w-[140px]"
                      >
                        {p.title}
                      </Link>
                      <DifficultyBadge difficulty={p.difficulty} className="text-[9px] px-1.5" />
                    </div>
                  ))}
                  {forecast.today.length === 0 && (
                    <p className="text-[11px] text-muted-foreground/60 italic">
                      No revisions due today.
                    </p>
                  )}
                </div>
              </div>

              {/* Tomorrow */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-warning uppercase tracking-wider">
                  Tomorrow ({forecast.tomorrow.length})
                </div>
                <div className="space-y-2 pl-3 border-l border-warning/20">
                  {forecast.tomorrow.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background/30 hover:bg-background/50 transition border border-border/20 text-xs"
                    >
                      <Link
                        to="/problems/$id"
                        params={{ id: p.id }}
                        className="truncate font-semibold text-foreground hover:text-primary-glow transition-colors max-w-[140px]"
                      >
                        {p.title}
                      </Link>
                      <DifficultyBadge difficulty={p.difficulty} className="text-[9px] px-1.5" />
                    </div>
                  ))}
                  {forecast.tomorrow.length === 0 && (
                    <p className="text-[11px] text-muted-foreground/60 italic">
                      No revisions due tomorrow.
                    </p>
                  )}
                </div>
              </div>

              {/* Upcoming */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary-glow uppercase tracking-wider">
                  Upcoming ({forecast.upcoming.length})
                </div>
                <div className="space-y-2 pl-3 border-l border-primary/20">
                  {forecast.upcoming.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background/30 hover:bg-background/50 transition border border-border/20 text-xs"
                    >
                      <Link
                        to="/problems/$id"
                        params={{ id: p.id }}
                        className="truncate font-semibold text-foreground hover:text-primary-glow transition-colors max-w-[140px]"
                      >
                        {p.title}
                      </Link>
                      <DifficultyBadge difficulty={p.difficulty} className="text-[9px] px-1.5" />
                    </div>
                  ))}
                  {forecast.upcoming.length === 0 && (
                    <p className="text-[11px] text-muted-foreground/60 italic">
                      No upcoming revisions.
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Pattern Mastery */}
          <div className="space-y-4">
            <SectionHeader title="Pattern Mastery" subtitle="Progress per DSA coding pattern" />
            <GlassCard className="space-y-4 border-border/30">
              {patternMastery.map((item) => (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground/90 truncate max-w-[170px]">
                      {item.name}
                    </span>
                    <span className="text-muted-foreground/80 text-[11px]">
                      {item.solved} solved
                    </span>
                  </div>
                  <Progress value={item.percentage || 10} className="h-1.5 bg-muted/40" />
                </div>
              ))}
            </GlassCard>
          </div>
        </div>
      </div>

      {/* SECTION 7 — Motivation Footer */}
      <FadeIn delay={600} className="pt-8">
        <GlassCard className="text-center p-6 border-dashed border-border bg-card/15 shadow-none max-w-2xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-glow/80 block mb-1">
            Study Motivation
          </span>
          <p className="text-sm md:text-base italic font-semibold text-foreground/90 leading-relaxed">
            "{motivationQuote}"
          </p>
        </GlassCard>
      </FadeIn>
    </PageContainer>
  );
}
