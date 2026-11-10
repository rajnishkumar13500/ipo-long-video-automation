import "dotenv/config";
import fs from "fs";
import path from "path";

// In-memory set of keys that failed with quota_exceeded, 401, 402, or 429 during this process run
const exhaustedKeys = new Set<string>();

/**
 * Strips quotes, whitespace, and formatting anomalies
 */
function cleanKey(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().replace(/^["']|["']$/g, "").trim();
}

/**
 * Discovers and collects ALL Cartesia API keys from:
 * 1. .env numbered variables (CARTESIA_API_KEY_1 ... CARTESIA_API_KEY_100, etc.)
 * 2. .env generic variable (CARTESIA_API_KEY)
 * 3. .env comma/newline/space-separated list (CARTESIA_API_KEYS)
 * 4. Plain text file (cartesia_keys.txt) in current dir or parent dir
 * 5. Sibling project .env or cartesia_keys.txt
 */
export function getCartesiaKeys(): string[] {
  const keys: string[] = [];
  const addKey = (raw: unknown) => {
    const k = cleanKey(raw);
    if (k && k.length > 8 && !keys.includes(k)) {
      keys.push(k);
    }
  };

  // 1. Any CARTESIA_API_KEY_* in process.env (no upper limit!)
  for (const [envVar, value] of Object.entries(process.env)) {
    if (/^CARTESIA_(?:API_)?KEY(?:_\d+)?$/i.test(envVar)) {
      addKey(value);
    }
  }

  // 2. Comma or semicolon or newline separated CARTESIA_API_KEYS
  if (process.env.CARTESIA_API_KEYS) {
    const split = process.env.CARTESIA_API_KEYS.split(/[,\s;\n\r]+/);
    for (const s of split) addKey(s);
  }

  // 3. Plain text file: cartesia_keys.txt
  const textFileLocations = [
    path.resolve(process.cwd(), "cartesia_keys.txt"),
    path.resolve(__dirname, "../cartesia_keys.txt"),
    path.resolve(__dirname, "../../cartesia_keys.txt"),
    path.resolve(__dirname, "../../Automation shorts/cartesia_keys.txt"),
  ];

  for (const tf of textFileLocations) {
    if (fs.existsSync(tf)) {
      try {
        const lines = fs.readFileSync(tf, "utf-8").split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            addKey(trimmed);
          }
        }
      } catch (err) {
        console.warn(`⚠️ [Key Manager] Error reading ${tf}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  // 4. Sibling project fallback: Automation shorts/.env
  const siblingEnvPath = path.resolve(__dirname, "../../Automation shorts/.env");
  if (fs.existsSync(siblingEnvPath)) {
    try {
      const fullEnv = fs.readFileSync(siblingEnvPath, "utf-8");
      const matches = fullEnv.matchAll(/CARTESIA_(?:API_)?KEY(?:_\d+)?=([^\r\n]+)/gi);
      for (const m of matches) {
        if (m[1]) addKey(m[1]);
      }
      const listMatch = fullEnv.match(/CARTESIA_API_KEYS=([^\r\n]+)/i);
      if (listMatch && listMatch[1]) {
        for (const k of listMatch[1].split(/[,\s;\n\r]+/)) {
          addKey(k);
        }
      }
    } catch {}
  }

  return keys;
}

/**
 * Returns available keys excluding those flagged as exhausted in the current process
 */
export function getAvailableCartesiaKeys(): string[] {
  const all = getCartesiaKeys();
  const available = all.filter((k) => !exhaustedKeys.has(k));
  return available.length > 0 ? available : all;
}

/**
 * Marks a key as exhausted for the lifetime of this process
 */
export function markKeyExhausted(key: string, reason?: string) {
  const cleaned = cleanKey(key);
  if (cleaned) {
    exhaustedKeys.add(cleaned);
    const short = `${cleaned.slice(0, 7)}...${cleaned.slice(-4)}`;
    console.warn(`   🚫 [Cartesia Key Manager] Key [${short}] marked exhausted (${reason || "quota/auth"}).`);
  }
}

/**
 * Resets the in-memory exhausted keys registry
 */
export function resetExhaustedKeys(): void {
  exhaustedKeys.clear();
}

/**
 * Masks an API key for safe terminal logging
 */
export function maskKey(key: string): string {
  const cleaned = cleanKey(key);
  if (!cleaned) return "empty";
  if (cleaned.length <= 10) return `${cleaned.slice(0, 3)}***`;
  return `${cleaned.slice(0, 7)}...${cleaned.slice(-4)}`;
}

export interface CartesiaKeyStatus {
  key: string;
  masked: string;
  valid: boolean;
  status: "active" | "exhausted" | "invalid" | "network_error";
  voiceCount?: number;
  error?: string;
}

/**
 * Checks live validity and health for a Cartesia API key against the official API
 */
export async function checkCartesiaKey(key: string): Promise<CartesiaKeyStatus> {
  const cleaned = cleanKey(key);
  const masked = maskKey(cleaned);

  try {
    const res = await fetch("https://api.cartesia.ai/voices", {
      headers: {
        "X-API-Key": cleaned,
        "Authorization": `Bearer ${cleaned}`,
        "Cartesia-Version": "2024-06-10",
      },
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      const count = Array.isArray(data) ? data.length : 0;
      return {
        key: cleaned,
        masked,
        valid: true,
        status: "active",
        voiceCount: count,
      };
    }

    const text = await res.text();
    const isExhausted =
      res.status === 402 ||
      res.status === 429 ||
      text.toLowerCase().includes("quota") ||
      text.toLowerCase().includes("credit") ||
      text.toLowerCase().includes("limit") ||
      text.toLowerCase().includes("rate");

    return {
      key: cleaned,
      masked,
      valid: false,
      status: isExhausted ? "exhausted" : "invalid",
      error: `HTTP ${res.status}: ${text.slice(0, 100)}`,
    };
  } catch (err) {
    return {
      key: cleaned,
      masked,
      valid: false,
      status: "network_error",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// Backward-compatible aliases for existing script callers
export const getElevenLabsKeys = getCartesiaKeys;
export const getAvailableElevenLabsKeys = getAvailableCartesiaKeys;
export const checkKeyQuota = checkCartesiaKey;
