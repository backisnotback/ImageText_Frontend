"use client";

import { useState, useEffect } from "react";
import HistoryList from "@/components/HistoryList";
import { getHistory, type OcrRecord } from "@/lib/api";

export default function HistoryPage() {
  const [records, setRecords] = useState<OcrRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory();
      setRecords(data);
    } catch (err: any) {
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = (id: number) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">OCR History</h1>
          <p className="mt-1 text-muted">
            {records.length} {records.length === 1 ? "record" : "records"}
          </p>
        </div>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-border/50 transition-colors text-foreground disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-muted">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading history...
          </div>
        </div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-5 text-center">
          <p className="text-danger font-medium">{error}</p>
          <button
            onClick={loadHistory}
            className="mt-3 text-sm font-medium text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <HistoryList records={records} onDelete={handleDelete} />
      )}
    </div>
  );
}
