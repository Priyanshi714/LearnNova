import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getTopics } from "@/lib/topics";
import { ChevronRight, Plus, SlidersHorizontal, BookOpen, AlertCircle } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  SectionHeader,
  GlassCard,
  ActionCard,
  SearchInput,
  Select,
  DifficultyBadge,
  StatusChip,
  EmptyState,
  ListSkeleton,
  FadeIn,
  SlideUp,
  Button,
  Badge,
  MutedText,
} from "@/components/design-system";

export const Route = createFileRoute("/_app/problems/")({
  head: () => ({ meta: [{ title: "My Problems — LearnNova" }] }),
  component: ProblemsPage,
});

const PLATFORMS = [
  "All",
  "LeetCode",
  "GeeksforGeeks",
  "Codeforces",
  "CodeChef",
  "HackerRank",
  "College Portal",
  "Other",
];
const DIFFS = ["All", "Easy", "Medium", "Hard"];
const STATUSES = ["All", "Solved", "Attempted", "Revising"];

interface Topic {
  id: string;
  name: string;
}

interface DBProblem {
  id: string;
  title: string;
  platform: string;
  problem_url?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: string;
  primary_topic_id: string;
  created_at: string;
  secondaryTopics?: string[];
  tags?: string[];
  solutions?: { id: string }[];
  lastUpdated?: string;
}

function ProblemsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const qParam = searchParams.get("q") || "";

  const [q, setQ] = useState(qParam);
  const [diff, setDiff] = useState("All");
  const [plat, setPlat] = useState("All");
  const [topic, setTopic] = useState("All");
  const [status, setStatus] = useState("All");
  const [problems, setProblems] = useState<DBProblem[]>([]);
  const [dbTopics, setDbTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQ(qParam);
  }, [qParam]);

  const loadProblems = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProblems(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  useEffect(() => {
    async function loadTopics() {
      const topics = await getTopics();
      setDbTopics(topics);
    }
    loadTopics();
  }, []);

  const filtered = useMemo(() => {
    return problems.filter((p: DBProblem) => {
      const topicObj = dbTopics.find((t) => t.id === p.primary_topic_id);
      const primaryTopic = topicObj ? topicObj.name : "Arrays";
      const secondaryTopics = p.secondaryTopics || [];
      const tags = p.tags || [];

      if (diff !== "All" && p.difficulty !== diff) return false;
      if (plat !== "All" && p.platform !== plat) return false;
      if (status !== "All" && p.status !== status) return false;
      if (topic !== "All" && primaryTopic !== topic && !secondaryTopics.includes(topic))
        return false;
      if (q) {
        const hay = [p.title, p.platform, primaryTopic, ...secondaryTopics, ...tags]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [problems, dbTopics, q, diff, plat, topic, status]);

  const handleClearFilters = () => {
    setQ("");
    setDiff("All");
    setPlat("All");
    setTopic("All");
    setStatus("All");
    navigate({
      to: "/problems",
      search: {} as any,
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="My Problems"
        subtitle="Search and filter your entire DSA knowledge base."
        actions={
          <Link to="/problems/new">
            <Button variant="primary" iconLeft={<Plus className="size-4" />}>
              Add Problem
            </Button>
          </Link>
        }
      />

      {/* Filter and Search controls */}
      <FadeIn>
        <GlassCard className="p-4 border-border/30">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1">
                <SearchInput
                  placeholder="Search by title, platform, tag, topic…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onClear={() => setQ("")}
                  className="bg-card/85"
                />
              </div>
              {(diff !== "All" || plat !== "All" || topic !== "All" || status !== "All" || q) && (
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="shrink-0 text-xs h-10"
                >
                  Reset Filters
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 pt-1">
              <Select
                options={DIFFS.map((d) => ({
                  value: d,
                  label: d === "All" ? "Difficulty: All" : d,
                }))}
                value={diff}
                onChange={(e) => setDiff(e.target.value)}
              />
              <Select
                options={PLATFORMS.map((p) => ({
                  value: p,
                  label: p === "All" ? "Platform: All" : p,
                }))}
                value={plat}
                onChange={(e) => setPlat(e.target.value)}
              />
              <Select
                options={["All", ...dbTopics.map((t) => t.name)].map((t) => ({
                  value: t,
                  label: t === "All" ? "Topic: All" : t,
                }))}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <Select
                options={STATUSES.map((s) => ({
                  value: s,
                  label: s === "All" ? "Status: All" : s,
                }))}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      {/* Problems List */}
      <div className="space-y-3">
        {loading ? (
          <ListSkeleton count={4} />
        ) : filtered.length === 0 ? (
          <FadeIn>
            <EmptyState
              icon={<AlertCircle className="size-5" />}
              title="No matching problems"
              description="No problems match your selected search keyword or filters. Try adjusting your query or resetting filters."
              actionButton={
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              }
            />
          </FadeIn>
        ) : (
          <div className="space-y-3">
            {filtered.map((p: DBProblem, index) => {
              const topicObj = dbTopics.find((t) => t.id === p.primary_topic_id);
              const primaryTopicName = topicObj ? topicObj.name : "Arrays";
              const secondaryTopics = p.secondaryTopics || [];
              const lastUpdated =
                p.lastUpdated ||
                (p.created_at
                  ? new Date(p.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—");

              return (
                <SlideUp key={p.id} delay={index * 30}>
                  <Link to="/problems/$id" params={{ id: p.id }} className="block">
                    <ActionCard
                      hoverEffect
                      className="p-4 bg-card/25 border-border/30 hover:border-primary/20 group"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-foreground group-hover:text-primary-glow transition-colors truncate">
                              {p.title}
                            </span>
                            <StatusChip
                              status={p.status === "Revising" ? "Attempted" : p.status}
                              className="shrink-0"
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted-foreground/80">
                            <span className="text-primary-glow/85">{p.platform}</span>
                            <span>·</span>
                            <span>{primaryTopicName}</span>
                            {secondaryTopics.length > 0 && (
                              <>
                                <span>·</span>
                                <span className="text-muted-foreground/50">
                                  +{secondaryTopics.join(", ")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-center">
                          <DifficultyBadge difficulty={p.difficulty} />
                          <div className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-wider">
                            Updated: {lastUpdated}
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-0.5 transition-all hidden sm:block" />
                        </div>
                      </div>
                    </ActionCard>
                  </Link>
                </SlideUp>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
