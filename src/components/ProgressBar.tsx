interface ProgressBarProps {
  progress: number;
  status: string;
}

export default function ProgressBar({ progress, status }: ProgressBarProps) {
  const label =
    status === "pending"
      ? "Waiting to start..."
      : status === "processing"
      ? `Processing... ${progress}%`
      : status === "completed"
      ? "Complete!"
      : "Failed";

  const barColor =
    status === "failed"
      ? "bg-danger"
      : status === "completed"
      ? "bg-success"
      : "bg-primary";

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted">{progress}%</span>
      </div>
      <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${barColor}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
