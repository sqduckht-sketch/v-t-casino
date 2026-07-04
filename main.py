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

# Hàm chạy web server - ĐƯỢC GỌI TRƯỚC
def run_web():
    port = int(os.environ.get("PORT", 10000))
    # Phải bind vào 0.0.0.0
    app.run(host='0.0.0.0', port=port)

# Khởi tạo Bot Discord
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f'Bot đã đăng nhập: {bot.user}')

# Chạy bot
if __name__ == "__main__":
    # Chạy web server trong luồng riêng
    web_thread = Thread(target=run_web)
    web_thread.daemon = True
    web_thread.start()
    
    # Chạy bot
    bot.run(os.environ['DISCORD_TOKEN'])
