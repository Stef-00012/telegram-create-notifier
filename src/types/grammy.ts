import type { Bot, BotContext, DB, Schemas } from "@/bot";
import type { Context as BaseContext } from "grammy";
import type {
	Conversation as BaseConversation,
	ConversationFlavor,
} from "@grammyjs/conversations";

export interface Context extends BaseContext {
	bot: Bot;
	db: DB;
	dbSchemas: Schemas;
	locale: string;
	botStatus?:
		| "creator"
		| "administrator"
		| "member"
		| "restricted"
		| "left"
		| "kicked";

	dbChat?: Schemas["chats"]["$inferSelect"];

	localizedAnswerCallbackQuery: (
		other?: Parameters<Context["answerCallbackQuery"]>[0],
		locale?: string,
		signal?: Parameters<Context["answerCallbackQuery"]>[1],
	) => ReturnType<Context["answerCallbackQuery"]>;
	localizedReply: (
		text: Parameters<Context["reply"]>[0],
		other?: Parameters<Context["reply"]>[1] | null,
		locale?: string,
		signal?: Parameters<Context["reply"]>[2],
	) => ReturnType<Context["reply"]>;

	isAdmin: boolean;
	isOwner: boolean;
}

export type Conversation = BaseConversation<
	ConversationFlavor<Context>,
	BotContext
>;
