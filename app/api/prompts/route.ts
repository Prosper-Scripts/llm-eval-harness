import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import getDb from "@/lib/db";
import type { Prompt } from "@/lib/types";

export async function GET() {
  try {
    const db = getDb();
    const prompts = db
      .prepare("SELECT * FROM prompts ORDER BY created_at DESC")
      .all() as unknown as Prompt[];
    return NextResponse.json(prompts);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json(
        { error: "title and content are required" },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const db = getDb();
    db.prepare(
      "INSERT INTO prompts (id, title, content) VALUES (?, ?, ?)"
    ).run(id, title, content);

    const prompt = db
      .prepare("SELECT * FROM prompts WHERE id = ?")
      .get(id) as unknown as Prompt;
    return NextResponse.json(prompt, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create prompt" },
      { status: 500 }
    );
  }
}
