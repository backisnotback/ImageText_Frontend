"use client";

import { useState, useRef, useCallback } from "react";

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/bmp", "image/tiff"];
const MAX_SIZE = 20 * 1024 * 1024;

export default function ImageUploader({ onFileSelect, disabled }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Unsupported file type. Use PNG, JPG, WEBP, BMP, or TIFF.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("File too large. Maximum size is 20MB.");
        return;
      }

      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSet(file);
    },
    [validateAndSet]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const reset = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-surface"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-md object-contain"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="text-sm text-danger hover:underline"
              disabled={disabled}
            >
              Remove image
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <svg
              className="w-12 h-12 mx-auto text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <div>
              <p className="text-foreground font-medium">
                Drop your image here, or{" "}
                <span className="text-primary">browse</span>
              </p>
              <p className="text-sm text-muted mt-1">
                PNG, JPG, WEBP, BMP, TIFF up to 20MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-danger font-medium bg-danger/10 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
