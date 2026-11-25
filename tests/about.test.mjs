import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, before, test } from 'node:test';

const require = createRequire(new URL('../client/package.json', import.meta.url));
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { createServer } = await import(require.resolve('vite'));
let server;
let About;

before(async () => {
  server = await createServer({
    root: new URL('../client', import.meta.url).pathname,
    server: { middlewareMode: true },
    appType: 'custom',
  });
  About = (await server.ssrLoadModule('/src/components/About.jsx')).default;
});

after(async () => { await server?.close(); });

test('About displays the demo title and current date in the browser locale', () => {
  const now = Date.now();
  const date = new Date(now);
  const markup = renderToStaticMarkup(createElement(About, { now }));
  assert.ok(markup.includes('<h1>GitHub Copilot Demo</h1>'));
  assert.ok(markup.includes(date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })));
});

test('About uses the local calendar date rather than UTC and updates after midnight', () => {
  const originalTimeZone = process.env.TZ;
  process.env.TZ = 'Pacific/Honolulu';
  try {
    const beforeMidnight = renderToStaticMarkup(createElement(About, { now: Date.parse('2026-11-25T09:59:00Z') }));
    const afterMidnight = renderToStaticMarkup(createElement(About, { now: Date.parse('2026-11-25T10:00:00Z') }));
    assert.ok(beforeMidnight.includes('dateTime="2026-11-24"'));
    assert.ok(afterMidnight.includes('dateTime="2026-11-25"'));
  } finally {
    if (originalTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimeZone;
  }
});
