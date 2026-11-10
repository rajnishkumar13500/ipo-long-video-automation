import "dotenv/config";
import fs from "fs";
import path from "path";
import { getCartesiaKeys, maskKey } from "./key_manager";

async function main() {
  const keys = getCartesiaKeys();
  if (keys.length === 0) {
    console.log("❌ No Cartesia API keys found in .env or cartesia_keys.txt!");
    console.log("👉 Please add your Cartesia API key from https://play.cartesia.ai/keys to .env or cartesia_keys.txt.");
    return;
  }

  const key = keys[0];
  console.log(`📡 Fetching Cartesia voice library using key [${maskKey(key)}]...\n`);

  const res = await fetch("https://api.cartesia.ai/voices", {
    headers: {
      "X-API-Key": key,
      "Authorization": `Bearer ${key}`,
      "Cartesia-Version": "2024-06-10",
    },
  });

  if (!res.ok) {
    console.error(`❌ Error fetching voices: HTTP ${res.status}`, await res.text());
    return;
  }

  const voices = (await res.json()) as any[];
  console.log(`Found ${voices.length} voices in Cartesia library.\n`);

  const outDir = path.resolve(__dirname, "../public/audio/samples");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outJson = path.join(outDir, "cartesia_voices.json");
  fs.writeFileSync(outJson, JSON.stringify(voices, null, 2), "utf-8");
  console.log(`💾 Saved full voice catalog to: public/audio/samples/cartesia_voices.json\n`);

  console.log("=== POPULAR & FEATURED CARTESIA VOICES ===");
  const popularVoices = voices.slice(0, 25);
  popularVoices.forEach((v: any, i: number) => {
    const padIdx = String(i + 1).padStart(2, " ");
    const name = (v.name || "Unnamed").padEnd(20);
    const lang = v.language || (v.languages ? v.languages.join(", ") : "multilingual");
    console.log(`${padIdx}. ${name} | ID: ${v.id} | Lang: ${lang}`);
  });

  console.log("\n💡 Set your preferred voice in .env: CARTESIA_VOICE_ID=<voice_id>");
}

main().catch(console.error);
