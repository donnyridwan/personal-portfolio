// Host-native Playwright adapter emitting Replica's captures.json evidence contract (Una is unavailable here).
// Readiness counts rendered images only: lazy images inside display:none breakpoint variants are never fetched by browsers.
const {chromium} = require('playwright'); const fs = require('fs'); const path = require('path');
const crypto = require('crypto'); const {execFileSync} = require('child_process');
const [cfgPath, out, skillDir] = process.argv.slice(2);
const plan = JSON.parse(execFileSync('node', [path.join(skillDir, 'scripts/replica.mjs'), 'plan', '--config', cfgPath]));
const config = plan.config;
(async () => {
  fs.mkdirSync(path.join(out, 'screenshots'), {recursive: true});
  const receipt = {version: 1, runId: crypto.randomUUID(), configHash: plan.configHash, createdAt: new Date().toISOString(), entries: []};
  const browser = await chromium.launch();
  for (const c of plan.matrix) {
    const entry = {...c}; const key = crypto.createHash('sha256').update(JSON.stringify(c)).digest('hex').slice(0, 16);
    for (const side of ['reference', 'local']) {
      const ctx = await browser.newContext({viewport: {width: c.width, height: c.height}, deviceScaleFactor: c.dpr, reducedMotion: 'reduce', colorScheme: config.colorScheme ?? 'light'});
      const page = await ctx.newPage(); const errors = [], failures = [];
      page.on('pageerror', e => errors.push(String(e.message).slice(0, 300)));
      page.on('requestfailed', r => { const u = new URL(r.url()); if (u.hostname !== 'events.framer.com') failures.push(`${r.failure()?.errorText} ${r.url().slice(0, 200)}`); });
      const url = new URL(c.route, config[side]).href;
      await page.goto(url, {waitUntil: 'networkidle'});
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += Math.floor(c.height / 2)) { await page.evaluate(y => window.scrollTo({top: y, behavior: 'instant'}), y); await page.waitForTimeout(120); }
      await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
      await page.evaluate(() => document.fonts.ready); await page.waitForLoadState('networkidle'); await page.waitForTimeout(3500);
      const obs = await page.evaluate(() => ({url: location.href, title: document.title, visibility: document.visibilityState,
        fonts: document.fonts.status, ready: document.readyState === 'complete' && [...document.images].filter(i => i.getClientRects().length).every(i => i.complete), scrollY: window.scrollY,
        documentWidth: document.documentElement.scrollWidth, documentHeight: document.documentElement.scrollHeight, browser: navigator.userAgent, platform: navigator.platform}));
      const shot = `screenshots/${key}-${side}.png`;
      const buf = await page.screenshot({path: path.join(out, shot), fullPage: true});
      entry[side] = {...obs, targetId: `playwright-${side}`, viewport: {width: c.width, height: c.height, dpr: c.dpr}, colorScheme: config.colorScheme ?? 'light', reducedMotion: true,
        diagnostics: {errors, failures, truncated: false}, screenshot: shot, sha256: crypto.createHash('sha256').update(buf).digest('hex')};
      await ctx.close();
    }
    receipt.entries.push(entry);
    console.log(c.route, c.width, entry.reference.documentHeight, entry.local.documentHeight);
  }
  fs.writeFileSync(path.join(out, 'captures.json'), JSON.stringify(receipt, null, 2) + '\n');
  await browser.close();
})();
