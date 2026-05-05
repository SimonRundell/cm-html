/**
 * @fileoverview Application entry point.
 * Mounts the React root into the #root DOM element provided by index.html.
 * StrictMode is enabled in development to surface potential issues early.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
