/* ===== RECURSOS EDUCATIVOS =====
 * Catálogo conectado a Google Drive + Google Sheets mediante Apps Script.
 * Para activarlo: despliega recursos-apps-script.gs.txt y pega la URL /exec abajo.
 */
const RESOURCES_SCRIPT_URL = '';
const RESOURCE_ITEMS = [];

function openResources(){
  hideLanding();
  document.querySelector('.hero-target')?.classList.add('hidden');
  document.querySelector('.hero-footer')?.classList.add('hidden');
  $('home').classList.add('hidden');
  $('studentDirectory')?.classList.add('hidden');
  $('teacherDirectory')?.classList.add('hidden');
  $('student')?.classList.add('hidden');
  $('teacher')?.classList.add('hidden');
  $('physics')?.classList.add('hidden');
  $('resources').classList.remove('hidden');
  loadResources();
}

async function loadResources(){
  window.resourceItems = RESOURCE_ITEMS.slice();
  if(RESOURCES_SCRIPT_URL){
    try{
      const data=await fetch(RESOURCES_SCRIPT_URL+'?action=list',{cache:'no-store'}).then(r=>r.json());
      if(data.ok && Array.isArray(data.items)) window.resourceItems=data.items;
    }catch(e){ console.warn('No se pudo cargar el catálogo remoto',e); }
  }
  renderResources();
}

function renderResources(){
  const box=$('resourcesBox');
  if(!box)return;
  const all=window.resourceItems||[];
  const current=window.resourceFilter||'Todas';
  const materias=['Todas',...new Set(all.map(r=>String(r.materia||'').trim()).filter(Boolean))];
  const items=current==='Todas'?all:all.filter(r=>String(r.materia||'')===current);

  let html='<div class="resource-head"><div><div class="eyebrow">MATERIAL DE APOYO</div><h2>Recursos educativos</h2><p class="muted">PDF, Word, videos y enlaces organizados por materia.</p></div><div class="resource-head-actions"><button class="back" onclick="closeResources()">← Regresar</button><button class="secondary" onclick="openResourceAdmin()">🔐 Administrar recursos</button></div></div>';
  html+='<div class="resource-filters">'+materias.map(m=>'<button class="resource-filter '+(m===current?'active':'')+'" onclick="window.resourceFilter=\''+escapeHtml(m)+'\';renderResources()">'+escapeHtml(m)+'</button>').join('')+'</div>';

  if(!items.length){
    html+='<div class="box resource-empty"><div class="resource-empty-icon">📚</div><h3>Próximamente</h3><p>Aquí aparecerán los materiales que publiques para tus alumnos: PDF, Word, videos, enlaces y actividades.</p><p class="muted">Puedes organizarlos por Biología, Física, Ofimática, Matemáticas, Artes y las demás asignaturas.</p></div>';
  }else{
    html+='<div class="resource-grid">'+items.map(resourceCard).join('')+'</div>';
  }
  box.innerHTML=html;
}

function resourceCard(r){
  const type=String(r.tipo||'RECURSO').toUpperCase();
  const icon=type==='PDF'?'📄':(type==='WORD'||type==='DOCX')?'📝':type==='VIDEO'?'▶️':type==='ENLACE'?'🌐':'📚';
  const action=r.descarga?'⬇️ Descargar':'🔗 Abrir recurso';
  const meta=[r.grado,r.grupo].filter(Boolean).join(' · ');
  return '<article class="resource-card"><div class="resource-type">'+icon+' '+escapeHtml(type)+'</div><div class="resource-subject">'+escapeHtml(r.materia||'General')+(meta?' · '+escapeHtml(meta):'')+'</div><h3>'+escapeHtml(r.titulo||'Recurso educativo')+'</h3><p>'+escapeHtml(r.descripcion||'Material de apoyo para estudiantes.')+'</p><a class="primary resource-btn" href="'+escapeHtml(r.url||'#')+'" target="_blank" rel="noopener">'+action+' ↗</a></article>';
}

function openResourceAdmin(){
  const pin=prompt('PIN docente:');
  if(pin!=='2468')return alert('PIN docente incorrecto.');
  renderResourceAdmin();
}

function renderResourceAdmin(){
  const box=$('resourcesBox');
  if(!box)return;
  box.innerHTML='<div class="resource-admin"><div class="resource-admin-head"><div><div class="eyebrow">ADMINISTRACIÓN</div><h2>Agregar recurso educativo</h2><p class="muted">Sube un PDF/Word o registra un enlace. Los archivos se guardarán en Google Drive cuando conectemos el Apps Script.</p></div><button class="back" onclick="renderResources()">← Ver recursos</button></div>'+
  '<form id="resourceForm" onsubmit="saveResourceFromPortal(event)">'+
  '<div class="resource-form-grid">'+
  '<label>Materia<select name="materia" required><option value="">Selecciona...</option><option>Biología</option><option>Física</option><option>Ofimática</option><option>Matemáticas</option><option>Artes</option><option>Ciencias</option><option>Otra</option></select></label>'+
  '<label>Grado<select name="grado"><option value="">Todos</option><option>1.º</option><option>2.º</option><option>3.º</option></select></label>'+
  '<label>Grupo<input name="grupo" placeholder="Ej. A o 2.º A"></label>'+
  '<label>Tipo<select name="tipo"><option>PDF</option><option>WORD</option><option>VIDEO</option><option>ENLACE</option><option>OTRO</option></select></label>'+
  '<label class="resource-form-wide">Título<input name="titulo" required placeholder="Ej. Práctica del microscopio"></label>'+
  '<label class="resource-form-wide">Descripción<textarea name="descripcion" rows="2" placeholder="Instrucciones para los alumnos"></textarea></label>'+
  '<label class="resource-form-wide">Archivo PDF o Word<input type="file" name="archivo" accept=".pdf,.doc,.docx"></label>'+
  '<label class="resource-form-wide">O pega un enlace<input name="url" type="url" placeholder="https://drive.google.com/... o cualquier página"></label>'+
  '</div><div class="resource-admin-actions"><button type="button" class="back" onclick="renderResources()">Cancelar</button><button class="primary" type="submit">➕ Guardar recurso</button></div></form></div>';
}

async function saveResourceFromPortal(ev){
  ev.preventDefault();
  if(!RESOURCES_SCRIPT_URL){
    alert('El módulo ya está preparado, pero falta conectar la URL /exec del Apps Script de Recursos. Primero hay que desplegar el archivo recursos-apps-script.gs.txt.');
    return;
  }
  const form=ev.target, fd=new FormData(form), file=form.archivo.files[0];
  const payload={action:'saveResource',pin:'2468',materia:fd.get('materia'),grado:fd.get('grado'),grupo:fd.get('grupo'),tipo:fd.get('tipo'),titulo:fd.get('titulo'),descripcion:fd.get('descripcion'),url:fd.get('url')||''};
  if(file){
    if(file.size>10*1024*1024)return alert('Para evitar problemas de carga, el archivo debe pesar 10 MB o menos.');
    payload.fileName=file.name;payload.mimeType=file.type;
    payload.fileBase64=await fileToBase64_(file);
    payload.url='';
  }
  const body=new URLSearchParams(payload);
  try{
    const res=await fetch(RESOURCES_SCRIPT_URL,{method:'POST',body});
    const data=await res.json();
    if(!data.ok)throw new Error(data.error||'No se pudo guardar');
    alert('Recurso guardado correctamente.');
    window.resourceFilter='Todas';
    await loadResources();
  }catch(e){
    alert('No se pudo guardar el recurso: '+e.message);
  }
}
function fileToBase64_(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}
function closeResources(){ $('resources').classList.add('hidden'); $('home').classList.remove('hidden'); }
