export const defaultNewAddonMessage = `<blockquote class="tg-blockquote"><b class="tg-bold">New Addon Created</b></blockquote>{{?modrinth:
✦ <b>Modrinth</b>
<b class="tg-bold">Name</b>: {{modrinth/name}}
<b class="tg-bold">Description</b>: {{modrinth/description}}
<b class="tg-bold">Authors</b>: {{modrinth/authorsUrl}}
<b class="tg-bold">Versions</b>: {{modrinth/versions}}
<b class="tg-bold">Creation Date</b>: {{modrinth/created}}
<b class="tg-bold">Categories</b>: {{modrinth/categories}}
<b class="tg-bold">Client Side</b>: {{modrinth/clientSide}}
<b class="tg-bold">Server Side</b>: {{modrinth/serverSide}}
<b class="tg-bold">Modloaders</b>:  {{modrinth/modloaders}}
|?}}{{?curseforge:
✦ <b>Curseforge</b>
<b class="tg-bold">Name</b>: {{curseforge/name}}
<b class="tg-bold">Description</b>: {{curseforge/description}}
<b class="tg-bold">Authors</b>: {{curseforge/authorsUrl}}
<b class="tg-bold">Versions</b>: {{curseforge/versions}}
<b class="tg-bold">Creation Date</b>: {{curseforge/created}}
<b class="tg-bold">Categories</b>: {{curseforge/categories}}
<b class="tg-bold">Client Side</b>: {{curseforge/clientSide}}
<b class="tg-bold">Server Side</b>: {{curseforge/serverSide}}
<b class="tg-bold">Modloaders</b>:  {{curseforge/modloaders}}|?}}`;

export const defaultUpdatedAddonMessage = `<blockquote><b>Addon aggiornato</b></blockquote>{{?modrinth:
✦ <b>Modrinth</b>
<b>Nome</b>: {{modrinth/name/new}}{{?modrinth/versions/added:
<b>Versioni (Aggiunte)</b>: {{modrinth/versions/added}}|?}}{{?modrinth/versions/removed:
<b>Versioni (Rimosse)</b>: {{modrinth/versions/removed}}|?}}{{?modrinth/modloaders/added:
<b>Modloaders (Aggiunti)</b>: {{modrinth/modloaders/added}}|?}}{{?modrinth/modloaders/removed:
<b>Modloaders (Rimossi)</b>: {{modrinth/modloaders/removed}}|?}}
|?}}{{?curseforge:
✦ <b>Curseforge</b>
<b>Nome</b>: {{curseforge/name/new}}{{?curseforge/versions/added:
<b>Versioni (Aggiunte)</b>: {{curseforge/versions/added}}|?}}{{?curseforge/versions/removed:
<b>Versioni (Rimosse)</b>: {{curseforge/versions/removed}}|?}}{{?curseforge/modloaders/added:
<b>Modloaders (Aggiunti)</b>: {{curseforge/modloaders/added}}|?}}{{?curseforge/modloaders/removed:
<b>Modloaders (Rimossi)</b>: {{curseforge/modloaders/removed}}|?}}|?}}`;
