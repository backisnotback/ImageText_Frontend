const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface OcrRecord {
  id: number;
  filename: string;
  filepath: string;
  text: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  error: string | null;
  file_size: number | null;
  progress?: number;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }

  return json.data;
}

export async function uploadImage(file: File): Promise<{ id: number; status: string }> {
  const formData = new FormData();
  formData.append("image", file);

  return request("/ocr", {
    method: "POST",
    body: formData,
  });
}

export async function getOcrResult(id: number): Promise<OcrRecord> {
  return request(`/ocr/${id}`);
}

export async function getHistory(): Promise<OcrRecord[]> {
  return request("/history");
}

export async function deleteHistoryItem(id: number): Promise<void> {
  return request(`/history/${id}`, { method: "DELETE" });
}

export function pollOcrResult(
  id: number,
  onUpdate: (record: OcrRecord) => void,
  intervalMs = 1000
): () => void {
  let active = true;

  const poll = async () => {
    while (active) {
      try {
        const record = await getOcrResult(id);
        onUpdate(record);
        if (record.status === "completed" || record.status === "failed") {
          break;
        }
      } catch {
        break;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  };

  poll();
  return () => { active = false; };
}
