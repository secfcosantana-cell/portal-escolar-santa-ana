const CACHE='portal-escolar-v70';
const ASSETS=['./','./index.html','./styles.css','./app-local.js','./physics.js','./teachers.js','./resources.js','./portal-data.json','./manifest.webmanifest','./assets/logo-santa-ana.svg','./assets/cell.svg','./assets/microscope.svg','./assets/bacteria.svg','./assets/dna.svg','./assets/teacher-biology.svg','./assets/teacher-physics.svg','./assets/teacher-math.svg','./assets/teacher-arts.svg','./assets/alfredo-materias.svg','./assets/hero-school.svg','./assets/icon-alumnos.svg','./assets/icon-docentes.svg','./assets/icon-familias.svg','./assets/icon-recursos.svg','./assets/app-icon.svg','./assets/portal-collage-photos.svg','./assets/portal-collage-hd.webp','./icon-192.png','./icon-512.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  if(/\.(css|js)$/.test(u.pathname)){e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request)));return;}
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{
      const copy=r.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); return r;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{
    const copy=r.clone(); caches.open(CACHE).then(x=>x.put(e.request,copy)); return r;
  }).catch(()=>caches.match('./index.html'))));
});