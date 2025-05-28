export const defaultNewAddonMessage = `<blockquote class="tg-blockquote"><b class="tg-bold">New Addon Created</b></blockquote>
<b class="tg-bold">Name</b>: {{name}}
<b class="tg-bold">Description</b>: {{description}}
<b class="tg-bold">Author</b>: {{[author}}]({{authorUrl}})
<b class="tg-bold">Versions</b>: {{versions}}
<b class="tg-bold">Creation Date</b>: {{created}}
<b class="tg-bold">Categories</b>: {{categories}}
<b class="tg-bold">Client Side</b>: {{clientSide}}
<b class="tg-bold">Server Side</b>: {{serverSide}}
<b class="tg-bold">Modloaders</b>:  {{modloaders}}`;

export const defaultUpdatedAddonMessage = `<blockquote><b>Addon aggiornato</b></blockquote>
<b>Nome</b>: {{name}}{{?addedVersions:
<b>Versioni (Aggiunte)</b>: {{addedVersions}}|?}}{{?removedVersions:
<b>Versioni (Rimosse)</b>: {{removedVersions}}|?}}{{?addedModloaders:
<b>Modloaders (Aggiunti)</b>: {{addedModloaders}}|?}}{{?removedModloaders:
<b>Modloaders (Rimossi)</b>: {{removedModloaders}}|?}}`;
