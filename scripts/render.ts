import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { recordIPO, ProcessedIPO } from "./tracker";
import { IPOData } from "../src/types/ipo";

export function renderIPOVideo(ipoData: IPOData, dataFilePath?: string): string {
  const outDir = path.resolve(__dirname, "../out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Ensure JSON file exists
  let jsonPath = dataFilePath;
  if (!jsonPath) {
    jsonPath = path.resolve(__dirname, `../src/data/${ipoData.id}.json`);
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    fs.writeFileSync(jsonPath, JSON.stringify(ipoData, null, 2), "utf-8");
  }

  const outFileName = `${ipoData.id}.mp4`;
  const outPath = path.join(outDir, outFileName);

  console.log(`\n🎬 Starting render for ${ipoData.companyName}...`);
  console.log(`   Output: out/${outFileName}`);
  console.log(`   Props: ${path.relative(process.cwd(), jsonPath)}`);

  // Record as in-progress
  const trackerEntry: ProcessedIPO = {
    id: ipoData.id,
    companyName: ipoData.companyName,
    listingDate: ipoData.listingDate,
    status: "in_progress",
    processedAt: new Date().toISOString(),
    dataPath: path.relative(process.cwd(), jsonPath).replace(/\\/g, "/"),
    videoPath: `out/${outFileName}`,
  };
  recordIPO(trackerEntry);

  try {
    const cmd = `npx remotion render src/index.ts IPOVideo "out/${outFileName}" --props="${jsonPath.replace(/\\/g, "/")}" --concurrency=6`;
    console.log(`   Running: ${cmd}`);
    execSync(cmd, { stdio: "inherit" });

    // Mark completed
    trackerEntry.status = "completed";
    trackerEntry.processedAt = new Date().toISOString();
    recordIPO(trackerEntry);

    console.log(`\n✅ Render completed successfully: out/${outFileName}`);
    return outPath;
  } catch (error: any) {
    trackerEntry.status = "failed";
    trackerEntry.error = error?.message || String(error);
    recordIPO(trackerEntry);
    console.error(`\n❌ Render failed for ${ipoData.companyName}:`, error);
    throw error;
  }
}
