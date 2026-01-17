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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAnalyze(input.trim(), inputType);
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Input type toggle */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-4">
        <button
          type="button"
          onClick={() => setInputType("url")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-caption font-medium transition-all duration-150",
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
            "flex items-center gap-2 px-4 py-2 rounded-md text-caption font-medium transition-all duration-150",
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
              className="w-full h-14 px-5 pr-32 rounded-xl border border-border bg-background text-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-150"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="lg"
              variant="hero"
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
              className="w-full px-5 py-4 rounded-xl border border-border bg-background text-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-150 resize-none"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="lg"
              variant="hero"
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

      <p className="mt-3 text-small text-muted-foreground">
        Supported: News articles, opinion pieces, research publications. 
        <span className="text-muted-foreground/70"> Personal social media posts are not supported.</span>
      </p>
    </div>
  );
}
