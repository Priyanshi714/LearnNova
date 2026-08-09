import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Loader2,
  HelpCircle,
  FileCode2,
  Lightbulb,
  GitBranch,
  BookOpen,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { searchLocalIndex, SearchResult } from "@/lib/search-util";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface UniversalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchData {
  problems: any[];
  solutions: any[];
  notes: any[];
  related: any[];
  journals: any[];
  revisions: any[];
}

export function UniversalSearch({ isOpen, onClose }: UniversalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setLoading(true);
      const fetchData = async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;

          // Fetch all knowledge-base items in parallel
          const [problemsRes, solutionsRes, notesRes, relatedRes, journalsRes, revisionsRes] =
            await Promise.all([
              supabase.from("problems").select("*").eq("user_id", user.id),
              supabase.from("solutions").select("*").eq("user_id", user.id),
              supabase.from("problem_notes").select("*").eq("user_id", user.id),
              supabase.from("related_problems").select("*").eq("user_id", user.id),
              supabase.from("journals").select("*").eq("user_id", user.id),
              supabase.from("revisions").select("*").eq("user_id", user.id),
            ]);

          setData({
            problems: problemsRes.data || [],
            solutions: solutionsRes.data || [],
            notes: notesRes.data || [],
            related: relatedRes.data || [],
            journals: journalsRes.data || [],
            revisions: revisionsRes.data || [],
          });
        } catch (err) {
          console.error("Failed to load search data:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim() || !data) return [];
    return searchLocalIndex(query, data);
  }, [query, data]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {
      Problems: [],
      Solutions: [],
      "Extra Notes": [],
      "Related Problems": [],
      Journal: [],
      "Revision History": [],
    };
    results.forEach((r) => {
      if (groups[r.category]) {
        groups[r.category].push(r);
      }
    });
    return groups;
  }, [results]);

  const handleSelect = (item: SearchResult) => {
    onClose();
    navigate({
      to: "/problems/$id",
      params: { id: item.problemId },
      search: { tab: item.tab, itemId: item.id } as any,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Problems":
        return <HelpCircle className="h-4 w-4 text-purple-400 shrink-0" />;
      case "Solutions":
        return <FileCode2 className="h-4 w-4 text-emerald-400 shrink-0" />;
      case "Extra Notes":
        return <Lightbulb className="h-4 w-4 text-yellow-400 shrink-0" />;
      case "Related Problems":
        return <GitBranch className="h-4 w-4 text-blue-400 shrink-0" />;
      case "Journal":
        return <BookOpen className="h-4 w-4 text-pink-400 shrink-0" />;
      case "Revision History":
        return <Clock className="h-4 w-4 text-indigo-400 shrink-0" />;
      default:
        return <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 border-border/60 bg-card/95 backdrop-blur-xl shadow-glow">
        <Command shouldFilter={false} className="bg-transparent border-0">
          <div className="flex items-center border-b border-border/30 px-3 py-1">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search problems, solutions, notes, journals..."
              value={query}
              onValueChange={setQuery}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Indexing knowledge base...</span>
            </div>
          ) : query.trim() === "" ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-foreground">Universal Search</p>
              <p className="text-xs text-muted-foreground max-w-xs mt-1">
                Search across problems, solutions, extra notes, related questions, journals, and
                revisions.
              </p>
              <div className="mt-4 flex items-center gap-3 text-[10px] text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-full border border-border/20">
                <span>
                  Use{" "}
                  <kbd className="font-mono bg-background px-1 py-0.5 rounded border border-border/40 text-[9px]">
                    ↑↓
                  </kbd>{" "}
                  to navigate
                </span>
                <span>·</span>
                <span>
                  <kbd className="font-mono bg-background px-1 py-0.5 rounded border border-border/40 text-[9px]">
                    Enter
                  </kbd>{" "}
                  to select
                </span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <CommandEmpty className="py-12 text-center text-sm text-muted-foreground">
              No matching results found.
            </CommandEmpty>
          ) : (
            <CommandList className="max-h-[380px] overflow-y-auto px-2 py-3 border-t border-border/20">
              {Object.entries(groupedResults).map(([category, items]) => {
                if (items.length === 0) return null;
                return (
                  <CommandGroup
                    key={category}
                    heading={category}
                    className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground/60 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:px-2"
                  >
                    {items.map((item) => (
                      <CommandItem
                        key={`${item.category}-${item.id}`}
                        onSelect={() => handleSelect(item)}
                        className="flex items-center gap-3 px-2 py-2 rounded-md data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground transition-colors duration-150 cursor-pointer"
                      >
                        {getCategoryIcon(item.category)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-medium text-foreground text-sm truncate">
                              {item.title}
                            </span>
                            {item.category !== "Problems" && (
                              <span className="text-[10px] text-muted-foreground/75 truncate italic shrink-0 max-w-[200px]">
                                in {item.problemTitle}
                              </span>
                            )}
                          </div>
                          {item.snippet && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5 leading-normal">
                              {item.snippet}
                            </p>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </CommandList>
          )}
        </Command>
      </DialogContent>
    </Dialog>
  );
}
