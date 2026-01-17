import { cn } from "@/lib/utils";
import { Lightbulb, Microscope } from "lucide-react";

interface ModeToggleProps {
  mode: "basic" | "expert";
  onChange: (mode: "basic" | "expert") => void;
  className?: string;
}

export function ModeToggle({ mode, onChange, className }: ModeToggleProps) {
  return (
    <div className={cn("flex gap-1 p-1 bg-muted rounded-lg", className)}>
      <button
        type="button"
        onClick={() => onChange("basic")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-caption font-medium transition-all duration-150",
          mode === "basic" 
            ? "bg-background text-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Lightbulb className="h-4 w-4" />
        Basic
      </button>
      <button
        type="button"
        onClick={() => onChange("expert")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-caption font-medium transition-all duration-150",
          mode === "expert" 
            ? "bg-background text-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Microscope className="h-4 w-4" />
        Expert
      </button>
    </div>
  );
}
