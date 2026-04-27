"use client";

import { useState } from "react";
import type { OcrRecord } from "@/lib/api";
import { deleteHistoryItem } from "@/lib/api";

interface HistoryListProps {
  records: OcrRecord[];
  onDelete: (id: number) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "Z").toLocaleString();
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-success/10 text-success",
    failed: "bg-danger/10 text-danger",
    processing: "bg-primary/10 text-primary",
    pending: "bg-muted/10 text-muted",
  };

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

export default function HistoryList({ records, onDelete }: HistoryListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this record?")) return;
    setDeletingId(id);
    try {
      await deleteHistoryItem(id);
      onDelete(id);
    } catch (err) {
      alert("Failed to delete record");
    } finally {
      setDeletingId(null);
    }
  };

  if (records.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-muted/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-muted text-lg">No OCR history yet</p>
        <p className="text-muted/70 text-sm mt-1">Upload an image to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <div
          key={record.id}
          className="bg-surface border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-md"
        >
          <div
            className="flex items-center justify-between px-5 py-4 cursor-pointer"
            onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{record.filename}</p>
                <p className="text-sm text-muted">
                  {formatDate(record.created_at)} &middot; {formatSize(record.file_size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <StatusBadge status={record.status} />
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                disabled={deletingId === record.id}
                className="p-1.5 text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger/10 disabled:opacity-50"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <svg
                className={`w-5 h-5 text-muted transition-transform ${expandedId === record.id ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {expandedId === record.id && (
            <div className="border-t border-border px-5 py-4">
              {record.status === "completed" && record.text ? (
                <pre className="whitespace-pre-wrap font-mono text-sm text-foreground break-words max-h-60 overflow-y-auto">
                  {record.text}
                </pre>
              ) : record.status === "failed" ? (
                <p className="text-danger text-sm">{record.error || "OCR processing failed"}</p>
              ) : (
                <p className="text-muted text-sm">Processing...</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
