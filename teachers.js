const TEACHER_PIN='2468';

const TEACHER_DIRECTORY=[
  {id:'francisco',name:'Alfredo',icon:'👨‍🏫',role:'Biología y Física',groups:['Biología · 1.º A','Biología · 1.º B','Biología · 1.º C','Física · 2.º A'],active:true},
  {id:'jmiguel',name:'J. Miguel',icon:'🎨',role:'Artes',groups:['Artes · 1.º A','Artes · 2.º A','Artes · 2.º B','Artes · 2.º C','Artes · 2.º D','Artes · 2.º E','Artes · 3.º A','Artes · 3.º B','Artes · 3.º C','Artes · 3.º D','Artes · 3.º E'],active:false},
  {id:'ameyalli',name:'Ameyalli',icon:'📐',role:'Matemáticas',groups:['Matemáticas · 2.º D','Matemáticas · 3.º A','Matemáticas · 3.º B','Matemáticas · 3.º C','Matemáticas · 3.º D','Matemáticas · 3.º E'],active:false},
  {id:'nayelli',name:'Nayelli',icon:'🔬',role:'Ciencias',groups:['Ciencias · 1.º D','Ciencias · 1.º E','Ciencias · 2.º E'],active:false}
];

function teacher(){
  const pin=prompt('PIN docente:');
  if(pin!==TEACHER_PIN){alert('PIN docente incorrecto.');return;}
  teacherPinSession=pin;
  home();
  $('home').classList.add('hidden');
  $('teacherDirectory').classList.remove('hidden');
  renderTeacherDirectory();
}

function renderTeacherDirectory(){
  const box=$('teacherDirectoryBox');
  box.innerHTML='<div class="teacher-menu-head"><div><div class="eyebrow">ÁREA DOCENTE · ACCESO PROTEGIDO</div><h2>Docentes</h2><p class="muted">Selecciona tu nombre para consultar tus materias y grupos.</p></div><div class="teacher-lock">🔐 PIN docente activo</div></div><div class="teacher-sheets-box"><div><b>📊 Listas y evaluaciones</b><span class="muted">Captura y modifica las actividades directamente en Google Sheets.</span></div><a class="primary teacher-sheets-btn" href="https://docs.google.com/spreadsheets/d/1OD8f2fOcpDmw9UkU5s9tmjh03qfnLrI29-hecEDvGnw/edit?usp=sharing" target="_blank" rel="noopener">Abrir Google Sheets ↗</a></div><div class="teacher-grid">'+TEACHER_DIRECTORY.map(t=>'<button class="teacher-card '+(t.active?'teacher-active':'')+'" onclick="openTeacherProfile(\''+t.id+'\')"><span class="teacher-avatar">'+t.icon+'</span><span class="teacher-name">'+escapeHtml(t.name)+'</span><span class="teacher-role">'+escapeHtml(t.role)+'</span><span class="teacher-count">'+t.groups.length+' grupo(s)</span></button>').join('')+'</div>';
}

function openTeacherProfile(id){
  const t=TEACHER_DIRECTORY.find(x=>x.id===id);
  if(!t)return;
  const box=$('teacherDirectoryBox');
  let html='<div class="box teacher-profile"><button class="back" onclick="renderTeacherDirectory()">← Docentes</button><div class="teacher-profile-title"><span class="teacher-avatar">'+t.icon+'</span><div><div class="eyebrow">DOCENTE</div><h2>'+escapeHtml(t.name)+'</h2><p class="muted">'+escapeHtml(t.role)+'</p></div></div><div class="teacher-groups-title">Mis materias y grupos</div><div class="teacher-group-grid">';
  html+=t.groups.map((g,i)=>{
    const functional=t.active;
    return '<button class="teacher-group-card '+(functional?'':'teacher-group-pending')+'" onclick="'+(functional?'openFranciscoGroup(\''+escapeHtml(g)+'\')':'teacherPending(\''+escapeHtml(g)+'\')')+'"><span class="group-icon">'+(g.startsWith('Física')?'⚛️':'🔬')+'</span><span><b>'+escapeHtml(g)+'</b><small>'+(functional?'Abrir consulta y evaluación':'Lista preparada · conexión pendiente')+'</small></span><span>→</span></button>';
  }).join('');
  html+='</div></div>';
  box.innerHTML=html;
}

function openFranciscoGroup(group){
  if(group.startsWith('Biología')){
    $('teacherDirectory').classList.add('hidden');
    $('teacher').classList.remove('hidden');
    const code=group.includes('A')?'A':group.includes('B')?'B':'C';
    $('teacher').querySelector('h2').innerHTML='Panel docente · Biología <span class="muted">· '+escapeHtml(group.split('·')[1].trim())+' · EN LÍNEA</span>';
    $('tg').innerHTML=['A','B','C'].map(x=>'<option value="'+x+'">'+x+'</option>').join('');
    $('tg').value=code;
    $('table').innerHTML='<div class="box">Cargando evaluaciones desde Google Sheets...</div>';
    const pin=teacherPinSession||TEACHER_PIN;
    fetch(GOOGLE_SCRIPT_URL+'?action=all&teacherPin='+encodeURIComponent(pin)+'&_='+Date.now(),{cache:'no-store'})
      .then(r=>r.json()).then(d=>{if(!d.ok)throw new Error(d.error||'Error');window.teacherData=d;teacherTable();})
      .catch(()=>{$('table').innerHTML='<div class="box msg">No se pudo conectar con Google Sheets de Biología.</div>';});
  }else if(group.startsWith('Física')){
    $('teacherDirectory').classList.add('hidden');
    $('physics').classList.remove('hidden');
    $('physicsBox').innerHTML='<div class="box">Cargando evaluaciones de Física...</div>';
    const pin=teacherPinSession||TEACHER_PIN;
    fetch(PHYSICS_SCRIPT_URL+'?action=all&teacherPin='+encodeURIComponent(pin)+'&_='+Date.now(),{cache:'no-store'})
      .then(r=>r.json()).then(d=>{if(!d.ok)throw new Error(d.error||'Error');window.physicsTeacherData=d;renderPhysicsTeacher();})
      .catch(()=>{$('physicsBox').innerHTML='<div class="box msg">No se pudo conectar con Google Sheets de Física.</div>';});
  }
}

function teacherPending(group){
  alert(group+' está preparado en el menú. La consulta de evaluaciones se conectará cuando terminemos de integrar el Google Sheets maestro.');
}

function openStudentDirectory(){
  home();
  $('home').classList.add('hidden');
  $('studentDirectory').classList.remove('hidden');
  renderStudentDirectory();
}

function renderStudentDirectory(){
  const box=$('studentDirectoryBox');
  box.innerHTML='<div class="teacher-menu-head"><div><div class="eyebrow">CONSULTA DE ALUMNOS · ACCESO PERSONAL</div><h2>Consulta tus actividades</h2><p class="muted">Selecciona a tu docente para entrar a la consulta de actividades y evaluaciones.</p></div><div class="teacher-lock">🔒 PIN personal</div></div><div class="teacher-grid student-directory-grid">'+TEACHER_DIRECTORY.filter(t=>t.active).map(t=>'<button class="teacher-card student-subject-card" data-teacher-id="'+t.id+'" onclick="openStudentTeacher(this.dataset.teacherId)"><span class="student-subject-image"></span><span class="teacher-avatar">'+t.icon+'</span><span class="teacher-name">'+escapeHtml(t.name)+'</span><span class="teacher-role">'+escapeHtml(t.role)+'</span><span class="teacher-count">'+t.groups.length+' grupo(s)</span></button>').join('')+'</div><div class="student-help"><b>¿Cómo consultar?</b><span>Elige tu docente → selecciona la materia o grupo → captura tu número de lista y PIN personal.</span></div>';
}
function openStudentTeacher(id){
  const t=TEACHER_DIRECTORY.find(x=>x.id===id);
  if(!t)return;
  if(id!=='francisco'){
    $('studentDirectoryBox').innerHTML='<div class="box"><button class="back" onclick="renderStudentDirectory()">← Docentes</button><div class="eyebrow">CONSULTA DE ALUMNOS</div><h2>'+escapeHtml(t.name)+'</h2><p class="muted">'+escapeHtml(t.role)+'</p><div class="msg">La conexión de las evaluaciones de esta materia todavía está en integración. Esta pantalla ya queda preparada para agregar el acceso con grupo, número de lista y PIN.</div></div>';
    return;
  }
  $('studentDirectoryBox').innerHTML='<div class="box student-choice"><button class="back" onclick="renderStudentDirectory()">← Docentes</button><div class="eyebrow">ALFREDO · BIOLOGÍA Y FÍSICA</div><h2>Selecciona tu materia</h2><p class="muted">Después podrás elegir grupo, número de lista y PIN personal.</p><div class="student-choice-grid"><button class="teacher-group-card" onclick="openStudentFromDirectory()"><span class="group-icon">🧬</span><span><b>Biología · 1.º A, B o C</b><small>Consulta tus actividades y avance</small></span><span>→</span></button><button class="teacher-group-card" onclick="openPhysicsFromDirectory()"><span class="group-icon">⚛️</span><span><b>Física · 2.º A</b><small>Consulta tus actividades y avance</small></span><span>→</span></button></div></div>';
}

function openStudentFromDirectory(){
  openStudent();
  $('studentDirectory').classList.add('hidden');
}
function openPhysicsFromDirectory(){
  openPhysics();
  $('studentDirectory').classList.add('hidden');
}
