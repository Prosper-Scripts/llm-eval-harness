"use client";

import { useState, useEffect } from "react";
import type { Result } from "@/lib/types";

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/results")
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load results")
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter.trim()
    ? results.filter((r) => r.experiment_id.includes(filter.trim()))
    : results;

  if (loading) return <p className="text-gray-500 text-sm mt-8">Loading...</p>;
  if (error) return <p className="text-red-500 text-sm mt-8">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Results</h1>

      <input
        type="text"
        placeholder="Filter by experiment ID..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {results.length === 0
            ? "No results yet. Run an experiment first."
            : "No results match that experiment ID."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm border-collapse bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                {[
                  "Experiment ID",
                  "Prompt ID",
                  "Score",
                  "Latency (ms)",
                  "Response",
                  "Created At",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 border-b border-gray-200 font-medium whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {result.experiment_id.slice(0, 8)}&hellip;
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {result.prompt_id.slice(0, 8)}&hellip;
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {result.score != null ? result.score.toFixed(3) : "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{result.latency_ms ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs">
                    <span className="block truncate">
                      {result.response.length > 80
                        ? result.response.slice(0, 80) + "…"
                        : result.response}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(result.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
