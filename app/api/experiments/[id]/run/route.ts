import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import getDb from "@/lib/db";
import type { Experiment, Prompt, Result } from "@/lib/types";

function mockLLMResponse(promptContent: string, model: string): string {
  const words = promptContent.split(/\s+/).filter((w) => w.length > 5);
  const keyword =
    words[Math.floor(Math.random() * Math.max(words.length, 1))] ||
    "your query";

  const openers = [
    `Regarding "${keyword.toLowerCase()}", this is a nuanced topic that warrants careful analysis.`,
    `To address your question about "${keyword.toLowerCase()}": there are several key considerations.`,
    `"${keyword}" is an interesting subject. Let me provide a structured response.`,
  ];

  const bodies = [
    `From a ${model} perspective, the evidence suggests a multifaceted approach. First, we must consider the foundational principles at play. Second, contextual factors significantly influence the outcome. Finally, practical application requires careful calibration.`,
    `The core insight involves understanding the underlying mechanisms. Analysis reveals that the primary drivers are complexity, context, and intent — each contributing meaningfully to an accurate assessment.`,
    `Breaking this down systematically: (1) the immediate interpretation, (2) the broader implications, and (3) actionable takeaways. This structured approach ensures a thorough and reliable response.`,
  ];

  const closers = [
    "I hope this addresses your question comprehensively.",
    "Let me know if you need further clarification on any aspect.",
    "This analysis reflects current understanding; additional context could refine these insights.",
  ];

  const opener = openers[Math.floor(Math.random() * openers.length)];
  const body = bodies[Math.floor(Math.random() * bodies.length)];
  const closer = closers[Math.floor(Math.random() * closers.length)];

  return `${opener}\n\n${body}\n\n${closer}`;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();

    const experiment = db
      .prepare("SELECT * FROM experiments WHERE id = ?")
      .get(params.id) as unknown as Experiment | undefined;

    if (!experiment) {
      return NextResponse.json(
        { error: "Experiment not found" },
        { status: 404 }
      );
    }

    const prompts = db.prepare("SELECT * FROM prompts").all() as unknown as Prompt[];

    if (prompts.length === 0) {
      return NextResponse.json(
        { error: "No prompts found. Add prompts before running an experiment." },
        { status: 400 }
      );
    }

    const insertResult = db.prepare(
      "INSERT INTO results (id, experiment_id, prompt_id, response, score, latency_ms) VALUES (?, ?, ?, ?, ?, ?)"
    );

    const results: Result[] = prompts.map((prompt) => {
      const id = uuidv4();
      const response = mockLLMResponse(prompt.content, experiment.model);
      const score = parseFloat((0.6 + Math.random() * 0.4).toFixed(3));
      const latency_ms = Math.floor(120 + Math.random() * 780);
      const created_at = new Date().toISOString();

      insertResult.run(
        id,
        experiment.id,
        prompt.id,
        response,
        score,
        latency_ms
      );

      return { id, experiment_id: experiment.id, prompt_id: prompt.id, response, score, latency_ms, created_at };
    });

    db.prepare("UPDATE experiments SET status = 'completed' WHERE id = ?").run(
      params.id
    );

    return NextResponse.json({ experiment_id: params.id, results });
  } catch {
    return NextResponse.json(
      { error: "Failed to run experiment" },
      { status: 500 }
    );
  }
}
