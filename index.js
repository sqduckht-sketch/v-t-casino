require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ] 
});

const db = {};

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    const userId = message.author.id;
    if (!db[userId]) db[userId] = { balance: 100 };

    const command = message.content.split(' ')[0];

    if (command === '!balance') {
        message.reply(`Số dư của bạn: **${db[userId].balance} xu**`);
    }

    if (command === '!daily') {
        db[userId].balance += 50;
        message.reply("Bạn đã nhận được 50 xu miễn phí!");
    }

    if (command === '!flip') {
        if (db[userId].balance < 10) return message.reply("Bạn không đủ 10 xu để chơi!");
        
        const win = Math.random() > 0.5;
        if (win) {
            db[userId].balance += 10;
            message.reply(`Chúc mừng! Bạn thắng 10 xu. Tổng: ${db[userId].balance}`);
        } else {
            db[userId].balance -= 10;
            message.reply(`Tiếc quá! Bạn mất 10 xu. Tổng: ${db[userId].balance}`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

// Server để Render không bị ngủ
const http = require('http');
http.createServer((req, res) => {
  res.write("Bot is alive!");
  res.end();
}).listen(process.env.PORT || 3000);
