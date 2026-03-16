import { useState } from "react";
import { Header } from "@/components/Header";
import { AnalysisInput } from "@/components/AnalysisInput";
import { AnalysisView } from "@/components/AnalysisView";
import { PublisherTrends } from "@/components/PublisherTrends";
import { CheckCircle, BarChart3, Zap, TrendingUp } from "lucide-react";
import {
  analyzeFromUrl,
  analyzeFromText,
  AnalysisResult,
  ArticleData,
} from "@/lib/api/analysis";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: CheckCircle,
    title: "Fact Verification",
    description:
      "Every claim cross-referenced with AI-powered analysis and transparent reasoning",
  },
  {
    icon: BarChart3,
    title: "Bias Detection",
    description:
      "Identifies framing, language, and omission bias with balanced explanations",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description:
      "Get comprehensive credibility scores in seconds using advanced AI",
  },
];

type View = "home" | "analysis" | "trends";

export default function Index() {
  const [view, setView] = useState<View>("home");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    article: ArticleData;
    analysis: AnalysisResult;
  } | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (input: string, type: "url" | "text") => {
    setIsLoading(true);

    try {
      if (type === "url") {
        const result = await analyzeFromUrl(input);

        if (result.error) {
          toast({
            title: "Analysis failed",
            description: result.error,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (result.article && result.analysis) {
          setAnalysisResult({
            article: result.article,
            analysis: result.analysis,
          });
          setView("analysis");
        }
      } else {
        const result = await analyzeFromText(input);

        if (result.error) {
          toast({
            title: "Analysis failed",
            description: result.error,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (result.analysis) {
          setAnalysisResult({
            article: result.article,
            analysis: result.analysis,
          });
          setView("analysis");
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (view === "analysis" && analysisResult) {
    return (
      <>
        <Header />
        <AnalysisView
          article={analysisResult.article}
          initialAnalysis={analysisResult.analysis}
          onBack={() => {
            setView("home");
            setAnalysisResult(null);
          }}
        />
      </>
    );
  }

  if (view === "trends") {
    return (
      <>
        <Header />
        <PublisherTrends onBack={() => setView("home")} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 md:px-6">
        {/* Hero / input state */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:flex-row">
            <div className="space-y-4 lg:w-5/12">
              <div className="inline-flex items-center gap-2 rounded-sm border border-border bg-secondary/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-[5px] bg-primary/10 ring-1 ring-primary/40">
                  <span className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent" />
                </span>
                Media bias &amp; fact‑check console
              </div>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.6rem] leading-tight tracking-[0.04em]">
                See through the spin before you hit publish.
              </h1>
              <p className="text-body text-muted-foreground max-w-xl leading-relaxed">
                BiasLens cross‑checks political stories against established fact‑checkers and multiple AI models,
                giving you an editorial‑grade read on credibility and framing in seconds.
              </p>
              <p className="hidden text-small text-muted-foreground/80 md:block">
                Designed for journalists, researchers and editors who need a second set of eyes, not a replacement.
              </p>
            </div>

            <div className="lg:w-7/12">
              <div className="rounded-xl border border-border bg-card/90 p-5 shadow-lg shadow-black/40 animate-slide-up">
                <AnalysisInput onAnalyze={handleAnalyze} isLoading={isLoading} />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
                  <p>
                    <span className="font-medium text-primary-foreground">No article is stored</span> — summaries only are cached for trends.
                  </p>
                  <button
                    type="button"
                    onClick={() => setView("trends")}
                    className="inline-flex items-center gap-1 rounded-sm border border-border bg-secondary/60 px-2 py-1 uppercase tracking-[0.16em]"
                  >
                    <TrendingUp className="h-3 w-3" />
                    Publisher trends
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-border">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`text-center md:text-left space-y-3 animate-slide-up stagger-${i + 2}`}
              >
                <div className="inline-flex p-2.5 rounded-lg bg-accent">
                  <feature.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="text-title text-foreground">{feature.title}</h3>
                <p className="text-caption text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust indicators */}
        <section className="py-16 border-t border-border">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-headline text-foreground">
              Built for clarity, not controversy
            </h2>
            <p className="text-body text-muted-foreground leading-relaxed">
              We present facts and perspectives without steering conclusions.
              When sources conflict, we show both sides. When data is uncertain,
              we say so.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {[
                "Transparent methodology",
                "No ideological steering",
                "Source citations",
                "Explicit uncertainty",
              ].map((item, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-full bg-muted text-caption text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <img
                src="/bias-lens.png"
                alt="BiasLens logo"
                className="h-5 w-5 object-contain"
              />
              <span className="text-caption font-medium text-foreground">
                BiasLens
              </span>
            </div>
            <div className="space-y-1 text-small text-muted-foreground">
              <p>Empowering informed decisions through transparent analysis.</p>
              <p className="text-muted-foreground/80">
                Built by Vyapak Bansal · 2026
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
