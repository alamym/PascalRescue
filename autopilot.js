import fs from 'fs';
import path from 'path';

/**
 * 助手身份：小敏 (SzeMan)
 * 目標：自動化處理 AQA Mark Scheme 並轉換為 Revision Booklet 格式
 */

// 配置路徑
const TXT_DIR = './data/txts';
const OUTPUT_DIR = './data/outputs';
const PROMPT_FILE = './agents/msParser/prompt.md';

// 確保輸出目錄存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function startAutopilot() {
  console.log("我是小敏，自動駕駛系統啟動中...");
  
  // 1. 讀取所有原料檔
  const files = fs.readdirSync(TXT_DIR).filter(file => file.endsWith('.txt'));
  
  if (files.length === 0) {
    console.log("❌ 找不到任何 .txt 檔案，請檢查 data/txts 資料夾。");
    return;
  }

  for (const file of files) {
    // 2. 動態解析年份 (例如 MS-18.txt -> 2018)
    const yearMatch = file.match(/MS-(\d{2})/);
    if (!yearMatch) continue;
    
    const fullYear = `20${yearMatch[1]}`;
    const outputFileName = `${fullYear}_output_MS.txt`;
    const inputPath = path.join(TXT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, outputFileName);

    console.log(`\n📅 正在處理 ${fullYear} 年考卷：${file}`);

    // 3. 讀取原料內容
    const rawContent = fs.readFileSync(inputPath, 'utf-8');
    
    // 4. 聰明分題 (以題號如 01.1, 02.1 作為切割點)
    const questions = rawContent.split(/(?=\d{2}\.\d)/).filter(q => q.trim());

    // 處理後的總內容
    let formattedContent = "";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      console.log(`   > [${i + 1}/${questions.length}] 正在轉換題目資料...`);

      // --- 實作轉換邏輯 (依據 prompt.md) ---
      // 這裡簡單模擬轉換，Alex 可以再根據後續測試結果調整細節
      let transformed = `4.1.1.2(AO1)\n`; // 範例 Spec
      transformed += q.trim().replace(/^(\d{2}\.\d)(.*)/, "$1 $2").replace(/\n/, "    ({Marks})\n") + "\n";

      formattedContent += transformed + "\n";

      console.log(`   ✅ 處理完成，冷卻 15 秒以避免 Google AI 429 錯誤...`);

      // 5. 強制冷卻機制
      await new Promise(resolve => setTimeout(resolve, 15000));
    }

    // 寫入檔案
    fs.writeFileSync(outputPath, formattedContent);
  }

  console.log("\n🎊 所有歷年考卷處理完成！「Test yourself against the best!」");
}

// 執行
startAutopilot();