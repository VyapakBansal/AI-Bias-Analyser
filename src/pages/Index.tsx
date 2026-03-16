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
        <section className="py-12 md:py-16 lg:py-20 min-h-[calc(100vh-4rem)] flex items-center">
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
                BiasLens cross‑checks political stories against established
                fact‑checkers and multiple AI models, giving you an
                editorial‑grade read on credibility and framing in seconds.
              </p>
              <p className="hidden text-small text-muted-foreground/80 md:block">
                Designed for journalists, researchers and editors who need a
                second set of eyes, not a replacement.
              </p>
            </div>

            <div className="lg:w-7/12">
              <div className="rounded-xl border border-border bg-card/90 p-5 shadow-lg shadow-black/40 animate-slide-up">
                <AnalysisInput
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
                  <p>
                    <span className="font-medium text-primary-foreground">
                      No article is stored
                    </span>{" "}
                    — summaries only are cached for trends.
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

        {/* How it works */}
        <section id="how-it-works" className="py-16 border-t border-border">
          <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="space-y-4">
              <h2 className="text-headline font-serif tracking-[0.05em]">
                How BiasLens reads an article
              </h2>
              <p className="text-body text-muted-foreground leading-relaxed">
                BiasLens doesn&apos;t hallucinate verdicts. It treats your article like a draft on an editor&apos;s
                desk: break it into claims, check those claims against external signals, then annotate the framing.
              </p>
              <ol className="space-y-3 text-body text-muted-foreground">
                <li>
                  <span className="font-semibold text-foreground">1. Ingest.</span>{" "}
                  You paste a URL or text. We normalise the content, strip boilerplate, and isolate the article body.
                </li>
                <li>
                  <span className="font-semibold text-foreground">2. Cross‑check.</span>{" "}
                  The core factual claims are compared against fact‑checking outlets and your chosen AI models.
                  Each model votes on credibility and bias, not just sentiment.
                </li>
                <li>
                  <span className="font-semibold text-foreground">3. Annotate.</span>{" "}
                  We surface charged language, missing context and sourcing patterns, then collapse that into a
                  single verdict banner and bias spectrum.
                </li>
              </ol>
              <p className="text-small text-muted-foreground">
                Under the hood this is a simple pipeline: article in, JSON out. The UI you see is a thin editorial
                layer on top of that structured analysis.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className={`space-y-2 rounded-xl border border-border bg-card/80 p-4 text-left animate-slide-up stagger-${i + 2}`}
                >
                  <div className="inline-flex items-center justify-center rounded-md bg-secondary/70 p-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-title text-foreground">{feature.title}</h3>
                  <p className="text-caption text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About BiasLens */}
        <section id="about-biaslens" className="py-16 border-t border-border">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-headline text-foreground">
                About BiasLens
              </h2>
              <p className="text-body text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                BiasLens is a personal project built to help people spot when a story is leaning too hard on spin,
                clickbait or one‑sided sourcing. It isn&apos;t trying to replace your judgement&mdash;just to slow you
                down before you share the wrong link.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "Built for readers, not feeds",
                  body: "BiasLens is for people who actually open articles, not just headlines. It surfaces what the piece is doing with language, sourcing and framing so you can decide whether it earns your attention.",
                },
                {
                  title: "No party lines, no presets",
                  body: "There are no hidden left or right sliders here. The system looks at structure: loaded phrases, missing context, and how often a claim is disputed elsewhere.",
                },
                {
                  title: "Signals, not final answers",
                  body: "Every verdict comes with uncertainty. When sources or models disagree, BiasLens shows that divergence instead of flattening it into a single score.",
                },
                {
                  title: "A small safeguard",
                  body: "This project exists so it&apos;s slightly harder to fall for confident‑sounding nonsense online. If it makes you close one tab a day, it&apos;s doing its job.",
                },
              ].map((card, i) => (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card/80 p-5 text-left shadow-[0_0_0_0_rgba(0,0,0,0)] transition-all duration-200 hover:border-primary/70 hover:shadow-[0_0_30px_rgba(34,211,238,0.18)]"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-emerald-400/10" />
                  <div className="relative space-y-2">
                    <h3 className="text-title text-foreground">{card.title}</h3>
                    <p className="text-caption text-muted-foreground leading-relaxed">
                      {card.body}
                    </p>
                  </div>
                </div>
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
