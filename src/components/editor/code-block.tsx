import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyButton } from "./copy-button";

interface CodeBlockProps {
  language: string;
  value: string;
}

function cleanCodeValue(value: string): string {
  if (!value) return "";
  // Trim leading newlines but preserve spaces of the first line
  // Trim trailing whitespace entirely
  return value.replace(/^\n+/, "").replace(/\s+$/, "");
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  // Normalize language for display and highlighting
  const displayLanguage = language ? language.toLowerCase() : "text";
  const isPlain = displayLanguage === "text" || displayLanguage === "plaintext";

  const cleanedValue = cleanCodeValue(value);

  if (isPlain) {
    return (
      <div className="relative my-4 overflow-hidden rounded-xl border border-border/30 bg-muted/10 px-4 py-3 font-mono text-sm leading-relaxed text-foreground/90 shadow-sm group">
        <CopyButton
          text={cleanedValue}
          className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <pre className="whitespace-pre-wrap font-mono text-[13px]">{cleanedValue}</pre>
      </div>
    );
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-xl border border-border/40 bg-card/65 text-foreground shadow-ds-md">
      {/* Header bar with window control dots, language, and copy button */}
      <div className="flex items-center justify-between bg-black/40 px-4 py-2 text-xs text-muted-foreground/80 border-b border-border/20">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="size-2.5 rounded-full bg-destructive/60 border border-destructive/25" />
          <span className="size-2.5 rounded-full bg-warning/60 border border-warning/25" />
          <span className="size-2.5 rounded-full bg-success/60 border border-success/25" />
          <span className="ml-2 font-mono text-[10px] uppercase font-bold tracking-wider text-primary-glow">
            {displayLanguage}
          </span>
        </div>
        <CopyButton
          text={cleanedValue}
          className="opacity-60 group-hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Code Container */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <SyntaxHighlighter
          language={displayLanguage}
          style={vscDarkPlus}
          showLineNumbers={true}
          customStyle={{
            margin: 0,
            background: "transparent",
            padding: "1rem 0.5rem",
            fontSize: "0.825rem",
            lineHeight: "1.6",
          }}
          codeTagProps={{
            style: {
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: "inherit",
            },
          }}
        >
          {cleanedValue}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

