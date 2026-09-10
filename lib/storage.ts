import { supabase } from './supabase'

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET!

if (!BUCKET) {
  throw new Error('Missing SUPABASE_STORAGE_BUCKET env var')
}

/**
 * Upload a file to Supabase Storage.
 *
 * @param buffer   - File content as a Buffer or Uint8Array
 * @param path     - Storage path, e.g. "admissions/2024/doc.pdf"
 * @param contentType - MIME type, e.g. "application/pdf"
 * @returns        - The storage path (use with getFileUrl to get a signed URL)
 *
 * IMPORTANT: ALL file uploads in this project MUST go through this function.
 * Never write files directly to the local filesystem — this app must run on
 * Vercel (no persistent disk), Render, and AWS without code changes.
 */
export async function uploadFile(
  buffer: Buffer | Uint8Array,
  path: string,
  contentType: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: false,
    })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  return data.path
}

/**
 * Get a short-lived signed URL for a private file.
 * Default expiry: 1 hour (3600 seconds).
 *
 * Use this for all file access — the bucket is private, so public URLs
 * will not work. Assignment submissions, admissions docs, and certificates
 * are never publicly accessible without a fresh signed URL.
 */
export async function getFileUrl(
  path: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds)

  if (error || !data?.signedUrl) {
    throw new Error(`Could not generate signed URL: ${error?.message}`)
  }

  return data.signedUrl
}

/**
 * Delete a file from Supabase Storage.
 * Used when cleaning up failed uploads or removing old submission versions.
 */
export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])

  if (error) {
    throw new Error(`Storage delete failed: ${error.message}`)
  }
}
