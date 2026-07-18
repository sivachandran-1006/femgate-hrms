remove const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.click('text="HR Manager"');
  await page.click('text="Sign In to HRMS"');
  await page.waitForTimeout(2000);
  await page.goto('http://localhost:5173/branches', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  console.log('branches URL:', page.url());
  await page.screenshot({ path: '/private/tmp/claude-503/-Users-annz-Documents-GitHub-mgate-hrms/9955ce3b-0d7c-4ec9-8ea1-2a8d159e8c3e/scratchpad/nav-debug-branches.png' });
  await browser.close();
})();
