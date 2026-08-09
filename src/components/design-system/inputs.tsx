import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

export { Checkbox, Switch };

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const TextInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, iconLeft, iconRight, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {iconLeft && (
          <div className="absolute left-3 flex items-center justify-center text-muted-foreground pointer-events-none size-4">
            {iconLeft}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-lg border border-border bg-card/65 px-3 py-2 text-sm shadow-inner transition-all duration-200 placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-40",
            iconLeft ? "pl-9" : "",
            iconRight ? "pr-9" : "",
            error
              ? "border-destructive/60 focus-visible:ring-destructive focus-visible:border-destructive"
              : "",
            className,
          )}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 flex items-center justify-center text-muted-foreground size-4">
            {iconRight}
          </div>
        )}
      </div>
    );
  },
);
TextInput.displayName = "TextInput";

export interface SearchInputProps extends Omit<InputProps, "iconLeft" | "iconRight"> {
  onClear?: () => void;
  value?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, value, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        type="text"
        iconLeft={<Search className="size-4 text-muted-foreground/80" />}
        iconRight={
          value && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="hover:text-foreground transition-colors p-0.5 rounded-full hover:bg-accent/40"
            >
              <X className="size-3" />
            </button>
          ) : undefined
        }
        className={className}
        value={value}
        {...props}
      />
    );
  },
);
SearchInput.displayName = "SearchInput";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-border bg-card/65 px-3 py-2 text-sm shadow-inner transition-all duration-200 placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-40",
          error
            ? "border-destructive/60 focus-visible:ring-destructive focus-visible:border-destructive"
            : "",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-lg border border-border bg-card/65 px-3 py-2 text-sm shadow-inner transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-40 appearance-none pr-8 cursor-pointer text-foreground",
            error ? "border-destructive/60 focus-visible:ring-destructive" : "",
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-card text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground/80">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  },
);
Select.displayName = "Select";

interface SearchBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  shortcut?: string;
}

export function SearchBox({
  placeholder = "Search everything...",
  value,
  onChange,
  onClear,
  shortcut = "⌘K",
  className,
  ...props
}: SearchBoxProps) {
  return (
    <div
      className={cn(
        "relative flex items-center w-full rounded-xl border border-border bg-card/45 shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background transition-all duration-200",
        className,
      )}
      {...props}
    >
      <Search className="size-4 text-muted-foreground ml-3 shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 border-none outline-none focus:outline-none focus:ring-0 focus:border-none min-w-0"
      />
      {value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="hover:text-foreground transition-colors p-1 rounded-full hover:bg-accent/40 mr-2 shrink-0"
        >
          <X className="size-4" />
        </button>
      ) : (
        shortcut && (
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 mr-2 shrink-0">
            {shortcut}
          </kbd>
        )
      )}
    </div>
  );
}
