import { client } from './sanity';

export async function uploadFile(file: File, type: 'image' | 'file' = 'image') {
  return client.assets.upload(type, file, {
    filename: file.name,
    contentType: file.type,
  });
}