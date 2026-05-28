"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  prompts: number;
  experiments: number;
  results: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ prompts: 0, experiments: 0, results: 0 });
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/prompts").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/api/experiments").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/api/results").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    ])
      .then(([prompts, experiments, results]) => {
        setStats({
          prompts: Array.isArray(prompts) ? prompts.length : 0,
          experiments: Array.isArray(experiments) ? experiments.length : 0,
          results: Array.isArray(results) ? results.length : 0,
        });
      })
      .catch(() => setStatsError("Could not load stats"));
  }, []);

  const statCards = [
    { label: "Total Prompts", value: stats.prompts, href: "/prompts" },
    { label: "Experiments", value: stats.experiments, href: "/experiments" },
    { label: "Results", value: stats.results, href: "/results" },
  ];

  return (
    <div className="space-y-10">
      <section className="text-center py-10 space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          LLM Evaluation Harness
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
          Run structured evaluations against language models. Define prompts,
          configure experiments, and analyze results — stored locally with
          SQLite.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            href="/experiments"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            New Experiment
          </Link>
          <Link
            href="/prompts"
            className="inline-flex items-center px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Browse Prompts
          </Link>
        </div>
      </section>

      {statsError && (
        <p className="text-center text-red-500 text-sm">{statsError}</p>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-4xl font-bold text-indigo-600">{value}</div>
            <div className="text-sm text-gray-600 mt-2">{label}</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
