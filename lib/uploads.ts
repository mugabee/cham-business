import "server-only";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

// Stored outside any web-servable directory -- the app root itself isn't
// the doc root (LiteSpeed proxies everything to the Node process), so this
// is only ever reachable through the authenticated download route.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export type SavedFile = {
  storedFilename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
};

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "application/pdf":
      return ".pdf";
    default:
      return "";
  }
}

export async function saveUploadedFile(file: File): Promise<SavedFile> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      `Unsupported file type for "${file.name}". Please upload a JPG, PNG, or PDF.`
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.name}" is too large (max 5MB).`);
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name) || extensionForMime(file.type);
  const storedFilename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, storedFilename), buffer);

  return {
    storedFilename,
    originalFilename: file.name,
    mimeType: file.type,
    fileSize: file.size,
  };
}

export async function readUploadedFile(storedFilename: string): Promise<Buffer> {
  if (
    storedFilename.includes("/") ||
    storedFilename.includes("\\") ||
    storedFilename.includes("..")
  ) {
    throw new Error("Invalid filename.");
  }
  return fs.readFile(path.join(UPLOAD_DIR, storedFilename));
}
