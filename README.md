# Telegram Create Addon Notifier

A telegram bot that sends a notification whenever a create addon gets updated (the data is retried from [Create Addons](https://github.com/stef-00012/create-addons/)'s WebSocket).
The bot can also just be used through [@CreateAddonsNotifierBot](https://t.me/CreateAddonsNotifierBot).

# How to run

> [!IMPORTANT]
> Requires [Bun](https://bun.sh/)

1. `git clone https://github.com/Stef-00012/telegram-create-notifier`
2. `bun install`
3. `bun run db:setup`
4. `bun run start`