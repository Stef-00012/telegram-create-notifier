import { adminOnly, ownerOnly } from "@/functions/util";
import type { Bot, Config, DB, Schemas } from "@/bot";
import { localize } from "@/functions/localize";
import type { BotContext as Context } from "@/bot";
import { eq } from "drizzle-orm";
import type { Conversation } from "@/types/grammy";

export function utilMiddleware(
	bot: Bot,
	db: DB,
	schemas: Schemas,
	config: Config,
	conversation?: Conversation,
) {
	return async (ctx: Context, next: () => Promise<void>) => {
		ctx.bot = bot;
		ctx.db = db;
		ctx.dbSchemas = schemas;
		ctx.config = config;

		ctx.dbChat = undefined;

		if (ctx.chatId) {
			if (conversation) {
				ctx.dbChat = await conversation.external((ctx) => {
					if (!ctx.chatId) return undefined;

					return ctx.db.query.chats.findFirst({
						where: eq(ctx.dbSchemas.chats.chatId, ctx.chatId.toString()),
					});
				});
			} else {
				ctx.dbChat = await ctx.db.query.chats.findFirst({
					where: eq(ctx.dbSchemas.chats.chatId, ctx.chatId.toString()),
				});
			}
		}

		ctx.locale = ctx.dbChat?.locale || "en";

		ctx.localizedAnswerCallbackQuery = async (_other, _locale, signal) => {
			let other = _other;

			const locale = _locale || ctx.locale;

			if (typeof other === "string") {
				other = localize(locale, other);
			} else if (other?.text) {
				other.text = localize(locale, other.text);
			}

			return ctx.answerCallbackQuery(other, signal);
		};

		ctx.localizedReply = async (_text, other, _locale, signal) => {
			const locale = _locale || ctx.locale;

			const text = localize(locale, _text);

			return ctx.reply(text, other || undefined, signal);
		};

		ctx.botStatus = ctx.myChatMember?.new_chat_member.status;

		if (ctx.botStatus !== "kicked" && ctx.botStatus !== "left")
			ctx.isAdmin = await adminOnly(ctx);
		ctx.isOwner = ownerOnly(ctx);

		await next();
	};
}
