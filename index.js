require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);
const userSchema = new mongoose.Schema({ userId: String, balance: { type: Number, default: 100 } });
const User = mongoose.model('User', userSchema);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const ADMIN_ID = '1126092277220122634';

let isBettingOpen = false;
let bets = []; 
let huValue = 1000; // Hũ mặc định 1000
const dailyCooldowns = new Map(); 

function formatMoney(amount) { return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const args = message.content.split(' ');
    const command = args[0];
    const userId = message.author.id;
    let user = await User.findOne({ userId: userId }) || await User.create({ userId: userId });

    // --- CÁC LỆNH CŨ & MỚI ---

    if (command === '!daily') {
        const lastDaily = dailyCooldowns.get(userId);
        const now = Date.now();
        const eightHours = 8 * 60 * 60 * 1000;
        if (lastDaily && (now - lastDaily) < eightHours) {
            const timeLeft = Math.ceil((eightHours - (now - lastDaily)) / (3600000));
            return message.reply(`⏰ Bạn đã nhận rồi! Hãy quay lại sau ${timeLeft} giờ nữa.`);
        }
        user.balance += 200; await user.save();
        dailyCooldowns.set(userId, now);
        message.reply(`🎁 Chúc mừng! Bạn đã nhận **200 xu** điểm danh. Hẹn gặp lại sau 8 giờ!`);
    }

    if (command === '!tx') {
        if (isBettingOpen) return message.reply("Đang có phiên Tài Xỉu diễn ra!");
        isBettingOpen = true; bets = [];
        const msg = await message.channel.send("🎲 **TÀI XỈU MỞ BÁT!** Gõ `!dat <tai/xiu> <số_tiền>` trong 30 giây!");
        let cd = 30;
        const timer = setInterval(async () => {
            cd--;
            if (cd > 0) msg.edit(`🎲 **Đang chờ đặt cược... ${cd}s**\nSố người tham gia: ${bets.length}`);
            else {
                clearInterval(timer); isBettingOpen = false;
                const d = [Math.floor(Math.random()*6)+1, Math.floor(Math.random()*6)+1, Math.floor(Math.random()*6)+1];
                const total = d[0]+d[1]+d[2];
                const res = (total >= 11) ? 'tai' : 'xiu';
                let ketQua = `Kết quả: ${d[0]}-${d[1]}-${d[2]} (**${total}** - ${res.toUpperCase()})\n`;
                
                if (d[0] === d[1] && d[1] === d[2]) {
                    ketQua += `🎉 **NỔ HŨ!!!** 🎉 Người chơi được chia: ${formatMoney(huValue)} xu!\n`;
                    for (let b of bets) {
                        let u = await User.findOne({ userId: b.userId });
                        u.balance += Math.floor(huValue / bets.length); await u.save();
                    }
                    huValue = 1000;
                } else {
                    for (let b of bets) {
                        let u = await User.findOne({ userId: b.userId });
                        if (b.choice === res) { u.balance += (b.amount * 2); ketQua += `<@${b.userId}> thắng ${formatMoney(b.amount * 2)} xu!\n`; }
                        else { huValue += Math.floor(b.amount * 0.05); ketQua += `<@${b.userId}> thua ${formatMoney(b.amount)} xu.\n`; }
                        await u.save();
                    }
                }
                message.channel.send(ketQua + `💰 **Hũ hiện tại:** ${formatMoney(huValue)} xu`);
            }
        }, 1000);
    }

    if (command === '!dat') {
        if (!isBettingOpen) return message.reply("Hiện không có phiên nào mở!");
        const choice = args[1]?.toLowerCase(); const amount = parseInt(args[2]);
        if (!['tai', 'xiu'].includes(choice) || !amount || amount > user.balance || amount <= 0) return message.reply("Cú pháp: `!dat <tai/xiu> <số_tiền>`");
        user.balance -= amount; await user.save();
        bets.push({ userId, choice, amount });
        message.reply(`✅ Đã đặt ${formatMoney(amount)} xu vào **${choice.toUpperCase()}**.`);
    }

    if (command === '!balance') message.reply(`Số dư của bạn: **${formatMoney(user.balance)} xu**`);
    if (command === '!hu') message.reply(`💰 **Giá trị Hũ hiện tại:** ${formatMoney(huValue)} xu`);

    if (command === '!chuyen') {
        const target = message.mentions.users.first(); const amount = parseInt(args[2]);
        if (!target || !amount || user.balance < amount) return message.reply("Lỗi: Số tiền hoặc người nhận không hợp lệ!");
        user.balance -= amount; await user.save();
        let tUser = await User.findOne({ userId: target.id }) || await User.create({ userId: target.id });
        tUser.balance += amount; await tUser.save();
        message.reply(`✅ Đã chuyển ${formatMoney(amount)} xu cho ${target.username}`);
    }

    if (command === '!admin_add' && userId === ADMIN_ID) {
        const target = message.mentions.users.first(); const amount = parseInt(args[2]);
        let tUser = await User.findOne({ userId: target.id }) || await User.create({ userId: target.id });
        tUser.balance += amount; await tUser.save();
        message.reply(`👑 Admin đã cộng ${formatMoney(amount)} xu cho ${target.username}!`);
    }

    if (command === '!top') {
        const top = await User.find().sort({ balance: -1 }).limit(5);
        let msg = "🏆 **Bảng xếp hạng đại gia:**\n";
        for (let i = 0; i < top.length; i++) {
            const member = await message.guild.members.fetch(top[i].userId).catch(() => null);
            msg += `${i + 1}. ${member ? member.displayName : "Người lạ"}: **${formatMoney(top[i].balance)} xu**\n`;
        }
        message.channel.send(msg);
    }

    if (command === '!lixi') {
        const amount = parseInt(args[1]);
        if (!amount || amount <= 0 || user.balance < amount) return message.reply("Lỗi: Số tiền không hợp lệ!");
        user.balance -= amount; await user.save();
        global.lixiCode = Math.random().toString(36).substring(7);
        global.lixiAmount = amount;
        message.channel.send(`🧧 **Lì xì ${formatMoney(amount)} xu!** Gõ \`!nhan ${global.lixiCode}\` để nhận.`);
    }

    if (command === '!nhan' && args[1] === global.lixiCode) {
        user.balance += global.lixiAmount; await user.save();
        message.reply(`🎉 Chúc mừng! Bạn nhận được ${formatMoney(global.lixiAmount)} xu!`);
        global.lixiCode = null;
    }
});

client.login(process.env.DISCORD_TOKEN);
const http = require('http');
http.createServer((req, res) => { res.writeHead(200); res.end('Bot is active'); }).listen(process.env.PORT || 3000);
