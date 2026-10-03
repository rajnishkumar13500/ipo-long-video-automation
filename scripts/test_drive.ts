import dotenv from "dotenv";
import { getDriveClient } from "./upload_drive";

dotenv.config();

async function testDriveConnection() {
  console.log("==================================================");
  console.log("🔍  TESTING GOOGLE DRIVE CONNECTION");
  console.log("==================================================");

  const parentFolderId = process.env.GDRIVE_PARENT_FOLDER_ID;
  if (!parentFolderId) {
    console.error("❌ GDRIVE_PARENT_FOLDER_ID is missing in your .env file!");
    console.log("💡 Add: GDRIVE_PARENT_FOLDER_ID=your_folder_id to .env");
    return;
  }
  console.log(`📁 Target Folder ID: ${parentFolderId}`);

  const drive = getDriveClient();
  if (!drive) {
    console.error("❌ Google Service Account credentials not found!");
    console.log("\n💡 Choose one of these two ways to provide credentials:");
    console.log("   Option 1: Put your downloaded JSON in the project as 'service_account.json' and add to .env:");
    console.log("             GOOGLE_APPLICATION_CREDENTIALS=./service_account.json");
    console.log("   Option 2: Add the JSON text directly to .env on a single line:");
    console.log("             GDRIVE_SERVICE_ACCOUNT_KEY={\"type\": \"service_account\", ...}");
    return;
  }

  try {
    // 1. Fetch details of parent folder
    console.log("\n📡 Checking folder access...");
    const folderRes = await drive.files.get({
      fileId: parentFolderId,
      fields: "id, name, permissions",
      supportsAllDrives: true,
    });
    console.log(`✅ Successfully accessed folder: "${folderRes.data.name}" (ID: ${folderRes.data.id})`);

    // 2. Upload a small test file
    console.log("\n📤 Testing file upload permissions...");
    const { Readable } = await import("stream");
    const testContent = `Connection successful at: ${new Date().toISOString()}`;
    const uploadRes = await drive.files.create({
      requestBody: {
        name: "test_connection.txt",
        parents: [parentFolderId],
      },
      media: {
        mimeType: "text/plain",
        body: Readable.from(testContent),
      },
      fields: "id, name, webViewLink",
      supportsAllDrives: true,
    });

    console.log(`✅ Upload test passed!`);
    console.log(`📄 Created file: ${uploadRes.data.name} (ID: ${uploadRes.data.id})`);
    console.log(`🔗 Web Link: https://drive.google.com/drive/folders/${parentFolderId}`);

    console.log("\n==================================================");
    console.log("🎉  GOOGLE DRIVE INTEGRATION IS 100% READY!");
    console.log("==================================================");
  } catch (error: any) {
    console.error("\n❌ Connection test failed with details:");
    console.error(JSON.stringify(error.response?.data || error.message || error, null, 2));
  }
}

testDriveConnection();

