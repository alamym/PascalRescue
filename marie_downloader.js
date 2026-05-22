const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function downloadMarieDocx() {
  const userDataDir = path.join(__dirname, 'user_data');
  const downloadDir = path.join(__dirname, 'downloads');

  console.log("🚀 正在啟動瀏覽器，尋找 Marie 的郵件...");

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--start-maximized'],
    acceptDownloads: true
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  try {
    await page.goto('https://outlook.office.com/mail/');

    // 1. 等待 Outlook 載入
    console.log("等待 Outlook 介面載入...");
    await page.waitForSelector('input[placeholder="Search"]', { timeout: 30000 });

    // 2. 搜尋 Marie 的郵件
    console.log("正在搜尋 Marine 的 .docx 檔案...");
    const searchInput = await page.waitForSelector('input[placeholder="Search"]');
    await searchInput.fill('Marine .docx');
    await page.keyboard.press('Enter');

    // 等待搜尋結果渲染
    await page.waitForTimeout(5000);

    // 3. 點擊第一封搜尋到的郵件
    const firstEmail = await page.waitForSelector('div[role="option"]', { timeout: 30000 });
    await firstEmail.click();
    console.log("✅ 已選取郵件");

    // 4. 尋找附件並下載
    console.log("正在尋找 .docx 附件...");
    await page.waitForTimeout(3000);

    // 嘗試多種可能找到附件下載按鈕的方式
    const attachmentSelector = 'button[aria-label*=".docx"], [data-icon-name="Docx20_16"], button[title*=".docx"]';

    const hasAttachment = await page.$(attachmentSelector);
    if (!hasAttachment) {
      console.log("❌ 未在目前郵件中發現 .docx 附件。");
      // 截圖確認頁面狀態
      await page.screenshot({ path: 'no_attachment_found.png' });
      return;
    }

    console.log("發現附件，開始下載...");
    const [ download ] = await Promise.all([
      page.waitForEvent('download'),
      page.click(attachmentSelector)
    ]);

    const fileName = download.suggestedFilename();
    const filePath = path.join(downloadDir, fileName);
    await download.saveAs(filePath);

    console.log(`\n🎉 成功下載：${fileName}`);
    console.log(`儲存路徑：${filePath}`);

  } catch (e) {
    console.log("❌ 下載流程失敗：", e.message);
    await page.screenshot({ path: 'download_error.png' });
  } finally {
    console.log("\n--- 任務結束 ---");
    await context.close();
    process.exit();
  }
}

downloadMarieDocx();
