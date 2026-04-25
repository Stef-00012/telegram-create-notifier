// general
import { handleWS } from "@/functions/handleWS";
import schemas from "@/db/schema";
import db from "@/db/db";
import fs from "node:fs";

// telegram
import type { TelegramCommand, TelegramEvent } from "@/types/handlers";
import type { Context } from "@/types/grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import type { BotCommand } from "grammy/types";
import { hydrate, type HydrateFlavor } from "@grammyjs/hydrate";
import { Bot as GrammyBot } from "grammy";
import {
	type ConversationFlavor,
	conversations,
	createConversation,
} from "@grammyjs/conversations";

// conversations
import {
	handleMessageConversation,
	conversationId as handleMessageConversationId,
} from "@/telegram/panels/settings";
import { utilMiddleware } from "@/telegram/middlewares/util";

// discord
import { GatewayIntentBits } from "discord.js";
import { Client } from "@/discord/structures/DiscordClient";
import type { DiscordCommand } from "@/types/discord";

export type Schemas = typeof schemas;
export type DB = typeof db;
export type BotContext = HydrateFlavor<Context>;
export type Bot = GrammyBot<ConversationFlavor<BotContext>>;

if (!process.env.TELEGRAM_TOKEN && !process.env.DISCORD_TOKEN) {
    throw new Error("Discord or Telegram bot token is not defined in the environment variables.");
}

export const locales: Record<string, Record<string, string>> = {};

const localeFiles = fs
	.readdirSync(`${__dirname}/locales`)
	.filter((file) => file.endsWith(".json"));

for (const localeFile of localeFiles) {
	const localeData = (await import(`${__dirname}/locales/${localeFile}`))
		.default as Record<string, string>;

	locales[localeFile.split(".")[0]] = localeData;

	console.info(
		`\x1b[34mLoaded the locale "\x1b[0;1m${localeFile.split(".")[0]}\x1b[0;34m"\x1b[0m`,
	);
}

let telegramBot: Bot | null = null;
let discordBot: Client | null = null;

if (process.env.TELEGRAM_TOKEN) {
	telegramBot = new GrammyBot<ConversationFlavor<BotContext>>(process.env.TELEGRAM_TOKEN);

	telegramBot.catch((error) => {
		console.error(
			`\x1b[31mThere was an error in the bot:\n - Name: \x1b[0;1m${error.name}\x1b[31m\n - Message: \x1b[0;1m${error.message}\x1b[31m\n - Cause: \x1b[0;1m${error.cause}\x1b[31m`,
			error.stack,
			"\x1b[0m",
		);
	});

	telegramBot.api.config.use(autoRetry());

	telegramBot.use(
		hydrate(),
		utilMiddleware(telegramBot, db, schemas),
		conversations<ConversationFlavor<Context>, BotContext>({
			plugins: async (conversation) => {
				return [
					hydrate(),
					/*
						biome-ignore lint/style/noNonNullAssertion: telegramBot is always
						not null as this function is only called in telegramBot.use()
					*/
					utilMiddleware(telegramBot!, db, schemas, conversation),
				];
			},
		}),

		createConversation(handleMessageConversation, handleMessageConversationId),
	);

	const suggestedCommands: BotCommand[] = [];

	const events = fs
		.readdirSync(`${__dirname}/telegram/events`)
		.filter((file) => file.endsWith(".ts"));

	const commands = fs
		.readdirSync(`${__dirname}/telegram/commands`)
		.filter((file) => file.endsWith(".ts"));

	for (const event of events) {
		const eventData = (await import(`${__dirname}/telegram/events/${event}`))
			.default as TelegramEvent;

		telegramBot.on(eventData.name, eventData.execute);

		console.info(
			`\x1b[34mLoaded the Telegram event "\x1b[0;1m${eventData.name}\x1b[0;34m"\x1b[0m`,
		);
	}

	for (const command of commands) {
		const commandData = (await import(`${__dirname}/telegram/commands/${command}`))
			.default as TelegramCommand;

		if (commandData.displaySuggestion && commandData.description) {
			suggestedCommands.push({
				command: commandData.name,
				description: commandData.description,
			});
		}

		telegramBot.command(
			commandData.name,
			(ctx, next) => {
				if (commandData.ownerOnly && !ctx.isOwner) return;
				if (commandData.adminOnly && !ctx.isAdmin) return;

				return next();
			},
			commandData.execute,
		);

		console.info(
			`\x1b[36mLoaded the Telegram command "\x1b[0;1m${commandData.name}\x1b[0;36m"\x1b[0m`,
		);
	}

	(async () => {
		await telegramBot.api.setMyCommands(suggestedCommands);

		telegramBot.start();
	})();
}

if (process.env.DISCORD_TOKEN) {
	discordBot = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildWebhooks],
	});

	const events = fs
		.readdirSync(`${__dirname}/discord/events`)
		.filter((file) => file.endsWith(".ts"));

	const commands = fs
		.readdirSync(`${__dirname}/discord/commands`)
		.filter((file) => file.endsWith(".ts"));

	for (const event of events) {
		const eventData = (await import(`${__dirname}/discord/events/${event}`)).default;

		const eventName = event.split(".")[0];

		discordBot.on(eventName, eventData.bind(null, discordBot));

		console.info(
			`\x1b[34mLoaded the Discord event "\x1b[0;1m${eventData.name}\x1b[0;34m"\x1b[0m`,
		);
	}

	for (const command of commands) {
		const commandData = (await import(`${__dirname}/discord/commands/${command}`))
			.default as DiscordCommand;

		discordBot.commands.set(commandData.name, commandData);

		console.info(
			`\x1b[36mLoaded the Discord command "\x1b[0;1m${commandData.name}\x1b[0;36m"\x1b[0m`,
		);
	}

	discordBot.login(process.env.DISCORD_TOKEN);
}

handleWS(telegramBot, discordBot);