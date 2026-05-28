"use client";

import { useState, useEffect } from "react";
import type { Experiment } from "@/lib/types";

const MODELS = [
  "gpt-4o",
  "gpt-3.5-turbo",
  "claude-3-opus",
  "claude-3-sonnet",
  "mistral-7b",
];

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [name, setName] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [creating, setCreating] = useState(false);
  const [runningIds, setRunningIds] = useState<Set<string>>(new Set());
  const [runMessages, setRunMessages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchExperiments() {
    try {
      const res = await fetch("/api/experiments");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setExperiments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load experiments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExperiments();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    await fetch("/api/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), model }),
    });
    setName("");
    await fetchExperiments();
    setCreating(false);
  }

  async function handleRun(id: string) {
    setRunningIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/experiments/${id}/run`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setRunMessages((prev) => ({
          ...prev,
          [id]: `Done! ${data.results.length} result(s) generated.`,
        }));
        setExperiments((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: "completed" } : e))
        );
      } else {
        setRunMessages((prev) => ({
          ...prev,
          [id]: data.error || "Run failed.",
        }));
      }
    } catch {
      setRunMessages((prev) => ({ ...prev, [id]: "Run failed." }));
    } finally {
      setRunningIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  if (loading) return <p className="text-gray-500 text-sm mt-8">Loading...</p>;
  if (error) return <p className="text-red-500 text-sm mt-8">Error: {error}</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Experiments</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm"
      >
        <h2 className="font-semibold text-gray-800">New Experiment</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Experiment name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {creating ? "Creating..." : "Create Experiment"}
        </button>
      </form>

      <div className="space-y-4">
        {experiments.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No experiments yet. Create one above.
          </p>
        ) : (
          experiments.map((exp) => (
            <div
              key={exp.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{exp.name}</h3>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      exp.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {exp.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Model: {exp.model}</p>
                <p className="text-xs text-gray-400">
                  {new Date(exp.created_at).toLocaleString()}
                </p>
                {runMessages[exp.id] && (
                  <p className="text-sm text-green-600 font-medium pt-1">
                    {runMessages[exp.id]}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRun(exp.id)}
                disabled={runningIds.has(exp.id)}
                className="shrink-0 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {runningIds.has(exp.id) ? "Running..." : "Run"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
