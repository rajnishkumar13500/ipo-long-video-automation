import fs from "fs";
import path from "path";

export interface ProcessedIPO {
  id: string;
  companyName: string;
  listingDate?: string;
  issueSizeCr?: number;
  status: "in_progress" | "completed" | "failed";
  processedAt: string;
  dataPath?: string;
  videoPath?: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
  error?: string;
}

export interface TrackingStore {
  version: number;
  lastUpdated: string;
  history: ProcessedIPO[];
}

const TRACKER_PATH = path.resolve(__dirname, "../data/processed_ipos.json");
const MAX_HISTORY = 50;

export function loadTracker(): TrackingStore {
  if (!fs.existsSync(TRACKER_PATH)) {
    const initial: TrackingStore = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      history: [],
    };
    fs.mkdirSync(path.dirname(TRACKER_PATH), { recursive: true });
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  const raw = fs.readFileSync(TRACKER_PATH, "utf-8");
  return JSON.parse(raw) as TrackingStore;
}

export function saveTracker(store: TrackingStore): void {
  store.lastUpdated = new Date().toISOString();
  if (store.history.length > MAX_HISTORY) {
    store.history = store.history.slice(0, MAX_HISTORY);
  }
  fs.mkdirSync(path.dirname(TRACKER_PATH), { recursive: true });
  fs.writeFileSync(TRACKER_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isIPOProcessed(idOrName: string): boolean {
  const store = loadTracker();
  const normalized = normalizeName(idOrName);
  return store.history.some(
    (item) =>
      item.status === "completed" &&
      (normalizeName(item.id) === normalized ||
        normalizeName(item.companyName) === normalized ||
        normalized.includes(normalizeName(item.companyName)) ||
        normalizeName(item.companyName).includes(normalized))
  );
}

export function recordIPO(entry: ProcessedIPO): void {
  const store = loadTracker();
  const existingIdx = store.history.findIndex(
    (h) => normalizeName(h.id) === normalizeName(entry.id)
  );
  if (existingIdx >= 0) {
    store.history[existingIdx] = entry;
  } else {
    // Put newest processed item at the beginning
    store.history.unshift(entry);
  }
  // Enforce sliding window of last 50 items
  if (store.history.length > MAX_HISTORY) {
    store.history = store.history.slice(0, MAX_HISTORY);
  }
  saveTracker(store);
}

