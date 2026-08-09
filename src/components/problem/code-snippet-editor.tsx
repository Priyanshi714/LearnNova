import { useState } from "react";
import { Select, Textarea } from "@/components/design-system";
import { PreviewToggle } from "@/components/editor/preview-toggle";
import { CodeBlock } from "@/components/editor/code-block";
import { cn } from "@/lib/utils";

interface CodeSnippetEditorProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  code: string;
  onCodeChange: (code: string) => void;
  placeholder?: string;
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

export function CodeSnippetEditor({
  language,
  onLanguageChange,
  code,
  onCodeChange,
  placeholder = "Paste code here...",
}: CodeSnippetEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const languages = ["Java", "C++", "Python", "JavaScript", "TypeScript", "Go", "Rust", "C#"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1.5 flex flex-col min-w-[160px]">
          <Label className="mb-0">Language</Label>
          <Select
            options={languages.map((lang) => ({ value: lang, label: lang }))}
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
          />
        </div>
        <div className="flex justify-end sm:self-end">
          <PreviewToggle mode={mode} onChange={setMode} />
        </div>
      </div>

      {mode === "edit" ? (
        <div className="space-y-1.5">
          <Label className="mb-0">Code Snippet</Label>
          <Textarea
            placeholder={placeholder}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="min-h-36 font-mono text-xs border-border/60 bg-background/50 text-foreground leading-relaxed p-3"
          />
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label className="mb-0">Code Snippet Preview</Label>
          {code.trim() ? (
            <CodeBlock language={language} value={code} />
          ) : (
            <div className="w-full rounded-lg border border-border/60 bg-background/30 p-8 text-center min-h-[144px] flex items-center justify-center">
              <p className="text-sm italic text-muted-foreground">No code to preview...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
