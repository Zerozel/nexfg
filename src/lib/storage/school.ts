import { createServerSupabase } from '@/lib/supabase/server';

const BUCKET_NAME = 'schools';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadSchoolImage(
  file: File,
  type: 'logo' | 'signature',
  schoolSlug: string
): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 5MB');
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File must be JPEG, PNG, or WebP');
  }

  // Signature-specific validation
  if (type === 'signature' && file.type !== 'image/png') {
    throw new Error('Signature must be a PNG file');
  }

  if (type === 'signature' && file.size > 2 * 1024 * 1024) {
    throw new Error('Signature must be less than 2MB');
  }

  const supabase = await createServerSupabase();
  const ext = file.type.split('/')[1] || 'png';
  const path = `${type}s/${schoolSlug}/${type}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

export async function deleteSchoolImage(
  type: 'logo' | 'signature',
  schoolSlug: string
): Promise<void> {
  const supabase = await createServerSupabase();

  // List all files in the folder to find the exact filename
  const { data: files } = await supabase.storage
    .from(BUCKET_NAME)
    .list(`${type}s/${schoolSlug}`);

  if (files && files.length > 0) {
    const paths = files.map((f) => `${type}s/${schoolSlug}/${f.name}`);
    await supabase.storage.from(BUCKET_NAME).remove(paths);
  }
}
