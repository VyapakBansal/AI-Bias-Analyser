import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type BiasType = "framing" | "language" | "omission" | "cultural" | "political" | "gender" | "racial" | "socioeconomic";

interface BiasHighlightProps {
  text: string;
  biasType: BiasType;
  whyBiased: string;
  whyNotBiased: string;
  severity: "low" | "medium" | "high";
  confidence: number;
  className?: string;
}

const biasLabels: Record<BiasType, string> = {
  framing: "Framing Bias",
  language: "Language Bias",
  omission: "Omission Bias",
  cultural: "Cultural Bias",
  political: "Political Bias",
  gender: "Gender Bias",
  racial: "Racial Bias",
  socioeconomic: "Socioeconomic Bias",
};

export function BiasHighlight({ 
  text, 
  biasType, 
  whyBiased, 
  whyNotBiased, 
  severity,
  confidence,
  className 
}: BiasHighlightProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityColors = {
    low: "border-l-claim-unverified",
    medium: "border-l-claim-partial",
    high: "border-l-claim-false",
  };

  return (
    <div className={cn(
      "rounded-lg border border-border bg-card overflow-hidden animate-fade-in",
      className
    )}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-highlight-bias text-small font-medium text-foreground">
                {biasLabels[biasType]}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-small font-medium",
                severity === "high" ? "bg-claim-false/10 text-claim-false" :
                severity === "medium" ? "bg-claim-partial/10 text-claim-partial" :
                "bg-muted text-muted-foreground"
              )}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)} severity
              </span>
            </div>
            <p className="text-body font-medium text-foreground">"{text}"</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-border pt-4">
          <div className={cn("pl-4 border-l-2", severityColors[severity])}>
            <h4 className="text-caption font-medium text-claim-false mb-1">Why it may be biased</h4>
            <p className="text-caption text-muted-foreground">{whyBiased}</p>
          </div>
          
          <div className="pl-4 border-l-2 border-l-claim-verified">
            <h4 className="text-caption font-medium text-claim-verified mb-1">Why it may not be biased</h4>
            <p className="text-caption text-muted-foreground">{whyNotBiased}</p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-small text-muted-foreground">Confidence:</span>
            <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary/60 rounded-full"
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className="text-small text-muted-foreground">{confidence}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
