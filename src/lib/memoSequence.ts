import { CourierParcel } from '../types';

const BASE_START_SERIAL = 260001;
const STORAGE_SEQ_KEY = 'taqwa_last_memo_sequence';
const STORAGE_PARCELS_KEY = 'taqwa_courier_parcels';

/**
 * Retrieves all known memo / consignment IDs from memory and localStorage
 */
export function getAllKnownMemoIds(existingParcels: CourierParcel[] = []): Set<string> {
  const ids = new Set<string>();

  // 1. In-memory parcels
  existingParcels.forEach(p => {
    if (!p) return;
    if (p.consignmentId) ids.add(String(p.consignmentId).trim());
    if (p.cnNumber) ids.add(String(p.cnNumber).trim());
    if ((p as any).memoNo) ids.add(String((p as any).memoNo).trim());
  });

  // 2. LocalStorage parcels
  try {
    const raw = localStorage.getItem(STORAGE_PARCELS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(p => {
          if (!p) return;
          if (p.consignmentId) ids.add(String(p.consignmentId).trim());
          if (p.cnNumber) ids.add(String(p.cnNumber).trim());
          if ((p as any).memoNo) ids.add(String((p as any).memoNo).trim());
        });
      }
    }
  } catch (e) {
    // Ignore parse errors
  }

  return ids;
}

/**
 * Generates the next guaranteed UNIQUE, sequential Memo Number starting from 260001.
 * e.g., 260001, 260002, 260003...
 */
export function getNextAutoMemoNumber(existingParcels: CourierParcel[] = []): string {
  const knownIds = getAllKnownMemoIds(existingParcels);

  // Find the highest numeric serial in the 260000+ range
  let maxFoundSerial = BASE_START_SERIAL - 1; // 260000

  // Check stored sequence pointer
  try {
    const storedSeq = localStorage.getItem(STORAGE_SEQ_KEY);
    if (storedSeq) {
      const num = parseInt(storedSeq, 10);
      if (!isNaN(num) && num >= BASE_START_SERIAL) {
        if (num > maxFoundSerial) {
          maxFoundSerial = num;
        }
      }
    }
  } catch (e) {
    // Ignore
  }

  // Scan all existing known parcel IDs
  knownIds.forEach(id => {
    const num = parseInt(id, 10);
    // If it's a 6-digit number in the 26xxxx range
    if (!isNaN(num) && num >= BASE_START_SERIAL && num < 299999) {
      if (num > maxFoundSerial) {
        maxFoundSerial = num;
      }
    }
  });

  // Compute next candidate serial
  let candidate = maxFoundSerial + 1;
  if (candidate < BASE_START_SERIAL) {
    candidate = BASE_START_SERIAL;
  }

  // Guarantee no collision
  while (knownIds.has(String(candidate))) {
    candidate++;
  }

  return String(candidate);
}

/**
 * Records that a memo number has been committed, updating the sequence pointer.
 */
export function commitMemoNumber(memoNumber: string): void {
  try {
    const num = parseInt(memoNumber, 10);
    if (!isNaN(num) && num >= BASE_START_SERIAL) {
      const stored = localStorage.getItem(STORAGE_SEQ_KEY);
      const currentStored = stored ? parseInt(stored, 10) : 0;
      if (num > currentStored) {
        localStorage.setItem(STORAGE_SEQ_KEY, String(num));
      }
    }
  } catch (e) {
    // Ignore
  }
}

/**
 * Checks if a memo number is already taken by another parcel
 */
export function isMemoNumberDuplicate(
  memoNumber: string,
  existingParcels: CourierParcel[] = [],
  currentEditingId?: string | null
): boolean {
  if (!memoNumber || !memoNumber.trim()) return false;
  const target = memoNumber.trim();

  // Check in-memory parcels
  const inMemDup = existingParcels.some(p => {
    if (!p) return false;
    if (currentEditingId && p.id === currentEditingId) return false;
    return (
      String(p.consignmentId || '').trim() === target ||
      String(p.cnNumber || '').trim() === target
    );
  });
  if (inMemDup) return true;

  // Check localStorage parcels
  try {
    const raw = localStorage.getItem(STORAGE_PARCELS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.some(p => {
          if (!p) return false;
          if (currentEditingId && p.id === currentEditingId) return false;
          return (
            String(p.consignmentId || '').trim() === target ||
            String(p.cnNumber || '').trim() === target
          );
        });
      }
    }
  } catch (e) {
    // Ignore
  }

  return false;
}
