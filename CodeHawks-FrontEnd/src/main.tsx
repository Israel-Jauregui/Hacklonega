import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
// The Hacktoberfest look's fonts, self-hosted (Google Fonts would break the site's CSP).
// Browsers only download a face once text uses it, so the default club look costs nothing.
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-800.css';
import '@fontsource/martian-mono/latin-400.css';
import '@fontsource/martian-mono/latin-700.css';
import '@fontsource/barlow-semi-condensed/latin-700.css';
import './styles.css';

const root = document.getElementById('root')!;
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// The production build is prerendered (scripts/prerender.mjs); the dev server's page is not.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
