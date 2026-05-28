# LLM Eval Harness

A full-stack web app for evaluating and comparing LLM responses across multiple models using custom prompts and scoring metrics. Define your prompts, run batch experiments, and inspect results — all stored locally with SQLite.

## Features

- **Prompt management** — create and store reusable evaluation prompts
- **Experiment runner** — run batch evaluations against multiple LLM models
- **Automated scoring** — each response is scored on accuracy and quality metrics
- **Results dashboard** — view and filter evaluation results with latency tracking
- **Built-in mock LLM engine** — develop and test offline without any API keys

## Tech Stack

- Next.js 14, TypeScript, Tailwind CSS
- Node.js API routes (App Router)
- SQLite via `node:sqlite` (built-in Node.js 22+, no native compilation required)
- UUID-based record management

## Getting Started

**Prerequisites:** Node.js 22+

```bash
git clone <repo-url>
cd llm-eval-harness
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The SQLite database (`eval.db`) is created automatically in the project root on first run.

## Project Structure

```
app/
  page.tsx                  # Home dashboard with stats
  layout.tsx                # Root layout with Navbar
  components/
    Navbar.tsx              # Top navigation bar
  prompts/
    page.tsx                # Prompt management page
  experiments/
    page.tsx                # Experiment creation and runner
  results/
    page.tsx                # Results table with filtering
  api/
    prompts/route.ts        # GET /api/prompts, POST /api/prompts
    experiments/route.ts    # GET /api/experiments, POST /api/experiments
    experiments/[id]/
      run/route.ts          # POST /api/experiments/:id/run
    results/route.ts        # GET /api/results
lib/
  db.ts                     # SQLite singleton, schema init
  types.ts                  # Shared TypeScript interfaces
public/                     # Static assets
```

## Screenshots

Screenshots coming soon.

## License

MIT
