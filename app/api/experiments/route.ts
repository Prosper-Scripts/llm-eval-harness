import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import getDb from "@/lib/db";
import type { Experiment } from "@/lib/types";

export async function GET() {
  try {
    const db = getDb();
    const experiments = db
      .prepare("SELECT * FROM experiments ORDER BY created_at DESC")
      .all() as unknown as Experiment[];
    return NextResponse.json(experiments);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch experiments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, model } = await request.json();
    if (!name || !model) {
      return NextResponse.json(
        { error: "name and model are required" },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const db = getDb();
    db.prepare(
      "INSERT INTO experiments (id, name, model) VALUES (?, ?, ?)"
    ).run(id, name, model);

    const experiment = db
      .prepare("SELECT * FROM experiments WHERE id = ?")
      .get(id) as unknown as Experiment;
    return NextResponse.json(experiment, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create experiment" },
      { status: 500 }
    );
  }
}
