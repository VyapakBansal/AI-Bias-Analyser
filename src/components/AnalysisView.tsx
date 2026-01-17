import { useState, useEffect } from "react";
import { CredibilityScore } from "./CredibilityScore";
import { ClaimCard } from "./ClaimCard";
import { BiasHighlight } from "./BiasHighlight";
import { ArticleCard } from "./ArticleCard";
import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Loader2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisResult, ArticleData, analyzeArticle } from "@/lib/api/analysis";
import { saveAnalyzedArticle, recordPublisherTrend, getPublisherArticles, Article } from "@/lib/api/publishers";
import { useToast } from "@/components/ui/use-toast";

interface AnalysisViewProps {
  article: ArticleData;
  initialAnalysis: AnalysisResult;
  onBack: () => void;
  className?: string;
}

export function AnalysisView({ article, initialAnalysis, onBack, className }: AnalysisViewProps) {
  const [mode, setMode] = useState<"basic" | "expert">("basic");
  const [analysis, setAnalysis] = useState<AnalysisResult>(initialAnalysis);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const { toast } = useToast();

  // Save article and record trend on mount
  useEffect(() => {
    const saveAndTrack = async () => {
      const saved = await saveAnalyzedArticle({
        url: article.url,
        title: article.title,
        publisher: article.publisher,
        content: article.content,
        credibility_score: analysis.credibilityScore,
        analysis_data: analysis as unknown as Record<string, unknown>,
      });

      if (saved) {
        // Record publisher trend
        const biasSummary = {
          totalBiases: analysis.biases.length,
          biasTypes: analysis.biases.map(b => b.biasType),
        };
        await recordPublisherTrend(article.publisher, saved.id, analysis.credibilityScore, biasSummary);
      }

      // Fetch related articles from same publisher
      const related = await getPublisherArticles(article.publisher);
      setRelatedArticles(related.slice(0, 5));
    };

    saveAndTrack();
  }, [article, analysis]);

  const handleModeChange = async (newMode: "basic" | "expert") => {
    if (newMode === mode) return;
    
    setMode(newMode);
    
    if (newMode === "expert" && mode === "basic") {
      // Re-run analysis in expert mode
      setIsReanalyzing(true);
      try {
        const result = await analyzeArticle(article.content, article.title, article.publisher, "expert");
        if (result.success && result.data) {
          setAnalysis(result.data);
        } else {
          toast({
            title: "Analysis failed",
            description: result.error || "Could not re-analyze in expert mode",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Expert mode analysis failed:", error);
      } finally {
        setIsReanalyzing(false);
      }
    }
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Top bar */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container px-4 md:px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            New Analysis
          </Button>
          
          <div className="flex items-center gap-3">
            <ModeToggle mode={mode} onChange={handleModeChange} />
            {isReanalyzing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container px-4 md:px-6 py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Article header */}
            <header className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-small font-medium text-muted-foreground uppercase tracking-wide">
                  {article.publisher}
                </span>
              </div>
              <h1 className="text-headline text-foreground">
                {article.title}
              </h1>
              {article.url && (
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-caption text-primary hover:underline"
                >
                  View original article →
                </a>
              )}
            </header>

            {/* Summary */}
            {analysis.summary && (
              <div className="p-4 rounded-lg bg-accent border border-border animate-fade-in">
                <p className="text-body text-foreground">{analysis.summary}</p>
              </div>
            )}

            {/* Credibility score card */}
            <div className="p-6 rounded-xl bg-card border border-border animate-slide-up">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-title text-foreground mb-1">Credibility Score</h2>
                  <p className="text-caption text-muted-foreground mb-4">
                    Based on factual accuracy, source reliability, and bias analysis
                  </p>
                  <CredibilityScore score={analysis.credibilityScore} size="lg" />
                </div>
                
                {analysis.scoreBreakdown && (
                  <div className="grid grid-cols-2 gap-4 text-caption">
                    <div>
                      <span className="text-muted-foreground">Factual Accuracy</span>
                      <p className="font-medium">{analysis.scoreBreakdown.factualAccuracy}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Source Reliability</span>
                      <p className="font-medium">{analysis.scoreBreakdown.sourceReliability}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bias Level</span>
                      <p className="font-medium">{analysis.scoreBreakdown.biasLevel}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Argument Balance</span>
                      <p className="font-medium">{analysis.scoreBreakdown.argumentBalance}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Factual Claims */}
            {analysis.claims.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-title text-foreground">Factual Claims ({analysis.claims.length})</h2>
                <p className="text-caption text-muted-foreground -mt-2">
                  {mode === "basic" 
                    ? "Key claims identified and verified against reliable sources"
                    : "Detailed verification with source analysis and confidence intervals"
                  }
                </p>
                <div className="space-y-3">
                  {analysis.claims.map((claim, i) => (
                    <ClaimCard 
                      key={i} 
                      claim={claim.claim}
                      status={claim.status}
                      explanation={claim.explanation}
                      confidence={claim.confidence}
                      className={`stagger-${Math.min(i + 1, 5)}`}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Bias Detection */}
            {analysis.biases.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-title text-foreground">Bias Detection ({analysis.biases.length})</h2>
                <p className="text-caption text-muted-foreground -mt-2">
                  {mode === "basic"
                    ? "Language and framing that may indicate bias"
                    : "Comprehensive linguistic and contextual bias analysis with cultural considerations"
                  }
                </p>
                <div className="space-y-3">
                  {analysis.biases.map((bias, i) => (
                    <BiasHighlight 
                      key={i} 
                      text={bias.text}
                      biasType={bias.biasType}
                      whyBiased={bias.whyBiased}
                      whyNotBiased={bias.whyNotBiased}
                      severity={bias.severity}
                      confidence={bias.confidence}
                      className={`stagger-${Math.min(i + 1, 5)}`}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Argument Analysis - Expert mode */}
            {mode === "expert" && analysis.arguments && (
              <section className="space-y-4 animate-fade-in">
                <h2 className="text-title text-foreground">Argument Analysis</h2>
                
                {analysis.arguments.thesis && (
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="text-caption font-medium text-foreground mb-2">Main Thesis</h3>
                    <p className="text-body text-muted-foreground">{analysis.arguments.thesis}</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="text-caption font-medium text-claim-verified mb-2">Supporting Arguments</h3>
                    <ul className="space-y-2 text-caption text-muted-foreground">
                      {analysis.arguments.supporting.map((arg, i) => (
                        <li key={i}>• {arg}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="text-caption font-medium text-claim-false mb-2">Opposing Arguments</h3>
                    <ul className="space-y-2 text-caption text-muted-foreground">
                      {analysis.arguments.opposing.map((arg, i) => (
                        <li key={i}>• {arg}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-36">
              {relatedArticles.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h2 className="text-title text-foreground">Publisher History</h2>
                  </div>
                  <p className="text-caption text-muted-foreground mb-4">
                    Previous analyses from {article.publisher}
                  </p>
                  <div className="space-y-4">
                    {relatedArticles.map((related, i) => (
                      <ArticleCard 
                        key={related.id} 
                        headline={related.title}
                        publisher={related.publisher}
                        summary={`Analyzed ${new Date(related.analyzed_at || related.created_at).toLocaleDateString()}`}
                        credibilityScore={related.credibility_score || 0}
                        className={`stagger-${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-6 rounded-xl bg-muted/50 border border-border text-center">
                  <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-title text-foreground mb-1">First Analysis</h3>
                  <p className="text-caption text-muted-foreground">
                    This is the first article analyzed from {article.publisher}. 
                    Analyze more to build trend data.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
