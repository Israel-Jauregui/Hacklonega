// Runs after `vite build`. Renders the app into dist/index.html and adds the
// Event structured data, so crawlers and link previews that do not run
// JavaScript still get the full page. The browser then hydrates this markup.
import { readFile, writeFile } from 'node:fs/promises';
import { StrictMode, createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const file = new URL('../dist/index.html', import.meta.url);
const placeholder = '<div id="root"></div>';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { default: App } = await vite.ssrLoadModule('/src/App.tsx');
  const { eventJsonLd } = await vite.ssrLoadModule('/src/lib/structured-data.ts');

  const template = await readFile(file, 'utf8');
  if (!template.includes(placeholder) || !template.includes('</head>')) throw new Error('dist/index.html is not the expected template.');

  const markup = renderToString(createElement(StrictMode, null, createElement(App)));
  if (!markup.includes('<h1')) throw new Error('Prerendered markup has no <h1>.');

  // A JSON data block is not executed, so the site's script-src 'self' CSP allows it.
  const jsonLd = JSON.stringify(eventJsonLd()).replaceAll('<', '\\u003c');
  await writeFile(file, template
    .replace('</head>', () => `  <script type="application/ld+json">${jsonLd}</script>\n  </head>`)
    .replace(placeholder, () => `<div id="root">${markup}</div>`));
} finally {
  await vite.close();
}
