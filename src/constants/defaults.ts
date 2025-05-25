import type { DBMessage } from "@/db/schemas/chats";

export const defaultNewAddonMessage: DBMessage = {
	text: "New Addon Created\nName: [[name]]\nDescription: [[description]]\nAuthor: [[[author]]]([[authorUrl]])\nVersions: [[versions]]\nCreation Date: [[created]]\nCategories: [[categories]]\nClient Side: [[clientSide]]\nServer Side: [[serverSide]]\nModloaders:  [[modloaders]]",
	entities: [
		{
			offset: 0,
			length: 17,
			type: "blockquote",
		},
		{
			offset: 0,
			length: 17,
			type: "bold",
		},
		{
			offset: 18,
			length: 4,
			type: "bold",
		},
		{
			offset: 33,
			length: 11,
			type: "bold",
		},
		{
			offset: 62,
			length: 6,
			type: "bold",
		},
		{
			offset: 98,
			length: 8,
			type: "bold",
		},
		{
			offset: 121,
			length: 13,
			type: "bold",
		},
		{
			offset: 148,
			length: 10,
			type: "bold",
		},
		{
			offset: 175,
			length: 11,
			type: "bold",
		},
		{
			offset: 203,
			length: 11,
			type: "bold",
		},
		{
			offset: 231,
			length: 10,
			type: "bold",
		},
	],
};

// export const defaultUpdatedAddonMessage: DBMessage = {
// 	text: "Addon Updated\nName: [[name]]\nVersions:\n    - Old: [[oldVersions]]\n    - New: [[newVersions]]\nModloaders:\n    - Old: [[oldModloaders]]\n    - New: [[newModloaders]]",
// 	entities: [
// 		{
// 			offset: 0,
// 			length: 13,
// 			type: "blockquote",
// 		},
// 		{
// 			offset: 0,
// 			length: 13,
// 			type: "bold",
// 		},
// 		{
// 			offset: 14,
// 			length: 4,
// 			type: "bold",
// 		},
// 		{
// 			offset: 29,
// 			length: 8,
// 			type: "bold",
// 		},
// 		{
// 			offset: 45,
// 			length: 3,
// 			type: "bold",
// 		},
// 		{
// 			offset: 72,
// 			length: 3,
// 			type: "bold",
// 		},
// 		{
// 			offset: 93,
// 			length: 10,
// 			type: "bold",
// 		},
// 		{
// 			offset: 111,
// 			length: 3,
// 			type: "bold",
// 		},
// 		{
// 			offset: 140,
// 			length: 3,
// 			type: "bold",
// 		},
// 	],
// };

export const defaultUpdatedAddonMessage: DBMessage = {
	text: "((?oldColor:Addon Updated|)\nName: [[name]]\nVersions:\n    - Old: [[oldVersions]]\n    - New: [[newVersions]]\nModloaders:\n    - Old: [[oldModloaders]]\n    - New: [[newModloaders]]",
	entities: [
		{
			offset: 0,
			length: 13,
			type: "blockquote",
		},
		{
			offset: 0,
			length: 13,
			type: "bold",
		},
		{
			offset: 28,
			length: 4,
			type: "bold",
		},
		{
			offset: 43,
			length: 8,
			type: "bold",
		},
		{
			offset: 59,
			length: 3,
			type: "bold",
		},
		{
			offset: 86,
			length: 3,
			type: "bold",
		},
		{
			offset: 107,
			length: 10,
			type: "bold",
		},
		{
			offset: 125,
			length: 3,
			type: "bold",
		},
		{
			offset: 154,
			length: 3,
			type: "bold",
		},
	],
};