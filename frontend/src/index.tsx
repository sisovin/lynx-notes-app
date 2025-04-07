import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Client-side entry point
const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

console.log("Lynx Notes App initialized");