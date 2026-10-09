// Centralized database sync & event notification system

export const DB_UPDATE_EVENT = 'izhar_db_updated';
const DB_SYNC_STORAGE_KEY = 'izhar_db_last_sync';

/**
 * Triggers a real-time refresh notification across all open components
 * and across other browser tabs/windows.
 */
export function notifyDbChange() {
  if (typeof window !== 'undefined') {
    // 1. Dispatch custom event for current window
    window.dispatchEvent(new CustomEvent(DB_UPDATE_EVENT));

    // 2. Touch localStorage to notify any other open browser tabs/windows
    try {
      localStorage.setItem(DB_SYNC_STORAGE_KEY, Date.now().toString());
    } catch {
      // Ignore if localStorage is unavailable
    }
  }
}

/**
 * Listen for storage events from other tabs to trigger local re-render
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === DB_SYNC_STORAGE_KEY) {
      window.dispatchEvent(new CustomEvent(DB_UPDATE_EVENT));
    }
  });
}
