"use client";

import { useState, useCallback } from "react";
import ImageUploader from "@/components/ImageUploader";
import CameraCapture from "@/components/CameraCapture";
import ProgressBar from "@/components/ProgressBar";
import OcrResultViewer from "@/components/OcrResultViewer";
import { uploadImage, pollOcrResult, type OcrRecord } from "@/lib/api";

type AppState = "idle" | "uploading" | "processing" | "completed" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OcrRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState("");

  const handleFileSelect = useCallback(async (file: File) => {
    setState("uploading");
    setProgress(0);
    setError(null);
    setResult(null);
    setFilename(file.name);

    try {
      const { id } = await uploadImage(file);
      setState("processing");

      pollOcrResult(id, (record) => {
        setProgress(record.progress ?? 0);

        if (record.status === "completed") {
          setResult(record);
          setState("completed");
        } else if (record.status === "failed") {
          setError(record.error || "OCR processing failed");
          setState("error");
        }
      });
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setState("error");
    }
  }, []);

  const handleReset = () => {
    setState("idle");
    setProgress(0);
    setResult(null);
    setError(null);
    setFilename("");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Extract Text from Images
        </h1>
        <p className="mt-3 text-muted text-lg">
          Upload an image or snap a photo, and let OCR do the rest.
        </p>
      </div>

      <div className="space-y-6">
        <ImageUploader
          onFileSelect={handleFileSelect}
          disabled={state === "uploading" || state === "processing"}
        />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <CameraCapture
          onCapture={handleFileSelect}
          disabled={state === "uploading" || state === "processing"}
        />

        {(state === "uploading" || state === "processing") && (
          <ProgressBar
            progress={state === "uploading" ? 0 : progress}
            status={state === "uploading" ? "pending" : "processing"}
          />
        )}

        {state === "error" && (
          <div className="bg-danger/10 border border-danger/20 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="font-medium text-danger">Processing Failed</p>
                <p className="text-sm text-danger/80 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {state === "completed" && result && (
          <div className="space-y-4">
            <OcrResultViewer text={result.text || ""} filename={filename} />
            <div className="text-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-border/50 transition-colors text-foreground"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Another Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
