import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link2, FileText, ArrowRight, Loader2 } from "lucide-react";

interface AnalysisInputProps {
  onAnalyze: (input: string, type: "url" | "text") => void;
  isLoading?: boolean;
  className?: string;
}

export function AnalysisInput({ onAnalyze, isLoading = false, className }: AnalysisInputProps) {
  const [inputType, setInputType] = useState<"url" | "text">("url");
  const [input, setInput] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([
    "snopes",
    "politifact",
    "reuters",
  ]);
  const [selectedModels, setSelectedModels] = useState<string[]>([
    "claude",
    "gpt4",
    "gemini",
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAnalyze(input.trim(), inputType);
    }
  };

  const toggleChip = (group: "sources" | "models", value: string) => {
    const setFn = group === "sources" ? setSelectedSources : setSelectedModels;
    const current = group === "sources" ? selectedSources : selectedModels;
    setFn(
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    );
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto text-left", className)}>
      {/* Input type toggle */}
      <div className="inline-flex gap-1 p-1 bg-secondary rounded-md border border-border max-w-full overflow-x-auto mb-4">
        <button
          type="button"
          onClick={() => setInputType("url")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-sm text-small font-medium tracking-wide transition-all duration-150",
            inputType === "url" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Link2 className="h-4 w-4" />
          Article URL
        </button>
        <button
          type="button"
          onClick={() => setInputType("text")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-sm text-small font-medium tracking-wide transition-all duration-150",
            inputType === "text" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="h-4 w-4" />
          Paste Text
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {inputType === "url" ? (
          <div className="relative">
            <input
              type="url"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full h-12 px-4 pr-32 rounded-md border border-border bg-secondary/60 text-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="lg"
              variant="default"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Analyze
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste the article text here..."
              rows={6}
              className="w-full px-4 py-3 rounded-md border border-border bg-secondary/60 text-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150 resize-none"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="lg"
              variant="default"
              disabled={!input.trim() || isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Analyze Article
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </form>

      {/* Source & model chips */}
      <div className="mt-6 space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-1.5">
            Fact-check sources
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "snopes", label: "Snopes" },
              { id: "politifact", label: "PolitiFact" },
              { id: "reuters", label: "Reuters Fact Check" },
              { id: "factcheck", label: "FactCheck.org" },
              { id: "ap", label: "AP Fact Check" },
              { id: "mbfc", label: "Media Bias / Fact Check" },
            ].map((source) => (
              <button
                key={source.id}
                type="button"
                onClick={() => toggleChip("sources", source.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] transition-colors",
                  selectedSources.includes(source.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary/60 text-muted-foreground hover:border-primary/50"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    selectedSources.includes(source.id) ? "bg-primary-foreground" : "bg-muted-foreground"
                  )}
                />
                {source.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-1.5">
            AI models
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "claude", label: "Claude" },
              { id: "gpt4", label: "GPT‑4o" },
              { id: "gemini", label: "Gemini" },
            ].map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => toggleChip("models", model.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] transition-colors",
                  selectedModels.includes(model.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary/60 text-muted-foreground hover:border-primary/50"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    selectedModels.includes(model.id) ? "bg-primary-foreground" : "bg-muted-foreground"
                  )}
                />
                {model.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-1 text-small text-muted-foreground">
          <span className="font-medium text-primary-foreground">BiasLens</span> queries multiple sources and models in parallel.
          More signals mean stronger verdicts, but also slower runs.
        </p>
      </div>
    </div>
  );
}
