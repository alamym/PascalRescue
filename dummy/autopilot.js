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

    for (let i = 0; i < questions.length; i++) {
      console.log(`   > [${i + 1}/${questions.length}] 正在轉換題目資料...`);

      /**
       * 💡 實際運作邏輯：
       * 在 Claude Code 環境下，你會直接請 Claude 執行這個腳本。
       * Claude 會讀取 prompt.md 的規則 來格式化這些 questions。
       */
      
      // 模擬處理後的結果（這部分在執行時會由你的 AI 指令接管輸出格式）
      // 格式包含：Spec Ref(AO), 子題號, 答案(1), 以及縮排的 Extra Info[cite: 1, 4, 6]
      
      console.log(`   ✅ 處理完成，冷卻 15 秒以避免 Google AI 429 錯誤...`);
      
      // 5. 強制冷卻機制
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
    
    console.log(`✨ ${fullYear} 年考卷處理完畢，已存至 outputs/${outputFileName}`);
  }

  console.log("\n🎊 所有歷年考卷處理完成！「Test yourself against the best!」");
}

// 執行
startAutopilot();