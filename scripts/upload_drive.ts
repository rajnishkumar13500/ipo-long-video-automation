import fs from "fs";
import path from "path";
import { google } from "googleapis";
import dotenv from "dotenv";
import { IPOData } from "../src/types/ipo";

dotenv.config();

export interface DriveUploadResult {
  success: boolean;
  folderName: string;
  folderId: string;
  folderUrl: string;
  uploadedFiles: {
    name: string;
    id: string;
    subfolder?: string;
  }[];
}

/**
 * Parses Google Service Account credentials from environment variables.
 * Supports:
 * 1. JSON string in GDRIVE_SERVICE_ACCOUNT_KEY
 * 2. Base64-encoded JSON string in GDRIVE_SERVICE_ACCOUNT_KEY
 * 3. File path in GOOGLE_APPLICATION_CREDENTIALS
 */
function getServiceAccountCredentials(): any | null {
  const rawKey = process.env.GDRIVE_SERVICE_ACCOUNT_KEY;
  if (rawKey && rawKey.trim()) {
    const trimmed = rawKey.trim();
    // Check if valid JSON directly
    if (trimmed.startsWith("{")) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        console.error("❌ Failed to parse GDRIVE_SERVICE_ACCOUNT_KEY as JSON:", e);
      }
    }
    // Check if Base64
    try {
      const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
      if (decoded.startsWith("{")) {
        return JSON.parse(decoded);
      }
    } catch (_) {
      // not base64
    }
  }

  const defaultLocalPath = path.resolve(__dirname, "../service_account.json");
  const candidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
      : null,
    defaultLocalPath,
  ].filter(Boolean) as string[];

  for (const cPath of candidates) {
    if (fs.existsSync(cPath)) {
      try {
        const content = fs.readFileSync(cPath, "utf-8");
        return JSON.parse(content);
      } catch (e) {
        console.error(`❌ Failed to read credentials file at ${cPath}:`, e);
      }
    }
  }


  return null;
}

/**
 * Creates authenticated Google Drive client
 * Supports:
 * 1. OAuth2 Refresh Token (GDRIVE_REFRESH_TOKEN + CLIENT_ID + CLIENT_SECRET) -> Best for personal @gmail.com accounts
 * 2. Google Service Account (GDRIVE_SERVICE_ACCOUNT_KEY or service_account.json)
 */
export function getDriveClient() {
  const refreshToken = process.env.GDRIVE_REFRESH_TOKEN?.trim();
  const clientId = process.env.GDRIVE_CLIENT_ID?.trim();
  const clientSecret = process.env.GDRIVE_CLIENT_SECRET?.trim();

  if (refreshToken && clientId && clientSecret) {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      "http://localhost:3000/oauth2callback"
    );
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return google.drive({ version: "v3", auth: oauth2Client });
  }

  const creds = getServiceAccountCredentials();
  if (!creds) {
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}


/**
 * Finds an available folder name avoiding collisions (e.g. "Money View" -> "Money View_2")
 */
async function findAvailableFolderName(
  drive: any,
  parentId: string,
  baseName: string
): Promise<string> {
  let candidateName = baseName;
  let counter = 1;

  while (true) {
    const query = `'${parentId}' in parents and name = '${candidateName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const res = await drive.files.list({
      q: query,
      fields: "files(id, name)",
      spaces: "drive",
    });

    if (!res.data.files || res.data.files.length === 0) {
      return candidateName;
    }

    counter++;
    candidateName = `${baseName}_${counter}`;
  }
}

/**
 * Creates a folder inside a parent folder on Google Drive
 */
async function createFolder(drive: any, parentId: string, name: string): Promise<string> {
  const fileMetadata = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentId],
  };

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: "id, name",
  });

  return folder.data.id!;
}

/**
 * Uploads a local file to a Google Drive folder
 */
async function uploadFileToDrive(
  drive: any,
  parentId: string,
  filePath: string,
  customName?: string,
  mimeType?: string
): Promise<{ id: string; name: string }> {
  const fileName = customName || path.basename(filePath);
  const media = {
    mimeType: mimeType || "application/octet-stream",
    body: fs.createReadStream(filePath),
  };

  const fileMetadata = {
    name: fileName,
    parents: [parentId],
  };

  const uploaded = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, name",
  });

  return {
    id: uploaded.data.id!,
    name: uploaded.data.name!,
  };
}

/**
 * Uploads a raw buffer/string to a Google Drive folder
 */
async function uploadBufferToDrive(
  drive: any,
  parentId: string,
  fileName: string,
  content: string | Buffer,
  mimeType: string
): Promise<{ id: string; name: string }> {
  const { Readable } = await import("stream");
  const stream = Readable.from(content);

  const fileMetadata = {
    name: fileName,
    parents: [parentId],
  };

  const uploaded = await drive.files.create({
    requestBody: fileMetadata,
    media: {
      mimeType,
      body: stream,
    },
    fields: "id, name",
  });

  return {
    id: uploaded.data.id!,
    name: uploaded.data.name!,
  };
}

/**
 * Main Google Drive Upload Workflow for an IPO
 */
export async function uploadIPOToDrive(
  ipoData: IPOData,
  videoFilePath: string,
  thumbnailPath?: string
): Promise<DriveUploadResult | null> {
  const parentFolderId = process.env.GDRIVE_PARENT_FOLDER_ID;
  if (!parentFolderId) {
    console.warn("⚠️ GDRIVE_PARENT_FOLDER_ID not set. Skipping Google Drive upload.");
    return null;
  }

  const drive = getDriveClient();
  if (!drive) {
    console.warn("⚠️ Google Service Account credentials not found. Skipping Google Drive upload.");
    return null;
  }

  console.log(`\n☁️  Starting Google Drive upload for ${ipoData.companyName}...`);
  console.log(`   Parent Folder ID: ${parentFolderId}`);

  try {
    // 1. Determine unique folder name (handling collisions)
    const baseFolderName = ipoData.companyName || ipoData.id.toUpperCase();
    const finalFolderName = await findAvailableFolderName(drive, parentFolderId, baseFolderName);
    console.log(`   📁 Target folder name: "${finalFolderName}"`);

    // 2. Create the company folder
    const companyFolderId = await createFolder(drive, parentFolderId, finalFolderName);
    console.log(`   ✅ Created company folder (ID: ${companyFolderId})`);

    // 3. Create subfolders: assets and audio
    const assetsFolderId = await createFolder(drive, companyFolderId, "assets");
    const audioFolderId = await createFolder(drive, companyFolderId, "audio");
    console.log(`   ✅ Created subfolders: assets/ and audio/`);

    const uploadedFiles: DriveUploadResult["uploadedFiles"] = [];

    // 4. Upload MP4 Video into company root folder
    if (fs.existsSync(videoFilePath)) {
      console.log(`   📤 Uploading video: ${path.basename(videoFilePath)}...`);
      const videoResult = await uploadFileToDrive(
        drive,
        companyFolderId,
        videoFilePath,
        `${ipoData.id}.mp4`,
        "video/mp4"
      );
      uploadedFiles.push({ name: videoResult.name, id: videoResult.id });
      console.log(`   ✅ Video uploaded (ID: ${videoResult.id})`);
    } else {
      console.warn(`   ⚠️ Video file not found at: ${videoFilePath}`);
    }

    // 5. Upload Assets into assets/ subfolder
    console.log(`   📤 Uploading assets to assets/ folder...`);

    // A. ipo_data.json
    const ipoDataJson = JSON.stringify(ipoData, null, 2);
    const dataResult = await uploadBufferToDrive(
      drive,
      assetsFolderId,
      "ipo_data.json",
      ipoDataJson,
      "application/json"
    );
    uploadedFiles.push({ name: dataResult.name, id: dataResult.id, subfolder: "assets" });

    // B. script.json
    if (ipoData.scripts) {
      const scriptJson = JSON.stringify(ipoData.scripts, null, 2);
      const scriptResult = await uploadBufferToDrive(
        drive,
        assetsFolderId,
        "script.json",
        scriptJson,
        "application/json"
      );
      uploadedFiles.push({ name: scriptResult.name, id: scriptResult.id, subfolder: "assets" });

      // C. script.txt (Formatted human readable transcript)
      const transcriptLines = [
        `==================================================`,
        `IPO Narration Script: ${ipoData.companyName}`,
        `Listing Date: ${ipoData.listingDate || "N/A"}`,
        `Voice: ${ipoData.timeline?.voiceId || "ElevenLabs Chris"}`,
        `==================================================\n`,
      ];
      const chapterKeys: (keyof NonNullable<typeof ipoData.scripts>)[] = [
        "chapter_1",
        "chapter_2",
        "chapter_3",
        "chapter_4",
        "chapter_5",
        "chapter_6",
        "chapter_7",
        "chapter_8",
      ];
      chapterKeys.forEach((key, idx) => {
        transcriptLines.push(`[Chapter ${idx + 1}: ${key}]`);
        if (ipoData.scripts && ipoData.scripts[key]) {
          transcriptLines.push(`"${ipoData.scripts[key]}"\n`);
        }
      });
      const transcriptResult = await uploadBufferToDrive(
        drive,
        assetsFolderId,
        "script.txt",
        transcriptLines.join("\n"),
        "text/plain"
      );
      uploadedFiles.push({ name: transcriptResult.name, id: transcriptResult.id, subfolder: "assets" });
    }

    // D. Company Logo (Fetch from logoUrl or favicon)
    if (ipoData.logoUrl && ipoData.logoUrl.startsWith("http")) {
      try {
        console.log(`   🌐 Fetching company logo: ${ipoData.logoUrl}...`);
        const logoRes = await fetch(ipoData.logoUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(5000),
        });
        if (logoRes.ok) {
          const buffer = Buffer.from(await logoRes.arrayBuffer());
          const contentType = logoRes.headers.get("content-type") || "image/png";
          const ext = contentType.includes("svg") ? "svg" : "png";
          const logoResult = await uploadBufferToDrive(
            drive,
            assetsFolderId,
            `logo.${ext}`,
            buffer,
            contentType
          );
          uploadedFiles.push({ name: logoResult.name, id: logoResult.id, subfolder: "assets" });
          console.log(`   ✅ Company logo uploaded`);
        }
      } catch (err) {
        console.warn(`   ⚠️ Could not download logo:`, err);
      }
    } else if (ipoData.logoUrl) {
      const localLogoPath = path.resolve(__dirname, `../public/${ipoData.logoUrl.replace(/^\//, "")}`);
      if (fs.existsSync(localLogoPath)) {
        const logoBuffer = fs.readFileSync(localLogoPath);
        const ext = path.extname(localLogoPath).slice(1) || "png";
        const logoResult = await uploadBufferToDrive(
          drive,
          assetsFolderId,
          `logo.${ext}`,
          logoBuffer,
          `image/${ext}`
        );
        uploadedFiles.push({ name: logoResult.name, id: logoResult.id, subfolder: "assets" });
        console.log(`   ✅ Local company logo uploaded to assets/logo.${ext}`);
      }
    }

    // E. 1280x720 Thumbnail Image
    let finalThumbPath = thumbnailPath;
    if (!finalThumbPath || !fs.existsSync(finalThumbPath)) {
      const defaultThumbPath = path.resolve(__dirname, `../out/${ipoData.id}-thumb.png`);
      if (fs.existsSync(defaultThumbPath)) {
        finalThumbPath = defaultThumbPath;
      }
    }
    if (finalThumbPath && fs.existsSync(finalThumbPath)) {
      console.log(`   📤 Uploading 1280x720 thumbnail: ${path.basename(finalThumbPath)}...`);
      const thumbResult = await uploadFileToDrive(
        drive,
        assetsFolderId,
        finalThumbPath,
        "thumbnail.png",
        "image/png"
      );
      uploadedFiles.push({ name: thumbResult.name, id: thumbResult.id, subfolder: "assets" });
      console.log(`   ✅ Thumbnail uploaded to assets/thumbnail.png (ID: ${thumbResult.id})`);
    }

    // 6. Upload Generated Scene Audio to audio/ subfolder
    const audioDir = path.resolve(__dirname, `../public/audio/${ipoData.id}`);
    if (fs.existsSync(audioDir)) {
      console.log(`   📤 Uploading audio scenes from ${audioDir}...`);
      const audioFiles = fs.readdirSync(audioDir).filter((f) => f.endsWith(".mp3") || f.endsWith(".wav"));
      for (const aFile of audioFiles) {
        const fullAudioPath = path.join(audioDir, aFile);
        const mime = aFile.endsWith(".mp3") ? "audio/mpeg" : "audio/wav";
        const aResult = await uploadFileToDrive(drive, audioFolderId, fullAudioPath, aFile, mime);
        uploadedFiles.push({ name: aResult.name, id: aResult.id, subfolder: "audio" });
      }
      console.log(`   ✅ Uploaded ${audioFiles.length} audio file(s)`);
    }

    const folderUrl = `https://drive.google.com/drive/folders/${companyFolderId}`;
    console.log(`\n🎉 Google Drive upload complete!`);
    console.log(`🔗 Folder URL: ${folderUrl}`);

    return {
      success: true,
      folderName: finalFolderName,
      folderId: companyFolderId,
      folderUrl,
      uploadedFiles,
    };
  } catch (error) {
    console.error(`❌ Google Drive upload failed:`, error);
    return null;
  }
}

// Standalone CLI runner: npx tsx scripts/upload_drive.ts --ipo=moneyview
if (require.main === module) {
  const args = process.argv.slice(2);
  let ipoSlug = "moneyview";
  for (const arg of args) {
    if (arg.startsWith("--ipo=")) {
      ipoSlug = arg.replace("--ipo=", "").trim().toLowerCase();
    }
  }

  const dataPath = path.resolve(__dirname, `../src/data/${ipoSlug}.json`);
  const videoPath = path.resolve(__dirname, `../out/${ipoSlug}.mp4`);

  if (!fs.existsSync(dataPath)) {
    console.error(`Data file not found: ${dataPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as IPOData;
  uploadIPOToDrive(data, videoPath).then((res) => {
    if (res?.success) {
      console.log(`\n✅ Finished uploading ${data.companyName} to Drive!`);
    } else {
      console.error(`\n❌ Failed to upload ${data.companyName}`);
    }
  });
}

