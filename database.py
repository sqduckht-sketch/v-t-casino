import sqlite3

def init_db():
    conn = sqlite3.connect('casino.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY, balance INTEGER)''')
    conn.commit()
    conn.close()

def get_balance(user_id):
    conn = sqlite3.connect('casino.db')
    c = conn.cursor()
    c.execute("SELECT balance FROM users WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    return row[0] if row else 1000

def update_balance(user_id, amount):
    conn = sqlite3.connect('casino.db')
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO users (user_id, balance) VALUES (?, ?)", (user_id, get_balance(user_id) + amount))
    conn.commit()
    conn.close()
