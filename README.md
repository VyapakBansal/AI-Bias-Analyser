# AI Article Analyser

Small web app for poking at news articles and seeing how biased or trustworthy they look. Built for ENGG 200, more “working prototype” than polished product.

---

## What you see in the app

- **Landing view**
  - Big title and short explanation of what the tool does.
  - A theme toggle in the header so you can flip between light and dark.

- **Article input panel**
  - Text area where you can paste the full article.
  - Optional URL field so you can try scraping an article from a live site.
  - Basic metadata fields like title and publisher.
  - Buttons to either *scrape* from the URL or *analyse* whatever text is in the box.

- **Analysis results**
  - **Credibility score card** with a 0–100 score and a few bullet points explaining why it landed there.
  - **Claims list**: each card shows one factual claim, its status (verified/partial/false/etc.), a short explanation and a confidence rating.
  - **Bias highlights**: quotes from the article with notes about framing, language, omission and other bias types, plus severity and confidence.
  - **Arguments summary**: main thesis, supporting points and any opposing points the model picked up.

- **Publisher / trend extras**
  - When there’s enough data, a little publisher trends section gives a rough feel for how this outlet tends to score over time.

All of this is driven by an AI model behind a Supabase edge function; the UI is just trying to make the JSON output readable for humans.

---

## How it works (roughly)

1. You paste an article or give a URL.
2. The backend sends the content to an AI model with a fairly strict “fact‑checker / media analyst” prompt.
3. The model replies with structured JSON (claims, biases, scores, etc.).
4. The frontend renders that into cards, charts and lists instead of a giant wall of text.

The logic is deliberately opinionated but not magical: if the input is vague or low quality, the output will be too.

---

## Running it locally

You’ll need a recent version of Node.js and npm.

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

Then open the printed URL (usually `http://localhost:5173`) in your browser.

To get real analyses instead of placeholder errors, you’ll also need:

- A Supabase project (the SQL migrations in `supabase/migrations` set up the basics).
- An AI API key configured for the `analyze-article` edge function (`AI_API_KEY` env var).

---

## Tech stack (kept simple)

- Vite + React + TypeScript
- shadcn‑ui + Tailwind CSS
- Supabase (edge functions + database)
- A single AI model endpoint behind the `analyze-article` function

Nothing here is especially clever; the point is clarity over cleverness.

---

## Rough edges and caveats

- It’s a student project, so you’ll find the occasional hard‑coded copy, clunky layout or half‑finished idea.
- The AI can be wrong or over‑confident; treat the output as a starting point for thinking, not ground truth.
- If it breaks, it should at least fail loudly enough that you can see where to poke it next.
