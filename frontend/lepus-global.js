// Initialize performance tracking variables
window.__FIRST_SCREEN_SYNC_TIMING__ = performance.now();
window.__FIRST_SCREEN_ASYNC_TIMING__ = 0;

// Global configuration for Lynx Notes App
window.__LEPUS__ = {
  apiBase: '/api',
  version: '1.0.0',
  environment: 'development',
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

console.log('Lepus global configuration loaded:', window.__LEPUS__);

// Set up basic Lynx/Lepus compatibility layer
window.__LEPUS__ = window.__LEPUS__ || {
  platform: 'browser',
  version: '1.0.0',
  deviceInfo: {
    brand: 'web',
    model: 'browser',
    system: navigator.userAgent
  },
  hooks: {},
  plugins: {},
  performance: {
    sync: () => window.__FIRST_SCREEN_SYNC_TIMING__,
    async: () => window.__FIRST_SCREEN_ASYNC_TIMING__
  }
};

// Track additional timing metrics for performance optimization
window.addEventListener('DOMContentLoaded', () => {
  window.__FIRST_SCREEN_ASYNC_TIMING__ = performance.now();
  console.log(`DOM Content Loaded in ${window.__FIRST_SCREEN_ASYNC_TIMING__ - window.__FIRST_SCREEN_SYNC_TIMING__}ms`);
});

// Add support for Lynx native API compatibility
window.__LEPUS__.callNative = function(module, method, params) {
  console.log(`[Lepus Bridge] Called native module "${module}" method "${method}" with params:`, params);
  return Promise.resolve({ success: true, message: 'Running in web mode' });
};

// Register global error handler
window.addEventListener('error', (event) => {
  console.error('[Lepus Error]', event.error);
});

console.log("[Lepus] Global environment initialized");