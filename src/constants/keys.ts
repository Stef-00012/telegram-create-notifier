import type { SupportTypes, WSAddonKeys } from "@/types/addonsWS";

export const keyNames: Record<WSAddonKeys, string> = {
	author: "Autore",
	categories: "Categorie",
	description: "Descrizione",
	downloads: "Download",
	icon: "Icona",
	name: "Nome",
	platform: "Piattaforma",
	slug: "Slug",
	version: "Versione",
	versions: "Versioni",
	clientSide: "Client Side",
	follows: "Follows",
	created: "Data di Creazione",
	modified: "Data di Modifica",
	color: "Colore",
	license: "Licenza",
	serverSide: "Server Side",
	modloaders: "Modloaders",
};

export const addKeyNames: Partial<Record<WSAddonKeys, string>> = {
	modloaders: "Aggiunti",
	categories: "Aggiunte",
	versions: "Aggiunte",
};

export const removeKeyNames: Partial<Record<WSAddonKeys, string>> = {
	modloaders: "Rimossi",
	categories: "Rimosse",
	versions: "Rimosse",
};

export const supportTypes: Record<SupportTypes, string> = {
	optional: "Opzionale",
	required: "Richiesto",
	unsupported: "Non supportato",
	unknown: "Sconosciuto",
};

export const settingKeys: WSAddonKeys[] = [
	"categories",
	"description",
	"icon",
	"name",
	"versions",
	"clientSide",
	"license",
	"serverSide",
	"modloaders",
];
