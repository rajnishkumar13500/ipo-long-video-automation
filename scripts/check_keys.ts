import { getCartesiaKeys, checkCartesiaKey } from "./key_manager";

async function main() {
  console.log("\n==================================================================");
  console.log("🔑 CARTESIA MULTI-KEY HEALTH & STATUS CHECKER (SONIC ENGINE)");
  console.log("==================================================================");

  const keys = getCartesiaKeys();
  if (keys.length === 0) {
    console.log("❌ No Cartesia keys found in .env or cartesia_keys.txt!");
    console.log("👉 Get your API key(s) from: https://play.cartesia.ai/keys");
    console.log("   Then add them to .env or cartesia_keys.txt.");
    process.exit(1);
  }

  console.log(`📡 Discovered ${keys.length} key(s) across .env and cartesia_keys.txt. Validating against Cartesia API...\n`);

  let activeCount = 0;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const info = await checkCartesiaKey(key);

    const padIdx = String(i + 1).padStart(2, " ");
    const keyLabel = `[${info.masked}]`;

    if (info.status === "active") {
      activeCount++;
      const voiceInfo = info.voiceCount !== undefined ? `(${info.voiceCount} voices accessible)` : "";
      console.log(`   ${padIdx}. ${keyLabel}  ✅ ACTIVE ${voiceInfo}`);
    } else if (info.status === "exhausted") {
      console.log(`   ${padIdx}. ${keyLabel}  ❌ EXHAUSTED / RATE LIMITED (${info.error || "quota limit"})`);
    } else if (info.status === "invalid") {
      console.log(`   ${padIdx}. ${keyLabel}  ⚠️ INVALID (${info.error || "unauthorized"})`);
    } else {
      console.log(`   ${padIdx}. ${keyLabel}  ⚠️ ${info.status.toUpperCase()} (${info.error || "failed"})`);
    }
  }

  console.log("\n------------------------------------------------------------------");
  console.log("📊 Summary:");
  console.log(`   • Verified Active Keys: ${activeCount} / ${keys.length}`);
  console.log("------------------------------------------------------------------");
  console.log("💡 How to add more keys (from https://play.cartesia.ai/keys):");
  console.log("   1. In cartesia_keys.txt: Simply paste new keys one per line.");
  console.log("   2. In .env: CARTESIA_API_KEY_1=..., CARTESIA_API_KEY_2=...");
  console.log("   3. In .env: CARTESIA_API_KEYS=key1,key2,key3");
  console.log("==================================================================\n");
}

main().catch((err) => {
  console.error("Fatal error checking keys:", err);
  process.exit(1);
});
