# Create Addon Notifier

A Discord & Telegram bot that sends a notification whenever a create addon gets updated (the data is retried from [Create Addons](https://github.com/stef-00012/create-addons/)'s WebSocket).
The bot can also just be used through [@CreateAddonsNotifierBot](https://t.me/CreateAddonsNotifierBot) (Telegram) or [Create Addons Notifier
#0281](https://discord.com/oauth2/authorize?client_id=1390937506710683708) (Discord).

# How to run

> [!IMPORTANT]
> Requires [Bun](https://bun.sh/)

1. `git clone https://github.com/Stef-00012/telegram-create-notifier`
2. `bun install`
3. `bun run db:setup`
4. copy `env.example` to `.env` and fill the values
5. `bun run start`

> [!NOTE]
> If you do not put a discord or telegram token, the bot will work, just it won't use that platform