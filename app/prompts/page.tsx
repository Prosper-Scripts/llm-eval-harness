"use client";

import { useState, useEffect } from "react";
import type { Prompt } from "@/lib/types";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPrompts() {
    try {
      const res = await fetch("/api/prompts");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setPrompts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load prompts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrompts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content.trim() }),
    });
    setTitle("");
    setContent("");
    await fetchPrompts();
    setSaving(false);
  }

  if (loading) return <p className="text-gray-500 text-sm mt-8">Loading...</p>;
  if (error) return <p className="text-red-500 text-sm mt-8">Error: {error}</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Prompts</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm"
      >
        <h2 className="font-semibold text-gray-800">New Prompt</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          placeholder="Prompt content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Add Prompt"}
        </button>
      </form>

      <div className="space-y-4">
        {prompts.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No prompts yet. Add one above.
          </p>
        ) : (
          prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900">{prompt.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {prompt.content}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(prompt.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
