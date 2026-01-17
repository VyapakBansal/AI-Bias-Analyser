import { supabase } from "@/integrations/supabase/client";

export type ClaimStatus = "verified" | "partial" | "false" | "unverified" | "outdated";
export type BiasType = "framing" | "language" | "omission" | "cultural" | "political" | "gender" | "racial" | "socioeconomic";
export type Severity = "low" | "medium" | "high";

export interface Claim {
  claim: string;
  status: ClaimStatus;
  explanation: string;
  confidence: number;
}

export interface Bias {
  text: string;
  biasType: BiasType;
  whyBiased: string;
  whyNotBiased: string;
  severity: Severity;
  confidence: number;
}

export interface Arguments {
  thesis: string;
  supporting: string[];
  opposing: string[];
}

export interface ScoreBreakdown {
  factualAccuracy: number;
  sourceReliability: number;
  biasLevel: number;
  argumentBalance: number;
}

export interface AnalysisResult {
  credibilityScore: number;
  summary: string;
  claims: Claim[];
  biases: Bias[];
  arguments: Arguments;
  scoreBreakdown: ScoreBreakdown;
}

export interface ArticleData {
  title: string;
  publisher: string;
  content: string;
  url?: string;
  description?: string;
}

export interface ScrapeResponse {
  success: boolean;
  error?: string;
  data?: ArticleData;
}

export interface AnalyzeResponse {
  success: boolean;
  error?: string;
  data?: AnalysisResult;
}

export async function scrapeArticle(url: string): Promise<ScrapeResponse> {
  const { data, error } = await supabase.functions.invoke('scrape-article', {
    body: { url },
  });

  if (error) {
    console.error('Scrape error:', error);
    return { success: false, error: error.message };
  }

  return data as ScrapeResponse;
}

export async function analyzeArticle(
  content: string,
  title: string,
  publisher: string,
  mode: 'basic' | 'expert' = 'basic'
): Promise<AnalyzeResponse> {
  const { data, error } = await supabase.functions.invoke('analyze-article', {
    body: { content, title, publisher, mode },
  });

  if (error) {
    console.error('Analyze error:', error);
    return { success: false, error: error.message };
  }

  return data as AnalyzeResponse;
}

export async function analyzeFromUrl(
  url: string,
  mode: 'basic' | 'expert' = 'basic'
): Promise<{ article?: ArticleData; analysis?: AnalysisResult; error?: string }> {
  // First scrape the article
  const scrapeResult = await scrapeArticle(url);
  
  if (!scrapeResult.success || !scrapeResult.data) {
    return { error: scrapeResult.error || 'Failed to fetch article' };
  }

  const article = scrapeResult.data;

  // Then analyze it
  const analyzeResult = await analyzeArticle(
    article.content,
    article.title,
    article.publisher,
    mode
  );

  if (!analyzeResult.success || !analyzeResult.data) {
    return { article, error: analyzeResult.error || 'Failed to analyze article' };
  }

  return { article, analysis: analyzeResult.data };
}

export async function analyzeFromText(
  content: string,
  title: string = 'Pasted Article',
  publisher: string = 'Unknown',
  mode: 'basic' | 'expert' = 'basic'
): Promise<{ article: ArticleData; analysis?: AnalysisResult; error?: string }> {
  const article: ArticleData = { content, title, publisher };

  const analyzeResult = await analyzeArticle(content, title, publisher, mode);

  if (!analyzeResult.success || !analyzeResult.data) {
    return { article, error: analyzeResult.error || 'Failed to analyze article' };
  }

  return { article, analysis: analyzeResult.data };
}
