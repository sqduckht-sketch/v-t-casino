require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

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

    if (command === '!balance') {
        message.reply(`Số dư của bạn: **${db[userId].balance} xu**`);
    }

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
                    winnerList += `<@${uid}>: +${bets[uid].amount}\n`;
                } else {
                    db[uid].balance -= bets[uid].amount;
                    winnerList += `<@${uid}>: -${bets[uid].amount}\n`;
                }
            }

            const embed = new EmbedBuilder()
                .setColor(result === 'tai' ? 0xFF0000 : 0x00FF00)
                .setTitle('🎲 KẾT QUẢ TÀI XỈU')
                .setDescription(`Kết quả: **${d1} - ${d2} - ${d3}**\nTổng: **${total} (${result.toUpperCase()})**`)
                .addFields({ name: 'Kết quả người chơi', value: winnerList || "Không có người đặt" })
                .setTimestamp();

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
