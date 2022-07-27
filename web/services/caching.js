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
  const cached = await getCachedItemDB(key);

  if (cached) {
    return cached;
  } else {
    (await dbPromise()).put(tableName, {
      key,
      item,
      validUntil: Number(new Date() / 1000) + validFor,
    });
    return item;
  }
}

export async function getCachedItemDB(key) {
  if (typeof indexedDB == 'undefined') return null;
  const cached = await (await dbPromise()).get(tableName, key);

  if (cached && cached.item) {
    if (cached.validUntil > Number(new Date() / 1000)) {
      return cached.item;
    } else {
      (await dbPromise()).delete(tableName, key);
    }
  }
  return null;
}

export function cacheItem(key, item, validFor = 60) {
  const cached = getCachedItem(key);

  if (cached) {
    return cached;
  } else {
    localStorage.setItem(
      `CASAMA_CACHE_${key}`,
      JSON.stringify({ item, validUntil: Number(new Date() / 1000) + validFor })
    );
    return item;
  }
}

export function getCachedItem(key) {
  const cached = JSON.parse(localStorage.getItem(`CASAMA_CACHE_${key}`));

  if (cached && cached.item) {
    if (cached.validUntil > Number(new Date() / 1000)) {
      return cached.item;
    } else {
      localStorage.removeItem(`CASAMA_CACHE_${key}`);
    }
  }
  return null;
}
