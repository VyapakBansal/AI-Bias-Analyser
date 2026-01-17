import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, XCircle, HelpCircle, Clock } from "lucide-react";

type ClaimStatus = "verified" | "partial" | "false" | "unverified" | "outdated";

interface ClaimCardProps {
  claim: string;
  status: ClaimStatus;
  explanation: string;
  sources?: string[];
  confidence: number;
  className?: string;
}

const statusConfig = {
  verified: {
    icon: CheckCircle,
    label: "Verified",
    colorClass: "text-claim-verified",
    bgClass: "bg-claim-verified/10",
  },
  partial: {
    icon: AlertCircle,
    label: "Partially Verified",
    colorClass: "text-claim-partial",
    bgClass: "bg-claim-partial/10",
  },
  false: {
    icon: XCircle,
    label: "False",
    colorClass: "text-claim-false",
    bgClass: "bg-claim-false/10",
  },
  unverified: {
    icon: HelpCircle,
    label: "Unverified",
    colorClass: "text-claim-unverified",
    bgClass: "bg-muted",
  },
  outdated: {
    icon: Clock,
    label: "Outdated",
    colorClass: "text-claim-partial",
    bgClass: "bg-claim-partial/10",
  },
};

export function ClaimCard({ 
  claim, 
  status, 
  explanation, 
  sources = [], 
  confidence,
  className 
}: ClaimCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      "rounded-lg border border-border bg-card p-4 animate-fade-in transition-all duration-200 hover:shadow-sm",
      className
    )}>
      <div className="flex gap-3">
        <div className={cn("mt-0.5 rounded-full p-1", config.bgClass)}>
          <Icon className={cn("h-4 w-4", config.colorClass)} />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <p className="text-body font-medium leading-snug">{claim}</p>
            <span className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-small font-medium",
              config.bgClass, config.colorClass
            )}>
              {config.label}
            </span>
          </div>
          
          <p className="text-caption text-muted-foreground leading-relaxed">
            {explanation}
          </p>

          {sources.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {sources.map((source, i) => (
                <a 
                  key={i}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-small text-primary hover:underline underline-offset-2"
                >
                  Source {i + 1}
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
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
      </div>
    </div>
  );
}
