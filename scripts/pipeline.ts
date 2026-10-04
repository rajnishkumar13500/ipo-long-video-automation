import fs from "fs";
import path from "path";
import { getUnprocessedIPOs, DiscoveredIPO } from "./discover";
import { extractIPODataFromUrl } from "./extract_ipo";
import { generateIPOScripts } from "./generate_script";
import { generateAudioAndTimeline } from "./generate_audio";
import { renderIPOVideo } from "./render";
import { uploadIPOToDrive } from "./upload_drive";
import { IPOData } from "../src/types/ipo";
import { loadTracker, recordIPO } from "./tracker";
import { ensureVerifiedCompanyLogo } from "./logo_fetcher";

async function runPipeline() {
  console.log("==================================================");
  console.log("🚀  IPO VIDEO AUTOMATION PIPELINE");
  console.log("==================================================");

  // Parse CLI args
  const args = process.argv.slice(2);
  let targetSlug = "";
  let targetVoice = "";
  let forceScripts = false;
  let forceAudio = false;
  let uploadDrive = false;

  for (const arg of args) {
    if (arg.startsWith("--ipo=")) {
      targetSlug = arg.replace("--ipo=", "").trim().toLowerCase();
    }
    if (arg.startsWith("--voice=")) {
      targetVoice = arg.replace("--voice=", "").trim();
    }
    if (arg === "--force-scripts") {
      forceScripts = true;
    }
    if (arg === "--force-audio") {
      forceAudio = true;
    }
    if (arg === "--upload-drive") {
      uploadDrive = true;
    }
  }

  let selectedIPO: DiscoveredIPO | null = null;
  let ipoData: IPOData | null = null;
  let jsonPath = "";

  if (targetSlug) {
    console.log(`\n🎯 Specific IPO requested: ${targetSlug}`);
    jsonPath = path.resolve(__dirname, `../src/data/${targetSlug}.json`);
    if (fs.existsSync(jsonPath)) {
      ipoData = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as IPOData;
    } else {
      console.error(`❌ Data file not found: ${jsonPath}`);
      console.log(
        `💡 Create the data file at src/data/${targetSlug}.json or run without --ipo to discover new IPOs.`
      );
      process.exit(1);
    }
  } else {
    console.log("\n📡 Step 1: Checking tracking store & discovering latest IPOs...");
    const tracker = loadTracker();
    console.log(
      `   Previously processed IPOs: ${tracker.history.map((h) => h.companyName).join(", ") || "None"}`
    );

    const unprocessed = await getUnprocessedIPOs();
    if (unprocessed.length === 0) {
      console.log("\n✨ All discovered IPOs have already been processed! Nothing to do.");
      return;
    }

    console.log(`\n📋 Found ${unprocessed.length} unworked IPO(s):`);
    unprocessed.forEach((u, i) => console.log(`   ${i + 1}. ${u.companyName} (${u.slug})`));

    // Select the first unprocessed IPO
    selectedIPO = unprocessed[0];
    console.log(`\n👉 Selected for processing: ${selectedIPO.companyName} (${selectedIPO.slug})`);

    jsonPath = path.resolve(__dirname, `../src/data/${selectedIPO.slug}.json`);
    if (fs.existsSync(jsonPath)) {
      console.log(`   Found existing data file: src/data/${selectedIPO.slug}.json`);
      ipoData = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as IPOData;
    } else {
      console.log(`   No local data file found for ${selectedIPO.slug}. Automatically extracting from article URL...`);
      ipoData = await extractIPODataFromUrl(selectedIPO.link, selectedIPO.companyName, selectedIPO.slug);
    }
  }

  // Step 1.5: Verify & Fetch Company Brand Logo across multi-website fallback cascade
  console.log("\n🎨 Step 1.5: Verifying Company Logo & Brand Assets...");
  const logoResult = await ensureVerifiedCompanyLogo(ipoData);
  fs.writeFileSync(jsonPath, JSON.stringify(ipoData, null, 2), "utf-8");
  if (logoResult.success) {
    console.log(`   ✅ Verified logo saved at: ${ipoData.logoUrl} [Provider: ${logoResult.provider}]`);
  } else {
    console.log(`   ℹ️ No valid web logo found across 6 providers. Using verified executive monogram badge.`);
  }

  // Step 2: Script Generation (Groq -> Gemini -> Deterministic safety net)
  console.log("\n📝 Step 2: Generating Scene Narration Scripts...");
  if (!ipoData.scripts || forceScripts) {
    const scriptResult = await generateIPOScripts(ipoData);
    ipoData.scripts = scriptResult.scripts;
    fs.writeFileSync(jsonPath, JSON.stringify(ipoData, null, 2), "utf-8");
    console.log(`   ✅ Script generated successfully via [${scriptResult.source}]`);
  } else {
    console.log(`   ⚡ Scripts already exist in dataset. (Use --force-scripts to re-generate)`);
  }

  // Step 3: Voiceover Audio Synthesis & Precision Timeline Synchronization
  console.log("\n🎙️ Step 3: Synthesizing Audio & Syncing Video Timeline...");
  const audioResult = await generateAudioAndTimeline(ipoData, {
    force: forceAudio,
    voiceId: targetVoice || undefined,
  });
  ipoData.timeline = audioResult.timeline;
  fs.writeFileSync(jsonPath, JSON.stringify(ipoData, null, 2), "utf-8");
  console.log(
    `   ✅ Audio synced! Total duration: ${audioResult.timeline.totalFrames} frames (~${(
      audioResult.timeline.totalFrames / 30
    ).toFixed(1)}s)`
  );

  // Step 4: Render Video with Remotion
  console.log("\n🎥 Step 4: Rendering animated 16:9 widescreen long-form video with Remotion...");
  let videoPath = "";
  try {
    videoPath = renderIPOVideo(ipoData, jsonPath);
    console.log("\n==================================================");
    console.log("🎉  RENDER COMPLETE!");
    console.log(`📹  Video File: ${videoPath}`);
    console.log(`📊  Data File:  ${jsonPath}`);
    console.log(`🎧  Audio Dir:  public/audio/${ipoData.id}/`);
    console.log(`⏱️  Duration:   ${ipoData.timeline.totalFrames} frames (~${(ipoData.timeline.totalFrames / 30 / 60).toFixed(2)} mins)`);
    console.log("==================================================");
  } catch (error) {
    console.error("\n❌ Pipeline failed during video rendering:", error);
    process.exit(1);
  }

  // Step 5: Google Drive Cloud Archiving
  const shouldUploadDrive =
    uploadDrive ||
    Boolean(
      process.env.GDRIVE_PARENT_FOLDER_ID &&
        (process.env.GDRIVE_REFRESH_TOKEN ||
          process.env.GDRIVE_SERVICE_ACCOUNT_KEY ||
          process.env.GOOGLE_APPLICATION_CREDENTIALS)
    );

  if (shouldUploadDrive) {
    console.log("\n☁️  Step 5: Archiving video and assets to Google Drive...");
    const driveResult = await uploadIPOToDrive(ipoData, videoPath);
    if (driveResult?.success) {
      recordIPO({
        id: ipoData.id,
        companyName: ipoData.companyName,
        listingDate: ipoData.listingDate,
        status: "completed",
        processedAt: new Date().toISOString(),
        dataPath: path.relative(process.cwd(), jsonPath).replace(/\\/g, "/"),
        videoPath: `out/${ipoData.id}.mp4`,
        driveFolderId: driveResult.folderId,
        driveFolderUrl: driveResult.folderUrl,
      });
      console.log(`   🔗 Live Google Drive Folder: ${driveResult.folderUrl}`);
    }
  } else {
    console.log("\n💡 Skipping Google Drive upload (credentials or GDRIVE_PARENT_FOLDER_ID not set).");
  }

  console.log("\n🏁 Pipeline execution successfully finished.");
}

runPipeline().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
