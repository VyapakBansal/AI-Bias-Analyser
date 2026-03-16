import { cn } from "@/lib/utils";
import { CredibilityScore } from "./CredibilityScore";

interface ArticleCardProps {
  headline: string;
  publisher: string;
  summary: string;
  credibilityScore: number;
  framingLabel?: string;
  className?: string;
} // what is the purpose of having multiple interface? We should be implementing a reducer callback function instead so that we can call all the state variables at the same time rather than just going through multiple instances of the same code again adn again
// I also feel like we should be implementing a

export function ArticleCard({
  headline,
  publisher,
  summary,
  credibilityScore,
  framingLabel,
  className,
}: ArticleCardProps) {
  return (
    <article
      className={cn(
        "group rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer animate-slide-up",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-small font-medium text-muted-foreground uppercase tracking-wide">
            {publisher}
          </span>
          {framingLabel && (
            <span className="px-2 py-0.5 rounded-full bg-accent text-small text-accent-foreground">
              {framingLabel}
            </span>
          )}
        </div>
        <div className="shrink-0">
          <CredibilityScore
            score={credibilityScore}
            size="sm"
            showLabel={false}
          />
        </div>
      </div>

      <h3 className="text-title text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {headline}
      </h3>

      <p className="text-caption text-muted-foreground line-clamp-2">
        {summary}
      </p>
    </article>
  );
}
