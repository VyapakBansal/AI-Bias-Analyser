import { cn } from "@/lib/utils";

interface CredibilityScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function CredibilityScore({ 
  score, 
  size = "md", 
  showLabel = true,
  className 
}: CredibilityScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-credibility-high";
    if (score >= 40) return "text-credibility-medium";
    return "text-credibility-low";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Highly Credible";
    if (score >= 60) return "Generally Reliable";
    if (score >= 40) return "Mixed Reliability";
    if (score >= 20) return "Low Credibility";
    return "Unreliable";
  };

  const sizeClasses = {
    sm: "text-xl",
    md: "text-4xl",
    lg: "text-display",
  };

  const progressSize = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2",
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline gap-2">
        <span className={cn("font-semibold tabular-nums", sizeClasses[size], getScoreColor(score))}>
          {score}
        </span>
        <span className="text-caption text-muted-foreground">/100</span>
      </div>
      
      {/* Progress bar */}
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", progressSize[size])}>
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            score >= 70 ? "bg-credibility-high" : score >= 40 ? "bg-credibility-medium" : "bg-credibility-low"
          )}
          style={{ width: `${score}%` }}
        />
      </div>

      {showLabel && (
        <span className="text-caption text-muted-foreground">
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
