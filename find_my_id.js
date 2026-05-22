import { Telegraf } from 'telegraf';

const token = '8508168171:AAH-eWqLOnbU2yfUnBktv0WEUtuJ54QfIms';
const bot = new Telegraf(token);

console.log('--- ID 偵測模式啟動 ---');
console.log('請在 Telegram 搜尋你的機器人並發送任何訊息（例如：你好）。');
console.log('你的 Chat ID 將會顯示在下方...\n');

bot.on('text', (ctx) => {
    const chatId = ctx.chat.id;
    const name = ctx.from.first_name;
    console.log('====================================');
    console.log(`✅ 偵測成功！`);
    console.log(`您的名字: ${name}`);
    console.log(`您的 Chat ID 是: ${chatId}`);
    console.log('====================================');
    console.log('\n請複製上面的數字，然後按 Ctrl+C 停止此腳本。');
});

bot.launch();
