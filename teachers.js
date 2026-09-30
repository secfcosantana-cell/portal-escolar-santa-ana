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
  if(id==='francisco'){
    box.innerHTML='<div class="box teacher-profile"><button class="back" onclick="renderTeacherDirectory()">← Docentes</button><div class="teacher-profile-title"><span class="teacher-avatar">'+t.icon+'</span><div><div class="eyebrow">DOCENTE</div><h2>Alfredo</h2><p class="muted">Biología y Física</p></div></div><div class="teacher-groups-title">Selecciona la materia</div><div class="teacher-group-grid"><button class="teacher-group-card" onclick="openFranciscoGroup(\'Biología · 1.º A\')"><span class="group-icon">🧬</span><span><b>Biología</b><small>Grupos 1.º A, 1.º B y 1.º C · Consulta y evaluación</small></span><span>→</span></button><button class="teacher-group-card" onclick="openFranciscoGroup(\'Física · 2.º A\')"><span class="group-icon">⚛️</span><span><b>Física</b><small>Grupo 2.º A · Consulta y evaluación</small></span><span>→</span></button></div></div>';
    return;
  }
  let html='<div class="box teacher-profile"><button class="back" onclick="renderTeacherDirectory()">← Docentes</button><div class="teacher-profile-title"><span class="teacher-avatar">'+t.icon+'</span><div><div class="eyebrow">DOCENTE</div><h2>'+escapeHtml(t.name)+'</h2><p class="muted">'+escapeHtml(t.role)+'</p></div></div><div class="teacher-groups-title">Mis materias y grupos</div><div class="teacher-group-grid">';
  html+=t.groups.map(g=>'<button class="teacher-group-card teacher-group-pending" onclick="teacherPending(\''+escapeHtml(g)+'\')"><span class="group-icon">📚</span><span><b>'+escapeHtml(g)+'</b><small>Lista preparada · conexión pendiente</small></span><span>→</span></button>').join('');
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
  home();
  $('home').classList.add('hidden');
  $('studentDirectory').classList.remove('hidden');
  renderStudentDirectory();
}

function renderStudentDirectory(){
  const box=$('studentDirectoryBox');
  box.innerHTML='<div class="teacher-menu-head"><div><div class="eyebrow">CONSULTA DE ALUMNOS · ACCESO PERSONAL</div><h2>Consulta tus actividades</h2><p class="muted">Selecciona a tu docente.</p></div><div class="teacher-lock">🔒 PIN personal</div></div><div class="teacher-grid student-directory-grid"><button class="teacher-card student-subject-card" onclick="openStudentTeacher(\'francisco\')"><span class="student-subject-image"></span><span class="teacher-avatar">👨‍🏫</span><span class="teacher-name">Alfredo</span><span class="teacher-role">Biología y Física</span><span class="teacher-count">2 materias</span></button></div><div class="student-help"><b>¿Cómo consultar?</b><span>Selecciona Alfredo → elige Biología o Física → captura grupo, número de lista y PIN.</span></div>';
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
  html+='</tbody></table></div><p class="muted">Las calificaciones se capturan de 0 a 10 y se guardan directamente en Google Sheets.</p>';
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
    loadBiologyActivityManager();
    teacherTable();
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
