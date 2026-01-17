import { useState } from "react";
import { Header } from "@/components/Header";
import { AnalysisInput } from "@/components/AnalysisInput";
import { AnalysisView } from "@/components/AnalysisView";
import { Shield, CheckCircle, BarChart3, Zap } from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    title: "Fact Verification",
    description: "Every claim cross-referenced against reputable sources with transparent sourcing",
  },
  {
    icon: BarChart3,
    title: "Bias Detection",
    description: "Identifies framing, language, and omission bias with balanced explanations",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get comprehensive credibility scores in seconds, not hours",
  },
];

export default function Index() {
  const [view, setView] = useState<"home" | "analysis">("home");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (input: string, type: "url" | "text") => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setView("analysis");
  };

  if (view === "analysis") {
    return (
      <>
        <Header />
        <AnalysisView onBack={() => setView("home")} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 md:px-6">
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-caption font-medium">
              <Shield className="h-4 w-4" />
              AI-powered credibility analysis
            </div>
            
            <h1 className="text-display text-foreground">
              Know what to trust
            </h1>
            
            <p className="text-body text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Analyze any article for factual accuracy, hidden bias, and credibility. 
              Make informed decisions about the content you consume.
            </p>
          </div>

          <div className="mt-12 animate-slide-up stagger-1">
            <AnalysisInput onAnalyze={handleAnalyze} isLoading={isLoading} />
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
              When sources conflict, we show both sides. When data is uncertain, we say so.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {["Transparent methodology", "No ideological steering", "Source citations", "Explicit uncertainty"].map((item, i) => (
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-caption font-medium text-foreground">Veritas</span>
            </div>
            <p className="text-small text-muted-foreground">
              Empowering informed decisions through transparent analysis
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
