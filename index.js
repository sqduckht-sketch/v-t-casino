require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

const db = {};
let isBettingOpen = false;
let bets = {};
const ADMIN_ID = '1126092277220122634'; 

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const userId = message.author.id;
    if (!db[userId]) db[userId] = { balance: 100 };

    const args = message.content.split(' ');
    const command = args[0];

    // Lệnh Cơ Bản
    if (command === '!balance') message.reply(`Số dư của bạn: **${db[userId].balance} xu**`);
    if (command === '!daily') {
        db[userId].balance += 50;
        message.reply("Bạn đã nhận được 50 xu miễn phí!");
    }

    // Lệnh Chuyển Tiền
    if (command === '!chuyen') {
        const target = message.mentions.users.first();
        const amount = parseInt(args[2]);
        if (!target || !amount || amount <= 0) return message.reply("Cú pháp: `!chuyen @user <số tiền>`");
        if (db[userId].balance < amount) return message.reply("Bạn không đủ tiền!");
        if (!db[target.id]) db[target.id] = { balance: 100 };
        db[userId].balance -= amount;
        db[target.id].balance += amount;
        message.reply(`✅ Đã chuyển ${amount} xu cho ${target.username}!`);
    }

    // Lệnh Admin
    if (command === '!admin_add') {
        if (userId !== ADMIN_ID) return message.reply("Bạn không có quyền Admin!");
        const target = message.mentions.users.first();
        const amount = parseInt(args[2]);
        if (!target || !amount) return message.reply("Cú pháp: `!admin_add @user <số tiền>`");
        if (!db[target.id]) db[target.id] = { balance: 100 };
        db[target.id].balance += amount;
        message.reply(`👑 Admin đã cộng ${amount} xu cho ${target.username}!`);
    }

    // Lệnh Tài Xỉu
    if (command === '!tx') {
        if (isBettingOpen) return message.reply("Phiên đang mở, hãy dùng `!dat <tai/xiu> <tien>`");
        isBettingOpen = true;
        bets = {}; 
        message.channel.send("🎲 **PHIÊN TÀI XỈU (30s):** Đặt cược bằng `!dat tai 100` hoặc `!dat xiu 100`");

        setTimeout(async () => {
            isBettingOpen = false;
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const d3 = Math.floor(Math.random() * 6) + 1;
            const total = d1 + d2 + d3;
            const result = (total >= 11) ? 'tai' : 'xiu';

            let winnerList = "";
            for (const uid in bets) {
                if (bets[uid].choice === result) {
                    db[uid].balance += bets[uid].amount;
                    winnerList += `<@${uid}>: +${bets[uid].amount} xu\n`;
                } else {
                    db[uid].balance -= bets[uid].amount;
                    winnerList += `<@${uid}>: -${bets[uid].amount} xu\n`;
                }
            }

            const embed = new EmbedBuilder()
                .setColor(result === 'tai' ? 0xFF0000 : 0x00FF00)
                .setTitle('🎲 KẾT QUẢ TÀI XỈU')
                .setDescription(`Kết quả: **${d1} - ${d2} - ${d3}**\nTổng: **${total} (${result.toUpperCase()})**`)
                .addFields({ name: 'Danh sách cược', value: winnerList || "Không có người đặt" });
            message.channel.send({ embeds: [embed] });
        }, 30000); 
    }

    if (command === '!dat') {
        if (!isBettingOpen) return message.reply("Không có phiên nào đang mở!");
        const choice = args[1]?.toLowerCase();
        const amount = parseInt(args[2]);
        if (!choice || !amount || db[userId].balance < amount) return message.reply("Sai cú pháp hoặc không đủ tiền!");
        bets[userId] = { choice, amount };
        message.reply(`✅ Đã nhận ${amount} xu vào ${choice.toUpperCase()}`);
    }
});

client.login(process.env.DISCORD_TOKEN);

const http = require('http');
http.createServer((req, res) => res.end("Bot is alive!")).listen(process.env.PORT || 3000);
