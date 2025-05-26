import type { Context } from "@/types/grammy";
import { EntitiesParser } from "@qz/telegram-entities-parser";
import type { Message } from "@qz/telegram-entities-parser/types";
import { localize } from "@/functions/localize";
import type { UpdateMessage, WSAddon } from "@/types/addonsWS";

type Result<T> = { removed: T[]; added: T[] };

const entitiesParser = new EntitiesParser();

export function compareArrays<T>(oldArray: T[], newArray: T[]): Result<T> {
	const removed = oldArray.filter((item) => !newArray.includes(item));
	const added = newArray.filter((item) => !oldArray.includes(item));

	return {
		removed,
		added,
	};
}

export async function adminOnly(ctx: Context) {
	const author = await ctx.getAuthor();

	if (ctx.config.ownerIds.includes(ctx.from?.id as number)) return true;

	if (
		ctx.chat?.type !== "private" &&
		["creator", "administrator"].includes(author.status)
	)
		return true;

	return false;
}

export function ownerOnly(ctx: Context) {
	return ctx.config.ownerIds.includes(ctx.from?.id as number);
}

export function parse(message: Message) {
	return entitiesParser
		.parse({ message })
		.replaceAll(
			'<blockquote class="tg-expandable-blockquote">',
			'<blockquote expandable class="tg-blockquote">',
		);
}

function parseConditional(text: string, variables: Record<string, string>) {
	const conditionalRegex =
		/\[\[\?(?<variable>.*?):(?<trueMsg>.*?)\|(?<falseMsg>.*?)\?\]\]/gim;

	return text.replace(
		conditionalRegex,
		(_match, variable, trueMsg, falseMsg) => {
			if (variables[variable]) return trueMsg;
			return falseMsg;
		},
	);
}

export function parseVariables(
	_text: string,
	variables: Record<string, string>,
) {
	const variableRegex = /\[\[(?<variable>.*?)\]\]/gim;

	const text = parseConditional(_text, variables);

	return text.replace(variableRegex, (match, variable) => {
		if (variables[variable]) return variables[variable];
		return match;
	});
}

export async function getNewAddonVariables(data: WSAddon, locale: string) {
	const output: Record<string, string> = {};

	for (const [key, value] of Object.entries(data)) {
		if (Array.isArray(value)) output[key] = value.join(", ");
		else if (key === "created" || key === "modified")
			output[key] = new Date(value).toLocaleString(locale);
		else if (key === "clientSide" || key === "serverSide")
			output[key] = await localize(
				locale,
				`websocket.variables.clientServerSide.${value}`,
			);
		else if (key === "author") {
			output[key] = value;
			output.authorUrl = `https://modrinth.com/user/${value}`;
		} else output[key] = value;
	}

	return output;
}

export async function getUpdatedAddonVariables(
	data: UpdateMessage["data"][0],
	locale: string,
) {
	const output: Record<string, string> = {
		name: data.name,
		platform: data.platform,
	};

	for (const [key, value] of Object.entries(data.changes)) {
		const baseKey = key.charAt(0).toUpperCase() + key.slice(1);

		if (Array.isArray(value.old) && Array.isArray(value.new)) {
			output[`old${baseKey}`] = value.old.join(", ");
			output[`new${baseKey}`] = value.new.join(", ");

			const { added, removed } = compareArrays(value.old, value.new);
			output[`added${baseKey}`] = added.join(", ");
			output[`removed${baseKey}`] = removed.join(", ");
		} else if (key === "created" || key === "modified") {
			output[`old${baseKey}`] = new Date(value.old as string).toLocaleString(
				locale,
			);
			output[`new${baseKey}`] = new Date(value.new as string).toLocaleString(
				locale,
			);
		} else if (key === "clientSide" || key === "serverSide") {
			output[`old${baseKey}`] = await localize(
				locale,
				`websocket.variables.clientServerSide.${value.old}`,
			);
			output[`new${baseKey}`] = await localize(
				locale,
				`websocket.variables.clientServerSide.${value.new}`,
			);
		} else {
			output[`old${baseKey}`] = String(value.old);
			output[`new${baseKey}`] = String(value.new);
		}
	}

	return output;
}
