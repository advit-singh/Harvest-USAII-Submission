import { createClient } from "@/lib/supabase/server";

const BUCKET = "reports";
const localFileCache = new Map<string, Buffer>();

export async function uploadReportFile(
  organizationId: string,
  reportId: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const storagePath = `${organizationId}/${reportId}/${fileName}`;

  try {
    const supabase = await createClient();
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });

    if (error) {
      localFileCache.set(storagePath, buffer);
      return `local://${storagePath}`;
    }

    return storagePath;
  } catch {
    localFileCache.set(storagePath, buffer);
    return `local://${storagePath}`;
  }
}

export async function createReportDownloadUrl(
  filePath: string,
  fileName: string,
): Promise<{ fileUrl: string; expiresAt: string }> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  if (filePath.startsWith("local://")) {
    const key = filePath.replace("local://", "");
    const buffer = localFileCache.get(key);
    if (!buffer) {
      throw new Error("Report file not found in local cache.");
    }
    const base64 = buffer.toString("base64");
    const mime = fileName.endsWith(".pdf")
      ? "application/pdf"
      : fileName.endsWith(".csv")
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    return {
      fileUrl: `data:${mime};base64,${base64}`,
      expiresAt,
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(filePath, 3600);

    if (error || !data?.signedUrl) {
      throw error ?? new Error("Failed to create signed URL.");
    }

    return { fileUrl: data.signedUrl, expiresAt };
  } catch {
    const buffer = localFileCache.get(filePath);
    if (!buffer) {
      throw new Error("Report file not available.");
    }
    const base64 = buffer.toString("base64");
    return {
      fileUrl: `data:application/octet-stream;base64,${base64}`,
      expiresAt,
    };
  }
}

export function cacheReportFileForTests(storagePath: string, buffer: Buffer): void {
  localFileCache.set(storagePath, buffer);
}
