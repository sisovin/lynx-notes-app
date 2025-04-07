import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const watchMode = process.argv.includes('--watch');
const distDir = path.join(__dirname, 'dist');
const outputFile = path.join(distDir, 'client.css');
const fallbackFile = path.join(__dirname, 'src', 'fallback.css');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

try {
  console.log('Building CSS with Tailwind CLI...');
  
  // Use direct path to tailwind binary with bun
  const tailwindBin = path.join(__dirname, 'node_modules', '.bin', 'tailwindcss');
  
  if (fs.existsSync(tailwindBin)) {
    console.log(`Found Tailwind binary at: ${tailwindBin}`);
    
    if (watchMode) {
      // For watch mode, use spawn
      const { spawn } = require('child_process');
      const tailwind = spawn(tailwindBin, [
        '-i', './src/index.css', 
        '-o', outputFile, 
        '--watch'
      ], { 
        stdio: 'inherit',
        shell: true 
      });
      
      // Handle process exit
      tailwind.on('close', (code) => {
        if (code !== 0) {
          console.error(`Tailwind process exited with code ${code}`);
          useFallbackCSS();
        }
      });
    } else {
      // For one-time build, use execSync
      execSync(`"${tailwindBin}" -i ./src/index.css -o "${outputFile}"`, { stdio: 'inherit' });
    }
  } else {
    console.error('Tailwind binary not found, falling back to basic CSS');
    useFallbackCSS();
  }
} catch (error) {
  console.error('Error using Tailwind CLI, falling back to basic CSS:', error);
  useFallbackCSS();
}

function useFallbackCSS() {
  // Fall back to copying the basic CSS file
  try {
    if (fs.existsSync(fallbackFile)) {
      fs.copyFileSync(fallbackFile, outputFile);
      console.log('Fallback CSS copied successfully');
    } else {
      console.log('Creating minimal CSS file...');
      const minimalCSS = `
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin: 0;
  padding: 0;
  background-color: var(--background, #f8f9fa);
  color: var(--text-color, #333333);
}

:root {
  --background: #f8f9fa;
  --card-background: #ffffff;
  --text-color: #333333;
  --text-secondary: #6c757d;
  --primary-color: #4f46e5;
  --hover-color: #4338ca;
  --border-color: #e5e7eb;
}

.dark {
  --background: #1a1a1a;
  --card-background: #2d2d2d;
  --text-color: #f0f0f0;
  --text-secondary: #adb5bd;
  --primary-color: #6366f1;
  --hover-color: #818cf8;
  --border-color: #4b5563;
}

.min-h-screen { min-height: 100vh; }
.bg-background { background-color: var(--background); }
.text-text { color: var(--text-color); }
.fixed { position: fixed; }
.top-4 { top: 1rem; }
.right-4 { right: 1rem; }
.z-50 { z-index: 50; }
      `;
      fs.writeFileSync(outputFile, minimalCSS);
      console.log('Minimal CSS created');
    }
  } catch (fallbackError) {
    console.error('Error copying fallback CSS:', fallbackError);
  }
}