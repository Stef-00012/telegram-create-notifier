export enum WSEvents {
	PING = 0, // server to client only
	PONG = 1, // client to server only
	CREATE = 2, // server to client only
	UPDATE = 3, // server to client only
	COMMAND = 4, // client to server only
	COMMAND_RESPONSE = 5, // server to client only
	COMMAND_ERROR = 6, // server to client only
}

export interface WSmessage {
	data: unknown;
	type: WSEvents;
}

export interface PingMessage extends Omit<WSmessage, "data"> {
	type: WSEvents.PING;
}

export interface PongMessage extends Omit<WSmessage, "data"> {
	type: WSEvents.PONG;
}

export interface CreateMessage extends WSmessage {
	data: WSAddon[];
	type: WSEvents.CREATE;
}

export interface UpdateMessageValues {
	old: WSAddonDataValues;
	new: WSAddonDataValues;
}

export type UpdateMessageDataChanges = Partial<
	Record<
		WSAddonDataKeys,
		{ old: WSAddonDataValues | null; new: WSAddonDataValues | null }
	>
> | null;

export interface UpdateMessage extends WSmessage {
	type: WSEvents.UPDATE;
	data: {
		slugs: Record<Platforms, WSAddonData["slug"] | null>;
		platforms: WSAddon["platforms"];
		names: Record<Platforms, WSAddonData["name"] | null>;
		changes: Record<Platforms, UpdateMessageDataChanges>;
	}[];
}

export interface CommandMessage extends WSmessage {
	type: WSEvents.COMMAND;
	data: {
		command: string;
		args: Record<string, number | string>;
	};
}

export interface CommandResponseMessage extends WSmessage {
	type: WSEvents.COMMAND_RESPONSE;
	command: string;
	data: unknown;
}

export interface CommandErrorMessage extends WSmessage {
	type: WSEvents.COMMAND_ERROR;
	command?: string;
	data: {
		message: string;
	};
}

export type WSAddonDataKeys = keyof WSAddonData;
export type WSAddonDataValues = WSAddonData[WSAddonDataKeys];

export type ModData = Record<Platforms, WSAddonData>;

export interface WSAddon {
	platforms: Platforms[];
	modData: Partial<ModData>;
}

export interface WSAddonData {
	slug: string;
	authors: WsAddonDataAuthor[];
	downloads: number;
	description: string;
	icon: string;
	name: string;
	version: string;
	versions: string[];
	categories: string[];
	follows: number;
	created: string;
	modified: string;
	color: number;
	license: string;
	clientSide: SupportTypes;
	serverSide: SupportTypes;
	modloaders: Modloaders[];
	id: string;
}

export interface WsAddonDataAuthor {
	name: string;
	url: string;
}

export type Platforms = "modrinth" | "curseforge";

export type SupportTypes = "unknown" | "required" | "optional" | "unsupported";

export type Modloaders =
	| "quilt"
	| "fabric"
	| "forge"
	| "neoforge"
	| "liteloader"
	| "modloader"
	| "rift"
	| "cauldron"
	| "any";
