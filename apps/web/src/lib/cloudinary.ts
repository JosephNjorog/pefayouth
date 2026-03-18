import { getCloudinarySignature } from './api';

/**
 * Uploads a file to Cloudinary using a server-generated signed upload.
 * The file goes directly from the browser to Cloudinary — it never passes
 * through our serverless function, keeping uploads fast and within size limits.
 */
export async function uploadToCloudinary(
  file: File,
  folder = 'pefayouth/gallery'
): Promise<string> {
  const { signature, timestamp, cloudName, apiKey, folder: signedFolder } =
    await getCloudinarySignature(folder);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', signedFolder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.error?.message || 'Cloudinary upload failed');
  }

  const data = await res.json();
  return data.secure_url as string;
}
