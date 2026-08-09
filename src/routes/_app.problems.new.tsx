import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTopics } from "@/lib/topics";
import { ArrowLeft, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app/problems/new")({
  validateSearch: (search: Record<string, unknown>): { topic?: string } => {
    return {
      topic: search.topic as string | undefined,
    };
  },
  head: () => ({ meta: [{ title: "Add Problem — LearnNova" }] }),
  component: AddProblemPage,
});

function AddProblemPage() {
  const navigate = useNavigate();
  const { topic } = Route.useSearch();
  const [dbTopics, setDbTopics] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("Container With Most Water");
  const [problemUrl, setProblemUrl] = useState(
    "https://leetcode.com/problems/container-with-most-water",
  );
  const [platform, setPlatform] = useState("LeetCode");
  const [difficulty, setDifficulty] = useState("Medium");
  const [status, setStatus] = useState("Solved");
  const [primaryTopic, setPrimaryTopic] = useState(topic || "Arrays");
  const [secondary, setSecondary] = useState<string[]>(["Hashing"]);
  const [tags, setTags] = useState<string[]>(["Blind75"]);
  const [tagInput, setTagInput] = useState("");
  useEffect(() => {
    async function loadTopics() {
      const topics = await getTopics();
      setDbTopics(topics);
    }

    loadTopics();
  }, []);

  const addTag = (t: string) => {
    const v = t.trim();
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setTagInput("");
  };

  const handleAddProblem = async () => {
    if (!title.trim()) {
      toast.error("Problem title cannot be empty");
      return;
    }
    if (!primaryTopic) {
      toast.error("Please select a primary topic");
      return;
    }

    const selectedTopic = dbTopics.find((topic) => topic.name === primaryTopic);
    if (!selectedTopic) {
      toast.error("Selected primary topic not found in database");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to add a problem");
      return;
    }

    // Query the max learning_order for this user and selected topic
    const { data: maxOrderData } = await supabase
      .from("problems")
      .select("learning_order")
      .eq("user_id", user.id)
      .eq("primary_topic_id", selectedTopic.id)
      .order("learning_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = maxOrderData?.learning_order ? maxOrderData.learning_order + 1 : 1;

    const { error } = await supabase.from("problems").insert({
      title: title.trim(),
      platform,
      problem_url: problemUrl,
      difficulty,
      status,
      primary_topic_id: selectedTopic.id,
      user_id: user.id,
      learning_order: nextOrder,
    });

    if (error) {
      console.error("Failed to add problem:", error);
      toast.error("Failed to add problem. Please try again.");
    } else {
      toast.success("Problem added to your second brain.");
      navigate({ to: "/problems" });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
      <Link
        to="/problems"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to problems
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Add a problem</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Turn a solved problem into organized knowledge.
        </p>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Problem Title</Label>
            <Input
              placeholder="e.g. Two Sum"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Problem URL</Label>
              <Input
                placeholder="https://…"
                value={problemUrl}
                onChange={(e) => setProblemUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "LeetCode",
                    "GeeksforGeeks",
                    "College Portal",
                    "CodeChef",
                    "Codeforces",
                    "HackerRank",
                    "Other",
                  ].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Easy", "Medium", "Hard"].map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Solved", "Attempted", "Revising"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Pattern Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary Topic</Label>
              <Select value={primaryTopic} onValueChange={setPrimaryTopic}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dbTopics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.name}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Add Secondary Topic</Label>
              <Select
                onValueChange={(v) => !secondary.includes(v) && setSecondary([...secondary, v])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick a related topic…" />
                </SelectTrigger>
                <SelectContent>
                  {dbTopics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.name}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Secondary Topics</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {secondary.length === 0 && (
                <span className="text-xs text-muted-foreground">None selected.</span>
              )}
              {secondary.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="gap-1 bg-primary/15 text-primary hover:bg-primary/20"
                >
                  {t}
                  <button onClick={() => setSecondary(secondary.filter((x) => x !== t))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Blind75, Amazon, Google, Favorite, Must Revise…"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(tagInput))}
            />
            <Button type="button" variant="outline" onClick={() => addTag(tagInput)}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Badge key={t} variant="outline" className="gap-1 border-border/60">
                {t}
                <button onClick={() => setTags(tags.filter((x) => x !== t))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Link to="/problems">
          <Button variant="ghost">Cancel</Button>
        </Link>
        <Button
          className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
          onClick={handleAddProblem}
        >
          Add Problem
        </Button>
      </div>
    </div>
  );
}
