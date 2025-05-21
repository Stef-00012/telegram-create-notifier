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
