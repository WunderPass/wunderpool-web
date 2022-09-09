import { openDB } from 'idb';
const dbName = 'CasamaCache';
const tableName = 'cache';

const dbPromise = () => {
  return openDB(dbName, 1, {
    upgrade(db) {
      db.createObjectStore(tableName, { keyPath: 'key' });
    },
  });
};

export async function cacheItemDB(key, item, validFor = 315360000) {
  if (typeof indexedDB == 'undefined') return item;
  const lowKey = key.toLowerCase();
  const cached = await getCachedItemDB(lowKey);

  if (cached) {
    return cached;
  } else {
    (await dbPromise()).put(tableName, {
      key: lowKey,
      item,
      validUntil: Number(new Date() / 1000) + validFor,
    });
    return item;
  }
}

export async function getCachedItemDB(key) {
  if (typeof indexedDB == 'undefined') return null;
  const lowKey = key.toLowerCase();
  const cached = await (await dbPromise()).get(tableName, lowKey);

  if (cached && cached.item) {
    if (cached.validUntil > Number(new Date() / 1000)) {
      return cached.item;
    } else {
      (await dbPromise()).delete(tableName, lowKey);
    }
  }
  return null;
}

export async function deleteItemDB(key) {
  if (typeof indexedDB == 'undefined') return null;
  const lowKey = key.toLowerCase();
  const cached = await getCachedItemDB(lowKey);
  (await dbPromise()).delete(tableName, lowKey);
  return cached;
}

export async function cacheImage(key, blob, validFor = 60) {
  if (typeof indexedDB == 'undefined') return blob;
  const lowKey = key.toLowerCase();
  const cached = await getCachedImage(lowKey);

  if (cached) {
    return cached;
  } else {
    const buffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('loadend', (e) => {
        resolve(reader.result);
      });
      reader.addEventListener('error', reject);
      reader.readAsArrayBuffer(blob);
    });
    (await dbPromise()).put(tableName, {
      key: lowKey,
      item: { buffer, type: blob.type },
      validUntil: Number(new Date() / 1000) + validFor,
    });
    return blob;
  }
}

export async function getCachedImage(key) {
  const lowKey = key.toLowerCase();
  const image = await getCachedItemDB(lowKey);

  if (image) {
    return new Blob([image.buffer], { type: image.type });
  }
  return null;
}

export async function cacheImageByURL(key, url, validFor = undefined) {
  const lowKey = key.toLowerCase();
  try {
    const imageBlob =
      (await getCachedImage(lowKey)) ||
      (await cacheImage(lowKey, await (await fetch(url)).blob(), validFor));

    return /image/.test(imageBlob.type) && imageBlob.size > 0
      ? URL.createObjectURL(imageBlob)
      : null;
  } catch (error) {
    return null;
  }
}
