import { createClient } from '@supabase/supabase-js';

const supabaseA = createClient(
  import.meta.env.VITE_SUPABASE_URL_A,
  import.meta.env.VITE_SUPABASE_KEY_A
);

const supabaseB = createClient(
  import.meta.env.VITE_SUPABASE_URL_B,
  import.meta.env.VITE_SUPABASE_KEY_B
);

const storageTargets = [
  { client: supabaseA, bucket: import.meta.env.VITE_SUPABASE_BUCKET_A },
  { client: supabaseB, bucket: import.meta.env.VITE_SUPABASE_BUCKET_B },
];

const THUMB_MAX_SIZE = 1024;
const THUMB_QUALITY = 0.85;

async function makeThumbnail(file) {
  const probe = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = THUMB_MAX_SIZE / Math.max(probe.width, probe.height);
  if (scale >= 1) {
    probe.close();
    return null;
  }
  const width = Math.round(probe.width * scale);
  const height = Math.round(probe.height * scale);
  probe.close();

  const bitmap = await createImageBitmap(file, {
    imageOrientation: 'from-image',
    resizeWidth: width,
    resizeHeight: height,
    resizeQuality: 'high',
  });
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      THUMB_QUALITY
    );
  });
}

export async function uploadPhoto(fileName, file) {
  const thumb = await makeThumbnail(file).catch(() => null);

  const first = Math.floor(Math.random() * storageTargets.length);
  const order = [storageTargets[first], storageTargets[1 - first]];

  let lastError = null;
  for (const { client, bucket } of order) {
    const { data, error } = await client.storage.from(bucket).upload(fileName, file);
    if (!error) {
      if (thumb) {
        await client.storage
          .from(bucket)
          .upload(`thumbs/${fileName}`, thumb, { contentType: 'image/jpeg' });
      }
      return data;
    }
    lastError = error;
  }
  throw lastError;
}

export async function listPhotos() {
  const results = await Promise.all(
    storageTargets.map(async ({ client, bucket }) => {
      const { data, error } = await client.storage
        .from(bucket)
        .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
      if (error || !data) return [];
      return data
        .filter((f) => f.name && !f.name.startsWith('.') && f.id)
        .map((f) => ({
          bucket,
          name: f.name,
          url: client.storage.from(bucket).getPublicUrl(f.name).data.publicUrl,
          thumbUrl: client.storage.from(bucket).getPublicUrl(`thumbs/${f.name}`).data.publicUrl,
          createdAt: f.created_at,
        }));
    })
  );
  return results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getFavorites() {
  const { data, error } = await supabaseA.from('favorites').select('bucket,name');
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export function favKey(photo) {
  return `${photo.bucket}/${photo.name}`;
}

export async function addFavorite(photo) {
  const { error } = await supabaseA.from('favorites').insert({ bucket: photo.bucket, name: photo.name });
  if (error) throw error;
}

export async function removeFavorite(photo) {
  const { error } = await supabaseA
    .from('favorites')
    .delete()
    .eq('bucket', photo.bucket)
    .eq('name', photo.name);
  if (error) throw error;
}

export async function deletePhoto(photo) {
  const target = storageTargets.find((t) => t.bucket === photo.bucket);
  const { error } = await target.client.storage.from(photo.bucket).remove([photo.name, `thumbs/${photo.name}`]);
  if (error) throw error;
  await supabaseA.from('favorites').delete().eq('bucket', photo.bucket).eq('name', photo.name);
}

export async function addMessage(messageText) {
  const { data, error } = await supabaseA
    .from('messages')
    .insert([{ text: messageText }]);

  if (error) throw error;
  return data;
}

export async function deleteMessage(id) {
  const { error } = await supabaseA.from('messages').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchMessages() {
  const { data, error } = await supabaseA
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
