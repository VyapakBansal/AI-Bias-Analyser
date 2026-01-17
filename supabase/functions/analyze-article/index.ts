import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert fact-checker and media analyst. Your task is to analyze articles for:

1. FACTUAL CLAIMS: Identify explicit and implicit factual claims. For each claim:
   - State the claim clearly
   - Classify as: verified, partial, false, unverified, or outdated
   - Provide explanation with reasoning
   - Rate confidence (0-100)

2. BIAS DETECTION: Identify instances of:
   - Framing bias (how issues are presented)
   - Language bias (loaded words, emotional language)
   - Omission bias (important context missing)
   - Political, cultural, gender, racial, or socioeconomic bias
   
   For each bias instance:
   - Quote the biased text
   - Explain why it may be biased
   - Explain why it may NOT be biased (balanced view)
   - Rate severity: low, medium, high
   - Rate confidence (0-100)

3. CREDIBILITY SCORE: Calculate a 0-100 score based on:
   - Factual accuracy (40%)
   - Source reliability indicators (20%)
   - Bias density and severity (25%)
   - Argument balance (15%)

4. ARGUMENTS: Identify:
   - Main thesis
   - Supporting arguments
   - Counter-arguments (if present)
   - Distinguish facts from opinions

Be balanced and objective. When uncertain, state so clearly. Never force conclusions.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, title, publisher, mode = 'basic' } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Article content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt = `Analyze this article for factual accuracy, bias, and credibility.

Title: ${title || 'Unknown'}
Publisher: ${publisher || 'Unknown'}
Analysis Mode: ${mode} (${mode === 'expert' ? 'provide detailed linguistic and contextual analysis' : 'provide clear, accessible explanations'})

Article Content:
${content.slice(0, 15000)}

Respond with a JSON object containing:
{
  "credibilityScore": number (0-100),
  "summary": "Brief overall assessment",
  "claims": [
    {
      "claim": "The factual claim text",
      "status": "verified|partial|false|unverified|outdated",
      "explanation": "Why this classification",
      "confidence": number (0-100)
    }
  ],
  "biases": [
    {
      "text": "The biased text quote",
      "biasType": "framing|language|omission|cultural|political|gender|racial|socioeconomic",
      "whyBiased": "Explanation of potential bias",
      "whyNotBiased": "Alternative interpretation",
      "severity": "low|medium|high",
      "confidence": number (0-100)
    }
  ],
  "arguments": {
    "thesis": "Main argument of the article",
    "supporting": ["Supporting point 1", "Supporting point 2"],
    "opposing": ["Counter-argument 1", "Counter-argument 2"]
  },
  "scoreBreakdown": {
    "factualAccuracy": number (0-100),
    "sourceReliability": number (0-100),
    "biasLevel": number (0-100, higher = less biased),
    "argumentBalance": number (0-100)
  }
}`;

    console.log('Analyzing article:', title);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content_text = aiResponse.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response (handle markdown code blocks)
    let analysis;
    try {
      const jsonMatch = content_text.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content_text.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content_text];
      analysis = JSON.parse(jsonMatch[1] || content_text);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw response:', content_text);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse analysis results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analysis complete, credibility score:', analysis.credibilityScore);

    return new Response(
      JSON.stringify({ success: true, data: analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing article:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
