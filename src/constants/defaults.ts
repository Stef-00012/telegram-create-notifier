export const defaultNewAddonMessage = `<blockquote><b>New Addon Created</b></blockquote>{{?modrinth:
✦ <b>Modrinth</b>
<b>Name</b>: {{modrinth/name}}
<b>Description</b>: {{modrinth/description}}
<b>Authors</b>: {{modrinth/authorsUrl}}
<b>Versions</b>: {{modrinth/versions}}
<b>Creation Date</b>: {{modrinth/created}}
<b>Categories</b>: {{modrinth/categories}}
<b>Client Side</b>: {{modrinth/clientSide}}
<b>Server Side</b>: {{modrinth/serverSide}}
<b>Modloaders</b>:  {{modrinth/modloaders}}
|?}}{{?curseforge:
✦ <b>Curseforge</b>
<b>Name</b>: {{curseforge/name}}
<b>Description</b>: {{curseforge/description}}
<b>Authors</b>: {{curseforge/authorsUrl}}
<b>Versions</b>: {{curseforge/versions}}
<b>Creation Date</b>: {{curseforge/created}}
<b>Categories</b>: {{curseforge/categories}}
<b>Client Side</b>: {{curseforge/clientSide}}
<b>Server Side</b>: {{curseforge/serverSide}}
<b>Modloaders</b>:  {{curseforge/modloaders}}|?}}`;

export const defaultUpdatedAddonMessage = `<blockquote><b>Addon Updated</b></blockquote>{{?modrinth:
✦ <b>Modrinth</b>
<b>Name</b>: {{names/modrinth}}{{?modrinth/versions/added:
<b>Versions (Added)</b>: {{modrinth/versions/added}}|?}}{{?modrinth/versions/removed:
<b>Versions (Removed)</b>: {{modrinth/versions/removed}}|?}}{{?modrinth/modloaders/added:
<b>Modloaders (Added)</b>: {{modrinth/modloaders/added}}|?}}{{?modrinth/modloaders/removed:
<b>Modloaders (Removed)</b>: {{modrinth/modloaders/removed}}|?}}
|?}}{{?curseforge:
✦ <b>Curseforge</b>
<b>Name</b>: {{names/curseforge}}{{?curseforge/versions/added:
<b>Versions (Added)</b>: {{curseforge/versions/added}}|?}}{{?curseforge/versions/removed:
<b>Versions (Removed)</b>: {{curseforge/versions/removed}}|?}}{{?curseforge/modloaders/added:
<b>Modloaders (Added)</b>: {{curseforge/modloaders/added}}|?}}{{?curseforge/modloaders/removed:
<b>Modloaders (Removed)</b>: {{curseforge/modloaders/removed}}|?}}|?}}`;
