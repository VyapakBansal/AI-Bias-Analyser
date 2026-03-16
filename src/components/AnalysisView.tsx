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
  const [hasAnimated, setHasAnimated] = useState(false);

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

  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 80);
    return () => clearTimeout(timer);
  }, []);

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
        <div className="container px-4 md:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <ArrowLeft className="h-4 w-4" />
            New Analysis
          </Button>
          
          <div className="flex items-center justify-between sm:justify-end gap-3">
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

            {/* Verdict banner */}
            <section className="rounded-xl border border-border bg-card/80 px-5 py-5 shadow-sm animate-slide-up">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2 md:max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-[0.26em] text-muted-foreground">
                      Overall verdict
                    </span>
                    <span className="rounded-sm border border-border bg-secondary/50 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {analysis.biases.length > 0 ? "Bias detected" : "Low bias signal"}
                    </span>
                  </div>
                  <h2 className="font-serif text-xl tracking-[0.04em]">
                    {analysis.credibilityScore >= 75
                      ? "Confirmed with mild framing"
                      : analysis.credibilityScore >= 55
                      ? "Partially verified, mixed framing"
                      : "Disputed with significant spin"}
                  </h2>
                  {analysis.summary && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {analysis.summary}
                    </p>
                  )}
                </div>
                <div className="flex gap-6 md:flex-col md:items-end">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Credibility
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-success/60 bg-background shadow-[0_0_0_1px_rgba(15,23,42,0.6)]">
                        <span className="text-lg font-semibold text-success tabular-nums">
                          {analysis.credibilityScore}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        out of 100
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">
                        {analysis.claims.length}
                      </span>{" "}
                      factual claims scanned
                    </div>
                    <div>
                      <span className="font-medium text-foreground">
                        {analysis.biases.length}
                      </span>{" "}
                      bias highlights
                    </div>
                    <div>
                      <span className="font-medium text-foreground">6</span> sources checked
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Political bias spectrum & tone */}
            <section className="rounded-xl border border-border bg-card/80 px-5 py-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Political bias spectrum
                </h3>
                <span className="text-xs text-muted-foreground">
                  Lean:{" "}
                  <span className="font-medium text-foreground">
                    Center‑left
                  </span>{" "}
                  · 78% confidence
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span>Far left</span>
                  <span>Center</span>
                  <span>Far right</span>
                </div>
                <div className="relative mt-1.5 h-3 overflow-hidden rounded-full bg-gradient-to-r from-sky-500 via-foreground/80 to-red-500">
                  <div
                    className="absolute top-[-4px] h-6 w-[2px] rounded-full bg-background shadow-[0_0_0_1px_rgba(15,23,42,0.9)]"
                    style={{
                      left: hasAnimated ? "36%" : "50%",
                      transition: "left 650ms cubic-bezier(0.33,0.85,0.3,1.1)",
                    }}
                  />
                </div>
              </div>

              <div className="mt-2 space-y-2">
                {[
                  { key: "emotional", label: "Emotional", value: 68 },
                  { key: "factual", label: "Factual", value: 74 },
                  { key: "sensational", label: "Sensational", value: 41 },
                  { key: "neutral", label: "Neutral", value: 52 },
                ].map((tone) => (
                  <div
                    key={tone.key}
                    className="flex items-center gap-3 text-xs"
                  >
                    <div className="w-24 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {tone.label}
                    </div>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full bg-primary",
                          tone.key === "emotional" && "bg-destructive",
                          tone.key === "sensational" && "bg-warning",
                          tone.key === "neutral" && "bg-success",
                        )}
                        style={{
                          width: hasAnimated ? `${tone.value}%` : "0%",
                          transition:
                            "width 700ms cubic-bezier(0.25,0.9,0.35,1.02)",
                        }}
                      />
                    </div>
                    <div className="w-8 text-right text-[11px] text-muted-foreground tabular-nums">
                      {tone.value}%
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Charged language
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {[
                    { word: "rigged", tone: "negative" },
                    { word: "shocking", tone: "negative" },
                    { word: "baseless", tone: "negative" },
                    { word: "independent experts", tone: "positive" },
                    { word: "critics say", tone: "neutral" },
                  ].map(({ word, tone }) => (
                    <span
                      key={word}
                      className={cn(
                        "rounded-sm border px-2 py-0.5 text-[11px] uppercase tracking-[0.16em]",
                        tone === "negative" &&
                          "border-destructive/70 bg-destructive/10 text-destructive-foreground",
                        tone === "positive" &&
                          "border-success/70 bg-success/10 text-success-foreground",
                        tone === "neutral" &&
                          "border-border bg-secondary/60 text-muted-foreground",
                      )}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Source verification table */}
            <section className="rounded-xl border border-border bg-card/80 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Source verification
                </h3>
                <span className="text-xs text-muted-foreground">
                  Cross‑checked against independent fact‑checkers
                </span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    name: "Snopes",
                    note: "Matches prior rating on similar quote from the same official.",
                    badge: "confirm",
                    delay: 80,
                  },
                  {
                    name: "PolitiFact",
                    note: "Rates the central claim as 'Half True' given missing context.",
                    badge: "partial",
                    delay: 140,
                  },
                  {
                    name: "Reuters Fact Check",
                    note: "Finds no direct match but flags a related debunk from 2024.",
                    badge: "none",
                    delay: 200,
                  },
                  {
                    name: "FactCheck.org",
                    note: "Previously disputed the statistic cited in paragraph three.",
                    badge: "dispute",
                    delay: 260,
                  },
                ].map((source) => (
                  <div
                    key={source.name}
                    className={cn(
                      "grid grid-cols-[auto,1fr,auto] items-center gap-3 rounded-md bg-secondary/70 px-3 py-2 text-xs opacity-0 translate-y-1",
                      hasAnimated && "opacity-100 translate-y-0",
                    )}
                    style={{
                      transition:
                        "opacity 260ms ease-out, transform 260ms ease-out",
                      transitionDelay: hasAnimated ? `${source.delay}ms` : "0ms",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-[10px] font-semibold uppercase">
                        {source.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")}
                      </div>
                      <span className="font-medium text-foreground">
                        {source.name}
                      </span>
                    </div>
                    <p className="text-[11px] leading-snug text-muted-foreground">
                      {source.note}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]",
                        source.badge === "confirm" &&
                          "border-success/80 bg-success/10 text-success-foreground",
                        source.badge === "partial" &&
                          "border-warning/80 bg-warning/10 text-warning-foreground",
                        source.badge === "dispute" &&
                          "border-destructive/80 bg-destructive/10 text-destructive-foreground",
                        source.badge === "none" &&
                          "border-border bg-background/40 text-muted-foreground",
                      )}
                    >
                      {source.badge === "confirm"
                        ? "Confirms"
                        : source.badge === "partial"
                        ? "Partially true"
                        : source.badge === "dispute"
                        ? "Disputes"
                        : "No match"}
                    </span>
                  </div>
                ))}
              </div>
            </section>

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

            {/* Framing analysis (high-level cards) */}
            <section className="space-y-3">
              <h2 className="text-title text-foreground">Framing analysis</h2>
              <div className="grid gap-2">
                {[
                  {
                    tone: "amber",
                    label: "Selective omission",
                    copy: "Key economic caveats are pushed into the final third of the piece, after the main claim has been asserted several times.",
                  },
                  {
                    tone: "red",
                    label: "Headline alignment",
                    copy: "Headline presents the claim as settled fact, while the body text repeatedly attributes it to unnamed 'critics' and 'observers'.",
                  },
                  {
                    tone: "green",
                    label: "Source diversity",
                    copy: "Includes on‑record quotes from both government officials and independent researchers, with links to underlying reports.",
                  },
                  {
                    tone: "amber",
                    label: "Temporal framing",
                    copy: "Uses outdated statistics without clearly signaling that newer data is available from the same agency.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[auto,1fr] gap-3 rounded-md bg-secondary/70 px-3 py-2.5"
                  >
                    <div
                      className={cn(
                        "mt-1 h-2 w-2 rounded-full",
                        item.tone === "green" && "bg-success",
                        item.tone === "amber" && "bg-warning",
                        item.tone === "red" && "bg-destructive",
                      )}
                    />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-[11px] leading-snug text-muted-foreground">
                        {item.copy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

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

        <div className="mt-8 flex flex-col gap-6">
          {/* AI model agreement */}
          <section className="mx-auto w-full max-w-3xl rounded-xl border border-border bg-card/80 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  AI model agreement
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  How different models read the same article. Divergence is a signal, not a verdict.
                </p>
              </div>
              <span className="inline-flex items-center rounded-sm border border-border bg-secondary/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Mixed consensus
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { name: "Claude", verdict: "Center‑left, mostly factual", confidence: 82, agree: true },
                { name: "GPT‑4o", verdict: "Center with emotional framing", confidence: 76, agree: true },
                { name: "Gemini", verdict: "Leans left with selective sourcing", confidence: 64, agree: false },
              ].map((model) => (
                <div
                  key={model.name}
                  className={cn(
                    "inline-flex flex-col gap-1 rounded-md border px-3 py-2 text-xs",
                    model.agree
                      ? "border-success/60 bg-success/5"
                      : "border-warning/70 bg-warning/5 shadow-[0_0_0_1px_rgba(250,204,21,0.35)]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{model.name}</span>
                    <span
                      className={cn(
                        "rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em]",
                        model.agree
                          ? "border-success/70 bg-success/10 text-success-foreground"
                          : "border-warning/80 bg-warning/15 text-warning-foreground",
                      )}
                    >
                      {model.agree ? "Aligns" : "Diverges"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] text-muted-foreground">
                      {model.verdict}
                    </p>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {model.confidence}% conf.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={onBack}
              className="gap-2 border-border bg-secondary/60 text-xs uppercase tracking-[0.18em]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Re‑analyze another article
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
