import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIconsFromSVG() {
  const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Read SVG content
  const svgContent = fs.readFileSync(svgPath);
  
  // Sizes to generate
  const sizes = [192, 512];
  
  console.log('🎨 دروستکردنی PNG ئایکۆنەکان بە Sharp...\n');
  
  try {
    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      
      await sharp(svgContent, { density: 300 })
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 95, progressive: true })
        .toFile(outputPath);
      
      console.log(`✅ دروست کرا: icon-${size}x${size}.png (${size}x${size}px)`);
    }
    
    console.log('\n✨ تەواو بوو! ئایکۆنەکان دروست کران.');
    console.log('🚀 ئێستا دەتوانیت Git push بکەیت!\n');
    
  } catch (error) {
    console.error('❌ هەڵە لە دروستکردندا:', error.message);
    process.exit(1);
  }
}

generateIconsFromSVG();
