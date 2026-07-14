import { createClient } from '@supabase/supabase-js';

// Account 1
const supabaseA = createClient(
  import.meta.env.VITE_SUPABASE_URL_A,
  import.meta.env.VITE_SUPABASE_KEY_A
);

// Account 2
const supabaseB = createClient(
  import.meta.env.VITE_SUPABASE_URL_B,
  import.meta.env.VITE_SUPABASE_KEY_B
);

// Kol target leeh client + esm el-bucket beta3o
const storageTargets = [
  { client: supabaseA, bucket: import.meta.env.VITE_SUPABASE_BUCKET_A },
  { client: supabaseB, bucket: import.meta.env.VITE_SUPABASE_BUCKET_B },
];

// Byekhtar bucket 3ashwa2y 3ashan yewazza3 el-storage wel-bandwidth,
// w law fashal (masalan el-bucket etmala) byegarrab el-tany automatic
export async function uploadPhoto(fileName, file) {
  const first = Math.floor(Math.random() * storageTargets.length);
  const order = [storageTargets[first], storageTargets[1 - first]];

  let lastError = null;
  for (const { client, bucket } of order) {
    const { data, error } = await client.storage.from(bucket).upload(fileName, file);
    if (!error) return data;
    lastError = error;
  }
  throw lastError;
}

// Bygib el-sowar men el-2 buckets, kol sora ma3aha esm el-bucket beta3ha
// 3ashan ne3raf nemsa7ha aw ne3melha favorite ba3den
export async function listPhotos() {
  const results = await Promise.all(
    storageTargets.map(async ({ client, bucket }) => {
      const { data, error } = await client.storage
        .from(bucket)
        .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
      if (error || !data) return [];
      // f.id == null ma3naha folder (zay thumbs/ el-adima) mesh file
      return data
        .filter((f) => f.name && !f.name.startsWith('.') && f.id)
        .map((f) => ({
          bucket,
          name: f.name,
          url: client.storage.from(bucket).getPublicUrl(f.name).data.publicUrl,
          createdAt: f.created_at,
        }));
    })
  );
  return results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// El-favorites metkhazzena f-table wa7ed f-project A (bucket + esm el-file)
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
  // Bnemsa7 el-thumb ma3aha; law mesh mawgooda Supabase betetgahalha 3ady
  const { error } = await target.client.storage.from(photo.bucket).remove([photo.name, `thumbs/${photo.name}`]);
  if (error) throw error;
  // Law kanet favorite, nemsa7ha men el-table kaman
  await supabaseA.from('favorites').delete().eq('bucket', photo.bucket).eq('name', photo.name);
}
