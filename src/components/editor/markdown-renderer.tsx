import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "./code-block";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  preserveBreaks?: boolean;
}

export function autoWrapAsciiDiagrams(content: string): string {
  if (!content) return "";

  const lines = content.split("\n");
  const processedLines: string[] = [];
  let inCodeBlock = false;
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Track fenced code blocks to avoid wrapping diagrams inside them
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      processedLines.push(line);
      i++;
      continue;
    }
    
    if (inCodeBlock) {
      processedLines.push(line);
      i++;
      continue;
    }
    
    // Check if the current line starts a diagram range
    if (isPotentialDiagramLine(line) && !isEmptyOrWhitespace(line)) {
      // Look ahead to find the end of this diagram range
      const rangeLines: string[] = [line];
      let j = i + 1;
      let hasStrongIndicator = hasStrongDiagramIndicator(line);
      let hasTableSep = isTableSeparatorLine(line);
      
      while (j < lines.length) {
        const nextLine = lines[j];
        if (nextLine.trim().startsWith("```")) {
          break; // code block start terminates diagram detection
        }
        
        const isContinuing = isPotentialDiagramLine(nextLine) || 
                             nextLine.startsWith(" ") || 
                             /^\s*\w+\s*$/.test(nextLine);
                             
        if (isContinuing && nextLine.trim() !== "") {
          rangeLines.push(nextLine);
          if (hasStrongDiagramIndicator(nextLine)) {
            hasStrongIndicator = true;
          }
          if (isTableSeparatorLine(nextLine)) {
            hasTableSep = true;
          }
          j++;
        } else if (isEmptyOrWhitespace(nextLine)) {
          // An empty line can be inside a diagram if the line AFTER it is also part of the diagram
          if (j + 1 < lines.length && 
              (isPotentialDiagramLine(lines[j + 1]) || lines[j + 1].startsWith(" ")) && 
              !isEmptyOrWhitespace(lines[j + 1])) {
            rangeLines.push(nextLine);
            j++;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      
      // Trim empty lines from the end of the range
      while (rangeLines.length > 0 && isEmptyOrWhitespace(rangeLines[rangeLines.length - 1])) {
        rangeLines.pop();
        j--;
      }
      
      // If we have at least 2 lines, at least one strong indicator, and NO table separator
      if (rangeLines.length >= 2 && hasStrongIndicator && !hasTableSep) {
        processedLines.push("```text");
        processedLines.push(...rangeLines);
        processedLines.push("```");
        i = j;
        continue;
      }
    }
    
    processedLines.push(line);
    i++;
  }
  
  return processedLines.join("\n");
}

function isEmptyOrWhitespace(line: string): boolean {
  return line.trim() === "";
}

function isTableSeparatorLine(line: string): boolean {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|?\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
}

function isPotentialDiagramLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed === "") return true; // neutral
  
  // Exclude standard Markdown syntax that we want processed normally
  if (trimmed.startsWith("#")) return false; // headings
  if (trimmed.startsWith("-") && !trimmed.startsWith("-->")) return false; // lists
  if (trimmed.startsWith("*")) return false; // lists or bold/italic
  if (trimmed.startsWith("+")) return false; // lists
  if (/^\d+\.\s+/.test(trimmed)) return false; // ordered lists
  if (trimmed.startsWith(">")) return false; // blockquotes
  if (trimmed.startsWith("<!--")) return false; // comments
  
  // Check for diagram patterns
  const hasSlashes = /[\/\\]/.test(trimmed);
  const hasPipe = /\|/.test(trimmed);
  const hasArrow = /->|<-|=>|<=|-->|<--/.test(trimmed);
  const hasTreeNodes = /\b\w+\b\s{2,}\b\w+\b/.test(trimmed); // values separated by multiple spaces (e.g. 8   10)
  
  // Lines starting with significant spaces (>= 3 spaces) and are relatively short
  const isSparseIndented = line.startsWith("   ") && trimmed.length < 35;
  
  return hasSlashes || hasPipe || hasArrow || hasTreeNodes || isSparseIndented;
}

function hasStrongDiagramIndicator(line: string): boolean {
  const trimmed = line.trim();
  
  // Slashes, pipes, arrows are strong indicators of a diagram
  const hasSlashes = /[\/\\]/.test(trimmed);
  const hasPipe = /\|/.test(trimmed);
  const hasArrow = /->|<-|=>|<=|-->|<--/.test(trimmed);
  
  return hasSlashes || hasPipe || hasArrow;
}

export function MarkdownRenderer({
  content,
  className = "",
  preserveBreaks = true,
}: MarkdownRendererProps) {
  const processedContent = useMemo(() => {
    return autoWrapAsciiDiagrams(content);
  }, [content]);

  return (
    <div
      className={`prose prose-invert max-w-none text-foreground/90 text-sm leading-relaxed ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Custom concept highlight tag
          concept: ({ children }) => (
            <span className="inline-flex items-center gap-1 bg-primary/20 text-primary-glow border border-primary/30 px-2 py-0.5 rounded-full font-semibold text-xs my-0.5 shadow-sm">
              💡 {children}
            </span>
          ),

          // Code blocks
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : "";
            const isInline = !match && !String(children).includes("\n");

            if (!isInline) {
              const codeVal = String(children).replace(/\n$/, "");
              
              if (lang === "input") {
                return (
                  <div className="relative my-4 overflow-hidden rounded-xl border border-border/30 bg-muted/15 font-mono text-sm leading-relaxed text-foreground shadow-sm max-w-xl">
                    <div className="bg-muted/30 px-4 py-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase border-b border-border/10 flex items-center gap-1.5">
                      <span>📥 Input</span>
                    </div>
                    <pre className="p-4 whitespace-pre font-mono text-[13px] overflow-x-auto text-foreground/90">{codeVal}</pre>
                  </div>
                );
              }
              
              if (lang === "output") {
                return (
                  <div className="relative my-4 overflow-hidden rounded-xl border border-border/30 bg-muted/15 font-mono text-sm leading-relaxed text-foreground shadow-sm max-w-xl">
                    <div className="bg-muted/30 px-4 py-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase border-b border-border/10 flex items-center gap-1.5">
                      <span>📤 Output</span>
                    </div>
                    <pre className="p-4 whitespace-pre font-mono text-[13px] overflow-x-auto text-foreground/90">{codeVal}</pre>
                  </div>
                );
              }
              
              if (lang === "complexity") {
                const lines = codeVal.split("\n");
                return (
                  <div className="relative my-4 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm max-w-md">
                    <div className="flex items-center gap-2 mb-3 pb-1.5 border-b border-primary/10">
                      <span className="text-primary font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span>⚡ Complexity</span>
                      </span>
                    </div>
                    <div className="space-y-2">
                      {lines.map((line, idx) => {
                        const parts = line.split(":");
                        if (parts.length >= 2) {
                          return (
                            <div key={idx} className="flex justify-between text-sm py-0.5">
                              <span className="text-muted-foreground font-medium">{parts[0].trim()}</span>
                              <span className="text-primary-glow font-mono font-semibold">{parts.slice(1).join(":").trim()}</span>
                            </div>
                          );
                        }
                        return <div key={idx} className="text-sm text-foreground/80 font-mono">{line}</div>;
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <CodeBlock
                  language={lang || "text"}
                  value={codeVal}
                />
              );
            }

            return (
              <code
                className="relative rounded bg-muted/50 px-[0.3rem] py-[0.15rem] font-mono text-xs font-semibold border border-border/40 text-primary-glow"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold tracking-tight text-foreground mt-6 mb-3 border-b border-border/20 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold tracking-tight text-foreground mt-5 mb-2.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold tracking-tight text-foreground mt-4 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold tracking-tight text-foreground mt-4 mb-2">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-xs font-semibold tracking-tight text-foreground mt-3 mb-1">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-semibold tracking-tight text-muted-foreground mt-3 mb-1">
              {children}
            </h6>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-3 space-y-1 text-foreground/80">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-3 space-y-1 text-foreground/80">{children}</ol>
          ),
          li: ({ children }) => (
            <li className={`text-sm text-foreground/80 leading-relaxed ${preserveBreaks ? "whitespace-pre-wrap" : ""}`}>
              {children}
            </li>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 border-primary bg-primary/10 pl-4 py-2.5 pr-2 my-4 italic text-muted-foreground/90 rounded-r-lg ${preserveBreaks ? "whitespace-pre-wrap" : ""}`}>
              {children}
            </blockquote>
          ),

          // Tables
          table: ({ children }) => (
            <div className="my-5 w-full overflow-x-auto rounded-xl border border-border/40 bg-card/25">
              <table className="w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/40 border-b border-border/30 font-semibold text-foreground">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody className="divide-y divide-border/20">{children}</tbody>,
          tr: ({ children }) => (
            <tr className="hover:bg-accent/10 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-xs uppercase tracking-wider font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className={`px-4 py-3 text-sm text-muted-foreground/90 ${preserveBreaks ? "whitespace-pre-wrap" : ""}`}>
              {children}
            </td>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:text-primary-glow font-medium underline transition-colors cursor-pointer"
            >
              {children}
            </a>
          ),

          // Paragraphs & general tags
          p: ({ children }) => (
            <p className={`mb-3 last:mb-0 leading-relaxed ${preserveBreaks ? "whitespace-pre-wrap" : ""}`}>
              {children}
            </p>
          ),
          hr: () => <hr className="my-5 border-t border-border/45" />,
        }}
      >
        {processedContent || "—"}
      </ReactMarkdown>
    </div>
  );
}

