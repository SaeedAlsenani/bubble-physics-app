from telethon import TelegramClient, events, Button

BOT_TOKEN = "7771832748:AAHtQD73OlrYM1wzEmgqGdRbcGKOeE0KwUE"
WEBAPP_URL = "https://new-gift-mini-app.vercel.app/"

# استخدم هذه الإعدادات الخاصة بالبوت
bot = TelegramClient(
    session='bot_session',
    api_id=2040,  # هذا الرقم ثابت ويعمل مع البوتات
    api_hash='b18441a1ff607e10a989891a5462e627'  # هذا الهاش ثابت للبوتات
).start(bot_token=BOT_TOKEN)

@bot.on(events.NewMessage(pattern='/start'))
async def start(event):
    await event.reply(
        '🚀 مرحبًا! اضغط لفتح التطبيق:',
        buttons=[Button.url('🎮 افتح التطبيق', WEBAPP_URL)]
    )

print("Bot is running...")
bot.run_until_disconnected()
