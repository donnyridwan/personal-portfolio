// Host-native behaviour checks emitting Replica's checks.json receipts. Every check runs on reference AND local.
const {chromium} = require('playwright'); const fs = require('fs'); const path = require('path');
const [cfgPath, out] = process.argv.slice(2);
const captures = JSON.parse(fs.readFileSync(path.join(out, 'captures.json')));
const config = JSON.parse(fs.readFileSync(cfgPath));
const tests = {
  'nav-hover-brackets': async (page, base) => {
    await page.goto(base + '/', {waitUntil: 'networkidle'});
    const link = page.locator('nav a, a').filter({hasText: /^\(?Projects\)?$/}).filter({visible: true}).first();
    const op = () => link.evaluate(a => +getComputedStyle(a.children[0]).opacity);
    const before = await op(); await link.hover(); const samples = [];
    for (let i = 0; i < 14; i++) { samples.push(+(await op()).toFixed(2)); await page.waitForTimeout(100); }
    const firstPeak = samples.findIndex(v => v > 0.75), firstTrough = samples.findIndex((v, i) => i > firstPeak && v < 0.2);
    const repeat = samples.findIndex((v, i) => i > firstTrough && v > 0.75);
    return {expected: 'bracket hidden at rest; on hover above 0.75 within 300ms, then pulses (fades <0.2, returns >0.75) within 1.4s', before, samples, firstPeak, firstTrough, repeat,
      pass: before === 0 && firstPeak >= 0 && firstPeak <= 3 && firstTrough > 0 && repeat > 0};
  },
  'anchor-services': async (page, base) => {
    await page.goto(base + '/', {waitUntil: 'networkidle'});
    await page.locator('a').filter({hasText: /^\(?Services\)?$/}).filter({visible: true}).first().click();
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => ({scrollY: Math.round(scrollY), top: Math.round(document.getElementById('services').getBoundingClientRect().top), hash: location.hash}));
    return {expected: '#services section scrolled to near top of viewport', ...r, pass: r.scrollY > 500 && Math.abs(r.top) < 200};
  },
  'project-link': async (page, base) => {
    await page.goto(base + '/', {waitUntil: 'networkidle'});
    await page.locator('a[href*="projects/vela-brand-identity"]').filter({visible: true}).first().click();
    await page.waitForURL(/vela-brand-identity/); await page.locator('h1', {hasText: 'Vela'}).filter({visible: true}).first().waitFor({timeout: 8000});
    const h1 = await page.locator('h1', {hasText: 'Vela'}).filter({visible: true}).first().innerText();
    return {expected: 'navigates to Vela project page', url: page.url(), h1, pass: /vela-brand-identity/.test(page.url()) && /Vela/.test(h1)};
  },
  'normal-motion': async (page, base) => {
    await page.goto(base + '/', {waitUntil: 'domcontentloaded'});
    const sample = () => page.evaluate(() => { const s = [...document.querySelectorAll('h1 span span')].filter(e => e.getClientRects().length); return s.length ? +getComputedStyle(s[s.length - 1]).opacity : null; });
    const t0 = await sample(); await page.waitForTimeout(3000); const t1 = await sample();
    const img = await page.evaluate(() => { const e = [...document.querySelectorAll('[style*="scale(1.2)"], [style*="will-change"]')]; return e.length; });
    return {expected: 'hero heading characters animate in (last char opacity <1 early, 1 after 3s)', early: t0, late: t1, pass: t0 !== null && t0 < 1 && t1 === 1};
  },
};
(async () => {
  const browser = await chromium.launch(); const items = [];
  fs.mkdirSync(path.join(out, 'checks'), {recursive: true});
  for (const id of config.requiredChecks) {
    const evidence = {id, sides: {}};
    for (const side of ['reference', 'local']) {
      const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'no-preference'});
      const page = await ctx.newPage(); const t = Date.now();
      try { evidence.sides[side] = {...await tests[id](page, config[side].replace(/\/$/, '')), ms: Date.now() - t}; }
      catch (e) { evidence.sides[side] = {pass: false, error: String(e.message).slice(0, 300)}; }
      await ctx.close();
    }
    const file = `checks/${id}.json`; fs.writeFileSync(path.join(out, file), JSON.stringify(evidence, null, 2));
    const status = evidence.sides.reference.pass && evidence.sides.local.pass ? 'PASS' : 'FAIL';
    items.push({id, status, evidence: file}); console.log(id, status, JSON.stringify(evidence.sides));
  }
  fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify({version: 1, runId: captures.runId, configHash: captures.configHash, items}, null, 2));
  await browser.close();
})();
