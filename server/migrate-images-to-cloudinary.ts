import { v2 as cloudinary } from "cloudinary";
import { pool } from "./db";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, { folder: "resilient", resource_type: "image" }, (err, result) => {
      if (err || !result) return reject(err || new Error("Upload failed"));
      resolve(result.secure_url);
    });
  });
}

async function main() {
  const { rows: products } = await pool.query("SELECT id, name, images FROM products");
  let totalMigrated = 0;

  for (const product of products) {
    const images: string[] = product.images || [];
    const newImages: string[] = [];
    let changed = false;

    for (const img of images) {
      if (img.startsWith("http")) {
        newImages.push(img);
        continue;
      }

      const filename = img.replace("/uploads/", "");
      const localPath = path.resolve("uploads", filename);

      if (!fs.existsSync(localPath)) {
        console.warn(`  [MISSING] ${filename} — file not found on disk, skipping`);
        newImages.push(img);
        continue;
      }

      try {
        console.log(`  Uploading ${filename}...`);
        const url = await uploadFile(localPath);
        console.log(`  -> ${url}`);
        newImages.push(url);
        changed = true;
        totalMigrated++;
      } catch (err: any) {
        console.error(`  [ERROR] Failed to upload ${filename}:`, err?.message);
        newImages.push(img);
      }
    }

    if (changed) {
      await pool.query("UPDATE products SET images = $1 WHERE id = $2", [newImages, product.id]);
      console.log(`Updated product: ${product.name}`);
    }
  }

  console.log(`\nMigration complete. ${totalMigrated} images uploaded to Cloudinary.`);
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
