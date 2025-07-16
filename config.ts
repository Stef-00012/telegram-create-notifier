export const config = {
	token: process.env.TOKEN as string,
	createAddonsWSURI: process.env.CREATE_ADDONS_WEBSOCKET_URI as string,
	ownerIds: process.env.OWNER_IDS?.split(",").map(id => Number.parseInt(id)).filter(Boolean) as number[],
};
