import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const watchMode = process.argv.includes('--watch');
const distDir = path.join(__dirname, 'dist');
const outputFile = path.join(distDir, 'client.css');
const tailwindOutputFile = path.join(__dirname, 'src', 'styles', 'tailwind-output.css');
const fallbackFile = path.join(__dirname, 'src', 'fallback.css');
const variablesFile = path.join(__dirname, 'src', 'styles', 'variables.css');

// Ensure directories exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (!fs.existsSync(path.join(__dirname, 'src', 'styles'))) {
  fs.mkdirSync(path.join(__dirname, 'src', 'styles'), { recursive: true });
}

// Create variables.css if it doesn't exist
if (!fs.existsSync(variablesFile)) {
  // Copy content from the non-tailwind parts of index.css
  try {
    const indexContent = fs.readFileSync(path.join(__dirname, 'src', 'index.css'), 'utf8');
    // Extract everything after the tailwind directives
    const nonTailwindContent = indexContent.split('@tailwind utilities;')[1] || '';
    fs.writeFileSync(variablesFile, nonTailwindContent);
    console.log('✅ Created variables.css with theme variables');
  } catch (error) {
    console.error('❌ Error creating variables.css:', error);
  }
}

try {
  console.log('Building CSS with Tailwind CLI...');
  
  // Use direct path to tailwind binary with bun
  const tailwindBin = path.join(__dirname, 'node_modules', '.bin', 'tailwindcss');
  
  if (fs.existsSync(tailwindBin)) {
    console.log(`Found Tailwind binary at: ${tailwindBin}`);
    
    if (watchMode) {
      // For watch mode, use spawn
      const tailwind = spawn(tailwindBin, [
        '-i', './src/index.css', 
        '-o', tailwindOutputFile, 
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
      execSync(`"${tailwindBin}" -i ./src/index.css -o "${tailwindOutputFile}"`, { stdio: 'inherit' });
      
      // Now combine the Tailwind output with variables.css
      combineCSS();
    }
  } else {
    console.error('Tailwind binary not found, falling back to basic CSS');
    useFallbackCSS();
  }
} catch (error) {
  console.error('Error using Tailwind CLI, falling back to basic CSS:', error);
  useFallbackCSS();
}

function combineCSS() {
  try {
    let combinedCss = '';
    
    // First add the tailwind output if it exists
    if (fs.existsSync(tailwindOutputFile)) {
      combinedCss += fs.readFileSync(tailwindOutputFile, 'utf8');
      console.log('✅ Added Tailwind output to combined CSS');
    }
    
    // Then add variables.css
    if (fs.existsSync(variablesFile)) {
      combinedCss += '\n\n' + fs.readFileSync(variablesFile, 'utf8');
      console.log('✅ Added variables.css to combined CSS');
    }
    
    // Add other component styles
    // Include SplashScreen.css, etc. similar to your current build.js
    
    // Write the combined CSS to the output file
    fs.writeFileSync(outputFile, combinedCss);
    console.log('✅ Combined CSS written to client.css');
  } catch (error) {
    console.error('❌ Error combining CSS:', error);
    useFallbackCSS();
  }
}

function useFallbackCSS() {
  // Fall back to copying the basic CSS file
  try {
    if (fs.existsSync(fallbackFile)) {
      fs.copyFileSync(fallbackFile, outputFile);
      console.log('Fallback CSS copied successfully');
    } else if (fs.existsSync(variablesFile)) {
      fs.copyFileSync(variablesFile, outputFile);
      console.log('Using variables.css as fallback');
    } else {
      console.log('Creating minimal CSS file...');
      const minimalCSS = `
/* Root variables for theme - light mode defaults */
:root {
  /* Light theme variables */
  --background: #ffffff;
  --card-background: #f8f9fa;
  --text-color: #212529;
  --text-secondary: #6c757d;
  --primary-color: #6366f1;
  --hover-color: #4f46e5;
  --border-color: #dee2e6;
}

.dark {
  /* Dark theme variables */
  --background: #1a1a1a;
  --card-background: #2d2d2d;
  --text-color: #f0f0f0;
  --text-secondary: #adb5bd;
  --primary-color: #6366f1;
  --hover-color: #818cf8;
  --border-color: #4b5563;
}

/* Apply base styles */
html, body {
  background-color: var(--background);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}
`;
      fs.writeFileSync(outputFile, minimalCSS);
      console.log('Minimal CSS created');
    }
  } catch (fallbackError) {
    console.error('Error copying fallback CSS:', fallbackError);
  }
}