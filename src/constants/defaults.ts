export const defaultNewAddonMessage = [
	'<blockquote class="tg-blockquote"><b class="tg-bold">New Addon Created</b></blockquote>',
	'<b class="tg-bold">Name</b>: [[name]]',
	'<b class="tg-bold">Description</b>: [[description]]',
	'<b class="tg-bold">Author</b>: [[[author]]]([[authorUrl]])',
	'<b class="tg-bold">Versions</b>: [[versions]]',
	'<b class="tg-bold">Creation Date</b>: [[created]]',
	'<b class="tg-bold">Categories</b>: [[categories]]',
	'<b class="tg-bold">Client Side</b>: [[clientSide]]',
	'<b class="tg-bold">Server Side</b>: [[serverSide]]',
	'<b class="tg-bold">Modloaders</b>:  [[modloaders]]',
].join("\n");

export const defaultUpdatedAddonMessage = [
	'<blockquote class="tg-blockquote"><b class="tg-bold">Addon Updated</b></blockquote>',
	'<b class="tg-bold">Name</b>: [[name]]',
	'<b class="tg-bold">Versions</b>:',
	'    - <b class="tg-bold">Old</b>: [[oldVersions]]',
	'    - <b class="tg-bold">New</b>: [[newVersions]]',
	'<b class="tg-bold">Modloaders</b>:',
	'    - <b class="tg-bold">Old</b>: [[oldModloaders]]',
	'    - <b class="tg-bold">New</b>: [[newModloaders]]',
].join("\n");
