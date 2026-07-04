import discord
from discord.ext import commands
import os
import database
from flask import Flask
from threading import Thread

# Khởi tạo Flask để Render nhận diện bot là một Web Service
app = Flask(__name__)

@app.route('/')
def home():
    return "Bot is alive!"

def run_web():
    # Lấy PORT mà Render cấp, nếu không có thì dùng mặc định 8080
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)

# Khởi tạo Bot Discord
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    database.init_db()
    print(f'Bot đã đăng nhập thành công: {bot.user}')

# Lệnh kiểm tra tiền
@bot.command()
async def bal(ctx):
    balance = database.get_balance(ctx.author.id)
    await ctx.send(f"💰 Số dư của bạn: **{balance} coins**")

# Chạy cả Web Server và Bot Discord cùng lúc
if __name__ == "__main__":
    Thread(target=run_web).start()
    bot.run(os.environ['DISCORD_TOKEN'])
