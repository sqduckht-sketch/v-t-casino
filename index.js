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
let isBettingOpen = false;
let bets = {};

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const userId = message.author.id;
    if (!db[userId]) db[userId] = { balance: 100 };

    const args = message.content.split(' ');
    const command = args[0];

    // Lệnh cơ bản
    if (command === '!balance') {
        message.reply(`Số dư của bạn: **${db[userId].balance} xu**`);
    }

    if (command === '!daily') {
        db[userId].balance += 50;
        message.reply("Bạn đã nhận được 50 xu miễn phí!");
    }

    // Lệnh Tài Xỉu
    if (command === '!tx') {
        if (isBettingOpen) return message.reply("Phiên tài xỉu đang diễn ra, hãy đặt cược bằng lệnh `!dat <tai/xiu> <số tiền>`");
        
        isBettingOpen = true;
        bets = {}; 
        message.channel.send("🎲 **PHIÊN TÀI XỈU ĐÃ MỞ!** Mọi người có 30 giây để đặt cược bằng lệnh `!dat <tai/xiu> <số tiền>`");

        setTimeout(async () => {
            isBettingOpen = false;
            message.channel.send("⏳ Đã hết giờ! Đang tung xúc xắc...");

            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const d3 = Math.floor(Math.random() * 6) + 1;
            const total = d1 + d2 + d3;
            const result = (total >= 11) ? 'tai' : 'xiu';

            let resultMessage = `Kết quả: **${d1} - ${d2} - ${d3} (Tổng: ${total} - ${result.toUpperCase()})**\n\n`;

            for (const uid in bets) {
                if (bets[uid].choice === result) {
                    db[uid].balance += bets[uid].amount;
                    resultMessage += `<@${uid}> thắng ${bets[uid].amount} xu! (Tổng: ${db[uid].balance})\n`;
                } else {
                    db[uid].balance -= bets[uid].amount;
                    resultMessage += `<@${uid}> thua ${bets[uid].amount} xu! (Tổng: ${db[uid].balance})\n`;
                }
            }
            message.channel.send(resultMessage);
        }, 30000); 
    }

    if (command === '!dat') {
        if (!isBettingOpen) return message.reply("Hiện không có phiên nào đang mở!");
        const choice = args[1];
        const amount = parseInt(args[2]);
        if (!db[userId] || db[userId].balance < amount) return message.reply("Bạn không đủ tiền!");
        
        bets[userId] = { choice, amount };
        message.reply(`Đã nhận cược: **${amount} xu** vào **${choice}**`);
    }
});

client.login(process.env.DISCORD_TOKEN);

const http = require('http');
http.createServer((req, res) => {
  res.write("Bot is alive!");
  res.end();
}).listen(process.env.PORT || 3000);
