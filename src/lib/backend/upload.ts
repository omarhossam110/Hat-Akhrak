import { BACKEND_URL } from "@/lib/backend/client";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_DEAL_IMAGES = 4;

export type UploadResult =
  | { url: string }
  | { error: "invalidImage" | "imageTooLarge" | "notVerified" | "generic" };

/** Sends one image to the backend (POST /uploads). Returns the stored
 * same-site path (e.g. /uploads/deal/<id>) to save on the deal / order. */
export async function uploadImage(
  file: File,
  kind: "deal" | "invoice",
  token: string,
): Promise<UploadResult> {
  if (file.size > MAX_IMAGE_BYTES) return { error: "imageTooLarge" };
  const body = new FormData();
  body.append("file", file, file.name || "image");
  try {
    const res = await fetch(`${BACKEND_URL}/uploads?kind=${kind}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
      cache: "no-store",
    });
    if (res.ok) return { url: ((await res.json()) as { url: string }).url };
    if (res.status === 413) return { error: "imageTooLarge" };
    if (res.status === 403) return { error: "notVerified" };
    if (res.status === 400) return { error: "invalidImage" };
  } catch {
    /* fall through */
  }
  return { error: "generic" };
}

/** The non-empty files of a multi-file input (an empty input yields one 0-byte File). */
export function filesFrom(formData: FormData, name: string): File[] {
  return formData.getAll(name).filter((v): v is File => v instanceof File && v.size > 0);
}
