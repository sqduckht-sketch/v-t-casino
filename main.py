import os
import discord
from discord.ext import commands
from flask import Flask
from threading import Thread

# Khởi tạo Flask
app = Flask(__name__)

@app.route('/')
def home():
    return "Bot is alive!"

def run_web():
    # Sử dụng cổng được Render cấp (biến môi trường PORT)
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)

# Khởi tạo Bot Discord
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f'Bot đã đăng nhập thành công: {bot.user}')

# Chạy cả web và bot
if __name__ == "__main__":
    # Chạy Web Server trong một luồng riêng
    Thread(target=run_web).start()
    
    # Chạy bot với token
    token = os.environ.get("DISCORD_TOKEN")
    if token:
        bot.run(token)
    else:
        print("LỖI: Chưa có DISCORD_TOKEN!")
