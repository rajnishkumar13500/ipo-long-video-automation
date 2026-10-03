import { EdgeTTS } from "@andresaya/edge-tts";
import fs from "fs";
import path from "path";

async function main() {
  const sampleDir = path.resolve(__dirname, "../public/audio/samples");
  if (!fs.existsSync(sampleDir)) fs.mkdirSync(sampleDir, { recursive: true });

  const sampleText =
    "ACEVECTOR IPO is live with a 420 crore issue. Should you apply or avoid? Let's check the numbers.";

  const maleVoicesToSample = [
    {
      id: "en-IN-PrabhatNeural",
      filename: "sample_1_prabhat_english.mp3",
      label: "Prabhat (Indian English Male - Crisp, Energetic Financial Creator)",
      rate: "+5%",
    },
    {
      id: "hi-IN-MadhurNeural",
      filename: "sample_2_madhur_hindi_english.mp3",
      label: "Madhur (Indian Male - Deep, Authoritative, News Anchor)",
      rate: "+0%",
    },
    {
      id: "ur-IN-SalmanNeural",
      filename: "sample_3_salman_warm.mp3",
      label: "Salman (Indian Male - Warm, Confident, Modern Narrator)",
      rate: "+4%",
    },
    {
      id: "en-IN-NeerjaExpressiveNeural",
      filename: "sample_4_neerja_female.mp3",
      label: "Neerja Expressive (Indian Female - Crisp & Professional)",
      rate: "+5%",
    },
  ];

  console.log("Generating Indian voice samples for comparison...\n");

  for (const voice of maleVoicesToSample) {
    console.log(`🎙️ Generating: ${voice.label}...`);
    const t = new EdgeTTS();
    await t.synthesize(sampleText, voice.id, { rate: voice.rate });
    const outPath = path.join(sampleDir, voice.filename);
    const buffer = t.toBuffer();
    fs.writeFileSync(outPath, buffer);
    const size = buffer.byteLength;
    console.log(`   ✅ Saved to: public/audio/samples/${voice.filename} (${size} bytes)`);
  }

  console.log("\n🎉 All samples generated successfully in: public/audio/samples/");
}

main().catch(console.error);
