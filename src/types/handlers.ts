import type { BotContext as Context } from "@/bot";
import type { ConversationFlavor } from "@grammyjs/conversations";
import type {
	FilterQuery,
	Filter,
	Middleware,
	CommandMiddleware,
} from "grammy";

export interface Command {
	name: string;
	description?: string;
	displaySuggestion?: boolean;
	ownerOnly?: boolean;
	adminOnly?: boolean;
	execute: CommandMiddleware<ConversationFlavor<Context>>;
}

export interface Event<T extends FilterQuery = FilterQuery> {
	name: T;
	execute: Middleware<Filter<ConversationFlavor<Context>, T>>;
}
