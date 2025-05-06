import { chromium } from 'playwright';
import 'dotenv/config';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  // 1. Login
  await page.goto('https://www.bigseller.com/');
  await page.fill('input[name="email"]', process.env.BIGSELLER_EMAIL);
  await page.fill('input[name="password"]', process.env.BIGSELLER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // 2. Buka halaman menunggu dicetak
  await page.goto('https://www.bigseller.com/web/order/index.htm?status=processing');
  await page.waitForTimeout(6000);

  // 3. Ekspor
  await page.click('text=Ekspor');
  await page.click('text=Ekspor Semua Pesanan');
  await page.click('text=Template Standar');
  await page.click('text=Siap Kirim 2');
  await page.click('button:has-text("Ekspor")');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('text=Unduh')
  ]);

  const path = `/tmp/bigseller-${Date.now()}.xlsx`;
  await download.saveAs(path);
  console.log(`✅ File berhasil disimpan: ${path}`);

  await browser.close();
})();
