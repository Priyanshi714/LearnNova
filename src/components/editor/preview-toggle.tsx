import { Eye, Pencil } from "lucide-react";

interface PreviewToggleProps {
  mode: "edit" | "preview";
  onChange: (mode: "edit" | "preview") => void;
  className?: string;
}

export function PreviewToggle({ mode, onChange, className = "" }: PreviewToggleProps) {
  return (
    <div
      className={`inline-flex rounded-lg border border-border/60 bg-background/50 p-0.5 ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange("edit")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
          mode === "edit"
            ? "bg-primary text-primary-foreground shadow"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
      <button
        type="button"
        onClick={() => onChange("preview")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
          mode === "preview"
            ? "bg-primary text-primary-foreground shadow"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Eye className="h-3.5 w-3.5" />
        Preview
      </button>
    </div>
  );
}
