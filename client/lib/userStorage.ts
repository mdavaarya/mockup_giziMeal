// Helper untuk localStorage per-user
// Semua data disimpan dengan prefix userId agar tiap user punya data sendiri

export function userKey(userId: string, key: string): string {
  return `user_${userId}_${key}`;
}

export function getUserData<T>(userId: string, key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(userKey(userId, key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setUserData<T>(userId: string, key: string, value: T): void {
  localStorage.setItem(userKey(userId, key), JSON.stringify(value));
}

export function removeUserData(userId: string, key: string): void {
  localStorage.removeItem(userKey(userId, key));
}