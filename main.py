import os
import discord
from discord.ext import commands
from flask import Flask
from threading import Thread

# Khởi tạo Flask App
app = Flask(__name__)

@app.route('/')
def home():
    return "Bot is alive!"

def run_web():
    # Sử dụng PORT từ biến môi trường
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)

# Khởi tạo Bot
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f'Bot đã đăng nhập thành công: {bot.user}')

# Chạy cả hai
if __name__ == "__main__":
    # Web server chạy ở luồng riêng
    Thread(target=run_web).start()
    
    # Chạy bot
    try:
        bot.run(os.environ['DISCORD_TOKEN'])
    except Exception as e:
        print(f"Lỗi khi chạy bot: {e}")
