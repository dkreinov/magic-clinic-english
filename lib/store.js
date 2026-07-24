import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const PROFILE_FILENAME = 'profile.json';
const BLOB_PATHNAME = 'profile/profile.json';

function getDataDir() {
  return process.env.DATA_DIR ?? '.data';
}

function useBlobBackend() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function loadFromFile() {
  const filePath = path.join(getDataDir(), PROFILE_FILENAME);
  try {
    const contents = await readFile(filePath, 'utf8');
    return JSON.parse(contents);
  } catch (err) {
    if (err && err.code === 'ENOENT') return null;
    throw err;
  }
}

async function saveToFile(profile) {
  const dir = getDataDir();
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, PROFILE_FILENAME);
  await writeFile(filePath, JSON.stringify(profile, null, 2), 'utf8');
  return profile;
}

async function loadFromBlob() {
  const { head, BlobNotFoundError } = await import('@vercel/blob');
  let blob;
  try {
    blob = await head(BLOB_PATHNAME);
  } catch (err) {
    if (err instanceof BlobNotFoundError) return null;
    throw err;
  }
  const response = await fetch(blob.url);
  return response.json();
}

async function saveToBlob(profile) {
  const { put } = await import('@vercel/blob');
  await put(BLOB_PATHNAME, JSON.stringify(profile, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  return profile;
}

export async function loadProfile() {
  if (useBlobBackend()) return loadFromBlob();
  return loadFromFile();
}

export async function saveProfile(profile) {
  profile.meta.updatedAt = new Date().toISOString();
  if (useBlobBackend()) return saveToBlob(profile);
  return saveToFile(profile);
}
