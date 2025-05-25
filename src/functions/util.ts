import type { DBMessage } from "@/db/schemas/chats";
import type { Context } from "@/types/grammy";

type Result<T> = { removed: T[]; added: T[] };

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

// Helper to process ((?variable:if-exists|if-not-exists)) conditionals
function processConditionals(
    text: string,
    entities: DBMessage["entities"],
    variables: Record<string, string>
): { text: string; entities: DBMessage["entities"] } {
    const condRegex = /\(\(\?([a-zA-Z0-9_]+):([^|]*)\|([^)]+)\)\)/g;
    let match: RegExpExecArray | null;
    let offsetShift = 0;

    while ((match = condRegex.exec(text)) !== null) {
        const [placeholder, varName, ifExists, ifNotExists] = match;
        const varValue = variables[varName];
        let replacement = varValue ? ifExists : ifNotExists;

        // Recursively replace variables in the replacement text
        replacement = replacement.replace(/\[\[([a-zA-Z0-9_]+)\]\]/g, (_, v) => variables[v] ?? "");

        const start = match.index + offsetShift;
        const end = start + placeholder.length;

        text = text.slice(0, start) + replacement + text.slice(end);

        const diff = replacement.length - placeholder.length;

        // Remove or shift entities
        const newEntities: typeof entities = [];
        for (const entity of entities) {
            if (entity.offset >= end) {
                newEntities.push({ ...entity, offset: entity.offset + diff });
            } else if (entity.offset + entity.length <= start) {
                newEntities.push(entity);
            } else if (entity.offset >= start && entity.offset < end) {
                // Entity is inside the removed conditional, drop it
            } else if (entity.offset < start && entity.offset + entity.length > end) {
                // Entity spans over the replaced area, adjust length
                newEntities.push({ ...entity, length: entity.length + diff });
            }
            // else: partial overlap, safest to drop
        }
        entities = newEntities;

        offsetShift += diff;
        condRegex.lastIndex = 0; // Restart regex after text change
    }

    return { text, entities };
}

export function replaceVariables(
    message: DBMessage,
    variables: Record<string, string>,
): DBMessage {
    let text = message.text;
    let entities: DBMessage["entities"] = message.entities.map(e => ({ ...e }));

	console.log("before:", text, entities);
	
    // 1. Process ((?variable:if-exists|if-not-exists)) conditionals first
    ({ text, entities } = processConditionals(text, entities, variables));
	console.log("after:", text, entities);

    // 2. Replace [[variables]]
    let offsetShift = 0;

    const varRegex = /\[\[([a-zA-Z0-9_]+)\]\]/g;

    let variableMatch = varRegex.exec(text);

    while (variableMatch !== null) {
        const [placeholder, varName] = variableMatch;
        const value = variables[varName] ?? `[[${varName}]]`;
        const start = variableMatch.index + offsetShift;
        const end = start + placeholder.length;

        text = text.slice(0, start) + value + text.slice(end);

        const diff = value.length - placeholder.length;

        for (const entity of entities) {
            if (entity.offset > start) entity.offset += diff;
            else if (entity.offset <= start && entity.offset + entity.length > start)
                entity.length += diff;
        }

        offsetShift += diff;
        variableMatch = varRegex.exec(text);
    }

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    offsetShift = 0;

    let linkMatch = linkRegex.exec(text);

    while (linkMatch !== null) {
        const [md, linkText, url] = linkMatch;
        const start = linkMatch.index + offsetShift;
        const end = start + md.length;

        text = text.slice(0, start) + linkText + text.slice(end);

        entities.push({
            offset: start,
            length: linkText.length,
            type: "text_link",
            url,
        });

        const diff = linkText.length - md.length;

        for (const entity of entities) {
            if (entity.offset > start) entity.offset += diff;
        }

        offsetShift += diff;
        linkMatch = linkRegex.exec(text);
    }

    entities.sort((a, b) => a.offset - b.offset);

    return { text, entities };
}