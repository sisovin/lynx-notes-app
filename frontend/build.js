import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Ensure the styles directory exists
if (!fs.existsSync('src/styles')) {
  fs.mkdirSync('src/styles', { recursive: true });
  
  // Create basic CSS files if they don't exist
  if (!fs.existsSync('src/styles/App.css')) {
    fs.writeFileSync('src/styles/App.css', '/* App styles */\n');
    console.log('Created empty App.css');
  }
  
  if (!fs.existsSync('src/styles/global.css')) {
    fs.writeFileSync('src/styles/global.css', '/* Global styles */\n');
    console.log('Created empty global.css');
  }
}

// Copy CSS files to dist first to make sure they exist
console.log('📝 Preparing CSS files...');
try {
  // Copy App.css to dist
  if (fs.existsSync('src/styles/App.css')) {
    fs.copyFileSync('src/styles/App.css', 'dist/App.css');
    console.log('✅ App.css copied successfully');
  }
  
  // Copy global.css to dist
  if (fs.existsSync('src/styles/global.css')) {
    fs.copyFileSync('src/styles/global.css', 'dist/global.css');
    console.log('✅ global.css copied successfully');
  }
  
  // Copy index.css if it exists
  if (fs.existsSync('src/index.css')) {
    fs.copyFileSync('src/index.css', 'dist/index.css');
    console.log('✅ index.css copied successfully');
  }
  
  // Copy fallback.css if it exists
  if (fs.existsSync('src/fallback.css')) {
    fs.copyFileSync('src/fallback.css', 'dist/fallback.css');
    console.log('✅ fallback.css copied successfully');
  }
  
  // Create client.css (combined version)
  let combinedCss = '';
  
  if (fs.existsSync('src/styles/global.css')) {
    let cssContent = fs.readFileSync('src/styles/global.css', 'utf8');
    
    // Remove any tailwind directives
    cssContent = cssContent.replace(/@tailwind\s+[^;]+;/g, '');
    cssContent = cssContent.replace(/@import\s+["']tailwindcss\/[^"']+["'];/g, '');
    
    combinedCss += cssContent;
  }
  
  if (fs.existsSync('src/styles/App.css')) {
    combinedCss += '\n\n' + fs.readFileSync('src/styles/App.css', 'utf8');
  }
  
  // Write the combined CSS
  fs.writeFileSync('dist/client.css', combinedCss);
  console.log('✅ client.css created successfully');
} catch (error) {
  console.error('❌ Failed to prepare CSS files:', error);
}

// Create lepus-global.js file
console.log('📝 Creating lepus-global.js...');
try {
  const lepusGlobalJs = `// Global configuration
window.LEPUS_CONFIG = {
  apiBase: '/api',
  version: '1.0.0',
  environment: '${process.env.NODE_ENV || 'development'}'
};
`;
  fs.writeFileSync('dist/lepus-global.js', lepusGlobalJs);
  console.log('✅ lepus-global.js created successfully');
} catch (error) {
  console.error('❌ Failed to create lepus-global.js:', error);
}

// Build the JavaScript
console.log('Building JavaScript...');
try {
  // Use direct Bun build instead of rsbuild
  console.log("Using direct Bun build instead of rsbuild...");

  // Build the client code with process definition
  console.log("🔨 Building client.js...");

  // Define environment variables that will be replaced in the build
  const processEnv = {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
    "process.env": JSON.stringify({
      NODE_ENV: process.env.NODE_ENV || "development",
    }),
  };

  const defineString = Object.entries(processEnv)
    .map(([key, value]) => `--define:${key}=${value}`)
    .join(" ");

  execSync(
    `bun build src/client.tsx --outdir dist --minify --format=iife ${defineString} --external "*.css"`,
    {
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "production",
      },
    }
  );
  console.log("✅ client.js built successfully");

  // Copy our environment shim to dist
  console.log("📝 Creating process environment shim...");
  try {
    if (fs.existsSync("src/process-env-shim.js")) {
      fs.copyFileSync("src/process-env-shim.js", "dist/process-env-shim.js");
      console.log("✅ Process environment shim copied successfully");
    } else {
      // Create it if it doesn't exist
      const processShim = `
window.process = window.process || {
  env: {
    NODE_ENV: '${process.env.NODE_ENV || "development"}',
    REACT_APP_API_URL: ${JSON.stringify(
      process.env.REACT_APP_API_URL || undefined
    )}
  }
};
console.log('Environment loaded:', window.process.env);
    `;
      fs.writeFileSync("dist/process-env-shim.js", processShim);
      console.log("✅ Process environment shim created successfully");
    }
  } catch (error) {
    console.error("❌ Failed to create process environment shim:", error);
  }

  // Update index.html to include the shim before client.js
  if (fs.existsSync('src/index.html')) {
    let htmlContent = fs.readFileSync('src/index.html', 'utf8');
  
    // Add the process-env-shim.js before client.js
    if (!htmlContent.includes('process-env-shim.js')) {
      htmlContent = htmlContent.replace(
        '<script src="/client.js"></script>',
        '<script src="/process-env-shim.js"></script>\n  <script src="/client.js"></script>'
      );
    }
  
    fs.writeFileSync('dist/index.html', htmlContent);
    console.log('✅ index.html updated with process environment shim');
  }
} catch (buildError) {
  console.error('❌ Failed to build JavaScript:', buildError);
}

console.log('🚀 Build completed');