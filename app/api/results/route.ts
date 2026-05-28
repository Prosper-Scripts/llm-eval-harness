import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import type { Result } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experimentId = searchParams.get("experiment_id");

    const db = getDb();
    let results: Result[];

    if (experimentId) {
      results = db
        .prepare(
          "SELECT * FROM results WHERE experiment_id = ? ORDER BY created_at DESC"
        )
        .all(experimentId) as unknown as Result[];
    } else {
      results = db
        .prepare("SELECT * FROM results ORDER BY created_at DESC")
        .all() as unknown as Result[];
    }

    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
