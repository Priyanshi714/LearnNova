import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { PreviewToggle } from "./preview-toggle";
import { MarkdownRenderer } from "./markdown-renderer";
import { PlusCircle, Lightbulb, Code, Braces, Zap } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  minHeightClass?: string;
  preserveBreaks?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write Markdown here...",
  className = "",
  minHeightClass = "min-h-[140px]",
  preserveBreaks = true,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertTemplate = () => {
    const template = `# Problem Statement

Write the problem statement here.

## Constraints

- 

## Sample Input
\`\`\`text

\`\`\`

## Sample Output
\`\`\`text

\`\`\`

## Explanation

`;
    if (
      !value.trim() ||
      confirm(
        "Are you sure you want to insert the template? This will replace your current content.",
      )
    ) {
      onChange(template);
    }
  };

  const handleInsert = (type: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value;
    const selection = currentVal.substring(start, end);
    const prefix = currentVal.substring(0, start);
    const suffix = currentVal.substring(end);

    let insertedText = "";
    let cursorStartOffset = 0;
    let cursorEndOffset = 0;

    switch (type) {
      case "highlight": {
        const text = selection || "Concept";
        insertedText = `<concept>${text}</concept>`;
        cursorStartOffset = "<concept>".length;
        cursorEndOffset = cursorStartOffset + text.length;
        break;
      }
      case "inline-code": {
        const text = selection || "code";
        insertedText = `\`${text}\``;
        cursorStartOffset = 1;
        cursorEndOffset = cursorStartOffset + text.length;
        break;
      }
      case "code-block": {
        insertedText = "\n```java\n\n```\n";
        cursorStartOffset = "\n```java\n".length;
        cursorEndOffset = cursorStartOffset;
        break;
      }
      case "tree": {
        insertedText = "\n```text\n        4\n       / \\\n      8   10\n     /   /  \\\n    7   5    1\n   /\n  3\n```\n";
        cursorStartOffset = insertedText.length;
        cursorEndOffset = cursorStartOffset;
        break;
      }
      case "input": {
        insertedText = "\n```input\n\n```\n";
        cursorStartOffset = "\n```input\n".length;
        cursorEndOffset = cursorStartOffset;
        break;
      }
      case "output": {
        insertedText = "\n```output\n\n```\n";
        cursorStartOffset = "\n```output\n".length;
        cursorEndOffset = cursorStartOffset;
        break;
      }
      case "complexity": {
        insertedText = "\n```complexity\nTime: O(N)\nSpace: O(1)\n```\n";
        cursorStartOffset = insertedText.length;
        cursorEndOffset = cursorStartOffset;
        break;
      }
      case "binary-tree": {
        insertedText = "\n```text\n        1\n       / \\\n      2   3\n     / \\\n    4   5\n```\n";
        cursorStartOffset = insertedText.length;
        cursorEndOffset = cursorStartOffset;
        break;
      }
      case "linked-list": {
        insertedText = "\n```text\n10 -> 20 -> 30 -> 40 -> null\n```\n";
        cursorStartOffset = insertedText.length;
        cursorEndOffset = cursorStartOffset;
        break;
      }
      case "graph": {
        insertedText = "\n```text\n0 -> 1, 2\n1 -> 0, 3\n2 -> 0\n3 -> 1\n```\n";
        cursorStartOffset = insertedText.length;
        cursorEndOffset = cursorStartOffset;
        break;
      }
      default:
        break;
    }

    const newVal = prefix + insertedText + suffix;
    onChange(newVal);

    // Set cursor position after the state update has been processed
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + cursorStartOffset,
        start + cursorEndOffset
      );
    }, 0);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        {mode === "edit" ? (
          <button
            type="button"
            onClick={handleInsertTemplate}
            className="text-xs font-semibold text-primary hover:text-primary-glow flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <PlusCircle className="size-3.5" /> Insert Problem Template
          </button>
        ) : (
          <div />
        )}
        <PreviewToggle mode={mode} onChange={setMode} />
      </div>

      {mode === "edit" ? (
        <div className="flex flex-col">
          {/* DSA Rich Text Toolbar */}
          <div className="flex flex-wrap gap-1 p-1 bg-black/40 border border-border/60 rounded-t-lg items-center border-b-0 select-none">
            {/* Formatters */}
            <button
              type="button"
              onClick={() => handleInsert("highlight")}
              className="h-7 px-2.5 text-[11px] bg-background/40 hover:bg-primary/10 border border-border/30 rounded-md text-foreground/80 hover:text-primary transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-medium"
              title="Highlight concept"
            >
              <Lightbulb className="size-3 text-primary-glow" /> Highlight
            </button>
            <button
              type="button"
              onClick={() => handleInsert("inline-code")}
              className="h-7 px-2.5 text-[11px] bg-background/40 hover:bg-primary/10 border border-border/30 rounded-md text-foreground/80 hover:text-primary transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-medium"
              title="Inline code block"
            >
              <Code className="size-3 text-primary-glow" /> Inline
            </button>
            <button
              type="button"
              onClick={() => handleInsert("code-block")}
              className="h-7 px-2.5 text-[11px] bg-background/40 hover:bg-primary/10 border border-border/30 rounded-md text-foreground/80 hover:text-primary transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-medium"
              title="Fenced code block"
            >
              <Braces className="size-3 text-primary-glow" /> Code Block
            </button>
            
            <div className="w-[1px] h-4 bg-border/40 mx-1" />
            
            {/* Blocks */}
            <button
              type="button"
              onClick={() => handleInsert("complexity")}
              className="h-7 px-2.5 text-[11px] bg-background/40 hover:bg-primary/10 border border-border/30 rounded-md text-foreground/80 hover:text-primary transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-medium"
              title="Complexity analysis block"
            >
              <Zap className="size-3 text-warning" /> Complexity
            </button>
            <button
              type="button"
              onClick={() => handleInsert("input")}
              className="h-7 px-2.5 text-[11px] bg-background/40 hover:bg-primary/10 border border-border/30 rounded-md text-foreground/80 hover:text-primary transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-medium"
              title="Sample Input block"
            >
              📥 Input
            </button>
            <button
              type="button"
              onClick={() => handleInsert("output")}
              className="h-7 px-2.5 text-[11px] bg-background/40 hover:bg-primary/10 border border-border/30 rounded-md text-foreground/80 hover:text-primary transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-medium"
              title="Sample Output block"
            >
              📤 Output
            </button>

            <div className="w-[1px] h-4 bg-border/40 mx-1" />

            {/* Diagram Templates */}
            <button
              type="button"
              onClick={() => handleInsert("tree")}
              className="h-7 px-2.5 text-[11px] bg-background/40 hover:bg-primary/10 border border-border/30 rounded-md text-foreground/80 hover:text-primary transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-medium"
              title="Ascii tree diagram template"
            >
              🌳 Tree
            </button>
            <button
              type="button"
              onClick={() => handleInsert("binary-tree")}
              className="h-7 px-2.5 text-[11px] bg-background/40 hover:bg-primary/10 border border-border/30 rounded-md text-foreground/80 hover:text-primary transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-medium"
              title="Binary tree template"
            >
              🌲 Binary Tree
            </button>
            <button
              type="button"
              onClick={() => handleInsert("linked-list")}
              className="h-7 px-2.5 text-[11px] bg-background/40 hover:bg-primary/10 border border-border/30 rounded-md text-foreground/80 hover:text-primary transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-medium"
              title="Linked list template"
            >
              🔗 Linked List
            </button>
            <button
              type="button"
              onClick={() => handleInsert("graph")}
              className="h-7 px-2.5 text-[11px] bg-background/40 hover:bg-primary/10 border border-border/30 rounded-md text-foreground/80 hover:text-primary transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-medium"
              title="Graph template"
            >
              📊 Graph
            </button>
          </div>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full border-border/60 bg-background/50 text-sm leading-relaxed p-3 ${minHeightClass} rounded-t-none border-t-0 focus-visible:ring-0 focus-visible:ring-offset-0`}
          />
        </div>
      ) : (
        <div
          className={`w-full rounded-lg border border-border/60 bg-background/30 p-4 overflow-y-auto ${minHeightClass}`}
        >
          {value.trim() ? (
            <MarkdownRenderer content={value} preserveBreaks={preserveBreaks} />
          ) : (
            <p className="text-sm italic text-muted-foreground">Nothing to preview...</p>
          )}
        </div>
      )}
    </div>
  );
}

