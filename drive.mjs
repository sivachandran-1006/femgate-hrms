import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

page.on("console", (msg) => {
  if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text());
});
page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));

await page.goto("http://localhost:5173/");

await page.evaluate(() => {
  localStorage.setItem("token", "Bearer mocktoken");
  localStorage.setItem("hrms_user", JSON.stringify({
    id: "emp001", email: "mani@mgatetech.com", role: "SUPER_ADMIN", name: "Mani", companyId: "c001",
  }));
});

await page.goto("http://localhost:5173/recruitment");
await page.waitForTimeout(2000);
await page.screenshot({ path: "/private/tmp/claude-503/-Users-annz-Documents-GitHub-mgate-hrms/c2b73dce-4960-4a5e-b77b-5b76dac7635d/scratchpad/01-recruitment.png" });

const postJobBtn = page.getByRole("button", { name: /post job/i }).first();
await postJobBtn.click();
await page.waitForTimeout(500);
await page.screenshot({ path: "/private/tmp/claude-503/-Users-annz-Documents-GitHub-mgate-hrms/c2b73dce-4960-4a5e-b77b-5b76dac7635d/scratchpad/02-step1.png" });

await browser.close();
