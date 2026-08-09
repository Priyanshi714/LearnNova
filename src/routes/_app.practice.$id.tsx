import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/components/difficulty-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ExternalLink, Play, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app/practice/$id")({
  ssr: false,
  head: () => ({ meta: [{ title: `Practice — LearnNova` }] }),
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("problems")
      .select("*, primary_topic:topics(name)")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      throw notFound();
    }
    return { problem: data };
  },
  notFoundComponent: () => (
    <div className="p-8 text-sm text-muted-foreground">Problem not found.</div>
  ),
  component: PracticePage,
});

const STARTER: Record<string, string> = {
  Python: "def solve():\n    # Your implementation here\n    pass\n",
  Java: "class Solution {\n    public void solve() {\n        // Your implementation here\n    }\n}\n",
  "C++":
    "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your implementation here\n    return 0;\n}\n",
  JavaScript: "function solve() {\n  // Your implementation here\n}\n",
};

interface DBProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  platform: string;
  primary_topic: { name: string } | null;
  problem_url?: string;
}

function PracticePage() {
  const { problem } = Route.useLoaderData() as { problem: DBProblem };
  const [lang, setLang] = useState("Python");
  const [code, setCode] = useState(STARTER.Python);

  const primaryTopicName = problem.primary_topic?.name || "Arrays";
  const secondaryTopics: string[] = [];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Top bar */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 bg-card/40 px-4 py-2.5 md:flex md:flex-wrap md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/problems/$id"
            params={{ id: problem.id }}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="truncate text-sm font-medium">{problem.title}</span>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={lang}
            onValueChange={(v) => {
              setLang(v);
              setCode(STARTER[v]);
            }}
          >
            <SelectTrigger className="h-8 w-32 border-border/60 bg-background/40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(STARTER).map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8 border-border/60">
            <Play className="mr-1.5 h-3.5 w-3.5" /> Run
          </Button>
          <Button
            size="sm"
            onClick={() => toast.success("Attempt saved.")}
            className="h-8 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" /> Save Attempt
          </Button>
        </div>
      </div>

      {/* Split */}
      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[22rem_minmax(0,1fr)]">
        {/* Left: problem info */}
        <aside className="overflow-y-auto border-b border-border/60 bg-card/30 p-5 lg:border-b-0 lg:border-r">
          <h2 className="text-lg font-semibold tracking-tight">{problem.title}</h2>
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            <Badge variant="outline" className="border-border/60">
              {problem.platform}
            </Badge>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground">Primary: </span>
              {primaryTopicName}
            </div>
            {secondaryTopics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-muted-foreground">Also:</span>
                {secondaryTopics.map((t) => (
                  <Badge key={t} variant="secondary" className="bg-primary/15 text-primary">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {problem.problem_url && (
            <a href={problem.problem_url} target="_blank" rel="noreferrer" className="mt-5 block">
              <Button variant="outline" size="sm" className="w-full border-border/60">
                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open Original Problem
              </Button>
            </a>
          )}
          <Card className="mt-5 border-warning/30 bg-warning/5">
            <CardContent className="flex gap-2.5 p-3.5 text-xs">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <div>
                <div className="font-medium text-warning">Active recall mode</div>
                <p className="mt-0.5 text-muted-foreground">
                  Previous solutions are hidden on purpose. Attempt independently first — your saved
                  solutions are one tab away after.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Right: editor */}
        <section className="flex flex-col bg-[oklch(0.13_0.015_280)]">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-2 text-[11px] text-muted-foreground">
            <span>
              solution.
              {lang === "Python" ? "py" : lang === "Java" ? "java" : lang === "C++" ? "cpp" : "js"}
            </span>
            <span>{lang}</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-5 font-mono text-sm leading-relaxed text-foreground outline-none"
          />
        </section>
      </div>
    </div>
  );
}
