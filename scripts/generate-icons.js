const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [
  16, 32, 96, 128, 192, 256, 384, 512
];

const generateIcons = async () => {
  const svgBuffer = await fs.readFile(path.join(__dirname, '../public/logo.svg'));
  
  // Generar favicon.ico (combinación de 16x16 y 32x32)
  const favicon = await sharp(svgBuffer)
    .resize(16, 16)
    .toBuffer();
  
  await sharp(svgBuffer)
    .resize(32, 32)
    .toBuffer()
    .then(async (data32) => {
      await sharp({
        create: {
          width: 32,
          height: 32,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
      .composite([
        { input: favicon },
        { input: data32, top: 0, left: 0 }
      ])
      .toFile(path.join(__dirname, '../public/favicon.ico'));
    });

  // Generar PNGs para diferentes tamaños
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `../public/icons/icon-${size}x${size}.png`));
  }

  // Generar apple-touch-icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/icons/apple-touch-icon.png'));
};

generateIcons().catch(console.error);
