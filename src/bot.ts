import type { Command, Event } from "@/types/handlers";
import type { Context } from "@/types/grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { handleWS } from "@/functions/handleWS";
import type { BotCommand } from "grammy/types";
import { hydrate, type HydrateFlavor } from "@grammyjs/hydrate";
import { Bot as GrammyBot } from "grammy";
import schemas from "@/db/schema";
import db from "@/db/db";
import fs from "node:fs";
import {
	type ConversationFlavor,
	conversations,
	createConversation,
} from "@grammyjs/conversations";

// conversations
import {
	handleMessageConversation,
	conversationId as handleMessageConversationId,
} from "@/panels/settings";
import { utilMiddleware } from "@/middlewares/util";

export type Schemas = typeof schemas;
export type DB = typeof db;
export type BotContext = HydrateFlavor<Context>;
export type Bot = GrammyBot<ConversationFlavor<BotContext>>;

if (!process.env.TOKEN) {
    throw new Error("Bot token is not defined in the environment variables.");
}

const bot = new GrammyBot<ConversationFlavor<BotContext>>(process.env.TOKEN);

bot.catch((error) => {
	console.error(
		`\x1b[31mThere was an error in the bot:\n - Name: \x1b[0;1m${error.name}\x1b[31m\n - Message: \x1b[0;1m${error.message}\x1b[31m\n - Cause: \x1b[0;1m${error.cause}\x1b[31m`,
		error.stack,
		"\x1b[0m",
	);
});

bot.api.config.use(autoRetry());

bot.use(
	hydrate(),
	utilMiddleware(bot, db, schemas),
	conversations<ConversationFlavor<Context>, BotContext>({
		plugins: async (conversation) => {
			return [
				hydrate(),
				utilMiddleware(bot, db, schemas, conversation),
			];
		},
	}),

	createConversation(handleMessageConversation, handleMessageConversationId),
);

const suggestedCommands: BotCommand[] = [];

const events = fs
	.readdirSync(`${__dirname}/events`)
	.filter((file) => file.endsWith(".ts"));

const commands = fs
	.readdirSync(`${__dirname}/commands`)
	.filter((file) => file.endsWith(".ts"));

const localeFiles = fs
	.readdirSync(`${__dirname}/locales`)
	.filter((file) => file.endsWith(".json"));

export const locales: Record<string, Record<string, string>> = {};

for (const event of events) {
	const eventData = (await import(`${__dirname}/events/${event}`))
		.default as Event;

	bot.on(eventData.name, eventData.execute);

	console.info(
		`\x1b[34mLoaded the event "\x1b[0;1m${eventData.name}\x1b[0;34m"\x1b[0m`,
	);
}

for (const command of commands) {
	const commandData = (await import(`${__dirname}/commands/${command}`))
		.default as Command;

	if (commandData.displaySuggestion && commandData.description) {
		suggestedCommands.push({
			command: commandData.name,
			description: commandData.description,
		});
	}

	bot.command(
		commandData.name,
		(ctx, next) => {
			if (commandData.ownerOnly && !ctx.isOwner) return;
			if (commandData.adminOnly && !ctx.isAdmin) return;

			return next();
		},
		commandData.execute,
	);

	console.info(
		`\x1b[36mLoaded the command "\x1b[0;1m${commandData.name}\x1b[0;36m"\x1b[0m`,
	);
}

for (const localeFile of localeFiles) {
	const localeData = (await import(`${__dirname}/locales/${localeFile}`))
		.default as Record<string, string>;

	locales[localeFile.split(".")[0]] = localeData;

	console.info(
		`\x1b[34mLoaded the locale "\x1b[0;1m${localeFile.split(".")[0]}\x1b[0;34m"\x1b[0m`,
	);
}

(async () => {
	await bot.api.setMyCommands(suggestedCommands);

	handleWS(bot);

	bot.start();
})();
