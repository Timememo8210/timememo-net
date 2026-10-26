/* Large source/geometry assets are version-pinned in the same public repository.
   Local previews use local files; production keeps the Pages deployment compact. */
(()=>{'use strict';
const revision='00340fa87d09b3c9b1406e6d339cc40c08505395';
const production=location.hostname==='timememo.net'||location.hostname==='www.timememo.net'||location.hostname==='timememo8210.github.io';
const base=production?'https://raw.githubusercontent.com/Timememo8210/timememo-net/'+revision+'/semiconductor-knowledge/':'/semiconductor-knowledge/';
window.SemiAssetURL=path=>base+String(path).replace(/^\/+/, '');
window.SemiAssetRevision=revision;
})();
