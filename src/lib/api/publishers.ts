import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface TrackedPublisher {
  id: string;
  name: string;
  domain: string | null;
  avg_credibility_score: number | null;
  total_articles_analyzed: number;
  last_analyzed_at: string | null;
  created_at: string;
}

export interface PublisherTrend {
  id: string;
  publisher_id: string;
  article_id: string;
  credibility_score: number;
  bias_summary: Record<string, unknown> | null;
  recorded_at: string;
}

export interface Article {
  id: string;
  url: string | null;
  title: string;
  publisher: string;
  credibility_score: number | null;
  analyzed_at: string | null;
  created_at: string;
}

export async function getTrackedPublishers(): Promise<TrackedPublisher[]> {
  const { data, error } = await supabase
    .from('tracked_publishers')
    .select('*')
    .order('last_analyzed_at', { ascending: false });

  if (error) {
    console.error('Error fetching publishers:', error);
    return [];
  }

  return (data || []) as TrackedPublisher[];
}

export async function trackPublisher(name: string, domain?: string): Promise<TrackedPublisher | null> {
  const { data, error } = await supabase
    .from('tracked_publishers')
    .upsert({ name, domain }, { onConflict: 'name' })
    .select()
    .single();

  if (error) {
    console.error('Error tracking publisher:', error);
    return null;
  }

  return data as TrackedPublisher;
}

export async function getPublisherTrends(publisherId: string): Promise<PublisherTrend[]> {
  const { data, error } = await supabase
    .from('publisher_trends')
    .select('*')
    .eq('publisher_id', publisherId)
    .order('recorded_at', { ascending: true });

  if (error) {
    console.error('Error fetching trends:', error);
    return [];
  }

  return (data || []) as PublisherTrend[];
}

export async function getPublisherArticles(publisherName: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('publisher', publisherName)
    .order('analyzed_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return (data || []) as Article[];
}

export async function saveAnalyzedArticle(
  article: {
    url?: string;
    title: string;
    publisher: string;
    content?: string;
    credibility_score: number;
    analysis_data: Record<string, unknown>;
  }
): Promise<Article | null> {
  const insertData = {
    url: article.url,
    title: article.title,
    publisher: article.publisher,
    content: article.content,
    credibility_score: article.credibility_score,
    analysis_data: article.analysis_data as Json,
    analyzed_at: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from('articles')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error saving article:', error);
    return null;
  }

  return data as Article;
}

export async function recordPublisherTrend(
  publisherName: string,
  articleId: string,
  credibilityScore: number,
  biasSummary?: Record<string, unknown>
): Promise<boolean> {
  // Get or create publisher
  const publisher = await trackPublisher(publisherName);
  if (!publisher) return false;

  const trendData = {
    publisher_id: publisher.id,
    article_id: articleId,
    credibility_score: credibilityScore,
    bias_summary: (biasSummary || null) as Json,
  };

  // Record the trend
  const { error } = await supabase
    .from('publisher_trends')
    .insert([trendData]);
  if (error) {
    console.error('Error recording trend:', error);
    return false;
  }

  return true;
}

export async function getRecentAnalyses(limit: number = 10): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('analyzed_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent analyses:', error);
    return [];
  }

  return (data || []) as Article[];
}
