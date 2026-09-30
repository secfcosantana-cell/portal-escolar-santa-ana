/* ===== RECURSOS EDUCATIVOS =====
   Publica aquí materiales por materia. Para PDF se recomienda guardar el archivo
   en Google Drive y pegar el enlace de descarga/visualización.
*/
const RESOURCE_ITEMS = [
  // Ejemplo:
  // {materia:'Biología', tipo:'PDF', titulo:'Práctica de laboratorio · Microscopio',
  //  descripcion:'Material para trabajar en clase.', url:'https://...', descarga:true},
  // {materia:'Física', tipo:'VIDEO', titulo:'Introducción a la física',
  //  descripcion:'Video de apoyo.', url:'https://...', descarga:false},
];

function openResources(){
  document.querySelector('.hero-target')?.classList.add('hidden');
  document.querySelector('.hero-footer')?.classList.add('hidden');
  $('home').classList.add('hidden');
  $('studentDirectory')?.classList.add('hidden');
  $('teacherDirectory')?.classList.add('hidden');
  $('student')?.classList.add('hidden');
  $('teacher')?.classList.add('hidden');
  $('physics')?.classList.add('hidden');
  $('resources').classList.remove('hidden');
  renderResources();
}

function renderResources(){
  const box=$('resourcesBox');
  if(!box)return;
  const materias=['Todas',...new Set(RESOURCE_ITEMS.map(r=>String(r.materia||'').trim()).filter(Boolean))];
  const current=window.resourceFilter||'Todas';
  const items=current==='Todas'?RESOURCE_ITEMS:RESOURCE_ITEMS.filter(r=>String(r.materia||'')===current);

  let html='<div class="resource-head"><div><div class="eyebrow">MATERIAL DE APOYO</div><h2>Recursos educativos</h2><p class="muted">PDF, videos, páginas web y materiales descargables organizados por materia.</p></div><button class="back" onclick="closeResources()">← Regresar</button></div>';
  html+='<div class="resource-filters">'+materias.map(m=>'<button class="resource-filter '+(m===current?'active':'')+'" onclick="window.resourceFilter=\''+escapeHtml(m)+'\';renderResources()">'+escapeHtml(m)+'</button>').join('')+'</div>';

  if(!items.length){
    html+='<div class="box resource-empty"><div class="resource-empty-icon">📚</div><h3>Próximamente</h3><p>Aquí aparecerán los materiales que se publiquen para las materias: archivos PDF, videos, enlaces a páginas educativas y materiales para descargar.</p><p class="muted">Los recursos pueden organizarse por Biología, Física, Ofimática, Matemáticas, Artes y las demás asignaturas.</p></div>';
  }else{
    html+='<div class="resource-grid">'+items.map(resourceCard).join('')+'</div>';
  }
  box.innerHTML=html;
}

function resourceCard(r){
  const type=String(r.tipo||'RECURSO').toUpperCase();
  const icon=type==='PDF'?'📄':type==='VIDEO'?'▶️':type==='ENLACE'?'🌐':'📚';
  const action=r.descarga?'⬇️ Descargar':'🔗 Abrir recurso';
  return '<article class="resource-card"><div class="resource-type">'+icon+' '+escapeHtml(type)+'</div><div class="resource-subject">'+escapeHtml(r.materia||'General')+'</div><h3>'+escapeHtml(r.titulo||'Recurso educativo')+'</h3><p>'+escapeHtml(r.descripcion||'Material de apoyo para estudiantes.')+'</p><a class="primary resource-btn" href="'+escapeHtml(r.url||'#')+'" target="_blank" rel="noopener">'+action+' ↗</a></article>';
}

function closeResources(){ $('resources').classList.add('hidden'); $('home').classList.remove('hidden'); }
