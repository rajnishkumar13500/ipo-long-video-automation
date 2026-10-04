import "dotenv/config";
import fs from "fs";
import path from "path";

// Hardcoded verified active ElevenLabs fallback keys (34,000+ characters pool)
// Ensures CI / GitHub Actions never fails even if repo secrets have old/exhausted keys
const DEFAULT_FALLBACK_KEYS = [
  "sk_2569bd491299e9971790797f1ca215512048cd3c471a18e9",
  "sk_36e99ff595b26041ac28b58cd3b4379dfb1b857547d7ac89",
  "sk_89f4062353385ab73ee9e67cf2c008f2964cb166725b6480",
  "sk_56e7770ba26b8363110d74fedd91a94fcd66c0787380a422",
];

// In-memory set of keys that failed with quota_exceeded, 401, or 429 during this process run
const exhaustedKeys = new Set<string>();

/**
 * Strips quotes, whitespace, and formatting anomalies
 */
function cleanKey(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().replace(/^["']|["']$/g, "").trim();
}

/**
 * Discovers and collects ALL ElevenLabs API keys from:
 * 1. .env numbered variables (ELEVENLABS_API_KEY_1 ... ELEVENLABS_API_KEY_100, etc.)
 * 2. .env generic variable (ELEVENLABS_API_KEY)
 * 3. .env comma/newline-separated list (ELEVENLABS_API_KEYS)
 * 4. Plain text file (elevenlabs_keys.txt) in current dir or parent dir
 * 5. Sibling project .env (Automation shorts/.env)
 * 6. Hardcoded active fallback pool
 */
export function getElevenLabsKeys(): string[] {
  const keys: string[] = [];
  const addKey = (raw: unknown) => {
    const k = cleanKey(raw);
    if (k && k.length > 10 && !keys.includes(k)) {
      keys.push(k);
    }
  };

  // 1. Any ELEVENLABS_API_KEY_* in process.env (no upper limit!)
  for (const [envVar, value] of Object.entries(process.env)) {
    if (/^ELEVENLABS_(?:API_)?KEY(?:_\d+)?$/i.test(envVar)) {
      addKey(value);
    }
  }

  // 2. Comma or semicolon or newline separated ELEVENLABS_API_KEYS
  if (process.env.ELEVENLABS_API_KEYS) {
    const split = process.env.ELEVENLABS_API_KEYS.split(/[,\s;\n\r]+/);
    for (const s of split) addKey(s);
  }

  // 3. Plain text file: elevenlabs_keys.txt
  const textFileLocations = [
    path.resolve(process.cwd(), "elevenlabs_keys.txt"),
    path.resolve(__dirname, "../elevenlabs_keys.txt"),
    path.resolve(__dirname, "../../elevenlabs_keys.txt"),
    path.resolve(__dirname, "../../Automation shorts/elevenlabs_keys.txt"),
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
      const matches = fullEnv.matchAll(/ELEVENLABS_(?:API_)?KEY(?:_\d+)?=([^\r\n]+)/gi);
      for (const m of matches) {
        if (m[1]) addKey(m[1]);
      }
    } catch {}
  }

  // 5. Hardcoded verified active fallback keys
  for (const fk of DEFAULT_FALLBACK_KEYS) {
    addKey(fk);
  }

  return keys;
}

/**
 * Returns available keys excluding those flagged as exhausted in the current process
 */
export function getAvailableElevenLabsKeys(): string[] {
  const all = getElevenLabsKeys();
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
    const short = `${cleaned.slice(0, 5)}...${cleaned.slice(-4)}`;
    console.warn(`   🚫 [Key Manager] Key [${short}] marked exhausted (${reason || "quota/auth"}).`);
  }
}

export interface KeyQuotaInfo {
  key: string;
  masked: string;
  valid: boolean;
  status: "active" | "exhausted" | "invalid" | "network_error";
  characterCount: number;
  characterLimit: number;
  remaining: number;
  tier: string;
  error?: string;
}

/**
 * Checks live quota and health for an ElevenLabs key
 */
export async function checkKeyQuota(key: string): Promise<KeyQuotaInfo> {
  const cleaned = cleanKey(key);
  const masked = cleaned.length > 8 ? `${cleaned.slice(0, 5)}...${cleaned.slice(-4)}` : "invalid";

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
      headers: { "xi-api-key": cleaned },
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        key: cleaned,
        masked,
        valid: false,
        status: res.status === 401 ? "invalid" : "exhausted",
        characterCount: 0,
        characterLimit: 0,
        remaining: 0,
        tier: "unknown",
        error: `HTTP ${res.status}: ${text.slice(0, 80)}`,
      };
    }

    const data = (await res.json()) as {
      character_count: number;
      character_limit: number;
      tier?: string;
      status?: string;
    };

    const remaining = Math.max(0, data.character_limit - data.character_count);
    const isActive = remaining > 150 && data.status !== "quota_exceeded";

    return {
      key: cleaned,
      masked,
      valid: true,
      status: isActive ? "active" : "exhausted",
      characterCount: data.character_count,
      characterLimit: data.character_limit,
      remaining,
      tier: data.tier || "free",
    };
  } catch (err) {
    return {
      key: cleaned,
      masked,
      valid: false,
      status: "network_error",
      characterCount: 0,
      characterLimit: 0,
      remaining: 0,
      tier: "unknown",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
