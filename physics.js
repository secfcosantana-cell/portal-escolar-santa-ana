const PHYSICS_STUDENT_SCRIPT_URL='https://script.google.com/macros/s/AKfycby3xGQ-PxeVThLd_iUWqAuvc5Vzk6YyZd6VYS8ac2FH6wbLG-eloUbBDijxQhzic72v/exec';
let physicsTeacherPinSession='';

function openPhysics(){
  document.getElementById('home').classList.add('hidden');
  document.getElementById('student').classList.add('hidden');
  document.getElementById('teacher').classList.add('hidden');
  document.getElementById('physics').classList.remove('hidden');

  document.getElementById('physicsBox').innerHTML=
    '<div class="box">'+
    '<div class="eyebrow">FÍSICA · 2.º A</div>'+
    '<h2>Consulta tu evaluación</h2>'+
    '<p>Selecciona tu grupo, número de lista y PIN personal.</p>'+
    '<label>Grupo</label>'+
    '<select id="fgroup"><option value="2.º A">2.º A</option></select>'+
    '<label>Número de lista</label>'+
    '<select id="fnum"></select>'+
    '<label>PIN personal</label>'+
    '<input id="fpin" maxlength="20" inputmode="numeric" autocomplete="off">'+
    '<button class="primary" onclick="physicsStudentLogin()">Consultar evaluación</button>'+
    '<button class="secondary" onclick="physicsTeacherLogin()">🔐 Acceso docente</button>'+
    '<div id="fmsg" class="msg"></div>'+
    '</div>';

  physicsNums();
}

function physicsNums(){
  const el=document.getElementById('fnum');
  if(!el)return;
  el.innerHTML=Array.from({length:27},(_,i)=>
    '<option value="'+(i+1)+'">'+(i+1)+'</option>'
  ).join('');
}

async function physicsStudentLogin(){
  const g=document.getElementById('fgroup').value;
  const n=document.getElementById('fnum').value;
  const p=document.getElementById('fpin').value.trim();
  const msg=document.getElementById('fmsg');

  msg.textContent='Consultando...';

  try{
    const u=PHYSICS_STUDENT_SCRIPT_URL+
      '?action=student'+
      '&grupo='+encodeURIComponent(g)+
      '&lista='+encodeURIComponent(n)+
      '&pin='+encodeURIComponent(p)+
      '&materia=Física'+
      '&_='+Date.now();

    const r=await fetch(u,{cache:'no-store'});
    const d=await r.json();

    if(!d.ok){
      msg.textContent=d.error||'Datos incorrectos.';
      return;
    }

    renderPhysicsStudent(d);

  }catch(e){
    msg.textContent='No se pudo conectar con Google Sheets de Física.';
  }
}

function renderPhysicsStudent(d){
  const p=Number(d.porcentaje)||0;
  const actividades=d.actividades||[];

  document.getElementById('physicsBox').innerHTML=
    '<div class="box">'+
    '<button class="back" onclick="openPhysics()">← Regresar</button>'+
    '<div class="eyebrow">'+escapeHtml(d.alumno.grupo)+' · FÍSICA · EN LÍNEA</div>'+
    '<h2>'+escapeHtml(d.alumno.nombre)+'</h2>'+
    '<div class="muted">Solo lectura · Información actualizada desde Google Sheets</div>'+
    '<div class="studentHead"><b>Avance acumulado</b><div class="percent">'+p+'%</div></div>'+
    '<div class="progress"><div class="bar" style="width:'+Math.min(p,100)+'%"></div></div>'+
    actividades.map(a=>{
      const cal=a.calificacion;
      const evaluada=a.evaluada===true;

      return '<div class="activity">'+
        '<span>⚛️</span>'+
        '<div class="grow">'+
          '<b>'+escapeHtml(a.actividad||'')+'</b>'+
          '<div class="muted">Valor de la actividad: '+Number(a.porcentaje||0)+'%</div>'+
        '</div>'+
        '<span class="activity-grade">'+
          (evaluada
            ? '<b>Calificación: '+Number(cal)+'/10</b>'
            : '<span class="muted">Sin calificar</span>')+
        '</span>'+
      '</div>';
    }).join('')+
    '</div>';
}


/************************************************************
 * ACCESO DOCENTE
 ************************************************************/

async function physicsTeacherLogin(){

  const pin=prompt('PIN docente de Física:');

  if(pin!=='2468'){
    alert('PIN docente incorrecto.');
    return;
  }

  physicsTeacherPinSession=pin;

  document.getElementById('physicsBox').innerHTML=
    '<div class="box">Cargando evaluaciones de Física...</div>';

  try{

    const r=await fetch(
      PHYSICS_STUDENT_SCRIPT_URL+
      '?action=all'+
      '&pin='+encodeURIComponent(pin)+
      '&materia='+encodeURIComponent('Física')+
      '&grupo='+encodeURIComponent('2º A')+
      '&_='+Date.now(),
      {cache:'no-store'}
    );

    const d=await r.json();

    if(!d.ok){
      throw new Error(d.error||'Error');
    }

    window.physicsTeacherData=d;

    renderPhysicsTeacher();

  }catch(e){

    document.getElementById('physicsBox').innerHTML=
      '<div class="box msg">'+
      'No se pudo cargar el panel docente. '+
      escapeHtml(e.message||'')+
      '</div>';
  }
}


/************************************************************
 * PANEL DOCENTE NUMÉRICO
 ************************************************************/

function renderPhysicsTeacher(){

  const d=window.physicsTeacherData;

  const asignacion=(d.asignaciones||[]).find(a=>
    normalizarPhysicsTexto(a.materia)==='fisica' &&
    normalizarPhysicsGrupo(a.grupo)==='2º a'
  ) || (d.asignaciones||[])[0];

  if(!asignacion){

    document.getElementById('physicsBox').innerHTML=
      '<div class="box msg">No se encontró la asignación de Física 2.º A.</div>';

    return;
  }

  window.physicsCurrentAssignment=asignacion;

  const actividades=(asignacion.actividades||[]).filter(a=>
    normalizarPhysicsTexto(a.Activa)!=='no' &&
    normalizarPhysicsTexto(a.Activa)!=='false' &&
    normalizarPhysicsTexto(a.Activa)!=='0'
  );

  const alumnos=asignacion.alumnos||[];
  const evaluaciones=asignacion.evaluaciones||[];

  let html=
    '<div class="box">'+
    '<button class="back" onclick="openPhysics()">← Física</button>'+
    '<div class="eyebrow">FÍSICA · 2.º A · DOCENTE</div>'+
    '<h2>Panel docente</h2>'+
    '<p class="muted">Captura la calificación de cada actividad de 0 a 10. El porcentaje se calcula automáticamente según el valor de cada actividad.</p>'+
    '<div class="teacher-note">'+
      '<b>Ejemplo:</b> una calificación de 8 en una actividad con valor de 15% genera <b>12%</b> acumulado.'+
    '</div>'+
    '<div class="tableWrap">'+
    '<table class="table physics-grade-table">'+
    '<thead><tr>'+
      '<th>Alumno</th>'+
      actividades.map(a=>
        '<th>'+escapeHtml(a.ID_Actividad||'')+
        '<br><span class="muted">'+physicsActivityWeight(a)+'%</span></th>'
      ).join('')+
      '<th>Acumulado</th>'+
    '</tr></thead><tbody>';

  alumnos.forEach(st=>{

    const lista=String(st.lista||'').trim();

    let total=0;

    html+='<tr>'+
      '<td><span class="physics-list">'+escapeHtml(lista)+'.</span> <b>'+escapeHtml(st.nombre||'')+'</b></td>';

    actividades.forEach(a=>{

      const ev=evaluaciones.find(x=>
        String(x.ID_Asignación||'').trim()===String(asignacion.idAsignacion||'').trim() &&
        normalizarPhysicsNumero(x['No. lista']||x.No_Lista)===normalizarPhysicsNumero(lista) &&
        String(x.ID_Actividad||'').trim()===String(a.ID_Actividad||'').trim()
      );

      const raw=ev ? ev['Calificación'] : '';
      const hasGrade=raw!==null && raw!==undefined && String(raw).trim()!=='';
      const grade=hasGrade ? Number(raw) : '';

      if(hasGrade && !isNaN(grade)){
        total+=(grade/10)*physicsActivityWeight(a);
      }

      html+='<td class="physics-grade-cell">'+
        '<input '+
          'class="physics-grade-input" '+
          'type="number" min="0" max="10" step="0.1" '+
          'value="'+(hasGrade?escapeHtml(String(grade)):'')+'" '+
          'data-lista="'+escapeHtml(lista)+'" '+
          'data-actividad="'+escapeHtml(String(a.ID_Actividad||''))+'" '+
          'onchange="savePhysicsGrade(this)" '+
          'title="Calificación de 0 a 10">'+
        '</td>';
    });

    total=Math.round(total*100)/100;

    html+='<td class="total physics-total" id="physics-total-'+escapeHtml(lista)+'">'+
      total+'%</td></tr>';
  });

  html+='</tbody></table></div>'+
    '<p class="muted physics-help">Los cambios se guardan directamente en Google Sheets. Los alumnos solo pueden consultar sus resultados.</p>'+
    '</div>';

  document.getElementById('physicsBox').innerHTML=html;
}


/************************************************************
 * GUARDAR CALIFICACIÓN NUMÉRICA
 ************************************************************/

async function savePhysicsGrade(input){

  const value=input.value.trim();
  const lista=input.dataset.lista;
  const idActividad=input.dataset.actividad;
  const asignacion=window.physicsCurrentAssignment;

  if(value===''){
    alert('Escribe una calificación de 0 a 10.');
    input.focus();
    return;
  }

  const grade=Number(value);

  if(isNaN(grade)||grade<0||grade>10){
    alert('La calificación debe ser un número de 0 a 10.');
    input.focus();
    return;
  }

  input.disabled=true;

  try{

    const u=PHYSICS_STUDENT_SCRIPT_URL+
      '?action=save'+
      '&pin='+encodeURIComponent(physicsTeacherPinSession)+
      '&idAsignacion='+encodeURIComponent(asignacion.idAsignacion)+
      '&lista='+encodeURIComponent(lista)+
      '&idActividad='+encodeURIComponent(idActividad)+
      '&calificacion='+encodeURIComponent(grade)+
      '&_='+Date.now();

    const r=await fetch(u,{cache:'no-store'});
    const d=await r.json();

    if(!d.ok){
      throw new Error(d.error||'No se pudo guardar.');
    }

    const evs=asignacion.evaluaciones||[];

    let ev=evs.find(x=>
      String(x.ID_Asignación||'').trim()===String(asignacion.idAsignacion||'').trim() &&
      normalizarPhysicsNumero(x['No. lista']||x.No_Lista)===normalizarPhysicsNumero(lista) &&
      String(x.ID_Actividad||'').trim()===String(idActividad).trim()
    );

    if(ev){
      ev['Calificación']=grade;
    }else{
      ev={
        ID_Asignación:asignacion.idAsignacion,
        'No. lista':lista,
        ID_Actividad:idActividad,
        Calificación:grade
      };
      evs.push(ev);
      asignacion.evaluaciones=evs;
    }

    actualizarPhysicsTotal(lista);

  }catch(e){

    alert('No se pudo guardar la calificación: '+(e.message||'Error'));

  }finally{

    input.disabled=false;
  }
}


/************************************************************
 * ACTUALIZAR TOTAL DE LA FILA
 ************************************************************/

function actualizarPhysicsTotal(lista){

  const asignacion=window.physicsCurrentAssignment;
  if(!asignacion)return;

  const rowInputs=
    Array.from(document.querySelectorAll(
      '.physics-grade-input[data-lista="'+CSS.escape(String(lista))+'"]'
    ));

  let total=0;

  rowInputs.forEach(input=>{

    const grade=Number(input.value);

    if(isNaN(grade))return;

    const actividad=(asignacion.actividades||[]).find(a=>
      String(a.ID_Actividad||'').trim()===String(input.dataset.actividad||'').trim()
    );

    if(actividad){
      total+=(grade/10)*physicsActivityWeight(actividad);
    }
  });

  total=Math.round(total*100)/100;

  const cell=document.getElementById(
    'physics-total-'+String(lista)
  );

  if(cell){
    cell.textContent=total+'%';
  }
}


/************************************************************
 * UTILIDADES DE FÍSICA
 ************************************************************/

function physicsActivityWeight(a){

  const value=
    a['Valor_%'] ??
    a['Valor %'] ??
    a['Porcentaje'] ??
    a['Valor'] ??
    0;

  const n=Number(String(value).replace(',','.'));

  return isNaN(n)?0:n;
}

function normalizarPhysicsTexto(v){

  return String(v??'')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'');
}

function normalizarPhysicsNumero(v){

  const t=String(v??'')
    .trim()
    .replace(/[^\d]/g,'');

  return t?String(Number(t)):'';
}

function normalizarPhysicsGrupo(v){

  let t=String(v??'')
    .trim()
    .toUpperCase()
    .replace(/\s+/g,' ');

  const m=t.match(/^(\d+)\s*[.º°]*\s*([A-Z])$/i);

  if(m){
    return m[1]+'º '+m[2].toLowerCase();
  }

  return t
    .replace(/°/g,'º')
    .replace(/\./g,'')
    .toLowerCase();
}
