import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure dist directory exists
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
}

// Ensure the styles directory exists
if (!fs.existsSync(path.join(__dirname, 'src', 'styles'))) {
  fs.mkdirSync(path.join(__dirname, 'src', 'styles'), { recursive: true });
}

// Create basic CSS files if they don't exist
if (!fs.existsSync(path.join(__dirname, 'src', 'styles', 'App.css'))) {
  fs.writeFileSync(path.join(__dirname, 'src', 'styles', 'App.css'), '/* App styles */\n');
  console.log('Created empty App.css');
}

if (!fs.existsSync(path.join(__dirname, 'src', 'styles', 'global.css'))) {
  fs.writeFileSync(path.join(__dirname, 'src', 'styles', 'global.css'), '/* Global styles */\n');
  console.log('Created empty global.css');
}

// Replace the entire CSS processing block with this improved version:
// Process CSS files
console.log('📝 Preparing CSS files...');
try {
  // Array to collect all import statements
  const imports = [];
  // Create a single combined CSS file
  let combinedCss = "";

  // Function to extract imports from CSS content
  const extractImports = (cssContent) => {
    // Regex to match @import statements
    const importRegex = /@import\s+(['"])(.+?)\1\s*;/g;
    const extractedImports = [];
    let match;

    // Extract all imports
    while ((match = importRegex.exec(cssContent)) !== null) {
      extractedImports.push(match[0]);
    }

    // Remove imports from the content
    const contentWithoutImports = cssContent.replace(importRegex, "");

    return {
      imports: extractedImports,
      content: contentWithoutImports,
    };
  };

  // Process a CSS file and add it to the combined CSS
  const processCssFile = (filePath, fileName) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      
      // Extract imports
      const { imports: fileImports, content: fileContent } = extractImports(content);
      
      // Add any new imports to our imports array
      fileImports.forEach((importRule) => {
        if (!imports.includes(importRule)) {
          imports.push(importRule);
        }
      });
      
      combinedCss += "\n\n" + fileContent;
      console.log(`✅ Added ${fileName} to combined CSS`);
      return true;
    }
    return false;
  };

  // Start with variables.css if it exists
  processCssFile(
    path.join(__dirname, "src", "styles", "variables.css"), 
    "variables.css"
  );

  // Then global.css
  processCssFile(
    path.join(__dirname, "src", "styles", "global.css"), 
    "global.css"
  );

  // Add component-specific CSS files
  // First check in the components directory, then fall back to the styles directory
  
  // NoteList.css
  if (!processCssFile(
    path.join(__dirname, "src", "styles", "components", "NoteList.css"),
    "components/NoteList.css"
  )) {
    processCssFile(
      path.join(__dirname, "src", "styles", "NoteList.css"),
      "NoteList.css"
    );
  }
  
  // SplashScreen.css
  if (!processCssFile(
    path.join(__dirname, "src", "styles", "components", "SplashScreen.css"),
    "components/SplashScreen.css"
  )) {
    processCssFile(
      path.join(__dirname, "src", "styles", "SplashScreen.css"),
      "SplashScreen.css"
    );
  }

  // Process all other CSS files in the styles directory
  if (fs.existsSync(path.join(__dirname, "src", "styles"))) {
    const cssFiles = fs.readdirSync(path.join(__dirname, "src", "styles"));
    cssFiles.forEach((file) => {
      if (
        file.endsWith(".css") &&
        file !== "global.css" &&
        file !== "variables.css" &&
        file !== "NoteList.css" &&
        file !== "SplashScreen.css"
      ) {
        processCssFile(
          path.join(__dirname, "src", "styles", file),
          file
        );
      }
    });
  }

  // Process all other CSS files in the components subdirectory
  if (fs.existsSync(path.join(__dirname, "src", "styles", "components"))) {
    const componentCssFiles = fs.readdirSync(
      path.join(__dirname, "src", "styles", "components")
    );
    componentCssFiles.forEach((file) => {
      if (
        file.endsWith(".css") &&
        file !== "NoteList.css" &&
        file !== "SplashScreen.css"
      ) {
        processCssFile(
          path.join(__dirname, "src", "styles", "components", file),
          "components/" + file
        );
      }
    });
  }

  // Create the final CSS by placing all imports at the top, then the content
  let finalCss = "";

  // Add imports first (only unique ones)
  if (imports.length > 0) {
    finalCss += "/* Combined imports */\n";
    finalCss += [...new Set(imports)].join("\n");
    finalCss += "\n\n";
  }

  // Add all CSS content
  finalCss += combinedCss;

  // Write the combined CSS file
  fs.writeFileSync(path.join(__dirname, "dist", "styles.css"), finalCss);
  console.log("✅ Combined CSS written to styles.css");

  // Also create client.css as an alias for backward compatibility
  fs.writeFileSync(path.join(__dirname, "dist", "client.css"), finalCss);
  console.log("✅ Combined CSS also written to client.css for compatibility");
  
  // Copy individual files for direct linking
  if (fs.existsSync(path.join(__dirname, "src", "styles", "global.css"))) {
    fs.copyFileSync(
      path.join(__dirname, "src", "styles", "global.css"),
      path.join(__dirname, "dist", "global.css")
    );
    console.log("✅ Copied global.css for direct linking");
  }
} catch (error) {
  console.error('❌ Error processing CSS:', error);
}
/* End Process CSS files */

// Add this to your build.js to create a placeholder logo if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'src', 'assets', 'lynx-logo.png'))) {
  console.log('No logo found, creating a placeholder SVG...');
  
  // Create assets directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, 'src', 'assets'))) {
    fs.mkdirSync(path.join(__dirname, 'src', 'assets'), { recursive: true });
  }
  
  // Copy a placeholder SVG file (we'll create it as a text file with .png extension for simplicity)
  const placeholderLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#4f46e5" rx="20" />
  <text x="50" y="55" font-family="Arial" font-size="24" text-anchor="middle" fill="white">Lynx</text>
</svg>`;

  fs.writeFileSync(path.join(__dirname, 'src', 'assets', 'lynx-logo.svg'), placeholderLogoSvg);
  console.log('✅ Created placeholder logo');
  
  // Also copy it to the dist folder
  fs.copyFileSync(path.join(__dirname, 'src', 'assets', 'lynx-logo.svg'), path.join(__dirname, 'dist', 'lynx-logo.svg'));
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