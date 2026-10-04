import { getElevenLabsKeys, checkKeyQuota } from "./key_manager";

async function main() {
  console.log("\n==================================================================");
  console.log("🔑 ELEVENLABS MULTI-KEY QUOTA & HEALTH CHECKER (FULL-LENGTH)");
  console.log("==================================================================");

  const keys = getElevenLabsKeys();
  if (keys.length === 0) {
    console.log("❌ No ElevenLabs keys found in .env or elevenlabs_keys.txt!");
    process.exit(1);
  }

  console.log(`📡 Discovered ${keys.length} key(s) across .env, text files & pool. Checking live quotas...\n`);

  let activeCount = 0;
  let totalRemainingChars = 0;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const info = await checkKeyQuota(key);

    const padIdx = String(i + 1).padStart(2, " ");
    const keyLabel = `[${info.masked}]`;

    if (info.status === "active") {
      activeCount++;
      totalRemainingChars += info.remaining;
      const remStr = info.remaining.toLocaleString().padStart(6, " ");
      const usedStr = `${info.characterCount.toLocaleString()}/${info.characterLimit.toLocaleString()}`;
      console.log(`   ${padIdx}. ${keyLabel}  ✅ ACTIVE   ${remStr} chars left (${usedStr} used)`);
    } else if (info.status === "exhausted") {
      const remStr = info.remaining.toLocaleString().padStart(6, " ");
      const usedStr = `${info.characterCount.toLocaleString()}/${info.characterLimit.toLocaleString()}`;
      console.log(`   ${padIdx}. ${keyLabel}  ❌ EXHAUSTED   ${remStr} chars left (${usedStr} used)`);
    } else {
      console.log(`   ${padIdx}. ${keyLabel}  ⚠️ ${info.status.toUpperCase()} (${info.error || "failed"})`);
    }
  }

  const estimatedVideos = Math.floor(totalRemainingChars / 3500);

  console.log("\n------------------------------------------------------------------");
  console.log("📊 Summary:");
  console.log(`   • Active Keys with Credits: ${activeCount} / ${keys.length}`);
  console.log(`   • Total Available Capacity: ${totalRemainingChars.toLocaleString()} characters`);
  console.log(`   • Estimated Full-Length Capacity: ~${estimatedVideos} full videos (at ~3,500 chars/video)`);
  console.log("------------------------------------------------------------------");
  console.log("💡 How to add more keys:");
  console.log("   1. In .env: Add ELEVENLABS_API_KEY_9, ELEVENLABS_API_KEY_10, etc.");
  console.log("   2. In elevenlabs_keys.txt: Simply paste new keys one per line.");
  console.log("   3. In .env: ELEVENLABS_API_KEYS=key1,key2,key3");
  console.log("==================================================================\n");
}

main().catch((err) => {
  console.error("Fatal error checking keys:", err);
  process.exit(1);
});
