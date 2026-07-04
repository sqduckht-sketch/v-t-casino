import os
import discord
from discord.ext import commands
from flask import Flask
from threading import Thread

# 1. Khởi tạo Flask ngay lập tức
app = Flask(__name__)

@app.route('/')
def home():
    return "Bot is alive!"

def run_web():
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)

# 2. Khởi động Web trước khi làm bất cứ việc gì khác
if __name__ == "__main__":
    Thread(target=run_web, daemon=True).start()

    # 3. Khởi tạo và chạy Bot
    intents = discord.Intents.default()
    intents.message_content = True
    bot = commands.Bot(command_prefix="!", intents=intents)

    @bot.event
    async def on_ready():
        print(f'Bot đã đăng nhập: {bot.user}')

    bot.run(os.environ['DISCORD_TOKEN'])
