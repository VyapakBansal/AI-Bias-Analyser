-- Create table for analyzed articles
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  content TEXT,
  credibility_score INTEGER,
  analysis_data JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for publisher tracking
CREATE TABLE public.tracked_publishers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  domain TEXT,
  avg_credibility_score NUMERIC(5,2),
  total_articles_analyzed INTEGER DEFAULT 0,
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for publisher trend history
CREATE TABLE public.publisher_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publisher_id UUID NOT NULL REFERENCES public.tracked_publishers(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  credibility_score INTEGER NOT NULL,
  bias_summary JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_articles_publisher ON public.articles(publisher);
CREATE INDEX idx_articles_analyzed_at ON public.articles(analyzed_at DESC);
CREATE INDEX idx_publisher_trends_publisher ON public.publisher_trends(publisher_id);
CREATE INDEX idx_publisher_trends_recorded ON public.publisher_trends(recorded_at DESC);

-- Enable RLS (keeping tables public for now since no auth required)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracked_publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_trends ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for articles (no auth for MVP)
CREATE POLICY "Allow public read on articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on articles" ON public.articles FOR INSERT WITH CHECK (true);

-- Public read/write policies for tracked_publishers
CREATE POLICY "Allow public read on tracked_publishers" ON public.tracked_publishers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tracked_publishers" ON public.tracked_publishers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on tracked_publishers" ON public.tracked_publishers FOR UPDATE USING (true);

-- Public read/write policies for publisher_trends
CREATE POLICY "Allow public read on publisher_trends" ON public.publisher_trends FOR SELECT USING (true);
CREATE POLICY "Allow public insert on publisher_trends" ON public.publisher_trends FOR INSERT WITH CHECK (true);

-- Function to update publisher stats
CREATE OR REPLACE FUNCTION public.update_publisher_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tracked_publishers
  SET 
    avg_credibility_score = (
      SELECT AVG(credibility_score) 
      FROM public.publisher_trends 
      WHERE publisher_id = NEW.publisher_id
    ),
    total_articles_analyzed = (
      SELECT COUNT(*) 
      FROM public.publisher_trends 
      WHERE publisher_id = NEW.publisher_id
    ),
    last_analyzed_at = NEW.recorded_at,
    updated_at = now()
  WHERE id = NEW.publisher_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update publisher stats
CREATE TRIGGER trigger_update_publisher_stats
AFTER INSERT ON public.publisher_trends
FOR EACH ROW
EXECUTE FUNCTION public.update_publisher_stats();