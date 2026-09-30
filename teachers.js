const TEACHER_PIN='2468';

const TEACHER_DIRECTORY=[
  {id:'francisco',name:'Alfredo',icon:'👨‍🏫',role:'Biología y Física',groups:['Biología · 1.º A','Biología · 1.º B','Biología · 1.º C','Física · 2.º A'],active:true},
  {id:'jmiguel',name:'J. Miguel',icon:'🎨',role:'Artes',groups:['Artes · 1.º A','Artes · 2.º A','Artes · 2.º B','Artes · 2.º C','Artes · 2.º D','Artes · 2.º E','Artes · 3.º A','Artes · 3.º B','Artes · 3.º C','Artes · 3.º D','Artes · 3.º E'],active:true},
  {id:'ameyalli',name:'Ameyalli',icon:'📐',role:'Matemáticas',groups:['Matemáticas · 2.º D','Matemáticas · 3.º A','Matemáticas · 3.º B','Matemáticas · 3.º C','Matemáticas · 3.º D','Matemáticas · 3.º E'],active:true},
  {id:'nayelli',name:'Nayelli',icon:'🔬',role:'Ciencias',groups:['Ciencias · 1.º D','Ciencias · 1.º E','Ciencias · 2.º E'],active:true}
];

function descargarTablaCalificacionesExcel(materia,grupo){
  const table=document.querySelector('#table table');
  if(!table){alert('No hay una tabla de calificaciones para descargar.');return;}
  const clone=table.cloneNode(true);
  clone.querySelectorAll('input').forEach(input=>{const td=input.closest('td');if(td)td.textContent=input.value||'';});
  clone.querySelectorAll('script').forEach(x=>x.remove());
  const titulo=document.createElement('div');
  titulo.innerHTML='<h2>Reporte de calificaciones</h2><p><b>Materia:</b> '+escapeHtml(materia||'')+' &nbsp; <b>Grupo:</b> '+escapeHtml(grupo||'')+'</p><p>Calificaciones de 0 a 10 y porcentaje acumulado.</p>';
  const wrap=document.createElement('div');
  wrap.appendChild(titulo);wrap.appendChild(clone);
  const html='<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;font-size:12px}h2{margin-bottom:4px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:5px;text-align:center}th{background:#dbe7f0;font-weight:bold}td:first-child,th:first-child{text-align:left}</style></head><body>'+wrap.innerHTML+'</body></html>';
  const blob=new Blob(['\\ufeff',html],{type:'application/vnd.ms-excel'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const safeMateria=String(materia||'Reporte').replace(/[^a-z0-9áéíóúüñ]+/gi,'_');
  const safeGrupo=String(grupo||'Grupo').replace(/[^a-z0-9áéíóúüñ]+/gi,'_');
  a.href=url;a.download='Calificaciones_'+safeMateria+'_'+safeGrupo+'.xls';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function teacher(){
  hideLanding();
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
  if(id==='francisco'){
    box.innerHTML='<div class="box teacher-profile"><button class="back" onclick="renderTeacherDirectory()">← Docentes</button><div class="teacher-profile-title"><span class="teacher-avatar">'+t.icon+'</span><div><div class="eyebrow">DOCENTE</div><h2>Alfredo</h2><p class="muted">Biología y Física</p></div></div><div class="teacher-groups-title">Selecciona la materia</div><div class="teacher-group-grid"><button class="teacher-group-card" onclick="openFranciscoGroup(\'Biología · 1.º A\')"><span class="group-icon">🧬</span><span><b>Biología</b><small>Grupos 1.º A, 1.º B y 1.º C · Consulta y evaluación</small></span><span>→</span></button><button class="teacher-group-card" onclick="openFranciscoGroup(\'Física · 2.º A\')"><span class="group-icon">⚛️</span><span><b>Física</b><small>Grupo 2.º A · Consulta y evaluación</small></span><span>→</span></button></div></div>';
    return;
  }
  let html='<div class="box teacher-profile"><button class="back" onclick="renderTeacherDirectory()">← Docentes</button><div class="teacher-profile-title"><span class="teacher-avatar">'+t.icon+'</span><div><div class="eyebrow">DOCENTE · EN LÍNEA</div><h2>'+escapeHtml(t.name)+'</h2><p class="muted">'+escapeHtml(t.role)+' · captura y consulta desde Google Sheets</p></div></div><div class="teacher-groups-title">Mis materias y grupos</div><div class="teacher-group-grid">';
  html+=t.groups.map(g=>'<button class="teacher-group-card" onclick="openGenericTeacherGroup(&quot;'+t.id+'&quot;,&quot;'+escapeHtml(g)+'&quot;)"><span class="group-icon">📚</span><span><b>'+escapeHtml(g)+'</b><small>Lista, actividades y evaluación · EN LÍNEA</small></span><span>→</span></button>').join('');
  html+='</div></div>';
  box.innerHTML=html;
}
function openFranciscoGroup(group){
  if(group.startsWith('Biología')){
    $('teacherDirectory').classList.add('hidden');
    $('teacher').classList.remove('hidden');
    const code=group.includes('A')?'A':group.includes('B')?'B':'C';
    $('teacher').querySelector('h2').innerHTML='Panel docente · Biología <span class="muted">· 1.º '+code+' · EN LÍNEA</span>';
    $('tg').innerHTML=['A','B','C'].map(x=>'<option value="'+x+'">'+x+'</option>').join('');
    $('tg').value=code;
    $('table').innerHTML='<div class="box">Cargando evaluaciones numéricas desde Google Sheets...</div>';
    const oldManager=$('biologyActivityManager');
    if(oldManager) oldManager.remove();
    $('tg').insertAdjacentHTML('afterend','<div id="biologyActivityManager" class="teacher-note" style="margin:12px 0;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span><b>Administración de actividades</b><br><span class="muted">Agrega, edita o activa/desactiva actividades sin entrar a Google Sheets.</span></span><button class="secondary" onclick="openBiologyActivityManager()">⚙️ Administrar actividades</button></div>');
    const pin=teacherPinSession||TEACHER_PIN;
    const url=BIOLOGY_SCRIPT_URL+'?action=all&pin='+encodeURIComponent(pin)+'&materia='+encodeURIComponent('Biología')+'&_='+Date.now();
    jsonpBiology(url,function(d){
      if(!d||!d.ok){$('table').innerHTML='<div class="box msg">'+escapeHtml((d&&d.error)||'No se pudo cargar Biología.')+'</div>';return;}
      window.teacherData=d;
      teacherTable();
    },function(){
      $('table').innerHTML='<div class="box msg">No se pudo conectar con Google Sheets de Biología.</div>';
    });
  }else if(group.startsWith('Física')){
    $('teacherDirectory').classList.add('hidden');
    $('physics').classList.remove('hidden');
    physicsTeacherLogin();
  }
}

function teacherPending(group){
  alert(group+' está preparado en el menú. La consulta de evaluaciones se conectará cuando terminemos de integrar el Google Sheets maestro.');
}

function openStudentDirectory(){
  hideLanding();
  home();
  $('home').classList.add('hidden');
  $('studentDirectory').classList.remove('hidden');
  renderStudentDirectory();
}

function renderStudentDirectory(){
  const box=$('studentDirectoryBox');
  box.innerHTML='<div class="teacher-menu-head"><div><div class="eyebrow">CONSULTA DE ALUMNOS · ACCESO PERSONAL</div><h2>Consulta tus actividades</h2><p class="muted">Selecciona la materia que deseas consultar.</p></div><div class="teacher-lock">🔒 PIN personal</div></div><div class="student-choice-grid student-direct-grid"><button class="teacher-group-card" onclick="openStudentFromDirectory()"><span class="group-icon">🧬</span><span><b>Biología</b><small>1.º A, B o C · Consulta tus actividades y avance</small></span><span>→</span></button><button class="teacher-group-card" onclick="openPhysicsFromDirectory()"><span class="group-icon">⚛️</span><span><b>Física</b><small>2.º A · Consulta tus actividades y avance</small></span><span>→</span></button><button class="teacher-group-card" onclick="openGenericStudentSubject(&quot;Artes&quot;,&quot;J. Miguel&quot;,&quot;🎨&quot;)"><span class="group-icon">🎨</span><span><b>Artes</b><small>J. Miguel · 1.º A a 3.º E</small></span><span>→</span></button><button class="teacher-group-card" onclick="openGenericStudentSubject(&quot;Matemáticas&quot;,&quot;Ameyalli&quot;,&quot;📐&quot;)"><span class="group-icon">📐</span><span><b>Matemáticas</b><small>Ameyalli · 2.º D y 3.º A a 3.º E</small></span><span>→</span></button><button class="teacher-group-card" onclick="openGenericStudentSubject(&quot;Ciencias&quot;,&quot;Nayelli&quot;,&quot;🔬&quot;)"><span class="group-icon">🔬</span><span><b>Ciencias</b><small>Nayelli · 1.º D, 1.º E y 2.º E</small></span><span>→</span></button></div><div class="student-help"><b>¿Cómo consultar?</b><span>Selecciona una materia y después captura grupo, número de lista y PIN personal.</span></div>';
}
function openStudentTeacher(id){
  const t=TEACHER_DIRECTORY.find(x=>x.id===id);
  if(!t)return;
  if(id!=='francisco'){
    openGenericStudentSubject(t.role,t.name,t.icon);
    return;
  }

  $('studentDirectoryBox').innerHTML='<div class="box student-choice"><button class="back" onclick="renderStudentDirectory()">← Docentes</button><div class="eyebrow">ALFREDO · BIOLOGÍA Y FÍSICA</div><h2>Selecciona tu materia</h2><p class="muted">Después podrás elegir grupo, número de lista y PIN personal.</p><div class="student-choice-grid"><button class="teacher-group-card" onclick="openStudentFromDirectory()"><span class="group-icon">🧬</span><span><b>Biología · 1.º A, B o C</b><small>Consulta tus actividades y avance</small></span><span>→</span></button><button class="teacher-group-card" onclick="openPhysicsFromDirectory()"><span class="group-icon">⚛️</span><span><b>Física · 2.º A</b><small>Consulta tus actividades y avance</small></span><span>→</span></button></div></div>';
}

/* ====================== ARTES · MATEMÁTICAS · CIENCIAS ====================== */
const GENERAL_SCHOOL_SCRIPT_URL='https://script.google.com/macros/s/AKfycby3xGQ-PxeVThLd_iUWqAuvc5Vzk6YyZd6VYS8ac2FH6wbLG-eloUbBDijxQhzic72v/exec';
const GENERAL_SUBJECT_GROUPS={
  'Artes':['1º A','2º A','2º B','2º C','2º D','2º E','3º A','3º B','3º C','3º D','3º E'],
  'Matemáticas':['2º D','3º A','3º B','3º C','3º D','3º E'],
  'Ciencias':['1º D','1º E','2º E']
};
const GENERAL_GROUP_COUNTS={
  'Artes|1º A':26,'Artes|2º A':27,'Artes|2º B':28,'Artes|2º C':28,'Artes|2º D':27,'Artes|2º E':28,
  'Artes|3º A':28,'Artes|3º B':29,'Artes|3º C':29,'Artes|3º D':29,'Artes|3º E':29,
  'Matemáticas|2º D':27,'Matemáticas|3º A':28,'Matemáticas|3º B':29,'Matemáticas|3º C':29,'Matemáticas|3º D':29,'Matemáticas|3º E':29,
  'Ciencias|1º D':25,'Ciencias|1º E':23,'Ciencias|2º E':28
};
let generalTeacherSubject='';
let generalTeacherData=null;
let generalTeacherAssignment=null;

function normalizarGeneralGrupo_(v){return String(v??'').trim().toUpperCase().replace(/\s+/g,' ').replace(/°/g,'º').replace(/\./g,'');}
function normalizarGeneralNumero_(v){const t=String(v??'').trim().replace(/[^\d]/g,'');return t?String(Number(t)):'';}
function generalActivityWeight_(a){const n=Number(String(a?.['Valor_%']??a?.['Valor %']??a?.Porcentaje??a?.Valor??0).replace(',','.'));return isNaN(n)?0:n;}

function openGenericTeacherGroup(teacherId,groupLabel){
  const t=TEACHER_DIRECTORY.find(x=>x.id===teacherId);if(!t)return;
  generalTeacherSubject=t.role;generalTeacherData=null;generalTeacherAssignment=null;
  $('teacherDirectory').classList.add('hidden');$('teacher').classList.remove('hidden');
  $('teacher').querySelector('h2').innerHTML='Panel docente · '+escapeHtml(t.role)+' <span class="muted">· '+escapeHtml(groupLabel.split(' · ')[1]||groupLabel)+' · EN LÍNEA</span>';
  const selectedGeneralGroup=groupLabel.split(' · ')[1]||groupLabel;
  $('tg').innerHTML='<option value="'+escapeHtml(selectedGeneralGroup)+'">'+escapeHtml(selectedGeneralGroup)+'</option>';
  $('tg').value=selectedGeneralGroup;
  $('table').innerHTML='<div class="box">Cargando evaluaciones numéricas desde Google Sheets...</div>';
  const oldManager=$('generalActivityManager');if(oldManager)oldManager.remove();
  $('tg').insertAdjacentHTML('afterend','<div id="generalActivityManager" class="teacher-note" style="margin:12px 0;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span><b>Administración de actividades</b><br><span class="muted">Agrega, edita o activa/desactiva actividades sin entrar a Google Sheets.</span></span><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="secondary" onclick="openGeneralActivityManager()">⚙️ Administrar actividades</button><button class="primary" onclick="descargarTablaCalificacionesExcel(generalTeacherSubject,$('tg').value)">📥 Descargar Excel para imprimir</button></div></div>');
  const url=GENERAL_SCHOOL_SCRIPT_URL+'?action=all&pin='+encodeURIComponent(teacherPinSession||TEACHER_PIN)+'&materia='+encodeURIComponent(t.role)+'&_='+Date.now();
  jsonpBiology(url,function(d){if(!d||!d.ok){$('table').innerHTML='<div class="box msg">'+escapeHtml((d&&d.error)||'No se pudo cargar '+t.role+'.')+'</div>';return;}generalTeacherData=d;renderGeneralTeacherTable();},function(){$('table').innerHTML='<div class="box msg">No se pudo conectar con Google Sheets de '+escapeHtml(t.role)+'.</div>';});
}
function renderGeneralTeacherTable(){
  const d=generalTeacherData;if(!d)return;
  const wanted=normalizarGeneralGrupo_($('tg').value);
  const asignacion=(d.asignaciones||[]).find(a=>normalizarGeneralGrupo_(a.grupo)===wanted);
  if(!asignacion){$('table').innerHTML='<div class="box msg">No se encontró la asignación de '+escapeHtml(generalTeacherSubject)+' '+escapeHtml($('tg').value)+'.</div>';return;}
  generalTeacherAssignment=asignacion;
  const students=asignacion.alumnos||[],evals=asignacion.evaluaciones||[];
  const acts=(asignacion.actividades||[]).filter(a=>!['no','false','0'].includes(String(a.Activa??'').trim().toLowerCase()));
  let html='<div class="tableWrap"><table class="table"><thead><tr><th>Alumno</th>'+acts.map(a=>'<th>'+escapeHtml(a.ID_Actividad||'')+'<br><span class="muted">'+generalActivityWeight_(a)+'%</span></th>').join('')+'<th>Acumulado</th></tr></thead><tbody>';
  students.forEach(st=>{
    const lista=String(st.lista??st['No. lista']??'').trim();let total=0;
    html+='<tr><td>'+escapeHtml(lista)+'. <b>'+escapeHtml(st.nombre||st.Alumno||'')+'</b></td>';
    acts.forEach(a=>{
      const ev=evals.find(x=>String(x.ID_Asignación||'').trim()===String(asignacion.idAsignacion||'').trim()&&normalizarGeneralNumero_(x['No. lista']||x.No_Lista)===normalizarGeneralNumero_(lista)&&String(x.ID_Actividad||'').trim()===String(a.ID_Actividad||'').trim());
      const raw=ev?.Calificación,has=raw!==null&&raw!==undefined&&String(raw).trim()!=='',grade=has?Number(raw):'';
      if(has&&!isNaN(grade))total+=(grade/10)*generalActivityWeight_(a);
      html+='<td><input class="general-grade-input" type="number" min="0" max="10" step="0.1" value="'+(has?escapeHtml(String(grade)):'')+'" data-lista="'+escapeHtml(lista)+'" data-asignacion="'+escapeHtml(asignacion.idAsignacion||'')+'" data-actividad="'+escapeHtml(a.ID_Actividad||'')+'" onchange="saveGeneralGrade(this)" title="Calificación de 0 a 10"></td>';
    });
    total=Math.round(total*100)/100;html+='<td class="total" id="general-total-'+escapeHtml(lista)+'">'+total+'%</td></tr>';
  });
  html+='</tbody></table></div><p class="muted">Las calificaciones se capturan de 0 a 10 y se guardan directamente en Google Sheets.</p>';
  $('table').innerHTML=html;
}
function saveGeneralGrade(input){
  const value=input.value.trim();
  if(value!==''){const grade=Number(value);if(isNaN(grade)||grade<0||grade>10){alert('La calificación debe ser un número de 0 a 10.');input.focus();return;}}
  input.disabled=true;
  const u=GENERAL_SCHOOL_SCRIPT_URL+'?action=save&pin='+encodeURIComponent(teacherPinSession||TEACHER_PIN)+'&idAsignacion='+encodeURIComponent(input.dataset.asignacion)+'&lista='+encodeURIComponent(input.dataset.lista)+'&idActividad='+encodeURIComponent(input.dataset.actividad)+'&calificacion='+encodeURIComponent(value)+'&_='+Date.now();
  jsonpBiology(u,function(d){if(!d||!d.ok){alert((d&&d.error)||'No se pudo guardar la calificación.');input.disabled=false;return;}const asig=(generalTeacherData.asignaciones||[]).find(a=>String(a.idAsignacion)===String(input.dataset.asignacion));const evs=asig?asig.evaluaciones:[];const ev=evs.find(x=>String(x.ID_Asignación||'').trim()===String(input.dataset.asignacion).trim()&&normalizarGeneralNumero_(x['No. lista']||x.No_Lista)===normalizarGeneralNumero_(input.dataset.lista)&&String(x.ID_Actividad||'').trim()===String(input.dataset.actividad).trim());if(ev)ev.Calificación=value===''?'':Number(value);else if(value!=='')evs.push({ID_Asignación:input.dataset.asignacion,'No. lista':input.dataset.lista,ID_Actividad:input.dataset.actividad,Calificación:Number(value)});updateGeneralTotal_(input.dataset.lista);input.disabled=false;},function(){alert('No se pudo conectar con Google Sheets.');input.disabled=false;});
}
function updateGeneralTotal_(lista){
  const asig=generalTeacherAssignment;if(!asig)return;let total=0;
  document.querySelectorAll('.general-grade-input[data-lista="'+CSS.escape(String(lista))+'"]').forEach(input=>{const grade=Number(input.value);if(isNaN(grade))return;const a=(asig.actividades||[]).find(x=>String(x.ID_Actividad||'').trim()===String(input.dataset.actividad||'').trim());if(a)total+=(grade/10)*generalActivityWeight_(a);});
  const cell=$('general-total-'+String(lista));if(cell)cell.textContent=Math.round(total*100)/100+'%';
}
let generalActivityPeriod='1';
function openGeneralActivityManager(){
  const box=$('generalActivityManager');if(!box)return;
  box.outerHTML='<div id="generalActivityManager" class="box" style="margin:12px 0"><div class="eyebrow">ADMINISTRAR ACTIVIDADES · '+escapeHtml(generalTeacherSubject.toUpperCase())+'</div><h3 style="margin:4px 0 10px">Actividades y porcentajes</h3><div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap"><div><label>Periodo</label><select id="generalAdminPeriod" onchange="generalActivityPeriod=this.value;loadGeneralActivityManager()"><option value="1">Periodo 1</option><option value="2">Periodo 2</option><option value="3">Periodo 3</option></select></div><button class="secondary" onclick="closeGeneralActivityManager()">Cerrar administración</button></div><div id="generalAdminBody" style="margin-top:12px">Cargando...</div></div>';
  $('generalAdminPeriod').value=generalActivityPeriod;loadGeneralActivityManager();
}
function closeGeneralActivityManager(){
  const m=$('generalActivityManager');if(m)m.outerHTML='<div id="generalActivityManager" class="teacher-note" style="margin:12px 0;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span><b>Administración de actividades</b><br><span class="muted">Agrega, edita o activa/desactiva actividades sin entrar a Google Sheets.</span></span><button class="secondary" onclick="openGeneralActivityManager()">⚙️ Administrar actividades</button></div>';
}
function loadGeneralActivityManager(){
  const body=$('generalAdminBody');if(!body)return;body.innerHTML='<div class="muted">Cargando actividades...</div>';
  const u=GENERAL_SCHOOL_SCRIPT_URL+'?action=activityAdmin&op=list&pin='+encodeURIComponent(teacherPinSession||TEACHER_PIN)+'&materia='+encodeURIComponent(generalTeacherSubject)+'&_='+Date.now();
  jsonpBiology(u,function(d){if(!d||!d.ok){body.innerHTML='<div class="msg">'+escapeHtml((d&&d.error)||'No se pudo cargar el catálogo.')+'</div>';return;}window.generalCurrentPeriod=String(d.periodoActual||'1');renderGeneralActivityManager(d.actividades||[]);},function(){body.innerHTML='<div class="msg">No se pudo conectar con Google Sheets.</div>';});
}
function renderGeneralActivityManager(all){
  const body=$('generalAdminBody');if(!body)return;
  const period=generalActivityPeriod,current=String(window.generalCurrentPeriod||'1'),currentAsig=String(generalTeacherAssignment?.idAsignacion||'').trim(),acts=(all||[]).filter(a=>String(a.periodo??a.Periodo??'1').replace(/^Periodo\s*/i,'')===String(period)&&(!currentAsig||String(a.idAsignacion||a.ID_Asignación||'').trim()===currentAsig));
  const total=acts.filter(a=>a.activa===true||['si','sí','true','1'].includes(String(a.activa??a.Activa??'').trim().toLowerCase())).reduce((s,a)=>s+Number(a.porcentaje??a.Porcentaje??a['Valor_%']??0),0);
  const disponible=Math.max(0,100-total);
  let html='<div class="teacher-note"><b>Periodo '+escapeHtml(period)+'</b> · Total activo: '+Math.round(total*100)/100+'% · Disponible: '+Math.round(disponible*100)/100+'%'+(String(period)===current?' · 🟢 ACTUAL':'')+'</div>';
  if(String(period)!==current)html+='<div style="margin-top:8px"><button class="secondary" onclick="setGeneralCurrentPeriod(&quot;'+period+'&quot;)">Usar Periodo '+period+' como actual</button></div>';
  html+='<div style="overflow:auto;margin-top:10px"><table class="table"><thead><tr><th>ID</th><th>Actividad</th><th>%</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
  if(!acts.length)html+='<tr><td colspan="5"><span class="muted">No hay actividades registradas en este periodo.</span></td></tr>';
  acts.forEach(a=>{const id=a.idActividad??a.ID_Actividad??'',name=a.actividad??a.Actividad??'',pct=Number(a.porcentaje??a.Porcentaje??a['Valor_%']??0),active=a.activa===true||['si','sí','true','1'].includes(String(a.activa??a.Activa??'').trim().toLowerCase());html+='<tr><td>'+escapeHtml(id)+'</td><td><b>'+escapeHtml(name)+'</b></td><td>'+pct+'%</td><td>'+(active?'🟢 Activa':'⚪ Inactiva')+'</td><td style="white-space:nowrap"><button class="secondary" onclick="editGeneralActivity(&quot;'+escapeHtml(id)+'&quot;,&quot;'+escapeHtml(name)+'&quot;,'+pct+')">✏️ Editar</button> <button class="secondary" onclick="toggleGeneralActivity(&quot;'+escapeHtml(id)+'&quot;,'+(!active)+')">'+(active?'Desactivar':'Activar')+'</button></td></tr>';});
  html+='</tbody></table></div><div class="box" style="margin-top:12px"><h4 style="margin:0 0 8px">➕ Agregar actividad al Periodo '+escapeHtml(period)+'</h4><div style="display:grid;grid-template-columns:minmax(220px,1fr) 120px auto;gap:8px;align-items:end"><div><label>Actividad</label><input id="generalNewActivity" placeholder="Nombre de la actividad"></div><div><label>Porcentaje</label><input id="generalNewPct" type="number" min="0.1" max="100" step="0.1" placeholder="%"></div><button class="primary" onclick="addGeneralActivity()">Agregar</button></div><div class="muted" style="margin-top:8px">No se puede superar el 100% del periodo.</div></div>';
  body.innerHTML=html;
}
function setGeneralCurrentPeriod(periodo){if(!confirm('¿Cambiar el periodo actual de '+generalTeacherSubject+' al Periodo '+periodo+'?'))return;activityAdminGeneral('setCurrentPeriod',{periodo:periodo});}
function addGeneralActivity(){const n=$('generalNewActivity')?.value.trim(),p=$('generalNewPct')?.value.trim();if(!n||!p){alert('Escribe el nombre y el porcentaje.');return;}activityAdminGeneral('add',{actividad:n,porcentaje:p,periodo:generalActivityPeriod});}
function editGeneralActivity(id,nombre,pct){const n=prompt('Nombre de la actividad:',nombre);if(n===null)return;const p=prompt('Porcentaje:',pct);if(p===null)return;activityAdminGeneral('edit',{idActividad:id,idAsignacion:generalTeacherAssignment?.idAsignacion||'',actividad:n,porcentaje:p});}
function toggleGeneralActivity(id,activa){activityAdminGeneral('toggle',{idActividad:id,idAsignacion:generalTeacherAssignment?.idAsignacion||'',activa:String(activa)});}
function activityAdminGeneral(op,extra){
  const params=Object.assign({action:'activityAdmin',op:op,pin:teacherPinSession||TEACHER_PIN,materia:generalTeacherSubject,grupo:$('tg')?.value||'',_:Date.now()},extra||{});
  const u=GENERAL_SCHOOL_SCRIPT_URL+'?'+Object.keys(params).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');
  jsonpBiology(u,function(d){if(!d||!d.ok){alert((d&&d.error)||'No se pudo guardar el cambio.');return;}loadGeneralActivityManager();const refresh=GENERAL_SCHOOL_SCRIPT_URL+'?action=all&pin='+encodeURIComponent(teacherPinSession||TEACHER_PIN)+'&materia='+encodeURIComponent(generalTeacherSubject)+'&_='+Date.now();jsonpBiology(refresh,function(fresh){if(fresh&&fresh.ok)generalTeacherData=fresh;renderGeneralTeacherTable();},function(){renderGeneralTeacherTable();});},function(){alert('No se pudo conectar con Google Sheets.');});
}

function openGenericStudentSubject(materia,docente,icon){
  hideLanding();$('home').classList.add('hidden');$('student').classList.add('hidden');$('studentDirectory').classList.remove('hidden');
  const groups=GENERAL_SUBJECT_GROUPS[materia]||[];const box=$('studentDirectoryBox');
  box.innerHTML='<div class="box student-choice"><button class="back" onclick="renderStudentDirectory()">← Materias</button><div class="eyebrow">CONSULTA DE ALUMNOS · EN LÍNEA</div><h2>'+escapeHtml(materia)+'</h2><p class="muted">'+escapeHtml(docente)+' · Selecciona tu grupo, número de lista y PIN personal.</p><div class="student-form-grid"><label>Grupo<select id="generalStudentGroup" onchange="fillGeneralStudentLists()">'+groups.map(g=>'<option value="'+escapeHtml(g)+'">'+escapeHtml(g)+'</option>').join('')+'</select></label><label>Número de lista<select id="generalStudentList"></select></label><label>PIN personal<input id="generalStudentPin" maxlength="20" inputmode="numeric" autocomplete="off" placeholder="PIN"></label></div><button class="primary" onclick="generalStudentLogin()">Consultar evaluación</button><div id="generalStudentMsg" class="msg"></div></div>';
  fillGeneralStudentLists(materia);
}
function fillGeneralStudentLists(materia){
  const g=$('generalStudentGroup')?.value||'';const count=GENERAL_GROUP_COUNTS[(materia||generalStudentCurrentSubject_())+'|'+g]||29;const el=$('generalStudentList');if(el)el.innerHTML=Array.from({length:count},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'</option>').join('');
}
function generalStudentLogin(){
  const g=$('generalStudentGroup').value,n=$('generalStudentList').value,p=$('generalStudentPin').value.trim(),msg=$('generalStudentMsg');msg.textContent='Consultando...';
  const materia=generalStudentCurrentSubject_();
  const u=GENERAL_SCHOOL_SCRIPT_URL+'?action=student&grupo='+encodeURIComponent(g)+'&lista='+encodeURIComponent(n)+'&pin='+encodeURIComponent(p)+'&materia='+encodeURIComponent(materia)+'&_='+Date.now();
  jsonpBiology(u,function(d){if(!d||!d.ok){msg.textContent=(d&&d.error)||'Datos incorrectos.';return;}renderGeneralStudent(d,materia);},function(){msg.textContent='No se pudo conectar con Google Sheets de '+escapeHtml(materia)+'.';});
}
function generalStudentCurrentSubject_(){return $('studentDirectoryBox')?.querySelector('.student-choice h2')?.textContent?.trim()||'';}
function renderGeneralStudent(d,materia){
  const p=Number(d.porcentaje)||0,acts=d.actividades||[];
  $('studentDirectoryBox').innerHTML='<div class="box"><button class="back" onclick="openGenericStudentSubject(&quot;'+escapeHtml(materia)+'&quot;,&quot;Consulta&quot;,&quot;📚&quot;)">← Regresar</button><div class="eyebrow">'+escapeHtml(d.alumno.grupo)+' · '+escapeHtml(materia.toUpperCase())+' · EN LÍNEA</div><h2>'+escapeHtml(d.alumno.nombre)+'</h2><div class="muted">Solo lectura · Información actualizada desde Google Sheets</div><div class="studentHead"><b>Avance acumulado</b><div class="percent">'+p+'%</div></div><div class="progress"><div class="bar" style="width:'+Math.min(p,100)+'%"></div></div>'+acts.map(a=>'<div class="activity"><span>📚</span><div class="grow"><b>'+escapeHtml(a.actividad||'')+'</b><div class="muted">Valor de la actividad: '+Number(a.porcentaje||0)+'%</div></div><span class="activity-grade">'+(a.evaluada===true?'<b>Calificación: '+Number(a.calificacion)+'/10</b>':'<span class="muted">Sin calificar</span>')+'</span></div>').join('')+'</div>';
}

function openStudentFromDirectory(){
  hideLanding();
  openStudent();
  $('studentDirectory').classList.add('hidden');
}
function openPhysicsFromDirectory(){
  hideLanding();
  openPhysics();
  $('studentDirectory').classList.add('hidden');
}


/* ========================= BIOLOGÍA NUMÉRICA ========================= */

const BIOLOGY_SCRIPT_URL='https://script.google.com/macros/s/AKfycbxYs9ZEvfvly_HwWNubtrXCPquZ9Eyln4ZQkhU3qwgbuzjNgwyomFFvhrzV0DgiHE52Fw/exec';

function studentLogin(){
  const code=$('sg').value,n=$('sn').value,p=$('sp').value.trim(),msg=$('sm');
  msg.textContent='Consultando...';
  const u=BIOLOGY_SCRIPT_URL+'?action=student&grupo='+encodeURIComponent('1º '+code)+'&lista='+encodeURIComponent(n)+'&pin='+encodeURIComponent(p)+'&materia='+encodeURIComponent('Biología')+'&_='+Date.now();
  jsonpBiology(u,function(d){
    if(!d||!d.ok){msg.textContent=(d&&d.error)||'Datos incorrectos.';return;}
    renderStudent(d);
  },function(){msg.textContent='No se pudo conectar con Google Sheets de Biología.';});
}

function renderStudent(d){
  const p=Number(d.porcentaje)||0;
  const actividades=d.actividades||[];
  $('studentBox').innerHTML='<div class="box"><button class="back" onclick="openStudent()">← Regresar</button><div class="eyebrow">'+escapeHtml(d.alumno.grupo)+' · BIOLOGÍA · EN LÍNEA</div><h2>'+escapeHtml(d.alumno.nombre)+'</h2><div class="muted">Solo lectura · Información actualizada desde Google Sheets</div><div class="studentHead"><b>Avance acumulado</b><div class="percent">'+p+'%</div></div><div class="progress"><div class="bar" style="width:'+Math.min(p,100)+'%"></div></div>'+actividades.map(a=>'<div class="activity"><span>'+activityIcon(a.idActividad)+'</span><div class="grow"><b>'+escapeHtml(a.actividad||'')+'</b><div class="muted">Valor de la actividad: '+Number(a.porcentaje||0)+'%</div></div><span class="activity-grade">'+(a.evaluada===true?'<b>Calificación: '+Number(a.calificacion)+'/10</b>':'<span class="muted">Sin calificar</span>')+'</span></div>').join('')+'</div>';
}

function activityIcon(id){
  const icons={A1:'🧠',A2:'🔬',A3:'📘',A4:'🧫',A5:'🦠',A6:'📊',A7:'🤝',a1:'🧠',a2:'🔬',a3:'📘',a4:'🧫',a5:'🦠',a6:'📊',a7:'🤝'};
  return icons[id]||'📌';
}

function teacherTable(){
  if(typeof generalTeacherSubject!=='undefined' && generalTeacherSubject){renderGeneralTeacherTable();return;}
  if(!window.teacherData)return;
  const g=$('tg').value;
  const fullGroup='1º '+g;
  const asignacion=(window.teacherData.asignaciones||[]).find(a=>normalizarBioGrupo_(a.grupo)===normalizarBioGrupo_(fullGroup));
  if(!asignacion){$('table').innerHTML='<div class="box msg">No se encontró la asignación de Biología '+escapeHtml(fullGroup)+'.</div>';return;}
  const students=asignacion.alumnos||[],evals=asignacion.evaluaciones||[];
  const acts=(asignacion.actividades||[]).filter(a=>!['no','false','0'].includes(String(a.Activa??'').trim().toLowerCase()));
  let html='<div class="tableWrap"><table class="table"><thead><tr><th>Alumno</th>'+acts.map(a=>'<th>'+escapeHtml(a.ID_Actividad||'')+'<br><span class="muted">'+biologyActivityWeight(a)+'%</span></th>').join('')+'<th>Total</th></tr></thead><tbody>';
  students.forEach(st=>{
    const lista=String(st.lista||'').trim();let total=0;
    html+='<tr><td>'+escapeHtml(lista)+'. <b>'+escapeHtml(st.nombre||'')+'</b></td>';
    acts.forEach(a=>{
      const ev=evals.find(x=>String(x.ID_Asignación||'').trim()===String(asignacion.idAsignacion||'').trim()&&normalizarBioNumero_(x['No. lista']||x.No_Lista)===normalizarBioNumero_(lista)&&String(x.ID_Actividad||'').trim()===String(a.ID_Actividad||'').trim());
      const raw=ev?.Calificación,has=raw!==null&&raw!==undefined&&String(raw).trim()!=='',grade=has?Number(raw):'';
      if(has&&!isNaN(grade))total+=(grade/10)*biologyActivityWeight(a);
      html+='<td><input class="biology-grade-input" type="number" min="0" max="10" step="0.1" value="'+(has?escapeHtml(String(grade)):'')+'" data-lista="'+escapeHtml(lista)+'" data-asignacion="'+escapeHtml(asignacion.idAsignacion||'')+'" data-actividad="'+escapeHtml(a.ID_Actividad||'')+'" onchange="saveBiologyGrade(this)" title="Calificación de 0 a 10"></td>';
    });
    total=Math.round(total*100)/100;
    html+='<td class="total" id="biology-total-'+escapeHtml(lista)+'">'+total+'%</td></tr>';
  });
  html+='</tbody></table></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0"><button class="secondary" onclick="descargarTablaCalificacionesExcel(\'Biología\',\'1.º '+code+'\')">📥 Descargar Excel</button></div><p class="muted">Las calificaciones se capturan de 0 a 10 y se guardan directamente en Google Sheets.</p>';
  $('table').innerHTML=html;
}

function saveBiologyGrade(input){
  const value=input.value.trim(),lista=input.dataset.lista,idAsignacion=input.dataset.asignacion,idActividad=input.dataset.actividad;
  if(value!==''){
    const grade=Number(value);
    if(isNaN(grade)||grade<0||grade>10){alert('La calificación debe ser un número de 0 a 10.');input.focus();return;}
  }
  input.disabled=true;
  const u=BIOLOGY_SCRIPT_URL+'?action=save&pin='+encodeURIComponent(teacherPinSession)+'&idAsignacion='+encodeURIComponent(idAsignacion)+'&lista='+encodeURIComponent(lista)+'&idActividad='+encodeURIComponent(idActividad)+'&calificacion='+encodeURIComponent(value)+'&_='+Date.now();
  jsonpBiology(u,function(d){
    if(!d||!d.ok){alert((d&&d.error)||'No se pudo guardar la calificación.');input.disabled=false;return;}
    const asig=(window.teacherData.asignaciones||[]).find(a=>String(a.idAsignacion)===String(idAsignacion));
    const evs=asig?asig.evaluaciones:[];
    const ev=evs.find(x=>String(x.ID_Asignación||'').trim()===String(idAsignacion).trim()&&normalizarBioNumero_(x['No. lista']||x.No_Lista)===normalizarBioNumero_(lista)&&String(x.ID_Actividad||'').trim()===String(idActividad).trim());
    if(ev)ev['Calificación']=value===''?'':Number(value);
    else if(value!=='')evs.push({ID_Asignación:idAsignacion,'No. lista':lista,ID_Actividad:idActividad,Calificación:Number(value)});
    teacherTable();
    input.disabled=false;
  },function(){alert('No se pudo conectar con Google Sheets de Biología.');input.disabled=false;});
}

function biologyActivityWeight(a){
  const value=a['Valor_%']??a['Valor %']??a['Porcentaje']??a['Valor']??0;
  const n=Number(String(value).replace(',','.'));
  return isNaN(n)?0:n;
}

let biologyActivityPeriod='1';

function openBiologyActivityManager(){
  const box=$('biologyActivityManager');
  if(!box)return;
  box.outerHTML='<div id="biologyActivityManager" class="box" style="margin:12px 0">'+
    '<div class="eyebrow">ADMINISTRAR ACTIVIDADES · BIOLOGÍA</div>'+
    '<h3 style="margin:4px 0 10px">Actividades y porcentajes</h3>'+
    '<div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap">'+
      '<div><label>Periodo</label><select id="bioAdminPeriod" onchange="biologyActivityPeriod=this.value;loadBiologyActivityManager()"><option value="1">Periodo 1</option><option value="2">Periodo 2</option><option value="3">Periodo 3</option></select></div>'+
      '<button class="secondary" onclick="closeBiologyActivityManager()">Cerrar administración</button>'+
    '</div>'+
    '<div id="bioAdminBody" style="margin-top:12px">Cargando...</div>'+
  '</div>';
  $('bioAdminPeriod').value=biologyActivityPeriod;
  loadBiologyActivityManager();
}

function closeBiologyActivityManager(){
  const m=$('biologyActivityManager');
  if(m)m.outerHTML='<div id="biologyActivityManager" class="teacher-note" style="margin:12px 0;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span><b>Administración de actividades</b><br><span class="muted">Agrega, edita o activa/desactiva actividades sin entrar a Google Sheets.</span></span><button class="secondary" onclick="openBiologyActivityManager()">⚙️ Administrar actividades</button></div>';
}

function loadBiologyActivityManager(){
  const body=$('bioAdminBody');
  if(!body)return;
  body.innerHTML='<div class="muted">Cargando actividades...</div>';
  const u=BIOLOGY_SCRIPT_URL+'?action=activityAdmin&op=list&pin='+encodeURIComponent(teacherPinSession||TEACHER_PIN)+'&materia='+encodeURIComponent('Biología')+'&_='+Date.now();
  jsonpBiology(u,function(d){
    if(!d||!d.ok){body.innerHTML='<div class="msg">'+escapeHtml((d&&d.error)||'No se pudo cargar el catálogo.')+'</div>';return;}
    window.biologyCurrentPeriod=String(d.periodoActual||'1');
    renderBiologyActivityManager(d.actividades||[]);
  },function(){body.innerHTML='<div class="msg">No se pudo conectar con Google Sheets.</div>';});
}

function renderBiologyActivityManager(all){
  const body=$('bioAdminBody');
  if(!body)return;
  const period=biologyActivityPeriod;
  const current=window.biologyCurrentPeriod||'1';
  const acts=all.filter(a=>String(a.periodo).trim()===String(period));
  const total=acts.filter(a=>a.activa).reduce((s,a)=>s+Number(a.porcentaje||0),0);
  const disponible=Math.max(0,100-total);
  let html='<div class="teacher-note"><b>Periodo '+period+'</b> · Total activo: '+Math.round(total*100)/100+'% · Disponible: '+Math.round(disponible*100)/100+'%'+(String(period)===String(current)?' · 🟢 ACTUAL':'')+' </div>';
  if(String(period)!==String(current)) html+='<div style="margin-top:8px"><button class="secondary" onclick="setBiologyCurrentPeriod(\''+period+'\')">Usar Periodo '+period+' como actual</button></div>';
  html+='<div style="overflow:auto;margin-top:10px"><table class="table"><thead><tr><th>ID</th><th>Actividad</th><th>%</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
  acts.forEach(a=>{
    html+='<tr><td>'+escapeHtml(a.idActividad)+'</td><td><b>'+escapeHtml(a.actividad)+'</b></td><td>'+Number(a.porcentaje)+'%</td><td>'+(a.activa?'🟢 Activa':'⚪ Inactiva')+'</td><td style="white-space:nowrap"><button class="secondary" onclick="editBiologyActivity(\''+escapeHtml(a.idActividad)+'\',\''+escapeHtml(a.actividad).replace(/'/g,"&#39;")+'\','+Number(a.porcentaje)+','+Number(a.periodo||1)+')">✏️ Editar</button> <button class="secondary" onclick="toggleBiologyActivity(\''+escapeHtml(a.idActividad)+'\','+(!a.activa)+')">'+(a.activa?'Desactivar':'Activar')+'</button></td></tr>';
  });
  html+='</tbody></table></div>';
  html+='<div class="box" style="margin-top:12px"><h4 style="margin:0 0 8px">➕ Agregar actividad al Periodo '+period+'</h4><div style="display:grid;grid-template-columns:minmax(220px,1fr) 120px auto;gap:8px;align-items:end"><div><label>Actividad</label><input id="bioNewActivity" placeholder="Nombre de la actividad"></div><div><label>Porcentaje</label><input id="bioNewPct" type="number" min="0.1" max="100" step="0.1" placeholder="%"></div><button class="primary" onclick="addBiologyActivity()">Agregar</button></div><div class="muted" style="margin-top:8px">No se puede superar el 100% del periodo.</div></div>';
  body.innerHTML=html;
}

function setBiologyCurrentPeriod(periodo){
  if(!confirm('¿Cambiar el periodo actual de Biología al Periodo '+periodo+'? Los alumnos verán las actividades activas de ese periodo.'))return;
  activityAdminBiology('setCurrentPeriod',{periodo:periodo});
}

function addBiologyActivity(){
  const nombre=$('bioNewActivity').value.trim();
  const pct=$('bioNewPct').value.trim();
  if(!nombre||!pct){alert('Escribe el nombre y el porcentaje.');return;}
  activityAdminBiology('add',{actividad:nombre,porcentaje:pct,periodo:biologyActivityPeriod});
}

function editBiologyActivity(id,nombre,pct,periodo){
  const nuevoNombre=prompt('Nombre de la actividad:',nombre);
  if(nuevoNombre===null)return;
  const nuevoPct=prompt('Porcentaje:',pct);
  if(nuevoPct===null)return;
  activityAdminBiology('edit',{idActividad:id,actividad:nuevoNombre,porcentaje:nuevoPct});
}

function toggleBiologyActivity(id,activa){
  activityAdminBiology('toggle',{idActividad:id,activa:String(activa)});
}

function activityAdminBiology(op,extra){
  const params=Object.assign({action:'activityAdmin',op:op,pin:teacherPinSession||TEACHER_PIN,materia:'Biología',_:Date.now()},extra||{});
  const u=BIOLOGY_SCRIPT_URL+'?'+Object.keys(params).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');
  jsonpBiology(u,function(d){
    if(!d||!d.ok){alert((d&&d.error)||'No se pudo guardar el cambio.');return;}

    // Actualizar el administrador.
    loadBiologyActivityManager();

    // Recargar TODO desde Google Apps Script para que las actividades nuevas
    // (A9, A10, A11, etc.) aparezcan inmediatamente en la tabla de captura.
    const refreshUrl=BIOLOGY_SCRIPT_URL+
      '?action=all&pin='+encodeURIComponent(teacherPinSession||TEACHER_PIN)+
      '&materia='+encodeURIComponent('Biología')+
      '&_='+Date.now();

    jsonpBiology(refreshUrl,function(fresh){
      if(fresh&&fresh.ok){
        window.teacherData=fresh;
      }
      teacherTable();
    },function(){
      // Si la recarga falla, conservamos los datos actuales y mostramos la tabla.
      teacherTable();
    });

  },function(){alert('No se pudo conectar con Google Sheets.');});
}

function normalizarBioGrupo_(v){return String(v??'').trim().toUpperCase().replace(/\s+/g,' ').replace(/°/g,'º').replace(/\./g,'');}
function normalizarBioNumero_(v){const t=String(v??'').trim().replace(/[^\d]/g,'');return t?String(Number(t)):'';}

function jsonpBiology(url,onSuccess,onError){
  const callbackName='biologyJsonp_'+Date.now()+'_'+Math.floor(Math.random()*100000);
  let finished=false;
  const script=document.createElement('script');
  const cleanup=()=>{if(script.parentNode)script.parentNode.removeChild(script);try{delete window[callbackName]}catch(e){window[callbackName]=undefined}};
  const timer=setTimeout(()=>{if(finished)return;finished=true;cleanup();if(onError)onError(new Error('Tiempo de espera agotado.'));},30000);
  window[callbackName]=data=>{if(finished)return;finished=true;clearTimeout(timer);cleanup();onSuccess(data)};
  script.onerror=()=>{if(finished)return;finished=true;clearTimeout(timer);cleanup();if(onError)onError(new Error('No se pudo cargar Google Apps Script.'))};
  script.src=url+(url.indexOf('?')>=0?'&':'?')+'callback='+encodeURIComponent(callbackName);
  document.head.appendChild(script);
}
