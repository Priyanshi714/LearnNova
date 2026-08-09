import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Eye,
  Calendar,
  Clock,
  RefreshCw,
  Sparkles,
  BookOpen,
  Code2,
  CheckCircle,
  HelpCircle,
  ThumbsUp,
  BrainCircuit,
  Timer,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { calculateTopicMastery } from "@/lib/mastery-util";
import { CodeBlock } from "@/components/editor/code-block";
import { MarkdownRenderer } from "@/components/editor/markdown-renderer";
import {
  PageContainer,
  PageHeader,
  GlassCard,
  ActionCard,
  DifficultyBadge,
  PriorityBadge,
  Badge,
  EmptyState,
  CardSkeleton,
  FadeIn,
  SlideUp,
} from "@/components/design-system";

export const Route = createFileRoute("/_app/revisions")({
  ssr: false,
  head: () => ({ meta: [{ title: "Revisions — LearnNova" }] }),
  component: RevisionsPage,
});

interface RevisionProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  primaryTopicId: string;
  primaryTopicName: string;
  lastRevisedDate: string | null;
  lastRevisedFormatted: string;
  dueDays: number;
  priorityScore: number;
  reason: string;
  status: string;
  journalNotes: string;
  journalLearned: string;
}

interface RevisionHistoryItem {
  id: string;
  problemTitle: string;
  type: string;
  notes: string;
  date: string;
}

function RevisionsPage() {
  const [loading, setLoading] = useState(true);
  const [studyQueue, setStudyQueue] = useState<RevisionProblem[]>([]);
  const [upcoming, setUpcoming] = useState<RevisionProblem[]>([]);
  const [history, setHistory] = useState<RevisionHistoryItem[]>([]);

  // Preview / Action Modals States
  const [solutionProblem, setSolutionProblem] = useState<RevisionProblem | null>(null);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(false);

  const [notesProblem, setNotesProblem] = useState<RevisionProblem | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [ratingProblem, setRatingProblem] = useState<RevisionProblem | null>(null);
  const [ratingNotes, setRatingNotes] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // Fetch Solutions on demand
  useEffect(() => {
    if (solutionProblem) {
      setLoadingSolutions(true);
      supabase
        .from("solutions")
        .select("*")
        .eq("problem_id", solutionProblem.id)
        .order("created_at", { ascending: true })
        .then(({ data, error }) => {
          if (!error && data) {
            setSolutions(data);
          }
          setLoadingSolutions(false);
        });
    } else {
      setSolutions([]);
    }
  }, [solutionProblem]);

  // Fetch Notes on demand
  useEffect(() => {
    if (notesProblem) {
      setLoadingNotes(true);
      supabase
        .from("problem_notes")
        .select("*")
        .eq("problem_id", notesProblem.id)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            setNotes(data);
          }
          setLoadingNotes(false);
        });
    } else {
      setNotes([]);
    }
  }, [notesProblem]);

  const loadRevisionsData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Load problems, revisions, and problem_topics in parallel
    const [problemsRes, revisionsRes, problemTopicsRes] = await Promise.all([
      supabase
        .from("problems")
        .select("*, primary_topic:topics(name), journals(learned, revision_notes)")
        .eq("user_id", user.id),
      supabase
        .from("revisions")
        .select("*, problem:problems(id, title, difficulty)")
        .eq("user_id", user.id)
        .order("revised_at", { ascending: false }),
      supabase.from("problem_topics").select("*"),
    ]);

    const problems = problemsRes.data || [];
    const revisions = revisionsRes.data || [];
    const problemTopics = problemTopicsRes.data || [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const allCalculated: RevisionProblem[] = problems.map((p) => {
      const pRevs = revisions.filter((r) => r.problem_id === p.id);

      let lastRevisedDate: string | null = null;
      let lastRevisedFormatted = "Never revised";
      let intervalDays = 1;
      let latestRating = "None";

      if (pRevs.length > 0) {
        const sortedRevs = [...pRevs].sort(
          (a, b) => new Date(b.revised_at).getTime() - new Date(a.revised_at).getTime(),
        );
        const latest = sortedRevs[0];
        lastRevisedDate = latest.revised_at;
        lastRevisedFormatted = new Date(latest.revised_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        latestRating = latest.revision_type || "";
        if (latestRating.includes("Easy")) {
          intervalDays = 14;
        } else if (latestRating.includes("Good")) {
          intervalDays = 7;
        } else if (latestRating.includes("Hard")) {
          intervalDays = 3;
        } else if (latestRating.includes("Forgot")) {
          intervalDays = 1;
        } else {
          intervalDays = 3; // fallback default
        }
      }

      // Calculate due days
      let dueDays = 0;
      let overdueDays = 0;
      if (lastRevisedDate) {
        const nextDue = new Date(
          new Date(lastRevisedDate).getTime() + intervalDays * 24 * 60 * 60 * 1000,
        );
        const nextDueStart = new Date(nextDue.getFullYear(), nextDue.getMonth(), nextDue.getDate());
        const timeDiff = nextDueStart.getTime() - startOfToday.getTime();
        dueDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        overdueDays = -dueDays;
      } else {
        dueDays = -30; // overdue by default
        overdueDays = 30;
      }

      // Calculate Topic Mastery score for this problem's topic
      const topicMastery = calculateTopicMastery(
        p.primary_topic_id,
        problems,
        problemTopics,
        revisions,
      );
      const masteryPct = topicMastery.pct;

      // Priority calculation:
      const scoreOverdue = overdueDays > 0 ? overdueDays * 12 : overdueDays * 2;
      const scoreDifficulty = p.difficulty === "Hard" ? 30 : p.difficulty === "Medium" ? 15 : 0;
      const scoreMastery = (100 - masteryPct) * 0.5;

      let scoreSchedule = 0;
      if (latestRating.includes("Forgot")) scoreSchedule = 20;
      else if (latestRating.includes("Hard")) scoreSchedule = 10;
      else if (latestRating.includes("Good")) scoreSchedule = 5;
      else if (latestRating === "None") scoreSchedule = 15;

      const priorityScore = Math.round(
        scoreOverdue + scoreDifficulty + scoreMastery + scoreSchedule,
      );

      // Determine Reason
      let reason = "Routine recall maintenance";
      if (!lastRevisedDate) {
        reason = "First review of this problem";
      } else if (overdueDays > 7) {
        reason = "Severely overdue for review";
      } else if (overdueDays > 0) {
        reason = "Due for spaced repetition review";
      } else if (scoreMastery > 35) {
        reason = "Weak topic mastery review";
      } else if (p.difficulty === "Hard") {
        reason = "Hard problem reinforcement";
      }

      const journal = Array.isArray(p.journals) ? p.journals[0] : (p.journals as any);

      return {
        id: p.id,
        title: p.title,
        difficulty: p.difficulty as "Easy" | "Medium" | "Hard",
        primaryTopicId: p.primary_topic_id,
        primaryTopicName: p.primary_topic?.name || "Arrays",
        lastRevisedDate,
        lastRevisedFormatted,
        dueDays,
        priorityScore,
        reason,
        status: p.status,
        journalNotes: journal?.revision_notes || "",
        journalLearned: journal?.learned || "",
      };
    });

    // 1. Study Queue: items due today or overdue (dueDays <= 0)
    const queue = allCalculated
      .filter((p) => p.dueDays <= 0)
      .sort((a, b) => b.priorityScore - a.priorityScore);
    setStudyQueue(queue);

    // 2. Upcoming Revisions: items due in the future (dueDays > 0)
    const upcomingList = allCalculated
      .filter((p) => p.dueDays > 0)
      .sort((a, b) => a.dueDays - b.dueDays || b.priorityScore - a.priorityScore)
      .slice(0, 8);
    setUpcoming(upcomingList);

    // 3. Logged History
    const historyMapped: RevisionHistoryItem[] = revisions.map((r) => {
      const problemObj = Array.isArray(r.problem)
        ? r.problem[0]
        : (r.problem as { title?: string } | null);
      return {
        id: r.id,
        problemTitle: problemObj?.title || "Unknown Problem",
        type: r.revision_type || "Review",
        notes: r.notes || "",
        date: r.revised_at
          ? new Date(r.revised_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
      };
    });
    setHistory(historyMapped);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadRevisionsData();
  }, [loadRevisionsData]);

  const handleRatingSubmit = async (rating: string) => {
    if (!ratingProblem) return;
    setSubmittingRating(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("revisions").insert({
        problem_id: ratingProblem.id,
        revision_type: rating,
        notes: ratingNotes.trim() || "Spaced repetition review completed.",
        revised_at: new Date().toISOString(),
        user_id: user.id,
      });

      if (error) {
        console.error("Failed to insert revision log:", error);
        toast.error("Failed to log recall rating.");
      } else {
        toast.success("Recall rating logged successfully!");
        setRatingProblem(null);
        setRatingNotes("");
        await loadRevisionsData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title="Smart Study Queue"
          subtitle="Spaced repetition engine prioritizing problems dynamically based on recall performance, difficulty, and topic mastery."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
          title="Smart Study Queue"
          subtitle="Spaced repetition engine prioritizing problems dynamically based on recall performance, difficulty, and topic mastery."
        />
      </FadeIn>

      {/* Daily Study Queue */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-primary animate-pulse" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Due for Review Today
            </h2>
            <Badge variant="default" className="shadow-ds-sm">
              {studyQueue.length}
            </Badge>
          </div>
          {studyQueue.length > 0 && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
              Sorted by Urgency
            </span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {studyQueue.map((p, index) => (
            <SlideUp key={p.id} delay={index * 40}>
              <GlassCard className="h-full flex flex-col justify-between" hoverEffect>
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          to="/problems/$id"
                          params={{ id: p.id }}
                          className="font-semibold text-foreground hover:text-primary transition-colors text-sm md:text-base line-clamp-1 flex-1"
                        >
                          {p.title}
                        </Link>
                        <DifficultyBadge difficulty={p.difficulty} />
                      </div>
                      <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                        <span>{p.primaryTopicName}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20 font-bold shrink-0">
                          Score: {p.priorityScore}
                        </span>
                      </div>
                    </div>

                    {/* Review reason tag */}
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-background/40 p-2 rounded-lg border border-border/20">
                      <Sparkles className="h-3 w-3 text-primary shrink-0 animate-pulse" />
                      <span className="font-medium line-clamp-1">{p.reason}</span>
                    </div>

                    <div className="text-[11px] text-muted-foreground/80 space-y-1 pt-1 border-t border-border/10">
                      <div className="flex justify-between">
                        <span>Last revised:</span>
                        <span className="font-semibold text-foreground">
                          {p.lastRevisedFormatted}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span
                          className={`font-semibold ${p.dueDays < -7 ? "text-destructive font-bold" : "text-foreground"}`}
                        >
                          {p.dueDays === -30
                            ? "First time review"
                            : `${Math.abs(p.dueDays)} days overdue`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 mt-4 border-t border-border/10 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-border/60 text-[11px] cursor-pointer"
                      onClick={() => setSolutionProblem(p)}
                    >
                      <Code2 className="mr-1.5 h-3.5 w-3.5" /> Code
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-border/60 text-[11px] cursor-pointer"
                      onClick={() => setNotesProblem(p)}
                    >
                      <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Notes
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold h-9 cursor-pointer"
                    onClick={() => {
                      setRatingProblem(p);
                      setRatingNotes("");
                    }}
                  >
                    <CheckCircle className="mr-1.5 h-4 w-4" /> Start Revision
                  </Button>
                </div>
              </GlassCard>
            </SlideUp>
          ))}

          {studyQueue.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={<CheckCircle className="h-5 w-5 text-success" />}
                title="Study Queue Clear!"
                description="You have completed all active recall sessions scheduled for today. Check upcoming items below. 🎉"
              />
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Revisions */}
      <section className="space-y-3 mt-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming Spaced Revisions
          </h2>
        </div>
        <GlassCard className="p-0">
          <div className="divide-y divide-border/10">
            {upcoming.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 transition hover:bg-muted/5"
              >
                <div className="min-w-0">
                  <Link
                    to="/problems/$id"
                    params={{ id: p.id }}
                    className="truncate text-sm font-medium hover:text-primary block transition-colors"
                  >
                    {p.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{p.primaryTopicName}</span>
                    <span>·</span>
                    <span>last revised {p.lastRevisedFormatted}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-muted-foreground bg-background/40 px-2 py-0.5 rounded border border-border/20 font-medium">
                    due in {p.dueDays} {p.dueDays === 1 ? "day" : "days"}
                  </span>
                  <DifficultyBadge difficulty={p.difficulty} />
                </div>
              </div>
            ))}
            {upcoming.length === 0 && (
              <p className="p-8 text-center text-xs text-muted-foreground">
                No upcoming revisions scheduled.
              </p>
            )}
          </div>
        </GlassCard>
      </section>

      {/* Revision History */}
      <section className="space-y-3 mt-6">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Spaced Recall Log History
          </h2>
        </div>
        <GlassCard className="p-0">
          <div className="divide-y divide-border/10">
            {history.slice(0, 10).map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>{r.problemTitle}</span>
                    <Badge
                      variant="secondary"
                      className="border-none bg-primary/10 px-2 py-0 text-[10px] text-primary font-medium"
                    >
                      {r.type}
                    </Badge>
                  </div>
                  {r.notes && (
                    <div className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                      {r.notes}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-right text-xs text-muted-foreground font-medium shrink-0 pt-0.5">
                  <Calendar className="h-3.5 w-3.5 opacity-60" />
                  <span>{r.date}</span>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="p-8 text-center text-xs text-muted-foreground">
                No revisions logged yet.
              </p>
            )}
          </div>
        </GlassCard>
      </section>

      {/* Solutions Preview Dialog */}
      <Dialog open={!!solutionProblem} onOpenChange={(open) => !open && setSolutionProblem(null)}>
        <DialogContent className="max-w-3xl border-border/40 bg-card/95 backdrop-blur-xl text-foreground max-h-[80vh] overflow-y-auto shadow-ds-glow p-6">
          <DialogHeader className="border-b border-border/20 pb-3 mb-4">
            <DialogTitle className="text-base font-semibold text-foreground">
              Solutions Preview: {solutionProblem?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {loadingSolutions ? (
              <div className="flex items-center justify-center py-12 text-xs text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Loading saved solutions...</span>
              </div>
            ) : solutions.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  icon={<Code2 className="h-5 w-5" />}
                  title="No solutions saved"
                  description="No solutions are currently recorded for this problem."
                />
              </div>
            ) : (
              <div className="space-y-6">
                {solutions.map((sol) => (
                  <div
                    key={sol.id}
                    className="space-y-3 border-b border-border/20 pb-5 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{sol.solution_name}</h4>
                      <Badge variant="outline" className="border-border/40 text-[10px]">
                        {sol.language}
                      </Badge>
                    </div>

                    {sol.approach && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                          Approach
                        </span>
                        <div className="text-xs text-muted-foreground">
                          <MarkdownRenderer content={sol.approach} />
                        </div>
                      </div>
                    )}

                    {sol.code && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                          Code
                        </span>
                        <CodeBlock value={sol.code} language={sol.language} />
                      </div>
                    )}

                    {sol.mistakes && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-warning uppercase tracking-widest block">
                          Mistakes
                        </span>
                        <div className="text-xs text-muted-foreground bg-warning/5 border border-warning/10 p-2.5 rounded-lg">
                          <MarkdownRenderer content={sol.mistakes} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes / Journal Preview Dialog */}
      <Dialog open={!!notesProblem} onOpenChange={(open) => !open && setNotesProblem(null)}>
        <DialogContent className="max-w-2xl border-border/40 bg-card/95 backdrop-blur-xl text-foreground max-h-[80vh] overflow-y-auto shadow-ds-glow p-6">
          <DialogHeader className="border-b border-border/20 pb-3 mb-4">
            <DialogTitle className="text-base font-semibold text-foreground">
              Notes & Journal: {notesProblem?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Journal Entries */}
            {notesProblem && (notesProblem.journalLearned || notesProblem.journalNotes) && (
              <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/30">
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <BrainCircuit className="h-3.5 w-3.5" /> Personal Journal Logs
                </h4>
                {notesProblem.journalLearned && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                      What I Learned
                    </span>
                    <div className="text-xs text-foreground bg-background/50 p-2.5 rounded-lg border border-border/20">
                      <MarkdownRenderer content={notesProblem.journalLearned} />
                    </div>
                  </div>
                )}
                {notesProblem.journalNotes && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Revision Notes
                    </span>
                    <div className="text-xs text-foreground bg-background/50 p-2.5 rounded-lg border border-border/20">
                      <MarkdownRenderer content={notesProblem.journalNotes} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Extra Notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-foreground/80" /> Extra Notes List
              </h4>
              {loadingNotes ? (
                <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Loading extra notes...</span>
                </div>
              ) : notes.length === 0 ? (
                <div className="py-4">
                  <EmptyState
                    icon={<MessageSquare className="h-5 w-5" />}
                    title="No extra notes"
                    description="No additional quick notes saved for this problem."
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 bg-background/40 border border-border/20 rounded-xl space-y-1.5"
                    >
                      <h5 className="text-xs font-semibold text-foreground">{n.title}</h5>
                      <div className="text-xs text-muted-foreground">
                        <MarkdownRenderer content={n.content} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recall Rating Dialog */}
      <Dialog
        open={!!ratingProblem}
        onOpenChange={(open) => !open && !submittingRating && setRatingProblem(null)}
      >
        <DialogContent className="max-w-md border-border/40 bg-card/95 backdrop-blur-xl text-foreground shadow-ds-glow p-6">
          <DialogHeader className="border-b border-border/20 pb-3 mb-4">
            <DialogTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
              <Timer className="h-4 w-4 text-primary" /> Log Recall Performance
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground leading-normal">
              Self-assess your recall quality for{" "}
              <strong className="text-foreground">"{ratingProblem?.title}"</strong> to schedule the
              next review cycle.
            </p>

            {/* Rating options grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={submittingRating}
                onClick={() => handleRatingSubmit("😄 Easy")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border/30 bg-background/40 hover:bg-success/5 hover:border-success/40 hover:shadow-ds-glow transition-all duration-200 cursor-pointer disabled:opacity-50 group text-center"
              >
                <span className="text-xl">😄</span>
                <span className="text-xs font-semibold mt-1 text-foreground group-hover:text-success">
                  Easy
                </span>
                <span className="text-[9px] text-muted-foreground mt-0.5">+14 Days</span>
              </button>

              <button
                disabled={submittingRating}
                onClick={() => handleRatingSubmit("🙂 Good")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border/30 bg-background/40 hover:bg-blue-500/5 hover:border-blue-500/40 hover:shadow-ds-glow transition-all duration-200 cursor-pointer disabled:opacity-50 group text-center"
              >
                <span className="text-xl">🙂</span>
                <span className="text-xs font-semibold mt-1 text-foreground group-hover:text-blue-400">
                  Good
                </span>
                <span className="text-[9px] text-muted-foreground mt-0.5">+7 Days</span>
              </button>

              <button
                disabled={submittingRating}
                onClick={() => handleRatingSubmit("😕 Hard")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border/30 bg-background/40 hover:bg-warning/5 hover:border-warning/40 hover:shadow-ds-glow transition-all duration-200 cursor-pointer disabled:opacity-50 group text-center"
              >
                <span className="text-xl">😕</span>
                <span className="text-xs font-semibold mt-1 text-foreground group-hover:text-warning">
                  Hard
                </span>
                <span className="text-[9px] text-muted-foreground mt-0.5">+3 Days</span>
              </button>

              <button
                disabled={submittingRating}
                onClick={() => handleRatingSubmit("😵 Forgot")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border/30 bg-background/40 hover:bg-destructive/5 hover:border-destructive/40 hover:shadow-ds-glow transition-all duration-200 cursor-pointer disabled:opacity-50 group text-center"
              >
                <span className="text-xl">😵</span>
                <span className="text-xs font-semibold mt-1 text-foreground group-hover:text-destructive">
                  Forgot
                </span>
                <span className="text-[9px] text-muted-foreground mt-0.5">+1 Day</span>
              </button>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/10">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                Optional Revision Notes
              </label>
              <Textarea
                placeholder="What did you get stuck on? Any memory shortcuts..."
                value={ratingNotes}
                onChange={(e) => setRatingNotes(e.target.value)}
                disabled={submittingRating}
                className="text-xs min-h-[70px] border-border/40 bg-background/40 focus-visible:ring-primary/30"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
