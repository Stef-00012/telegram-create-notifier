export const telegramDefaultNewAddonMessage = `<blockquote><b>New Addon Created</b></blockquote>{{?modrinth:
✦ <b>Modrinth</b>
<b>Name</b>: {{modrinth/name}}
<b>Description</b>: {{modrinth/description}}
<b>Authors</b>: {{modrinth/authorsUrl}}
<b>Versions</b>: {{modrinth/versions}}{{?modrinth/createVersion:
<b>Create Version</b>: {{modrinth/createVersion}}|?}}
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
<b>Versions</b>: {{curseforge/versions}}{{?curseforge/createVersion:
<b>Create Version</b>: {{curseforge/createVersion}}|?}}
<b>Creation Date</b>: {{curseforge/created}}
<b>Categories</b>: {{curseforge/categories}}
<b>Client Side</b>: {{curseforge/clientSide}}
<b>Server Side</b>: {{curseforge/serverSide}}
<b>Modloaders</b>:  {{curseforge/modloaders}}|?}}`;

export const telegramDefaultUpdatedAddonMessage = `<blockquote><b>Addon Updated</b></blockquote>{{?modrinth:
✦ <b>Modrinth</b>
<b>Name</b>: {{names/modrinth}}{{?modrinth/versions/added:
<b>Versions (Added)</b>: {{modrinth/versions/added}}|?}}{{?modrinth/versions/removed:
<b>Versions (Removed)</b>: {{modrinth/versions/removed}}|?}}{{?modrinth/modloaders/added:
<b>Modloaders (Added)</b>: {{modrinth/modloaders/added}}|?}}{{?modrinth/modloaders/removed:
<b>Modloaders (Removed)</b>: {{modrinth/modloaders/removed}}|?}}{{?modrinth/createVersion/new:
<b>Create Version (New)</b>: {{modrinth/createVersion/new}}|?}}{{?modrinth/createVersion/old:
<b>Create Version (Old)</b>: {{modrinth/createVersion/old}}|?}}
|?}}{{?curseforge:
✦ <b>Curseforge</b>
<b>Name</b>: {{names/curseforge}}{{?curseforge/versions/added:
<b>Versions (Added)</b>: {{curseforge/versions/added}}|?}}{{?curseforge/versions/removed:
<b>Versions (Removed)</b>: {{curseforge/versions/removed}}|?}}{{?curseforge/modloaders/added:
<b>Modloaders (Added)</b>: {{curseforge/modloaders/added}}|?}}{{?curseforge/modloaders/removed:
<b>Modloaders (Removed)</b>: {{curseforge/modloaders/removed}}|?}}{{?curseforge/createVersion/new:
<b>Create Version (New)</b>: {{curseforge/createVersion/new}}|?}}{{?curseforge/createVersion/old:
<b>Create Version (Old)</b>: {{curseforge/createVersion/old}}|?}}
|?}}`;

export const discordDefaultNewAddonMessage = `> **New Addon Created**{{?modrinth:
✦ **Modrinth**
**Name**: {{modrinth/name}}
**Description**: {{modrinth/description}}
**Authors**: {{modrinth/authorsUrl}}
**Versions**: {{modrinth/versions}}{{?modrinth/createVersion:
**Create Version**: {{modrinth/createVersion}}|?}}
**Creation Date**: {{modrinth/created}}
**Categories**: {{modrinth/categories}}
**Client Side**: {{modrinth/clientSide}}
**Server Side**: {{modrinth/serverSide}}
**Modloaders**:  {{modrinth/modloaders}}
|?}}{{?curseforge:
✦ **Curseforge**
**Name**: {{curseforge/name}}
**Description**: {{curseforge/description}}
**Authors**: {{curseforge/authorsUrl}}
**Versions**: {{curseforge/versions}}{{?curseforge/createVersion:
**Create Version**: {{curseforge/createVersion}}|?}}
**Creation Date**: {{curseforge/created}}
**Categories**: {{curseforge/categories}}
**Client Side**: {{curseforge/clientSide}}
**Server Side**: {{curseforge/serverSide}}
**Modloaders**:  {{curseforge/modloaders}}|?}}`;

export const discordDefaultUpdatedAddonMessage = `> **Addon Updated**{{?modrinth:
✦ **Modrinth**
**Name**: {{names/modrinth}}{{?modrinth/versions/added:
**Versions (Added)**: {{modrinth/versions/added}}|?}}{{?modrinth/versions/removed:
**Versions (Removed)**: {{modrinth/versions/removed}}|?}}{{?modrinth/modloaders/added:
**Modloaders (Added)**: {{modrinth/modloaders/added}}|?}}{{?modrinth/modloaders/removed:
**Modloaders (Removed)**: {{modrinth/modloaders/removed}}|?}}{{?modrinth/createVersion/new:
**Create Version (New)**: {{modrinth/createVersion/new}}|?}}{{?modrinth/createVersion/old:
**Create Version (Old)**: {{modrinth/createVersion/old}}|?}}
|?}}{{?curseforge:
✦ **Curseforge**
**Name**: {{names/curseforge}}{{?curseforge/versions/added:
**Versions (Added)**: {{curseforge/versions/added}}|?}}{{?curseforge/versions/removed:
**Versions (Removed)**: {{curseforge/versions/removed}}|?}}{{?curseforge/modloaders/added:
**Modloaders (Added)**: {{curseforge/modloaders/added}}|?}}{{?curseforge/modloaders/removed:
**Modloaders (Removed)**: {{curseforge/modloaders/removed}}|?}}{{?curseforge/createVersion/new:
**Create Version (New)**: {{curseforge/createVersion/new}}|?}}{{?curseforge/createVersion/old:
**Create Version (Old)**: {{curseforge/createVersion/old}}|?}}
|?}}`;
