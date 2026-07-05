require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Đã kết nối MongoDB!'))
    .catch(err => console.error('Lỗi kết nối:', err));

const userSchema = new mongoose.Schema({ userId: String, balance: { type: Number, default: 100 } });
const User = mongoose.model('User', userSchema);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const ADMIN_ID = '1126092277220122634';

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const userId = message.author.id;
    let user = await User.findOne({ userId: userId }) || await User.create({ userId: userId });

    const args = message.content.split(' ');
    const command = args[0];

    if (command === '!balance') message.reply(`Số dư của bạn: **${user.balance} xu**`);
    
    if (command === '!chuyen') {
        const target = message.mentions.users.first();
        const amount = parseInt(args[2]);
        if (!target || !amount || user.balance < amount) return message.reply("Lỗi: Không đủ tiền hoặc sai cú pháp!");
        
        user.balance -= amount;
        await user.save();
        
        let targetUser = await User.findOne({ userId: target.id }) || await User.create({ userId: target.id });
        targetUser.balance += amount;
        await targetUser.save();
        message.reply(`✅ Đã chuyển ${amount} xu cho ${target.username}`);
    }

    if (command === '!admin_add' && userId === ADMIN_ID) {
        const target = message.mentions.users.first();
        const amount = parseInt(args[2]);
        let targetUser = await User.findOne({ userId: target.id }) || await User.create({ userId: target.id });
        targetUser.balance += amount;
        await targetUser.save();
        message.reply(`👑 Admin đã cộng ${amount} xu cho ${target.username}!`);
    }
});

client.login(process.env.DISCORD_TOKEN);
