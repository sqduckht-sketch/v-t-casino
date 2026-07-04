import discord
from discord.ext import commands
import os
import database # File database.py của bạn
from flask import Flask
from threading import Thread

# 1. Khởi tạo Flask để Render nhận diện bot là dịch vụ web
app = Flask(__name__)

@app.route('/')
def home():
    return "Bot is alive!"

def run_web():
    # Render yêu cầu dùng biến PORT nếu có, mặc định là 10000
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)

# 2. Khởi tạo Bot Discord
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    database.init_db() # Khởi tạo database khi bot sẵn sàng
    print(f'Bot đã đăng nhập thành công: {bot.user}')

# 3. Các lệnh của bot
@bot.command()
async def bal(ctx):
    balance = database.get_balance(ctx.author.id)
    await ctx.send(f"💰 Số dư của bạn: **{balance} coins**")

# 4. Chạy cả Web Server và Bot Discord cùng lúc
if __name__ == "__main__":
    # Chạy Flask ở một luồng riêng để không chặn Bot
    Thread(target=run_web).start()
    # Chạy bot với token từ biến môi trường
    bot.run(os.environ['DISCORD_TOKEN'])
