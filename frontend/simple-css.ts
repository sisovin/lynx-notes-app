import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const outputFile = path.join(distDir, 'client.css');
const sourceFile = path.join(__dirname, 'src', 'fallback.css');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy the fallback CSS
fs.copyFileSync(sourceFile, outputFile);
console.log('CSS copied successfully');