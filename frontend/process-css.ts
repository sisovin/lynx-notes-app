import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function processCss() {
  try {
    const inputPath = path.join(__dirname, 'src', 'index.css');
    const outputDir = path.join(__dirname, 'dist');
    const outputPath = path.join(outputDir, 'client.css');
    
    const inputCss = fs.readFileSync(inputPath, 'utf8');
    
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Process the CSS with PostCSS
    const result = await postcss([
      tailwindcss,
      autoprefixer
    ]).process(inputCss, {
      from: inputPath,
      to: outputPath
    });
    
    // Write the result to a file
    fs.writeFileSync(outputPath, result.css);
    console.log('✅ CSS processed successfully');
    
    // If source maps are enabled
    if (result.map) {
      fs.writeFileSync(`${outputPath}.map`, result.map.toString());
    }
  } catch (error) {
    console.error('❌ Error processing CSS:', error);
  }
}

// Run once immediately
processCss();

// Watch for changes if --watch flag is provided
if (process.argv.includes('--watch')) {
  console.log('Watching for CSS changes...');
  
  fs.watch(path.join(__dirname, 'src'), { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.css')) {
      console.log(`File ${filename} changed, rebuilding CSS...`);
      processCss();
    }
  });
  
  // Also watch the Tailwind config file
  fs.watchFile(path.join(__dirname, 'tailwind.config.js'), () => {
    console.log('Tailwind config changed, rebuilding CSS...');
    processCss();
  });
}