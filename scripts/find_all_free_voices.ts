import "dotenv/config";
import fs from "fs";
import path from "path";
import { getElevenLabsKeys } from "./generate_audio";

async function main() {
  const keys = getElevenLabsKeys();
  const key = keys[0];
  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": key || "" },
  });

  if (!res.ok) {
    console.error("Error fetching voices:", res.status, await res.text());
    return;
  }

  const data = (await res.json()) as { voices: any[] };

  // Filter only premade voices (the 100% free API voices)
  const premadeVoices = data.voices.filter((v: any) => v.category === "premade");

  console.log(`Found ${premadeVoices.length} official free premade voices:\n`);

  const results: any[] = [];

  for (const v of premadeVoices) {
    // Quick test to verify HTTP 200 via API
    const testRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.voice_id}`, {
      method: "POST",
      headers: { "xi-api-key": key || "", "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Testing API access.",
        model_id: "eleven_multilingual_v2",
      }),
    });

    const isAvailableOnFreeApi = testRes.ok;

    results.push({
      id: v.voice_id,
      name: v.name,
      gender: v.labels?.gender || "unknown",
      accent: v.labels?.accent || "standard",
      description: v.labels?.description || v.description || "",
      useCase: v.labels?.["use case"] || "",
      previewUrl: v.preview_url || "",
      apiStatus: testRes.status,
      worksOnFreeApi: isAvailableOnFreeApi,
    });
  }

  const outJson = path.resolve(__dirname, "../public/audio/samples/free_voices.json");
  fs.writeFileSync(outJson, JSON.stringify(results, null, 2));

  console.log("=== VERIFIED FREE VOICES ON ELEVENLABS API ===");
  results.forEach((r) => {
    const statusIcon = r.worksOnFreeApi ? "✅" : "❌";
    console.log(
      `${statusIcon} [${r.gender.toUpperCase()}] ${r.name.padEnd(12)} | ID: ${r.id} | Accent: ${r.accent} | Use case: ${r.useCase || r.description}`
    );
  });
}

main().catch(console.error);
