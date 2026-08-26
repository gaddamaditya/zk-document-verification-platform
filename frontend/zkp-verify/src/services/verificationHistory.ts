// ─── Verification History Service ───────────────────────────────
// Stores verification results in browser localStorage.
// Only safe, non-sensitive metadata is persisted.
// No document data, OCR text, or private information is stored.

const STORAGE_KEY = 'zkverify_verification_history';
const MAX_HISTORY = 20;

export interface VerificationRecord {
  /** Unique record ID (timestamp-based) */
  id: string;
  /** Proof ID (e.g. ZK-18BDB981), may be null for manual uploads */
  proofId: string | null;
  /** VALID or INVALID */
  status: 'VALID' | 'INVALID';
  /** Human-readable claim labels */
  claims: string[];
  /** ISO timestamp */
  timestamp: string;
  /** Circuit name if available */
  circuitName?: string;
}

/**
 * Retrieve all verification history records from localStorage.
 * Returns newest first.
 */
export function getHistory(): VerificationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Add a verification record to history.
 *
 * @param record - The record to add (id will be generated).
 * @param attemptId - A unique identifier for the current verification attempt.
 *   If a record with the same attemptId already exists, the write is skipped.
 *   This prevents double-writes within a single verification flow without
 *   blocking legitimate re-verifications of the same proofId later.
 */
export function addRecord(
  record: Omit<VerificationRecord, 'id'>,
  attemptId: string,
): void {
  try {
    const history = getHistory();

    // Per-attempt deduplication: skip if this exact attempt already wrote a record
    if (history.some((r) => r.id === attemptId)) {
      return;
    }

    const newRecord: VerificationRecord = {
      ...record,
      id: attemptId,
    };

    // Prepend (newest first) and cap at MAX_HISTORY
    const updated = [newRecord, ...history].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[VerificationHistory] Failed to save record:', err);
  }
}

/**
 * Clear all verification history from localStorage.
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[VerificationHistory] Failed to clear history:', err);
  }
}
