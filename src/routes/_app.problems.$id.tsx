import { createFileRoute, Link, notFound, useNavigate, useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  ExternalLink,
  Play,
  Plus,
  BookMarked,
  AlertTriangle,
  Lightbulb,
  Clock,
  FileCode2,
  ChevronRight,
  RefreshCw,
  Trash2,
  Pencil,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  GitBranch,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getTopics } from "@/lib/topics";
import { MarkdownRenderer } from "@/components/editor/markdown-renderer";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { CodeBlock } from "@/components/editor/code-block";
import { getPrerequisitesForTopic } from "@/lib/concept-map";
import { CodeSnippetEditor } from "@/components/problem/code-snippet-editor";

// Import new premium design system
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
  InfoChip,
  EmptyState,
  FadeIn,
  SlideUp,
  Button,
  Badge,
  MutedText,
  TextInput,
  Textarea,
  Select,
} from "@/components/design-system";

export const Route = createFileRoute("/_app/problems/$id")({
  head: () => ({ meta: [{ title: "Problem Details — LearnNova" }] }),
  loader: async ({ params }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const query = supabase
      .from("problems")
      .select("*, primary_topic:topics(name)")
      .eq("id", params.id);

    if (user) {
      query.eq("user_id", user.id);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      throw notFound();
    }

    return { problem: data };
  },
  notFoundComponent: () => (
    <div className="p-8 text-sm text-muted-foreground">Problem not found.</div>
  ),
  component: ProblemDetail,
});

interface ProblemDetailData {
  id: string;
  user_id: string;
  title: string;
  platform: string;
  problem_url?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: string;
  primary_topic_id: string;
  learning_order?: number;
  description?: string;
  created_at: string;
  primary_topic?: { name: string };
  secondaryTopics?: string[];
  tags?: string[];
  solutions?: {
    id: string;
    name: string;
    language: string;
    timeComplexity: string;
    spaceComplexity: string;
    code: string;
    approach: string;
    mistakes: string;
    notes: string;
    dateAdded: string;
  }[];
  journal?: {
    learned: string;
    mistakes: string;
    revisionNotes: string;
  };
  revisions?: {
    type: string;
    date: string;
    notes: string;
  }[];
}

function ProblemDetail() {
  const { problem } = Route.useLoaderData() as { problem: ProblemDetailData };
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "info";
  const itemId = searchParams.get("itemId");

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(location.search);
    params.set("tab", newTab);
    params.delete("itemId");
    navigate({
      to: "/problems/$id",
      params: { id: problem.id },
      search: Object.fromEntries(params.entries()) as any,
      replace: true,
    });
  };

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [isRecsOpen, setIsRecsOpen] = useState(true);
  const [isGraphOpen, setIsGraphOpen] = useState(true);

  const loadRecommendations = useCallback(async () => {
    setLoadingRecs(true);
    try {
      const { data: problems, error } = await supabase
        .from("problems")
        .select("*")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      const allProblems = problems || [];

      // Recommendation algorithm logic
      const targetTopicId = problem.primary_topic_id;
      const targetPatternTags = problem.tags || [];

      const matches = allProblems
        .filter((p) => p.id !== problem.id)
        .map((p) => {
          let score = 0;
          const reasons: string[] = [];

          if (p.primary_topic_id === targetTopicId) {
            score += 50;
            reasons.push("Same Topic");
          }

          const overlappingTags = (p.tags || []).filter((t: string) =>
            targetPatternTags.includes(t),
          );
          if (overlappingTags.length > 0) {
            score += 30;
            reasons.push("Same Pattern");
          }

          if (p.difficulty === problem.difficulty) {
            score += 15;
          } else {
            reasons.push(`${p.difficulty} variation`);
          }

          let matchPct = Math.min(99, score);
          if (p.primary_topic_id === targetTopicId && overlappingTags.length > 0) {
            matchPct = Math.min(100, score + 10);
          }

          return {
            id: p.id,
            title: p.title,
            difficulty: p.difficulty,
            platform: p.platform,
            matchPct,
            reason: reasons[0] || "Related Topic",
          };
        })
        .filter((p) => p.matchPct > 15)
        .sort((a, b) => b.matchPct - a.matchPct)
        .slice(0, 5);

      setRecommendations(matches);
    } catch (e) {
      console.error("Failed to load recommendations", e);
    } finally {
      setLoadingRecs(false);
    }
  }, [problem]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // Rest of state loading and mutations logic
  const [solutions, setSolutions] = useState(problem.solutions || []);
  const [activeSolution, setActiveSolution] = useState<string | null>(solutions[0]?.id || null);

  // Sync active solution with query param itemId if present
  useEffect(() => {
    if (activeTab === "solutions" && itemId) {
      const match = solutions.find((s) => s.id === itemId);
      if (match) {
        setActiveSolution(match.id);
      }
    }
  }, [activeTab, itemId, solutions]);

  const [notes, setNotes] = useState<
    { id: string; title: string; content: string; created_at: string }[]
  >([]);
  const [revisions, setRevisions] = useState<
    { id: string; type: string; date: string; notes: string }[]
  >([]);
  const [dbTopics, setDbTopics] = useState<{ id: string; name: string }[]>([]);

  const loadExtraNotes = useCallback(async () => {
    const { data } = await supabase
      .from("problem_notes")
      .select("*")
      .eq("problem_id", problem.id)
      .order("created_at", { ascending: false });
    if (data) setNotes(data);
  }, [problem.id]);

  const loadRevisions = useCallback(async () => {
    const { data } = await supabase
      .from("revisions")
      .select("*")
      .eq("problem_id", problem.id)
      .order("revised_at", { ascending: false });
    if (data) {
      setRevisions(
        data.map((r) => ({
          id: r.id,
          type: r.revision_type,
          date: new Date(r.revised_at || r.created_at).toLocaleDateString(),
          notes: r.notes || "",
        })),
      );
    }
  }, [problem.id]);

  useEffect(() => {
    if (activeTab === "notes") {
      loadExtraNotes();
    } else if (activeTab === "related_problems") {
      loadRelatedProblems();
    } else if (activeTab === "revisions") {
      loadRevisions();
    } else if (activeTab === "solutions") {
      loadSolutions();
    } else if (activeTab === "journal") {
      loadJournal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    async function loadTopics() {
      const topics = await getTopics();
      setDbTopics(topics);
    }
    loadTopics();
  }, []);

  const loadSolutions = async () => {
    const { data } = await supabase
      .from("solutions")
      .select("*")
      .eq("problem_id", problem.id)
      .order("created_at", { ascending: false });
    if (data) {
      const mapped = data.map((s) => ({
        id: s.id,
        name: s.solution_name,
        language: s.language,
        timeComplexity: s.time_complexity || "—",
        spaceComplexity: s.space_complexity || "—",
        code: s.code || "",
        approach: s.approach || "",
        mistakes: s.mistakes || "",
        notes: s.notes || "",
        dateAdded: new Date(s.created_at).toLocaleDateString(),
      }));
      setSolutions(mapped);
      if (mapped.length > 0 && !activeSolution) {
        setActiveSolution(mapped[0].id);
      }
    }
  };

  const sol = solutions.find((s) => s.id === activeSolution);

  // Solution Modals Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [solName, setSolName] = useState("");
  const [solLanguage, setSolLanguage] = useState("TypeScript");
  const [solTimeComplexity, setSolTimeComplexity] = useState("");
  const [solSpaceComplexity, setSolSpaceComplexity] = useState("");
  const [solCode, setSolCode] = useState("");
  const [solApproach, setSolApproach] = useState("");
  const [solMistakes, setSolMistakes] = useState("");
  const [solNotes, setSolNotes] = useState("");

  const handleAddSolution = async () => {
    if (!solName.trim()) {
      toast.error("Please enter a solution title.");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("solutions")
      .insert({
        problem_id: problem.id,
        user_id: user.id,
        solution_name: solName,
        language: solLanguage,
        code: solCode,
        approach: solApproach,
        mistakes: solMistakes,
        notes: solNotes,
        time_complexity: solTimeComplexity,
        space_complexity: solSpaceComplexity,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      toast.error("Failed to save solution.");
    } else {
      toast.success("Solution saved!");
      setIsAddModalOpen(false);
      // reset
      setSolName("");
      setSolCode("");
      setSolApproach("");
      setSolMistakes("");
      setSolNotes("");
      setSolTimeComplexity("");
      setSolSpaceComplexity("");
      loadSolutions();
    }
  };

  // Edit Solution Form States
  const [isEditSolModalOpen, setIsEditSolModalOpen] = useState(false);
  const [editSolId, setEditSolId] = useState("");
  const [editSolName, setEditSolName] = useState("");
  const [editSolLanguage, setEditSolLanguage] = useState("TypeScript");
  const [editSolTimeComplexity, setEditSolTimeComplexity] = useState("");
  const [editSolSpaceComplexity, setEditSolSpaceComplexity] = useState("");
  const [editSolCode, setEditSolCode] = useState("");
  const [editSolApproach, setEditSolApproach] = useState("");
  const [editSolMistakes, setEditSolMistakes] = useState("");
  const [editSolNotes, setEditSolNotes] = useState("");

  const handleOpenEditSolution = (s: any) => {
    setEditSolId(s.id);
    setEditSolName(s.name);
    setEditSolLanguage(s.language);
    setEditSolTimeComplexity(s.timeComplexity);
    setEditSolSpaceComplexity(s.spaceComplexity);
    setEditSolCode(s.code);
    setEditSolApproach(s.approach);
    setEditSolMistakes(s.mistakes);
    setEditSolNotes(s.notes);
    setIsEditSolModalOpen(true);
  };

  const handleEditSolution = async () => {
    if (!editSolName.trim()) {
      toast.error("Please enter a solution title.");
      return;
    }
    const { error } = await supabase
      .from("solutions")
      .update({
        solution_name: editSolName,
        language: editSolLanguage,
        code: editSolCode,
        approach: editSolApproach,
        mistakes: editSolMistakes,
        notes: editSolNotes,
        time_complexity: editSolTimeComplexity,
        space_complexity: editSolSpaceComplexity,
      })
      .eq("id", editSolId);

    if (error) {
      console.error(error);
      toast.error("Failed to update solution.");
    } else {
      toast.success("Solution updated!");
      setIsEditSolModalOpen(false);
      loadSolutions();
    }
  };

  const handleDeleteSolution = async () => {
    if (!activeSolution) return;
    const { error } = await supabase.from("solutions").delete().eq("id", activeSolution);
    if (error) {
      toast.error("Failed to delete solution.");
    } else {
      toast.success("Solution deleted.");
      setActiveSolution(null);
      loadSolutions();
    }
  };

  const handleDeleteProblem = async () => {
    const { error } = await supabase.from("problems").delete().eq("id", problem.id);
    if (error) {
      toast.error("Failed to delete problem.");
    } else {
      toast.success("Problem deleted.");
      navigate({ to: "/problems" });
    }
  };

  // Edit Problem States
  const [isEditProblemModalOpen, setIsEditProblemModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(problem.title);
  const [editProblemUrl, setEditProblemUrl] = useState(problem.problem_url || "");
  const [editPlatform, setEditPlatform] = useState(problem.platform);
  const [editDifficulty, setEditDifficulty] = useState(problem.difficulty);
  const [editStatus, setEditStatus] = useState(problem.status);
  const [editPrimaryTopic, setEditPrimaryTopic] = useState(problem.primary_topic?.name || "");

  const handleEditProblem = async () => {
    if (!editTitle.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    const topicObj = dbTopics.find((t) => t.name === editPrimaryTopic);
    if (!topicObj) {
      toast.error("Primary topic invalid.");
      return;
    }

    let nextOrder = problem.learning_order;
    if (problem.primary_topic_id !== topicObj.id) {
      const { data: maxOrderData } = await supabase
        .from("problems")
        .select("learning_order")
        .eq("user_id", problem.user_id)
        .eq("primary_topic_id", topicObj.id)
        .order("learning_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      nextOrder = maxOrderData?.learning_order ? maxOrderData.learning_order + 1 : 1;
    }

    const { error } = await supabase
      .from("problems")
      .update({
        title: editTitle,
        problem_url: editProblemUrl,
        platform: editPlatform,
        difficulty: editDifficulty,
        status: editStatus,
        primary_topic_id: topicObj.id,
        learning_order: nextOrder,
      })
      .eq("id", problem.id);

    if (error) {
      console.error(error);
      toast.error("Failed to update problem.");
    } else {
      toast.success("Problem updated!");
      setIsEditProblemModalOpen(false);
      window.location.reload();
    }
  };

  // Problem Description states & actions
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState(problem.description || "");

  const handleSaveDescription = async () => {
    const { error } = await supabase
      .from("problems")
      .update({ description: descriptionContent })
      .eq("id", problem.id);

    if (error) {
      console.error(error);
      toast.error("Failed to save description.");
    } else {
      toast.success("Problem description saved.");
      setIsDescriptionModalOpen(false);
      window.location.reload();
    }
  };

  // Extra Notes states & actions
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editNoteId, setEditNoteId] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) {
      toast.error("Please enter a note title.");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (editNoteId) {
      const { error } = await supabase
        .from("problem_notes")
        .update({ title: noteTitle, content: noteContent })
        .eq("id", editNoteId);
      if (error) {
        toast.error("Failed to save note.");
      } else {
        toast.success("Note saved.");
        setIsNoteModalOpen(false);
        loadExtraNotes();
      }
    } else {
      const { error } = await supabase.from("problem_notes").insert({
        problem_id: problem.id,
        user_id: user.id,
        title: noteTitle,
        content: noteContent,
      });
      if (error) {
        toast.error("Failed to save note.");
      } else {
        toast.success("Note created.");
        setIsNoteModalOpen(false);
        loadExtraNotes();
      }
    }
  };

  const handleOpenEditNote = (note: any) => {
    setEditNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = async (id: string) => {
    const { error } = await supabase.from("problem_notes").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete note.");
    } else {
      toast.success("Note deleted.");
      loadExtraNotes();
    }
  };

  // Revisions States & Action
  const [isAddRevModalOpen, setIsAddRevModalOpen] = useState(false);
  const [revNotes, setRevNotes] = useState("");
  const [revConfidence, setRevConfidence] = useState("3");
  const [revDate, setRevDate] = useState(new Date().toISOString().split("T")[0]);

  // Edit Revision states
  const [isEditRevModalOpen, setIsEditRevModalOpen] = useState(false);
  const [editRevId, setEditRevId] = useState("");
  const [editRevNotes, setEditRevNotes] = useState("");
  const [editRevConfidence, setEditRevConfidence] = useState("3");
  const [editRevDate, setEditRevDate] = useState("");

  const handleAddRevision = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("revisions").insert({
      problem_id: problem.id,
      user_id: user.id,
      notes: revNotes,
      confidence_level: parseInt(revConfidence),
      revised_at: new Date(revDate).toISOString(),
      revision_type: `Practice Again (${revConfidence}/5 Confidence)`,
    });

    if (error) {
      toast.error("Failed to save revision.");
    } else {
      toast.success("Revision recorded!");
      setIsAddRevModalOpen(false);
      setRevNotes("");
      setRevConfidence("3");
      loadRevisions();
    }
  };

  const handleOpenEditRevision = (r: any) => {
    setEditRevId(r.id);
    setEditRevNotes(r.notes);
    const confidenceMatch = r.type.match(/\((\d)\/5/);
    setEditRevConfidence(confidenceMatch ? confidenceMatch[1] : "3");

    // Parse Date formatted string e.g. "26/06/2026" or similar back to "YYYY-MM-DD"
    let dVal = new Date().toISOString().split("T")[0];
    const parts = r.date.split("/");
    if (parts.length === 3) {
      // DD/MM/YYYY to YYYY-MM-DD
      dVal = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    setEditRevDate(dVal);
    setIsEditRevModalOpen(true);
  };

  const handleEditRevision = async () => {
    const { error } = await supabase
      .from("revisions")
      .update({
        notes: editRevNotes,
        confidence_level: parseInt(editRevConfidence),
        revised_at: new Date(editRevDate).toISOString(),
        revision_type: `Practice Again (${editRevConfidence}/5 Confidence)`,
      })
      .eq("id", editRevId);

    if (error) {
      toast.error("Failed to update revision.");
    } else {
      toast.success("Revision updated!");
      setIsEditRevModalOpen(false);
      loadRevisions();
    }
  };

  const handleDeleteRevision = async (id: string) => {
    const { error } = await supabase.from("revisions").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete revision.");
    } else {
      toast.success("Revision deleted.");
      loadRevisions();
    }
  };

  // Journal States & Action
  const [journalLearned, setJournalLearned] = useState("");
  const [journalMistakes, setJournalMistakes] = useState("");
  const [journalRevisionNotes, setJournalRevisionNotes] = useState("");
  const [isEditingJournal, setIsEditingJournal] = useState(false);

  const loadJournal = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("journals")
      .select("*")
      .eq("problem_id", problem.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setJournalLearned(data.learned || "");
      setJournalMistakes(data.mistakes || "");
      setJournalRevisionNotes(data.revision_notes || "");
    }
  };

  const handleSaveJournal = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from("journals")
      .select("id")
      .eq("problem_id", problem.id)
      .eq("user_id", user.id)
      .maybeSingle();

    let error = null;
    if (existing) {
      const res = await supabase
        .from("journals")
        .update({
          learned: journalLearned,
          mistakes: journalMistakes,
          revision_notes: journalRevisionNotes,
        })
        .eq("id", existing.id);
      error = res.error;
    } else {
      const res = await supabase.from("journals").insert({
        problem_id: problem.id,
        user_id: user.id,
        learned: journalLearned,
        mistakes: journalMistakes,
        revision_notes: journalRevisionNotes,
      });
      error = res.error;
    }

    if (error) {
      toast.error("Failed to save journal.");
    } else {
      toast.success("Journal updated!");
      setIsEditingJournal(false);
      loadJournal();
    }
  };

  // Related Problems States & Actions
  const [relatedProblems, setRelatedProblems] = useState<
    {
      id: string;
      title: string;
      solution: string;
      notes: string;
      created_at: string;
      code?: string | null;
      language?: string | null;
    }[]
  >([]);
  const [isRelProblemModalOpen, setIsRelProblemModalOpen] = useState(false);
  const [editRelProblemId, setEditRelProblemId] = useState("");
  const [relProblemTitle, setRelProblemTitle] = useState("");
  const [relProblemSolution, setRelProblemSolution] = useState("");
  const [relProblemNotes, setRelProblemNotes] = useState("");
  const [relProblemLanguage, setRelProblemLanguage] = useState("Java");
  const [relProblemCode, setRelProblemCode] = useState("");

  const loadRelatedProblems = async () => {
    const { data } = await supabase
      .from("related_problems")
      .select("*")
      .eq("problem_id", problem.id)
      .order("created_at", { ascending: false });
    if (data) setRelatedProblems(data);
  };

  // Sync active related problem with query param itemId if present
  useEffect(() => {
    if (activeTab === "related_problems" && itemId) {
      // scroll to linked item or highlight it
      setTimeout(() => {
        const el = document.getElementById(`rel-${itemId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
    }
  }, [activeTab, itemId, relatedProblems]);

  const handleSaveRelProblem = async () => {
    if (!relProblemTitle.trim()) {
      toast.error("Please enter a question title.");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const codeVal = relProblemCode.trim() ? relProblemCode : null;
    const langVal = relProblemCode.trim() ? relProblemLanguage : null;

    if (editRelProblemId) {
      const { error } = await supabase
        .from("related_problems")
        .update({
          title: relProblemTitle,
          solution: relProblemSolution,
          notes: relProblemNotes,
          code: codeVal,
          language: langVal,
        })
        .eq("id", editRelProblemId);
      if (error) {
        toast.error("Failed to save related problem.");
      } else {
        toast.success("Related problem updated!");
        setIsRelProblemModalOpen(false);
        loadRelatedProblems();
      }
    } else {
      const { error } = await supabase.from("related_problems").insert({
        problem_id: problem.id,
        user_id: user.id,
        title: relProblemTitle,
        solution: relProblemSolution,
        notes: relProblemNotes,
        code: codeVal,
        language: langVal,
      });
      if (error) {
        toast.error("Failed to save related problem.");
      } else {
        toast.success("Related problem added!");
        setIsRelProblemModalOpen(false);
        loadRelatedProblems();
      }
    }
  };

  const handleOpenEditRelProblem = (item: any) => {
    setEditRelProblemId(item.id);
    setRelProblemTitle(item.title);
    setRelProblemSolution(item.solution);
    setRelProblemNotes(item.notes);
    setRelProblemLanguage(item.language || "Java");
    setRelProblemCode(item.code || "");
    setIsRelProblemModalOpen(true);
  };

  const handleDeleteRelProblem = async (id: string) => {
    const oldProblems = [...relatedProblems];
    setRelatedProblems(relatedProblems.filter((p) => p.id !== id));

    const { error } = await supabase.from("related_problems").delete().eq("id", id);

    if (error) {
      console.error(error);
      toast.error("Failed to delete related problem. Restoring old state.");
      setRelatedProblems(oldProblems);
    } else {
      toast.success("Related problem deleted.");
    }
  };

  const primaryTopic = problem.primary_topic?.name || "Arrays";
  const secondaryTopics = problem.secondaryTopics || [];
  const tags = problem.tags || [];
  const problemUrl = problem.problem_url || "#";
  const dateAdded = new Date(problem.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <PageContainer className="pb-16 space-y-6">
      {/* Back Link */}
      <Link
        to="/problems"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back
        to Problems
      </Link>

      {/* Flagship Hero Workspace header */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card/80 via-background/95 to-primary/5 p-6 md:p-8 shadow-ds-lg group">
          <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-primary/10 to-primary-glow/5 blur-[90px] rounded-full pointer-events-none opacity-80" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="min-w-0 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full tracking-wider">
                  {problem.platform}
                </span>
                <DifficultyBadge difficulty={problem.difficulty} />
                <StatusChip status={problem.status === "Revising" ? "Attempted" : problem.status} />
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">
                {problem.title}
              </h1>
              <div className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                <span>Primary: {primaryTopic}</span>
                {secondaryTopics.length > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-muted-foreground/60">
                      Secondary: {secondaryTopics.join(", ")}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a href={problemUrl} target="_blank" rel="noreferrer">
                <Button
                  variant="outline"
                  iconRight={<ExternalLink className="size-3.5" />}
                  className="h-9 px-3.5"
                >
                  Open Original
                </Button>
              </a>
              <Link to="/practice/$id" params={{ id: problem.id }}>
                <Button
                  variant="outline"
                  iconLeft={<Play className="size-3.5 fill-foreground" />}
                  className="h-9 px-3.5"
                >
                  Practice
                </Button>
              </Link>
              <Button
                variant="outline"
                iconLeft={<Pencil className="size-3.5" />}
                onClick={() => setIsEditProblemModalOpen(true)}
                className="h-9 px-3.5"
              >
                Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="danger"
                    iconLeft={<Trash2 className="size-3.5" />}
                    className="h-9 px-3.5"
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-border/60 bg-card/95 backdrop-blur-md text-foreground">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the problem
                      <strong> "{problem.title}"</strong> and all its associated solutions, journal
                      entries, and revisions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-border/60 bg-background/50 hover:bg-background/80">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteProblem}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="primary"
                iconLeft={<Plus className="size-3.5" />}
                onClick={() => setIsAddModalOpen(true)}
                className="h-9 px-3.5"
              >
                Add Solution
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="bg-card/45 border border-border/30 rounded-xl p-1 w-full overflow-x-auto flex whitespace-nowrap scrollbar-none">
          <TabsTrigger
            value="info"
            className="rounded-lg px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all data-[state=active]:bg-primary/15 data-[state=active]:text-primary cursor-pointer"
          >
            Problem Info
          </TabsTrigger>
          <TabsTrigger
            value="solutions"
            className="rounded-lg px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all data-[state=active]:bg-primary/15 data-[state=active]:text-primary cursor-pointer"
          >
            Solutions
            <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px]">
              {solutions.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="related_problems"
            className="rounded-lg px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all data-[state=active]:bg-primary/15 data-[state=active]:text-primary cursor-pointer"
          >
            Related Problems
            <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px]">
              {relatedProblems.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="journal"
            className="rounded-lg px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all data-[state=active]:bg-primary/15 data-[state=active]:text-primary cursor-pointer"
          >
            Personal Journal
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="rounded-lg px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all data-[state=active]:bg-primary/15 data-[state=active]:text-primary cursor-pointer"
          >
            Extra Notes
            <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px]">
              {notes.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="revisions"
            className="rounded-lg px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all data-[state=active]:bg-primary/15 data-[state=active]:text-primary cursor-pointer"
          >
            Revisions
            <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px]">
              {revisions.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Problem Info */}
        <TabsContent value="info">
          <FadeIn>
            <GlassCard className="border-border/30">
              <div className="grid gap-6 p-1 md:grid-cols-2">
                <Field label="Title" value={problem.title} />
                <Field label="Platform" value={problem.platform} />
                <Field label="Difficulty" value={problem.difficulty} />
                <Field label="Primary Topic" value={primaryTopic} />
                <div>
                  <Label>Secondary Topics</Label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {secondaryTopics.length === 0 && (
                      <span className="text-xs text-muted-foreground/60 italic">—</span>
                    )}
                    {secondaryTopics.map((t) => (
                      <Badge key={t} variant="secondary" className="bg-primary/10 text-primary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Tags</Label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {tags.length === 0 && (
                      <span className="text-xs text-muted-foreground/60 italic">—</span>
                    )}
                    {tags.map((t) => (
                      <Badge key={t} variant="outline" className="border-border/60">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Field label="Status" value={problem.status} />
                <Field label="Date Added" value={dateAdded} />
              </div>
            </GlassCard>

            {/* Problem Description section */}
            {!problem.description ? (
              <div className="mt-6 border-t border-border/20 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Problem Description
                  </h3>
                </div>
                <div className="mt-4 rounded-xl border border-dashed border-border/40 bg-card/20 p-8 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    No problem description saved.
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Useful for temporary platforms like College Portal, Internal Assessments, and
                    University Portals.
                  </p>
                  <Button
                    variant="primary"
                    className="mt-4 gap-2 text-xs"
                    onClick={() => {
                      setDescriptionContent(problem.description || "");
                      setIsDescriptionModalOpen(true);
                    }}
                  >
                    Add Problem Description
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 border-t border-border/20 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Problem Description
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold text-primary hover:text-primary-glow"
                    onClick={() => {
                      setDescriptionContent(problem.description || "");
                      setIsDescriptionModalOpen(true);
                    }}
                  >
                    Edit Description
                  </Button>
                </div>
                <GlassCard className="border-border/30 p-5 bg-background/10">
                  <MarkdownRenderer content={problem.description} />
                </GlassCard>
              </div>
            )}
          </FadeIn>
        </TabsContent>

        {/* Tab 2: Solutions */}
        <TabsContent value="solutions">
          <FadeIn>
            <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
              <GlassCard className="border-border/30 p-4">
                <div className="space-y-4">
                  <SectionHeader title="Saved Solutions" className="pb-2 border-b-0" />
                  <div className="space-y-2">
                    {solutions.map((s) => (
                      <button
                        id={`sol-${s.id}`}
                        key={s.id}
                        onClick={() => setActiveSolution(s.id)}
                        className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all duration-300 cursor-pointer ${
                          activeSolution === s.id
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border/30 bg-background/20 hover:bg-background/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {s.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="shrink-0 border-border/40 text-[9px] px-1 py-0"
                          >
                            {s.language}
                          </Badge>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                          <Clock className="h-3 w-3 shrink-0" /> {s.timeComplexity}
                          <span>·</span>
                          <span>{s.dateAdded}</span>
                        </div>
                      </button>
                    ))}
                    {solutions.length === 0 && (
                      <EmptyState
                        icon={<FileCode2 className="size-4" />}
                        title="No Solutions"
                        description="Click 'Add Solution' to add your code snippets."
                        className="py-6 border-dashed"
                      />
                    )}
                  </div>
                </div>
              </GlassCard>

              {sol ? (
                <GlassCard
                  className="border-border/30"
                  header={
                    <div className="flex w-full items-center justify-between gap-3">
                      <div>
                        <h4 className="text-base font-bold text-foreground">{sol.name}</h4>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground/80">
                          <Badge variant="outline" className="border-border/60">
                            {sol.language}
                          </Badge>
                          <span>Time: {sol.timeComplexity}</span>
                          <span>·</span>
                          <span>Space: {sol.spaceComplexity}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-primary transition-colors cursor-pointer"
                          onClick={() => handleOpenEditSolution(sol)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="border-border/60 bg-card/95 backdrop-blur-md text-foreground">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Solution</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the solution{" "}
                                <strong>"{sol.name}"</strong>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border/60 bg-background/50 hover:bg-background/80">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteSolution}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-5">
                    <div>
                      <Label>Code</Label>
                      <CodeBlock language={sol.language} value={sol.code} />
                    </div>
                    <Field label="Approach" value={sol.approach} block />
                    <div className="grid gap-4 md:grid-cols-2 pt-2">
                      <Field label="Mistakes Made" value={sol.mistakes} block />
                      <Field label="Solution Notes" value={sol.notes} block />
                    </div>
                  </div>
                </GlassCard>
              ) : (
                solutions.length > 0 && (
                  <GlassCard className="flex items-center justify-center border-border/30 p-12 text-sm text-muted-foreground">
                    Select a solution on the left to view the details.
                  </GlassCard>
                )
              )}
            </div>
          </FadeIn>
        </TabsContent>

        {/* Tab 3: Related Problems */}
        <TabsContent value="related_problems">
          <FadeIn className="space-y-4">
            <div className="flex justify-between items-center border-b border-border/20 pb-3">
              <SectionHeader
                title="Related Problems"
                subtitle="Variations, follow-ups, or similar patterns"
              />
              <Button
                variant="primary"
                iconLeft={<Plus className="size-4" />}
                onClick={() => {
                  setEditRelProblemId("");
                  setRelProblemTitle("");
                  setRelProblemSolution("");
                  setRelProblemNotes("");
                  setRelProblemLanguage("Java");
                  setRelProblemCode("");
                  setIsRelProblemModalOpen(true);
                }}
              >
                Add Related Problem
              </Button>
            </div>

            {relatedProblems.length === 0 ? (
              <EmptyState
                icon={<BookMarked className="size-5" />}
                title="No Related Problems Linked"
                description="Link other variations or similar questions and add their solutions or notes."
                actionButton={
                  <Button
                    variant="outline"
                    iconLeft={<Plus className="size-4" />}
                    onClick={() => {
                      setEditRelProblemId("");
                      setRelProblemTitle("");
                      setRelProblemSolution("");
                      setRelProblemNotes("");
                      setRelProblemLanguage("Java");
                      setRelProblemCode("");
                      setIsRelProblemModalOpen(true);
                    }}
                  >
                    Link First Related Problem
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {relatedProblems.map((item) => (
                  <RelatedProblemCard
                    key={item.id}
                    item={item}
                    isActive={itemId === item.id}
                    onEdit={() => handleOpenEditRelProblem(item)}
                    onDelete={() => handleDeleteRelProblem(item.id)}
                  />
                ))}
              </div>
            )}
          </FadeIn>
        </TabsContent>

        {/* Tab 4: Journal */}
        <TabsContent value="journal">
          <FadeIn className="space-y-4">
            <div className="flex justify-between items-center border-b border-border/20 pb-3">
              <SectionHeader
                title="Personal Journal"
                subtitle="Mistakes journal and revision takeaways"
              />
              {!isEditingJournal ? (
                <Button variant="outline" onClick={() => setIsEditingJournal(true)}>
                  Edit Journal
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setIsEditingJournal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSaveJournal}>
                    Save Journal
                  </Button>
                </div>
              )}
            </div>

            <div
              id="journal-container"
              className={`grid gap-4 md:grid-cols-3 transition-all duration-300 rounded-xl p-1 ${
                itemId ? "border border-primary bg-primary/5 shadow-ds-glow" : ""
              }`}
            >
              <JournalCard
                icon={Lightbulb}
                title="What I Learned"
                tone="text-primary-glow"
                value={journalLearned}
                onChange={setJournalLearned}
                disabled={!isEditingJournal}
              />
              <JournalCard
                icon={AlertTriangle}
                title="Common Mistakes"
                tone="text-warning"
                value={journalMistakes}
                onChange={setJournalMistakes}
                disabled={!isEditingJournal}
              />
              <JournalCard
                icon={BookMarked}
                title="Revision Notes"
                tone="text-success"
                value={journalRevisionNotes}
                onChange={setJournalRevisionNotes}
                disabled={!isEditingJournal}
              />
            </div>
          </FadeIn>
        </TabsContent>

        {/* Tab 5: Extra Notes */}
        <TabsContent value="notes">
          <FadeIn className="space-y-4">
            <div className="flex justify-between items-center border-b border-border/20 pb-3">
              <SectionHeader
                title="Extra Notes"
                subtitle="Scratchpad, code snippets, or templates"
              />
              <Button
                variant="primary"
                iconLeft={<Plus className="size-4" />}
                onClick={() => {
                  setEditNoteId("");
                  setNoteTitle("");
                  setNoteContent("");
                  setIsNoteModalOpen(true);
                }}
              >
                Add Note
              </Button>
            </div>

            {notes.length === 0 ? (
              <EmptyState
                icon={<BookMarked className="size-5" />}
                title="No Extra Notes"
                description="Save code design patterns, interview tips, or notes."
                actionButton={
                  <Button
                    variant="outline"
                    iconLeft={<Plus className="size-4" />}
                    onClick={() => {
                      setEditNoteId("");
                      setNoteTitle("");
                      setNoteContent("");
                      setIsNoteModalOpen(true);
                    }}
                  >
                    Create First Note
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 items-start">
                {notes.map((note) => (
                  <GlassCard
                    id={`note-${note.id}`}
                    key={note.id}
                    className={`border-border/30 flex flex-col justify-between transition-all duration-300 h-fit ${
                      itemId === note.id ? "border-primary bg-primary/5 shadow-ds-glow" : ""
                    }`}
                    title={note.title}
                  >
                    <div className="space-y-4 flex-1 flex flex-col">
                      <div className="text-sm text-muted-foreground mb-4">
                        <MarkdownRenderer content={note.content} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground/75 border-t border-border/10 pt-3 mt-auto font-semibold uppercase tracking-wider">
                        <span>
                          Created:{" "}
                          {new Date(note.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            className="h-8 px-2.5 text-xs text-foreground/85 hover:text-primary transition-colors cursor-pointer"
                            onClick={() => handleOpenEditNote(note)}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-border/60 bg-card/95 backdrop-blur-md text-foreground">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Note</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the note{" "}
                                  <strong>"{note.title}"</strong>? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-border/60 bg-background/50 hover:bg-background/80">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </FadeIn>
        </TabsContent>

        {/* Tab 6: Revisions */}
        <TabsContent value="revisions">
          <FadeIn className="space-y-4">
            <div className="flex justify-between items-center border-b border-border/20 pb-3">
              <SectionHeader title="Revision History" subtitle="Your spaced repetition logs" />
              <Button
                variant="primary"
                iconLeft={<Plus className="size-4" />}
                onClick={() => setIsAddRevModalOpen(true)}
              >
                Add Revision Record
              </Button>
            </div>

            <GlassCard className="border-border/30 p-0">
              <div className="divide-y divide-border/20">
                {revisions.length === 0 && (
                  <EmptyState
                    icon={<RefreshCw className="size-5" />}
                    title="No Revision History"
                    description="Schedule spaced repetition practices to lock in patterns."
                    className="py-12 border-none shadow-none"
                  />
                )}
                {revisions.map((r) => (
                  <div
                    id={`rev-${r.id}`}
                    key={r.id}
                    className={`flex items-start justify-between gap-4 px-5 py-4 transition-all duration-300 ${
                      itemId === r.id
                        ? "bg-primary/5 border border-primary/20"
                        : "hover:bg-accent/10"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${r.type.includes("Practice Again") ? "bg-primary/15 text-primary-glow" : "bg-success/15 text-success"}`}
                      >
                        {r.type.includes("Practice Again") ? (
                          <Play className="h-3.5 w-3.5" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground">{r.type}</span>
                          <span className="text-[10px] text-muted-foreground/70 font-semibold">
                            {r.date}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <MarkdownRenderer content={r.notes} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-primary transition-colors cursor-pointer"
                        onClick={() => handleOpenEditRevision(r)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-border/60 bg-card/95 backdrop-blur-md text-foreground">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Revision Record</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this revision record from {r.date}?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-border/60 bg-background/50 hover:bg-background/80">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteRevision(r.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </FadeIn>
        </TabsContent>
      </Tabs>

      {/* Recommended Problems (Collapsible widget) */}
      <SlideUp delay={100}>
        <Collapsible
          open={isRecsOpen}
          onOpenChange={setIsRecsOpen}
          className="w-full rounded-xl border border-border/40 bg-card/45 backdrop-blur-md overflow-hidden transition-all duration-300 shadow-ds-sm mt-6"
        >
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between px-5 py-4 hover:bg-muted/10 transition-colors text-left cursor-pointer">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
                <span className="font-bold text-foreground text-sm">Recommended Problems</span>
                {!loadingRecs && recommendations.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-primary/10 border-primary/20 text-primary text-[10px]"
                  >
                    {recommendations.length} Found
                  </Badge>
                )}
              </div>
              {isRecsOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground/60" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground/60" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="border-t border-border/20 px-5 py-5 bg-card/15">
            {loadingRecs ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Finding practice suggestions...</span>
              </div>
            ) : recommendations.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="size-4" />}
                title="No recommendations found"
                description="Add more problems to get smart recommendations."
                className="py-8 shadow-none border-none bg-transparent"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((rec) => (
                  <Link key={rec.id} to="/problems/$id" params={{ id: rec.id }} className="block">
                    <ActionCard
                      hoverEffect
                      className="p-4 bg-background/25 border-border/40 hover:border-primary/30 flex flex-col justify-between h-full group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {rec.title}
                          </span>
                          <span className="text-[9px] font-bold text-primary shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20">
                            {rec.matchPct}% Match
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Badge
                            variant="outline"
                            className="border-border/60 text-[8px] px-1 py-0 h-4"
                          >
                            {rec.platform}
                          </Badge>
                          <DifficultyBadge difficulty={rec.difficulty} />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/10 text-[9px] text-muted-foreground flex items-center justify-between uppercase font-bold tracking-wider">
                        <span className="bg-muted/40 px-2 py-0.5 rounded-md border border-border/20 text-muted-foreground text-[9px]">
                          {rec.reason}
                        </span>
                        <span className="group-hover:translate-x-0.5 transition-transform text-primary font-bold text-[9px]">
                          Solve now →
                        </span>
                      </div>
                    </ActionCard>
                  </Link>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </SlideUp>

      {/* Knowledge Graph collapsible */}
      <SlideUp delay={150}>
        <Collapsible
          open={isGraphOpen}
          onOpenChange={setIsGraphOpen}
          className="w-full rounded-xl border border-border/40 bg-card/45 backdrop-blur-md overflow-hidden transition-all duration-300 shadow-ds-sm mt-6"
        >
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between px-5 py-4 hover:bg-muted/10 transition-colors text-left cursor-pointer">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4.5 w-4.5 text-primary" />
                <span className="font-bold text-foreground text-sm">Knowledge Graph</span>
              </div>
              {isGraphOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground/60" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground/60" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="border-t border-border/20 px-5 py-5 bg-card/15">
            <div className="flex flex-col gap-5 items-center max-w-3xl mx-auto py-4">
              {/* Part B: Prerequisites Node */}
              <div className="w-full max-w-md bg-background/30 border border-border/20 p-5 rounded-2xl space-y-3.5">
                <div className="flex items-center gap-2 border-b border-border/10 pb-2">
                  <div className="size-2 rounded-full bg-muted-foreground/60 animate-pulse-subtle" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Prerequisite Concepts
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 p-1">
                  {getPrerequisitesForTopic(primaryTopic).length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">
                      Foundational Concept (No custom prerequisites mapped)
                    </span>
                  ) : (
                    getPrerequisitesForTopic(primaryTopic).map((p) => (
                      <Badge
                        key={p}
                        variant="outline"
                        className="border-border/80 bg-background/50 hover:bg-muted/10 text-xs px-2.5 py-1"
                      >
                        {p}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {/* Connection Arrow */}
              <div className="flex flex-col items-center my-0.5">
                <div className="h-6 w-px bg-gradient-to-b from-border/50 to-primary/50" />
                <div className="flex items-center justify-center size-6 rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <ArrowDown className="h-3 w-3" />
                </div>
                <div className="h-4 w-px bg-primary/20" />
              </div>

              {/* Part A: Core Concepts (Active Target Node) */}
              <div className="w-full max-w-md bg-gradient-to-br from-primary/10 via-primary/5 to-background/50 border border-primary/30 shadow-ds-glow p-5 rounded-2xl space-y-3.5 text-center">
                <div className="flex items-center justify-center gap-2 border-b border-primary/10 pb-2">
                  <div className="size-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    Active Concept Node
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Primary Concept
                  </h4>
                  <span className="inline-flex items-center rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-sm font-semibold text-primary shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    {primaryTopic}
                  </span>
                </div>

                {(secondaryTopics.length > 0 || tags.length > 0) && (
                  <div className="space-y-2 border-t border-border/10 pt-3">
                    <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Supporting Patterns & Details
                    </h4>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {secondaryTopics.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="bg-primary/5 text-primary-glow border border-primary/10 text-xs px-2 py-0.5"
                        >
                          {t}
                        </Badge>
                      ))}
                      {tags.map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="border-border/60 text-xs px-2 py-0.5"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Connection Arrow */}
              <div className="flex flex-col items-center my-0.5">
                <div className="h-6 w-px bg-gradient-to-b from-primary/50 to-primary-glow/50" />
                <div className="flex items-center justify-center size-6 rounded-full border border-primary-glow/20 bg-primary-glow/10 text-primary-glow">
                  <ArrowDown className="h-3 w-3" />
                </div>
                <div className="h-4 w-px bg-primary-glow/20" />
              </div>

              {/* Part C & D: Target Expansion (Builds Toward & Related Problems Node) */}
              <div className="w-full space-y-3">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Target Expansion Roadmap
                  </span>
                </div>

                <div className="w-full grid gap-4 md:grid-cols-2">
                  {/* Suggestions suggestions */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold px-1">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Automatic Suggestions
                    </div>

                    <div className="space-y-2">
                      {recommendations.slice(0, 3).length === 0 ? (
                        <p className="text-xs text-muted-foreground bg-background/20 border border-border/20 rounded-xl p-4 text-center italic">
                          No recommendations available.
                        </p>
                      ) : (
                        recommendations.slice(0, 3).map((rec) => (
                          <ActionCard
                            key={rec.id}
                            className="border-border/40 bg-background/25 p-3.5 rounded-xl hover:border-primary/30 transition-all duration-200 flex flex-col justify-between space-y-2 group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {rec.title}
                              </span>
                              <span className="text-[9px] font-bold text-primary shrink-0 bg-primary/10 px-1 py-0.5 rounded-full border border-primary/20">
                                {rec.matchPct}% Match
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1 items-center">
                                <Badge
                                  variant="outline"
                                  className="border-border/60 text-[8px] px-1 py-0 h-4"
                                >
                                  {rec.platform}
                                </Badge>
                                <DifficultyBadge difficulty={rec.difficulty} />
                              </div>
                              <Link to="/problems/$id" params={{ id: rec.id }}>
                                <Button
                                  variant="ghost"
                                  className="h-7 text-[10px] text-primary hover:text-primary-glow font-semibold p-1.5 cursor-pointer"
                                >
                                  Open Problem
                                </Button>
                              </Link>
                            </div>
                          </ActionCard>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Manual Related Problems suggestion */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold px-1">
                      <GitBranch className="h-3.5 w-3.5 text-foreground/80" /> Manual Related
                      Problems
                    </div>

                    <div className="space-y-2">
                      {relatedProblems.length === 0 ? (
                        <p className="text-xs text-muted-foreground bg-background/20 border border-border/20 rounded-xl p-4 text-center italic">
                          No manual related problems linked.
                        </p>
                      ) : (
                        relatedProblems.map((item) => (
                          <GlassCard
                            key={item.id}
                            className="border-border/40 bg-background/25 p-3.5 rounded-xl flex flex-col justify-between space-y-2"
                          >
                            <div>
                              <span className="text-xs font-semibold text-foreground line-clamp-1">
                                {item.title}
                              </span>
                              {item.notes && (
                                <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                                  {item.notes}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between border-t border-border/10 pt-2 mt-1">
                              <span className="text-[8px] text-muted-foreground font-medium uppercase tracking-wider">
                                Manual Link
                              </span>
                              <Button
                                onClick={() => {
                                  const params = new URLSearchParams(location.search);
                                  params.set("tab", "related_problems");
                                  params.set("itemId", item.id);
                                  navigate({
                                    to: "/problems/$id",
                                    params: { id: problem.id },
                                    search: Object.fromEntries(params.entries()) as any,
                                    replace: true,
                                  });
                                }}
                                variant="ghost"
                                className="h-7 text-[10px] text-primary hover:text-primary-glow font-semibold p-1.5 cursor-pointer"
                              >
                                Open Notes
                              </Button>
                            </div>
                          </GlassCard>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </SlideUp>

      {/* Solution add dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl border-border/60 bg-card/95 backdrop-blur-md text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Add New Solution
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Solution Title</Label>
              <TextInput
                placeholder="e.g. Optimal Two Pointer Approach"
                value={solName}
                onChange={(e) => setSolName(e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Time Complexity</Label>
                <TextInput
                  placeholder="e.g. O(N)"
                  value={solTimeComplexity}
                  onChange={(e) => setSolTimeComplexity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Space Complexity</Label>
                <TextInput
                  placeholder="e.g. O(1)"
                  value={solSpaceComplexity}
                  onChange={(e) => setSolSpaceComplexity(e.target.value)}
                />
              </div>
            </div>

            <CodeSnippetEditor
              language={solLanguage}
              onLanguageChange={setSolLanguage}
              code={solCode}
              onCodeChange={setSolCode}
            />

            <div className="space-y-2">
              <Label>Approach</Label>
              <MarkdownEditor
                placeholder="Describe the logic..."
                value={solApproach}
                onChange={setSolApproach}
                minHeightClass="min-h-24"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Mistakes Made</Label>
                <MarkdownEditor
                  placeholder="Common pitfalls..."
                  value={solMistakes}
                  onChange={setSolMistakes}
                  minHeightClass="min-h-24"
                />
              </div>
              <div className="space-y-2">
                <Label>Solution Notes</Label>
                <MarkdownEditor
                  placeholder="Key takeaways..."
                  value={solNotes}
                  onChange={setSolNotes}
                  minHeightClass="min-h-24"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddSolution}>
              Save Solution
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Revision dialog */}
      <Dialog open={isAddRevModalOpen} onOpenChange={setIsAddRevModalOpen}>
        <DialogContent className="max-w-md border-border/60 bg-card/95 backdrop-blur-md text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">Add Revision</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Revision Notes</Label>
              <MarkdownEditor
                placeholder="What did you learn/improve on this revision?"
                value={revNotes}
                onChange={setRevNotes}
                minHeightClass="min-h-24"
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2 flex flex-col">
                <Label className="mb-1.5">Confidence Level</Label>
                <Select
                  options={["1", "2", "3", "4", "5"].map((level) => ({
                    value: level,
                    label: `${level} / 5`,
                  }))}
                  value={revConfidence}
                  onChange={(e) => setRevConfidence(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Revision Date</Label>
                <TextInput
                  type="date"
                  value={revDate}
                  onChange={(e) => setRevDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setIsAddRevModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddRevision}>
              Save Revision
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Problem dialog */}
      <Dialog open={isEditProblemModalOpen} onOpenChange={setIsEditProblemModalOpen}>
        <DialogContent className="max-w-xl border-border/60 bg-card/95 backdrop-blur-md text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">Edit Problem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Problem Title</Label>
              <TextInput
                placeholder="e.g. Two Sum"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Problem URL</Label>
                <TextInput
                  placeholder="https://…"
                  value={editProblemUrl}
                  onChange={(e) => setEditProblemUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2 flex flex-col">
                <Label className="mb-1.5">Platform</Label>
                <Select
                  options={[
                    "LeetCode",
                    "GeeksforGeeks",
                    "College Portal",
                    "CodeChef",
                    "Codeforces",
                    "HackerRank",
                    "Other",
                  ].map((p) => ({ value: p, label: p }))}
                  value={editPlatform}
                  onChange={(e) => setEditPlatform(e.target.value)}
                />
              </div>
              <div className="space-y-2 flex flex-col">
                <Label className="mb-1.5">Difficulty</Label>
                <Select
                  options={["Easy", "Medium", "Hard"].map((d) => ({ value: d, label: d }))}
                  value={editDifficulty}
                  onChange={(e) => setEditDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                />
              </div>
              <div className="space-y-2 flex flex-col">
                <Label className="mb-1.5">Status</Label>
                <Select
                  options={["Solved", "Attempted", "Revising"].map((s) => ({ value: s, label: s }))}
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2 flex flex-col">
              <Label className="mb-1.5">Primary Topic</Label>
              <Select
                options={dbTopics.map((topic) => ({ value: topic.name, label: topic.name }))}
                value={editPrimaryTopic}
                onChange={(e) => setEditPrimaryTopic(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setIsEditProblemModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditProblem}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Solution dialog */}
      <Dialog open={isEditSolModalOpen} onOpenChange={setIsEditSolModalOpen}>
        <DialogContent className="max-w-2xl border-border/60 bg-card/95 backdrop-blur-md text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Edit Solution
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Solution Title</Label>
              <TextInput
                placeholder="e.g. Optimal Two Pointer Approach"
                value={editSolName}
                onChange={(e) => setEditSolName(e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Time Complexity</Label>
                <TextInput
                  placeholder="e.g. O(N)"
                  value={editSolTimeComplexity}
                  onChange={(e) => setEditSolTimeComplexity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Space Complexity</Label>
                <TextInput
                  placeholder="e.g. O(1)"
                  value={editSolSpaceComplexity}
                  onChange={(e) => setEditSolSpaceComplexity(e.target.value)}
                />
              </div>
            </div>
            <CodeSnippetEditor
              language={editSolLanguage}
              onLanguageChange={setEditSolLanguage}
              code={editSolCode}
              onCodeChange={setEditSolCode}
            />
            <div className="space-y-2">
              <Label>Approach</Label>
              <MarkdownEditor
                placeholder="Describe the logic..."
                value={editSolApproach}
                onChange={setEditSolApproach}
                minHeightClass="min-h-24"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Mistakes Made</Label>
                <MarkdownEditor
                  placeholder="Common pitfalls..."
                  value={editSolMistakes}
                  onChange={setEditSolMistakes}
                  minHeightClass="min-h-24"
                />
              </div>
              <div className="space-y-2">
                <Label>Solution Notes</Label>
                <MarkdownEditor
                  placeholder="Key takeaways..."
                  value={editSolNotes}
                  onChange={setEditSolNotes}
                  minHeightClass="min-h-24"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setIsEditSolModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditSolution}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Revision dialog */}
      <Dialog open={isEditRevModalOpen} onOpenChange={setIsEditRevModalOpen}>
        <DialogContent className="max-w-md border-border/60 bg-card/95 backdrop-blur-md text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Edit Revision
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Revision Notes</Label>
              <MarkdownEditor
                placeholder="What did you learn/improve on this revision?"
                value={editRevNotes}
                onChange={setEditRevNotes}
                minHeightClass="min-h-24"
              />
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2 flex flex-col">
                <Label className="mb-1.5">Confidence Level</Label>
                <Select
                  options={["1", "2", "3", "4", "5"].map((level) => ({
                    value: level,
                    label: `${level} / 5`,
                  }))}
                  value={editRevConfidence}
                  onChange={(e) => setEditRevConfidence(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Revision Date</Label>
                <TextInput
                  type="date"
                  value={editRevDate}
                  onChange={(e) => setEditRevDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setIsEditRevModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditRevision}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Problem Description Dialog */}
      <Dialog open={isDescriptionModalOpen} onOpenChange={setIsDescriptionModalOpen}>
        <DialogContent className="max-w-2xl border-border/60 bg-card/95 backdrop-blur-md text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {problem.description ? "Edit Problem Description" : "Add Problem Description"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Description (Markdown supported)</Label>
              <MarkdownEditor
                placeholder="Enter the problem statement, constraints, input/output samples here..."
                value={descriptionContent}
                onChange={setDescriptionContent}
                minHeightClass="min-h-[300px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setIsDescriptionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveDescription}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Extra Note dialog */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="max-w-md border-border/60 bg-card/95 backdrop-blur-md text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {editNoteId ? "Edit Note" : "Add Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Note Title</Label>
              <TextInput
                placeholder="e.g. Edge Cases to Remember"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <MarkdownEditor
                placeholder="Write your note observations, templates, tips here..."
                value={noteContent}
                onChange={setNoteContent}
                minHeightClass="min-h-32"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveNote}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Related Problem dialog */}
      <Dialog open={isRelProblemModalOpen} onOpenChange={setIsRelProblemModalOpen}>
        <DialogContent className="max-w-md border-border/60 bg-card/95 backdrop-blur-md text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {editRelProblemId ? "Edit Related Problem" : "Add Related Problem"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question Title</Label>
              <TextInput
                placeholder="e.g. 3Sum"
                value={relProblemTitle}
                onChange={(e) => setRelProblemTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Solution / Approach</Label>
              <MarkdownEditor
                placeholder="Describe the solution logic or paste code..."
                value={relProblemSolution}
                onChange={setRelProblemSolution}
                minHeightClass="min-h-32"
              />
            </div>
            <CodeSnippetEditor
              language={relProblemLanguage}
              onLanguageChange={setRelProblemLanguage}
              code={relProblemCode}
              onCodeChange={setRelProblemCode}
            />
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <MarkdownEditor
                placeholder="Key takeaways, similarities, or variations..."
                value={relProblemNotes}
                onChange={setRelProblemNotes}
                minHeightClass="min-h-20"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setIsRelProblemModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveRelProblem}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Field({ label, value, block }: { label: string; value: string; block?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      {block ? (
        <div className="mt-1 rounded-xl border border-border/30 bg-background/40 p-3.5 text-sm text-foreground/90 leading-relaxed shadow-inner">
          <MarkdownRenderer content={value || "—"} />
        </div>
      ) : (
        <div className="mt-1 text-sm font-semibold text-foreground/90">{value || "—"}</div>
      )}
    </div>
  );
}

function JournalCard({
  icon: Icon,
  title,
  tone,
  value,
  onChange,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone: string;
  value: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
}) {
  return (
    <GlassCard hoverEffect className="border-border/30 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-border/10">
          <Icon className={cn("h-4 w-4", tone)} />
          <h4 className="text-sm font-bold text-foreground">{title}</h4>
        </div>
        {disabled ? (
          <div className="min-h-[140px] border border-border/20 rounded-xl p-3.5 bg-background/35 overflow-y-auto leading-relaxed text-sm text-foreground/95">
            <MarkdownRenderer content={value} />
          </div>
        ) : (
          <MarkdownEditor
            value={value}
            onChange={onChange || (() => {})}
            minHeightClass="min-h-[140px]"
          />
        )}
      </div>
    </GlassCard>
  );
}

function RelatedProblemCard({
  item,
  onEdit,
  onDelete,
  isActive,
}: {
  item: {
    id: string;
    title: string;
    solution: string;
    notes: string;
    created_at: string;
    code?: string | null;
    language?: string | null;
  };
  onEdit: () => void;
  onDelete: () => void;
  isActive: boolean;
}) {
  const [isCodeOpen, setIsCodeOpen] = useState(false);

  return (
    <GlassCard
      id={`rel-${item.id}`}
      className={`border-border/30 flex flex-col justify-between transition-all duration-300 ${
        isActive ? "border-primary bg-primary/5 shadow-ds-glow" : ""
      }`}
      title={item.title}
    >
      <div className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div>
            <Label>Solution / Approach</Label>
            <div className="mt-1.5 rounded-lg border border-border/20 bg-background/40 p-3 text-sm text-foreground/90">
              <MarkdownRenderer content={item.solution} />
            </div>
          </div>

          <div className="pt-1">
            <Collapsible
              open={isCodeOpen}
              onOpenChange={setIsCodeOpen}
              className="w-full rounded-lg border border-border/20 bg-background/20 overflow-hidden transition-all duration-300"
            >
              <CollapsibleTrigger asChild>
                <button className="flex w-full items-center justify-between px-3.5 py-2 hover:bg-muted/10 transition-colors text-left cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="h-4 w-4 text-primary" />
                    <span className="font-bold text-foreground text-xs uppercase tracking-wider">
                      Code Snippet
                    </span>
                  </div>
                  {isCodeOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/60" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t border-border/10 bg-black/10 px-3.5 py-3">
                {item.code ? (
                  <CodeBlock language={item.language || "Java"} value={item.code} />
                ) : (
                  <EmptyState
                    icon={<FileCode2 className="size-4 text-muted-foreground/60" />}
                    title="No code snippet added."
                    description=""
                    className="py-6 border-none bg-transparent shadow-none"
                  />
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {item.notes && (
            <div>
              <Label>Notes</Label>
              <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                <MarkdownRenderer content={item.notes} />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground/75 border-t border-border/10 pt-3 mt-4 font-semibold uppercase tracking-wider">
          <span>
            Added:{" "}
            {new Date(item.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-8 px-2.5 text-xs text-foreground/85 hover:text-primary transition-colors cursor-pointer"
              onClick={onEdit}
            >
              <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-border/60 bg-card/95 backdrop-blur-md text-foreground">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Related Problem</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the related problem{" "}
                    <strong>"{item.title}"</strong>? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border/60 bg-background/50 hover:bg-background/80">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
