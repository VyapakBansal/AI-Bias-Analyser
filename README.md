# AI Article Analyser

This project is a small web app for analysing news articles for factual claims, bias and overall credibility. It was hacked together for ENGG 200 and is meant to feel like a practical tool rather than a shiny demo.

## Getting started

You’ll need a recent version of Node.js and npm installed.

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

Then open the printed URL in your browser.

## Tech stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (edge functions + database)

## What it does

- Lets you paste in an article or scrape one from a URL  
- Runs an AI analysis to pull out factual claims, potential bias and a credibility score  
- Shows the results in a way that’s actually readable for humans

## Notes

This repo is intentionally lightweight and geared towards experimentation. If something looks a bit scrappy but works, that’s probably on purpose.
