"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

export default function CameraCapture({ onCapture, disabled }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    setError(null);
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Could not access camera. Please allow camera permissions.");
    }
  }, [stopStream]);

  const openCamera = useCallback(async () => {
    setIsOpen(true);
    setPreview(null);
    await startCamera(facingMode);
  }, [startCamera, facingMode]);

  const closeCamera = useCallback(() => {
    stopStream();
    setIsOpen(false);
    setPreview(null);
    setError(null);
  }, [stopStream]);

  const switchCamera = useCallback(async () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    await startCamera(next);
  }, [facingMode, startCamera]);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    stopStream();

    const dataUrl = canvas.toDataURL("image/png");
    setPreview(dataUrl);
  }, [stopStream]);

  const confirmPhoto = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera-${Date.now()}.png`, { type: "image/png" });
      onCapture(file);
      closeCamera();
    }, "image/png");
  }, [onCapture, closeCamera]);

  const retakePhoto = useCallback(async () => {
    setPreview(null);
    await startCamera(facingMode);
  }, [startCamera, facingMode]);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  return (
    <>
      <button
        type="button"
        onClick={openCamera}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-surface transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Take a Photo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Camera</h3>
              <button onClick={closeCamera} className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border/50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="relative bg-black aspect-[4/3]">
              {preview ? (
                <img src={preview} alt="Captured" className="w-full h-full object-contain" />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-6">
                  <p className="text-white text-center text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 px-5 py-4 border-t border-border">
              {preview ? (
                <>
                  <button
                    onClick={retakePhoto}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-border/50 transition-colors text-foreground"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retake
                  </button>
                  <button
                    onClick={confirmPhoto}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Use Photo
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={switchCamera}
                    className="p-2.5 text-muted hover:text-foreground rounded-full hover:bg-border/50 transition-colors"
                    title="Switch camera"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                  <button
                    onClick={takePhoto}
                    disabled={!!error}
                    className="w-14 h-14 rounded-full bg-white border-4 border-border hover:border-primary transition-colors disabled:opacity-50"
                    title="Capture"
                  />
                  <div className="w-10" />
                </>
              )}
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </>
  );
}
