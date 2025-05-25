import { Bot } from "grammy";
import { adminOnly, ownerOnly } from "@/functions/util";
import type { Command, Event } from "@/types/handlers";
import { autoThread } from "@grammyjs/auto-thread";
import { autoRetry } from "@grammyjs/auto-retry";
import { handleWS } from "@/functions/handleWS";
import { localize } from "@/functions/localize";
import type { BotCommand } from "grammy/types";
import type { Context } from "@/types/grammy";
import schemas from "@/db/schema";
import { config } from "$config";
import { eq } from "drizzle-orm";
import db from "@/db/db";
import fs from "node:fs";
import {
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

// conversations
import { handleMessageConversation, conversationId as handleMessageConversationId } from "@/panels/settings";

export type Config = typeof config;
export type Schemas = typeof schemas;
export type DB = typeof db;

const bot = new Bot<ConversationFlavor<Context>>(config.token);

bot.catch((error) => {
	console.error(
		`\x1b[31mThere was an error in the bot:\n - Name: \x1b[0;1m${error.name}\x1b[31m\n - Message: \x1b[0;1m${error.message}\x1b[31m\n - Cause: \x1b[0;1m${error.cause}\x1b[31m`,
		error.stack,
		"\x1b[0m",
	);
});

bot.api.config.use(autoRetry())

bot.use(autoThread());
bot.use(async (ctx, next) => {
	ctx.bot = bot;
	ctx.db = db;
	ctx.dbSchemas = schemas;
	ctx.config = config;

	ctx.dbChat = undefined;

	if (ctx.chatId) {
		ctx.dbChat = await ctx.db.query.chats.findFirst({
			where: eq(ctx.dbSchemas.chats.chatId, ctx.chatId.toString()),
		})
	}

	ctx.locale = ctx.dbChat?.locale || "en";

	ctx.localizedAnswerCallbackQuery = async (_other, _locale, signal) => {
		let other = _other;

		const locale = _locale || ctx.locale;

		if (typeof other === "string") {
			other = await localize(locale, other)
		} else if (other?.text) {
			other.text = await localize(locale, other.text)
		}

		return ctx.answerCallbackQuery(other, signal)
	}

	ctx.localizedReply = async (_text, other, _locale, signal) => {
		const locale = _locale || ctx.locale;

		const text = await localize(locale, _text);

		return ctx.reply(text, (other || undefined), signal)
	}

	ctx.isAdmin = await adminOnly(ctx);
	ctx.isOwner = ownerOnly(ctx);

	await next();
});

bot.use(conversations())
bot.use(createConversation(handleMessageConversation, handleMessageConversationId))

const suggestedCommands: BotCommand[] = [];

const events = fs
	.readdirSync(`${__dirname}/events`)
	.filter((file) => file.endsWith(".ts"));

const commands = fs
	.readdirSync(`${__dirname}/commands`)
	.filter((file) => file.endsWith(".ts"));

for (const event of events) {
	const eventData = (await import(`${__dirname}/events/${event}`))
		.default as Event;

	bot.on(eventData.name, eventData.execute);

	console.log(
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

	bot.command(commandData.name, commandData.execute);

	console.log(
		`\x1b[36mLoaded the command "\x1b[0;1m${commandData.name}\x1b[0;36m"\x1b[0m`,
	);
}

bot.api.setMyCommands(suggestedCommands);

handleWS(bot);

bot.start();

