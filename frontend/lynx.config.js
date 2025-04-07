import { defineConfig } from '@lynx-js/rspeedy';
import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginQRCode({
      // Use dynamic URL generation based on the actual server settings
      schema: (url) => {
        // Extract hostname from current URL
        const hostname = url.hostname || '192.168.50.131';
        // Use the configured port from server settings
        const port = 3000; 
        return `http://${hostname}:${port}/?fullscreen=true`;
      },
      // Add these options for better QR code visibility
      options: {
        size: 200,         // QR code size
        margin: 4,         // QR code margin
        containerStyle: {
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          zIndex: 9999
        },
        qrStyle: {
          display: 'block'
        },
        // Add a title above the QR code
        titleText: 'Scan to open on mobile',
        titleStyle: {
          textAlign: 'center',
          marginBottom: '8px',
          fontWeight: 'bold'
        }
      }
    }),
    pluginReactLynx(),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  output: {
    distPath: "dist"
  }
});