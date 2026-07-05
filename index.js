require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);
const userSchema = new mongoose.Schema({ userId: String, balance: { type: Number, default: 100 } });
const User = mongoose.model('User', userSchema);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const ADMIN_ID = '1126092277220122634';

function formatMoney(amount) { return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const userId = message.author.id;
    let user = await User.findOne({ userId: userId }) || await User.create({ userId: userId });
    const args = message.content.split(' ');
    const command = args[0];

    if (command === '!balance') message.reply(`Số dư của bạn: **${formatMoney(user.balance)} xu**`);

    if (command === '!chuyen') {
        const target = message.mentions.users.first();
        const amount = parseInt(args[2]);
        if (!target || !amount || user.balance < amount) return message.reply("Lỗi: Số tiền không hợp lệ hoặc không đủ tiền!");
        user.balance -= amount; await user.save();
        let tUser = await User.findOne({ userId: target.id }) || await User.create({ userId: target.id });
        tUser.balance += amount; await tUser.save();
        message.reply(`✅ Đã chuyển ${formatMoney(amount)} xu cho ${target.username}`);
    }

    if (command === '!admin_add' && userId === ADMIN_ID) {
        const target = message.mentions.users.first();
        const amount = parseInt(args[2]);
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

    if (command === '!tx') {
        const choice = args[1]?.toLowerCase();
        const amount = parseInt(args[2]);
        if (!['tai', 'xiu'].includes(choice) || !amount || amount > user.balance || amount <= 0) return message.reply("Cú pháp: `!tx <tai/xiu> <số_tiền>`");
        user.balance -= amount; await user.save();
        const msg = await message.reply("🎲 Đang lắc xúc xắc... 3");
        let cd = 3;
        const timer = setInterval(() => { cd--; if(cd > 0) msg.edit(`🎲 Đang lắc xúc xắc... ${cd}`); else clearInterval(timer); }, 1000);
        setTimeout(async () => {
            const d = [Math.floor(Math.random()*6)+1, Math.floor(Math.random()*6)+1, Math.floor(Math.random()*6)+1];
            const total = d[0]+d[1]+d[2];
            const res = (total >= 11) ? 'tai' : 'xiu';
            if (res === choice) { user.balance += (amount * 2); await user.save(); msg.edit(`Kết quả: ${d[0]} ${d[1]} ${d[2]} (**${total}** - ${res.toUpperCase()})\n🎉 Thắng **${formatMoney(amount*2)} xu**!`); }
            else msg.edit(`Kết quả: ${d[0]} ${d[1]} ${d[2]} (**${total}** - ${res.toUpperCase()})\n😭 Thua rồi!`);
        }, 3000);
    }
});

client.login(process.env.DISCORD_TOKEN);
const http = require('http');
http.createServer((req, res) => res.end('Running')).listen(process.env.PORT || 3000);
