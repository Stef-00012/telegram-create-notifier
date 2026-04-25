import { adminOnly, ownerOnly } from "@/functions/util";
import type { Bot, DB, Schemas } from "@/bot";
import { localize } from "@/functions/localize";
import type { BotContext as Context } from "@/bot";
import { eq } from "drizzle-orm";
import type { Conversation } from "@/types/grammy";

export function utilMiddleware(
	bot: Bot,
	db: DB,
	schemas: Schemas,
	conversation?: Conversation,
) {
	return async (ctx: Context, next: () => Promise<void>) => {
		ctx.bot = bot;
		ctx.db = db;
		ctx.dbSchemas = schemas;

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

		ctx.localizedAnswerCallbackQuery = async (_other, options) => {
			let other = _other;

			const locale = options?.locale || ctx.locale;

			if (typeof other === "string") {
				other = localize(locale, other);
			} else if (other?.text) {
				other.text = localize(locale, other.text, options?.variables);
			}

			return ctx.answerCallbackQuery(other, options?.signal);
		};

		ctx.localizedReply = async (_text, options) => {
			const locale = options?.locale || ctx.locale;

			const text = localize(locale, _text, options?.variables);

			return ctx.reply(text, options?.other || undefined, options?.signal);
		};

		ctx.botStatus = ctx.myChatMember?.new_chat_member.status;

		if (ctx.botStatus !== "kicked" && ctx.botStatus !== "left")
			ctx.isAdmin = await adminOnly(ctx);
		ctx.isOwner = ownerOnly(ctx);

		await next();
	};
}
