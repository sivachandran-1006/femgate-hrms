const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  const netErrors = [];
  page.on('console', (msg) => { console.log('[console]', msg.type(), msg.text()); if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));
  page.on('requestfailed', (req) => netErrors.push(req.url()));

  const shot = (name) => page.screenshot({ path: `/private/tmp/claude-503/-Users-annz-Documents-GitHub-mgate-hrms/9955ce3b-0d7c-4ec9-8ea1-2a8d159e8c3e/scratchpad/${name}.png` });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.click('text="HR Manager"', { timeout: 8000 });
  await page.click('text="Sign In to HRMS"');
  await page.waitForTimeout(3000);
  console.log('URL after login:', page.url());
  await shot('fd-01-dashboard');

  for (const path of ['branches', 'designations', 'departments', 'announcements', 'holiday-calendar']) {
    await page.goto(`http://localhost:5173/${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await shot(`fd-02-${path}`);
  }

  console.log('CONSOLE_ERRORS:', errors.length);
  console.log('NET_REQUESTS_TO_BACKEND:', netErrors.filter(u => u.includes('localhost:4000')).length);
  console.log('Sample net errors:', netErrors.slice(0, 3));
  await browser.close();
})();
