require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Database giả lập (Memory Storage)
const db = {};

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    const userId = message.author.id;
    if (!db[userId]) db[userId] = { balance: 100 }; // Khởi tạo 100 xu cho người mới

    const args = message.content.split(' ');
    const command = args[0];

    // Lệnh kiểm tra tiền
    if (command === '!balance') {
        message.reply(`Số dư của bạn: **${db[userId].balance} xu**`);
    }

    // Lệnh nhận tiền hằng ngày
    if (command === '!daily') {
        db[userId].balance += 50;
        message.reply("Bạn đã nhận được 50 xu miễn phí!");
    }

    // Lệnh chơi Coinflip (Cược 10 xu)
    if (command === '!flip') {
        if (db[userId].balance < 10) return message.reply("Bạn không đủ 10 xu để chơi!");
        
        const win = Math.random() > 0.5;
        if (win) {
            db[userId].balance += 10;
            message.reply(`Chúc mừng! Bạn tung trúng mặt ngửa. Bạn thắng 10 xu. Tổng: ${db[userId].balance}`);
        } else {
            db[userId].balance -= 10;
            message.reply(`Tiếc quá! Bạn tung trúng mặt sấp. Bạn mất 10 xu. Tổng: ${db[userId].balance}`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
