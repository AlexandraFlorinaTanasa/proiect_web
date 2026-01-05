import { openDB } from 'idb';

const DB_NAME = 'TaskOfflineDB';
const STORE_NAME = 'pending_tasks';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const saveTaskOffline = async (task: any) => {
  const db = await initDB();
  await db.add(STORE_NAME, task);
  console.log("Sarcina a fost salvată local (offline).");
};

export const getOfflineTasks = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const clearOfflineTasks = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).clear();
  await tx.done;
};