import type { Context } from "@/bot";

type Result<T> = { removed: T[]; added: T[] }

export function compareArrays<T>(
	oldArray: T[],
	newArray: T[],
): Result<T> {
	const removed = oldArray.filter((item) => !newArray.includes(item));
	const added = newArray.filter((item) => !oldArray.includes(item));

	return {
        removed,
        added
    };
}

export async function adminOnly(ctx: Context) {
	const author = await ctx.getAuthor()
        
	if (!ctx.config.ownerIds.includes(ctx.from?.id as number)) {
		if (ctx.chat?.type !== "private" && ["creator", "administrator"].includes(author.status)) return false;
	}

	return true;
}

export function ownerOnly(ctx: Context) {
	return ctx.config.ownerIds.includes(ctx.from?.id as number)
}