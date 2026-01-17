import { useState } from "react";
import { CredibilityScore } from "./CredibilityScore";
import { ClaimCard } from "./ClaimCard";
import { BiasHighlight } from "./BiasHighlight";
import { ArticleCard } from "./ArticleCard";
import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisViewProps {
  onBack: () => void;
  className?: string;
}

// Mock data for demonstration
const mockAnalysis = {
  title: "Climate Change Report Shows Accelerating Ice Melt",
  publisher: "Global News Network",
  credibilityScore: 72,
  claims: [
    {
      claim: "Arctic ice has decreased by 40% since 1979",
      status: "verified" as const,
      explanation: "Multiple peer-reviewed studies confirm this figure, including NASA satellite data and NSIDC records.",
      sources: ["https://nasa.gov/arctic", "https://nsidc.org/data"],
      confidence: 94,
    },
    {
      claim: "Sea levels will rise by 3 meters by 2050",
      status: "partial" as const,
      explanation: "While sea level rise is documented, the 3-meter figure by 2050 represents an extreme scenario. IPCC projections range from 0.3 to 1.1 meters by 2100.",
      sources: ["https://ipcc.ch/reports"],
      confidence: 78,
    },
    {
      claim: "No major economies are meeting their Paris Agreement targets",
      status: "false" as const,
      explanation: "Several nations, including the UK and some EU members, are on track to meet their 2030 commitments according to Climate Action Tracker.",
      sources: ["https://climateactiontracker.org"],
      confidence: 89,
    },
  ],
  biases: [
    {
      text: "scientists warn of catastrophic consequences",
      biasType: "language" as const,
      whyBiased: "The word 'catastrophic' is emotionally charged and may overstate the scientific consensus, which typically uses more measured language like 'severe' or 'significant'.",
      whyNotBiased: "Given the documented impacts on ecosystems and human populations, 'catastrophic' may be an accurate characterization of worst-case scenarios.",
      severity: "medium" as const,
      confidence: 72,
    },
    {
      text: "Climate skeptics continue to deny the evidence",
      biasType: "framing" as const,
      whyBiased: "The term 'deny' has negative connotations and doesn't distinguish between different types of skepticism (scientific methodology, policy responses, etc.).",
      whyNotBiased: "The term accurately describes the rejection of well-established scientific evidence by certain groups.",
      severity: "low" as const,
      confidence: 65,
    },
  ],
  relatedArticles: [
    {
      headline: "IPCC Report: What the Data Actually Shows",
      publisher: "Science Daily",
      summary: "An objective breakdown of the latest IPCC findings without editorial interpretation.",
      credibilityScore: 89,
      framingLabel: "Neutral",
    },
    {
      headline: "The Real Cost of Climate Action",
      publisher: "Economic Review",
      summary: "Analysis focuses on economic impacts of climate policies rather than environmental benefits.",
      credibilityScore: 68,
      framingLabel: "Economic Focus",
    },
    {
      headline: "Why Climate Alarmism Hurts the Cause",
      publisher: "Policy Forum",
      summary: "Opinion piece arguing that extreme predictions undermine public trust in climate science.",
      credibilityScore: 54,
      framingLabel: "Contrarian",
    },
  ],
};

export function AnalysisView({ onBack, className }: AnalysisViewProps) {
  const [mode, setMode] = useState<"basic" | "expert">("basic");

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
            <ModeToggle mode={mode} onChange={setMode} />
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
                  {mockAnalysis.publisher}
                </span>
              </div>
              <h1 className="text-headline text-foreground">
                {mockAnalysis.title}
              </h1>
            </header>

            {/* Credibility score card */}
            <div className="p-6 rounded-xl bg-card border border-border animate-slide-up">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-title text-foreground mb-1">Credibility Score</h2>
                  <p className="text-caption text-muted-foreground mb-4">
                    Based on factual accuracy, source reliability, and bias analysis
                  </p>
                  <CredibilityScore score={mockAnalysis.credibilityScore} size="lg" />
                </div>
              </div>
            </div>

            {/* Factual Claims */}
            <section className="space-y-4">
              <h2 className="text-title text-foreground">Factual Claims</h2>
              <p className="text-caption text-muted-foreground -mt-2">
                {mode === "basic" 
                  ? "Key claims identified and verified against reliable sources"
                  : "Detailed verification with source analysis and confidence intervals"
                }
              </p>
              <div className="space-y-3">
                {mockAnalysis.claims.map((claim, i) => (
                  <ClaimCard 
                    key={i} 
                    {...claim} 
                    className={`stagger-${i + 1}`}
                  />
                ))}
              </div>
            </section>

            {/* Bias Detection */}
            <section className="space-y-4">
              <h2 className="text-title text-foreground">Bias Detection</h2>
              <p className="text-caption text-muted-foreground -mt-2">
                {mode === "basic"
                  ? "Language and framing that may indicate bias"
                  : "Comprehensive linguistic and contextual bias analysis with cultural considerations"
                }
              </p>
              <div className="space-y-3">
                {mockAnalysis.biases.map((bias, i) => (
                  <BiasHighlight 
                    key={i} 
                    {...bias}
                    className={`stagger-${i + 1}`}
                  />
                ))}
              </div>
            </section>

            {mode === "expert" && (
              <section className="space-y-4 animate-fade-in">
                <h2 className="text-title text-foreground">Argument Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="text-caption font-medium text-claim-verified mb-2">Supporting Arguments</h3>
                    <ul className="space-y-2 text-caption text-muted-foreground">
                      <li>• Cites multiple peer-reviewed sources</li>
                      <li>• Data aligns with IPCC consensus</li>
                      <li>• Includes counterarguments</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="text-caption font-medium text-claim-false mb-2">Opposing Arguments</h3>
                    <ul className="space-y-2 text-caption text-muted-foreground">
                      <li>• Some projections exceed mainstream estimates</li>
                      <li>• Limited regional context provided</li>
                      <li>• Economic impacts understated</li>
                    </ul>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-36">
              <h2 className="text-title text-foreground mb-4">Related Coverage</h2>
              <p className="text-caption text-muted-foreground mb-4">
                Compare how other sources cover this topic
              </p>
              <div className="space-y-4">
                {mockAnalysis.relatedArticles.map((article, i) => (
                  <ArticleCard 
                    key={i} 
                    {...article}
                    className={`stagger-${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
