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

// Process CSS files
console.log('📝 Preparing CSS files...');
try {
  // Create a single combined CSS file
  let combinedCss = '';
  
  // Start with global.css
  if (fs.existsSync('src/styles/global.css')) {
    combinedCss += fs.readFileSync('src/styles/global.css', 'utf8');
    console.log('✅ Added global.css to combined CSS');
  }
  
  // Add the NoteList component styles
  if (fs.existsSync('src/styles/components/NoteList.css')) {
    combinedCss += '\n\n' + fs.readFileSync('src/styles/components/NoteList.css', 'utf8');
    console.log('✅ Added NoteList.css to combined CSS');
  } else if (fs.existsSync('src/styles/NoteList.css')) {
    // Fallback to the old location
    combinedCss += '\n\n' + fs.readFileSync('src/styles/NoteList.css', 'utf8');
    console.log('✅ Added NoteList.css to combined CSS');
  }
  
  // Write the combined CSS file
  fs.writeFileSync('dist/client.css', combinedCss);
  console.log('✅ Combined CSS written to client.css');
  
  // Also keep individual files for direct linking
  if (fs.existsSync('src/styles/global.css')) {
    fs.copyFileSync('src/styles/global.css', 'dist/global.css');
  }
  
  if (fs.existsSync('src/styles/components/NoteList.css')) {
    fs.copyFileSync('src/styles/components/NoteList.css', 'dist/NoteList.css');
  } else if (fs.existsSync('src/styles/NoteList.css')) {
    fs.copyFileSync('src/styles/NoteList.css', 'dist/NoteList.css');
  }
} catch (error) {
  console.error('❌ Error processing CSS:', error);
}

// Create global script files
console.log('📝 Creating lepus-global.js...');
try {
  const lepusGlobalJs = `// Global configuration for Lynx Notes App
window.__LEPUS__ = {
  apiBase: '/api',
  version: '1.0.0',
  environment: '${process.env.NODE_ENV || 'development'}',
  features: {
    darkMode: true,
    offlineSupport: true
  },
  config: {
    noteRefreshInterval: 30000, // 30 seconds
    maxNoteLength: 5000,
    autoSaveInterval: 5000  // 5 seconds
  }
};

// Define SSR flag (we're not using SSR in this build)
window.__ENABLE_SSR__ = false;

// Performance metrics initialization
(function setupPerformanceMetrics() {
  // First screen rendering timing
  window.__FIRST_SCREEN_SYNC_TIMING__ = {
    startTime: Date.now(),
    endTime: null,
    duration: 0
  };
  
  // Record when the first screen is fully rendered
  window.addEventListener('load', function() {
    window.__FIRST_SCREEN_SYNC_TIMING__.endTime = Date.now();
    window.__FIRST_SCREEN_SYNC_TIMING__.duration = 
      window.__FIRST_SCREEN_SYNC_TIMING__.endTime - window.__FIRST_SCREEN_SYNC_TIMING__.startTime;
  });
})();

console.log('Lepus global configuration loaded:', window.__LEPUS__);
`;
  fs.writeFileSync('dist/lepus-global.js', lepusGlobalJs);
  console.log('✅ lepus-global.js created successfully');
} catch (error) {
  console.error('❌ Failed to create lepus-global.js:', error);
}

console.log('📝 Creating performance-shim.js...');
try {
  const performanceShimJs = `// Performance metrics initialization
window.__FIRST_SCREEN_SYNC_TIMING__ = window.__FIRST_SCREEN_SYNC_TIMING__ || {
  startTime: Date.now(),
  endTime: null,
  duration: 0
};

// Define SSR flag (we're not using SSR in this build)
window.__ENABLE_SSR__ = false;

console.log('Performance metrics initialized');
`;
  fs.writeFileSync('dist/performance-shim.js', performanceShimJs);
  console.log('✅ performance-shim.js created successfully');
} catch (error) {
  console.error('❌ Failed to create performance-shim.js:', error);
}

console.log('📝 Creating process-env-shim.js...');
try {
  const processEnvShimJs = `// Environment variables for the application
window.process = window.process || {};
window.process.env = {
  NODE_ENV: '${process.env.NODE_ENV || 'development'}',
  API_URL: 'http://192.168.50.131:3001',
  REACT_APP_API_URL: 'http://192.168.50.131:3001/api'
};

console.log('Environment loaded:', window.process.env);
`;
  fs.writeFileSync('dist/process-env-shim.js', processEnvShimJs);
  console.log('✅ process-env-shim.js created successfully');
} catch (error) {
  console.error('❌ Failed to create process-env-shim.js:', error);
}

console.log('📝 Creating lepus-fallback.js...');
try {
  const lepusFallbackJs = `// Fallback for __LEPUS__ global object
if (typeof window.__LEPUS__ === 'undefined') {
  console.warn('__LEPUS__ global not found, creating default');
  window.__LEPUS__ = {
    apiBase: '/api',
    version: '1.0.0',
    environment: 'development',
    features: {
      darkMode: true,
      offlineSupport: true
    },
    config: {
      noteRefreshInterval: 30000
    }
  };
}

// Fallback for SSR flag
if (typeof window.__ENABLE_SSR__ === 'undefined') {
  window.__ENABLE_SSR__ = false;
  console.warn('__ENABLE_SSR__ not defined, defaulting to false');
}
`;
  fs.writeFileSync('dist/lepus-fallback.js', lepusFallbackJs);
  console.log('✅ lepus-fallback.js created successfully');
} catch (error) {
  console.error('❌ Failed to create lepus-fallback.js:', error);
}

// Build the JavaScript
console.log('Building JavaScript...');
try {
  console.log("Using direct Bun build instead of rsbuild...");
  
  // Define environment variables that will be replaced in the build
  const processEnv = {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
    "process.env": JSON.stringify({
      NODE_ENV: process.env.NODE_ENV || "development",
      API_URL: "http://192.168.50.131:3001",
      REACT_APP_API_URL: "http://192.168.50.131:3001/api"
    }),
    "__ENABLE_SSR__": "false"
  };
  
  const defineString = Object.entries(processEnv)
    .map(([key, value]) => `--define:${key}=${value}`)
    .join(" ");

  // Update the build command to exclude CSS files from bundling
  execSync(
    `bun build src/client.tsx --outdir dist --minify --format=iife ${defineString} --external:*.css`,
    {
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "production",
      },
    }
  );
  console.log("✅ client.js built successfully");

  // Update index.html to include all scripts in the right order
  if (fs.existsSync('src/index.html')) {
    let htmlContent = fs.readFileSync('src/index.html', 'utf8');
    const originalContent = htmlContent;
    
    // Create an array for scripts in the desired order
    const scriptsToAdd = [
      '<script src="/performance-shim.js"></script>',
      '<script src="/lepus-global.js"></script>',
      '<script src="/lepus-fallback.js"></script>',
      '<script src="/process-env-shim.js"></script>',
      '<script src="/client.js"></script>'
    ];
    
    // Remove any existing script tags that are in our list
    scriptsToAdd.forEach(script => {
      if (htmlContent.includes(script)) {
        htmlContent = htmlContent.replace(script, '');
      }
    });
    
    // Find where to insert the scripts (before closing body tag)
    const insertPoint = htmlContent.lastIndexOf('</body>');
    if (insertPoint !== -1) {
      const scriptsHtml = '  ' + scriptsToAdd.join('\n  ') + '\n';
      htmlContent = htmlContent.slice(0, insertPoint) + scriptsHtml + htmlContent.slice(insertPoint);
    }
    
    // Only write the file if changes were made
    if (htmlContent !== originalContent) {
      fs.writeFileSync('dist/index.html', htmlContent);
      console.log('✅ index.html updated with all required scripts');
    } else {
      console.log('ℹ️ index.html already has all required scripts');
    }
  } else {
    console.warn('⚠️ src/index.html not found, skipping HTML update');
  }
} catch (buildError) {
  console.error('❌ Failed to build JavaScript:', buildError);
}

console.log('🚀 Build completed');