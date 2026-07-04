import os
import discord
from discord.ext import commands
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
    print(f'Bot đã đăng nhập thành công: {bot.user}')

# 3. Chạy cả Web Server và Bot Discord cùng lúc
if __name__ == "__main__":
    # Chạy Flask ở một luồng riêng để không chặn Bot
    Thread(target=run_web).start()
    
    # Chạy bot với token từ biến môi trường
    token = os.environ.get("DISCORD_TOKEN")
    if token:
        bot.run(token)
    else:
        print("LỖI: Chưa có DISCORD_TOKEN trong biến môi trường!")
