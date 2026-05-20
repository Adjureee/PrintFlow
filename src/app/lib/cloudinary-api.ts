import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const FUNCTIONS_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-73bd5aa5`;

export interface CloudinarySignResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  bytes: number;
  format: string;
}

export class CloudinaryUploadError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'CloudinaryUploadError';
  }
}

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_BYTES = 10 * 1024 * 1024;

export async function requestCloudinarySignature(
  accessToken: string,
): Promise<CloudinarySignResponse> {
  const response = await fetch(`${FUNCTIONS_BASE}/cloudinary-sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: publicAnonKey,
    },
    body: JSON.stringify({}),
  });

  const data = (await response.json()) as CloudinarySignResponse & { error?: string };

  if (!response.ok) {
    throw new CloudinaryUploadError(
      data.error ?? 'Could not prepare secure upload',
    );
  }

  return data;
}

export async function uploadDocumentToCloudinary(
  file: File,
  accessToken: string,
): Promise<CloudinaryUploadResult> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new CloudinaryUploadError('Only PDF and DOCX files are allowed.');
  }

  if (file.size > MAX_BYTES) {
    throw new CloudinaryUploadError('File must be 10 MB or smaller.');
  }

  const sign = await requestCloudinarySignature(accessToken);

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder);
  form.append('resource_type', 'raw');

  const uploadUrl = `https://api.cloudinary.com/v1_1/${sign.cloudName}/raw/upload`;

  let response: Response;
  try {
    response = await fetch(uploadUrl, {
      method: 'POST',
      body: form,
    });
  } catch (err) {
    throw new CloudinaryUploadError('Network error during upload', err);
  }

  const result = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    resource_type?: string;
    bytes?: number;
    format?: string;
    error?: { message?: string };
  };

  if (!response.ok || !result.secure_url || !result.public_id) {
    throw new CloudinaryUploadError(
      result.error?.message ?? 'Cloudinary upload failed',
    );
  }

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type ?? 'raw',
    bytes: result.bytes ?? file.size,
    format: result.format ?? file.name.split('.').pop() ?? 'pdf',
  };
}
