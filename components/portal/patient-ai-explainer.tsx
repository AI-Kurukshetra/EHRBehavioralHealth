"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type PatientAiExplainerProps = {
  title: string;
  content: string;
  type: "note" | "treatment-plan";
};

export function PatientAiExplainer({ title, content, type }: PatientAiExplainerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const handleExplain = async () => {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/ai/patient-friendly", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        type,
      }),
    });

    const data = (await response.json()) as {
      explanation?: string;
      error?: string;
    };

    if (!response.ok || !data.explanation) {
      setError(data.error ?? "Unable to explain this right now.");
      setLoading(false);
      return;
    }

    setExplanation(data.explanation);
    setLoading(false);
  };

  return (
    <div className="mt-3 space-y-3">
      <Button type="button" variant="secondary" onClick={handleExplain} disabled={loading}>
        {loading ? "Explaining..." : "Explain simply"}
      </Button>
      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
      {explanation ? (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4 text-sm text-slate-700 whitespace-pre-wrap">
          {explanation}
        </div>
      ) : null}
    </div>
  );
}
