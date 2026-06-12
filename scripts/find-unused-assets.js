const fs = require('fs');
const path = require('path');
const ASSET_DIR = path.join(__dirname, '../src/assets');
const SRC_DIR = path.join(__dirname, '../src');
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
const CODE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
function getAllFiles(dir, extensions, files = []) {
  if (!fs.existsSync(dir)) return files;
  const dirFiles = fs.readdirSync(dir);
  dirFiles.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, extensions, files);
    } else {
      if (extensions.includes(path.extname(fullPath))) {
        files.push(fullPath);
      }
    }
  });
  return files;
}
const assetFiles = getAllFiles(ASSET_DIR, IMAGE_EXTENSIONS);
const codeFiles = getAllFiles(SRC_DIR, CODE_EXTENSIONS);
const codeContent = codeFiles
  .map(file => fs.readFileSync(file, 'utf8'))
  .join('\n');
const unusedAssets = [];
assetFiles.forEach(assetPath => {
  const fileName = path.basename(assetPath);
  if (!codeContent.includes(fileName)) {
    unusedAssets.push(assetPath);
  }
});
console.log('\n=== UNUSED ASSETS ===\n');
if (unusedAssets.length === 0) {
  console.log('No unused assets found.');
} else {
  unusedAssets.forEach(file => {
    console.log(file);
  });
}
console.log(`\nTotal unused assets: ${unusedAssets.length}\n`);


//npm run find:assets
