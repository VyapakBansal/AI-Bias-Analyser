import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTrackedPublishers, getPublisherTrends, TrackedPublisher, PublisherTrend } from "@/lib/api/publishers";
import { CredibilityScore } from "./CredibilityScore";

interface PublisherTrendsProps {
  onBack: () => void;
  className?: string;
}

export function PublisherTrends({ onBack, className }: PublisherTrendsProps) {
  const [publishers, setPublishers] = useState<TrackedPublisher[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<TrackedPublisher | null>(null);
  const [trends, setTrends] = useState<PublisherTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPublishers = async () => {
      setIsLoading(true);
      const data = await getTrackedPublishers();
      setPublishers(data);
      setIsLoading(false);
    };
    loadPublishers();
  }, []);

  useEffect(() => {
    const loadTrends = async () => {
      if (selectedPublisher) {
        const data = await getPublisherTrends(selectedPublisher.id);
        setTrends(data);
      }
    };
    loadTrends();
  }, [selectedPublisher]);

  const getTrendIcon = (publisher: TrackedPublisher) => {
    if (publisher.total_articles_analyzed < 2) return Minus;
    // In a real app, we'd calculate trend from historical data
    return publisher.avg_credibility_score && publisher.avg_credibility_score > 60 
      ? TrendingUp 
      : TrendingDown;
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container px-4 md:px-6 py-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Analysis
          </Button>
        </div>
      </div>

      <main className="container px-4 md:px-6 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-headline text-foreground">Publisher Trends</h1>
            </div>
            <p className="text-body text-muted-foreground">
              Track credibility patterns across publishers over time
            </p>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse text-muted-foreground">Loading publishers...</div>
            </div>
          ) : publishers.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-title text-foreground mb-2">No publishers tracked yet</h2>
              <p className="text-body text-muted-foreground max-w-md mx-auto">
                Analyze articles to start tracking publisher credibility trends. 
                Each analysis contributes to the publisher's trend data.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {publishers.map((publisher, i) => {
                const TrendIcon = getTrendIcon(publisher);
                return (
                  <button
                    key={publisher.id}
                    onClick={() => setSelectedPublisher(
                      selectedPublisher?.id === publisher.id ? null : publisher
                    )}
                    className={cn(
                      "w-full p-5 rounded-xl border text-left transition-all duration-200 animate-slide-up",
                      selectedPublisher?.id === publisher.id 
                        ? "border-primary bg-accent" 
                        : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-title text-foreground">{publisher.name}</h3>
                          <TrendIcon className={cn(
                            "h-4 w-4",
                            TrendIcon === TrendingUp ? "text-claim-verified" :
                            TrendIcon === TrendingDown ? "text-claim-false" :
                            "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex items-center gap-4 text-caption text-muted-foreground">
                          <span>{publisher.total_articles_analyzed} articles analyzed</span>
                          {publisher.last_analyzed_at && (
                            <span>Last: {new Date(publisher.last_analyzed_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      {publisher.avg_credibility_score !== null && (
                        <CredibilityScore 
                          score={Math.round(publisher.avg_credibility_score)} 
                          size="sm" 
                          showLabel={false} 
                        />
                      )}
                    </div>

                    {/* Expanded trend view */}
                    {selectedPublisher?.id === publisher.id && trends.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-border animate-fade-in">
                        <h4 className="text-caption font-medium text-foreground mb-4">
                          Credibility Over Time
                        </h4>
                        <div className="flex items-end gap-1 h-24">
                          {trends.map((trend, idx) => (
                            <div
                              key={trend.id}
                              className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/30"
                              style={{ 
                                height: `${trend.credibility_score}%`,
                                maxWidth: "40px"
                              }}
                              title={`Score: ${trend.credibility_score} - ${new Date(trend.recorded_at).toLocaleDateString()}`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-small text-muted-foreground mt-2">
                          <span>Oldest</span>
                          <span>Most Recent</span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
