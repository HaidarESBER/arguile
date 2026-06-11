import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');
const logoPath = path.join(publicDir, 'nuagelogonobg1.png');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA icons...');

// Generate icons for each size
for (const size of sizes) {
  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

  await sharp(logoPath)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 250, g: 250, b: 249, alpha: 1 } // Cream color
    })
    .png()
    .toFile(outputPath);

  console.log(`✓ Generated icon-${size}x${size}.png`);
}

console.log('\n✓ All PWA icons generated successfully!');
