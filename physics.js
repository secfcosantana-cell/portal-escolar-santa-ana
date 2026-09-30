const PHYSICS_STUDENT_SCRIPT_URL='https://script.google.com/macros/s/AKfycbxYs9ZEvfvly_HwWNubtrXCPquZ9Eyln4ZQkhU3qwgbuzjNgwyomFFvhrzV0DgiHE52Fw/exec';
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

    jsonpPhysics(u,function(d){
      if(!d.ok){
        msg.textContent=d.error||'Datos incorrectos.';
        return;
      }
      renderPhysicsStudent(d);
    },function(err){
      msg.textContent='No se pudo conectar con Google Sheets de Física.';
    });

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
 * COMUNICACIÓN CON APPS SCRIPT
 * Las consultas de lectura usan JSONP para evitar el problema
 * de CORS/redirección de ContentService desde GitHub Pages.
 ************************************************************/
function jsonpPhysics(url,onSuccess,onError){
  const callbackName='physicsJsonp_'+Date.now()+'_'+Math.floor(Math.random()*100000);
  let finished=false;
  const script=document.createElement('script');

  const cleanup=function(){
    if(script.parentNode) script.parentNode.removeChild(script);
    try{ delete window[callbackName]; }catch(e){ window[callbackName]=undefined; }
  };

  const timer=setTimeout(function(){
    if(finished)return;
    finished=true;
    cleanup();
    if(onError)onError(new Error('Tiempo de espera agotado al consultar Google Apps Script.'));
  },30000);

  window[callbackName]=function(data){
    if(finished)return;
    finished=true;
    clearTimeout(timer);
    cleanup();
    onSuccess(data);
  };

  script.onerror=function(){
    if(finished)return;
    finished=true;
    clearTimeout(timer);
    cleanup();
    if(onError)onError(new Error('No se pudo cargar la respuesta de Google Apps Script.'));
  };

  script.src=url+
    (url.indexOf('?')>=0?'&':'?')+
    'callback='+encodeURIComponent(callbackName);

  document.head.appendChild(script);
}

function postPhysicsSave(url){
  return new Promise(function(resolve,reject){
    const frameName='physicsSaveFrame_'+Date.now();
    const iframe=document.createElement('iframe');
    iframe.name=frameName;
    iframe.style.display='none';
    document.body.appendChild(iframe);

    const form=document.createElement('form');
    form.method='POST';
    form.action=PHYSICS_STUDENT_SCRIPT_URL;
    form.target=frameName;
    form.style.display='none';

    const query=url.split('?')[1]||'';
    const params=new URLSearchParams(query);

    params.forEach(function(value,key){
      const input=document.createElement('input');
      input.type='hidden';
      input.name=key;
      input.value=value;
      form.appendChild(input);
    });

    document.body.appendChild(form);

    let done=false;
    const finish=function(ok){
      if(done)return;
      done=true;
      setTimeout(function(){
        if(form.parentNode)form.parentNode.removeChild(form);
        if(iframe.parentNode)iframe.parentNode.removeChild(iframe);
      },300);
      if(ok)resolve();
      else reject(new Error('No se pudo enviar la calificación a Google Sheets.'));
    };

    iframe.onload=function(){ finish(true); };
    iframe.onerror=function(){ finish(false); };

    form.submit();

    setTimeout(function(){ if(!done) finish(true); },2500);
  });
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

  const callbackName='physicsTeacherCallback_'+Date.now();

  let script=null;
  let timer=null;
  let terminado=false;

  function limpiar(){
    if(timer)clearTimeout(timer);
    if(script && script.parentNode)script.parentNode.removeChild(script);
    try{delete window[callbackName];}catch(e){window[callbackName]=undefined;}
  }

  window[callbackName]=function(d){

    if(terminado)return;
    terminado=true;

    limpiar();

    if(!d || !d.ok){
      document.getElementById('physicsBox').innerHTML=
        '<div class="box msg">No se pudo cargar el panel docente. '+
        escapeHtml((d&&d.error)||'Respuesta inválida de Google Apps Script.')+
        '</div>';
      return;
    }

    window.physicsTeacherData=d;
    renderPhysicsTeacher();
  };

  script=document.createElement('script');

  script.onerror=function(){
    if(terminado)return;
    terminado=true;
    limpiar();

    document.getElementById('physicsBox').innerHTML=
      '<div class="box msg">No se pudo conectar con Google Apps Script.</div>';
  };

  const url=
    PHYSICS_STUDENT_SCRIPT_URL+
    '?action=all'+
    '&pin='+encodeURIComponent(pin)+
    '&materia='+encodeURIComponent('Física')+
    '&grupo='+encodeURIComponent('2º A')+
    '&callback='+encodeURIComponent(callbackName)+
    '&_='+Date.now();

  script.src=url;
  document.head.appendChild(script);

  timer=setTimeout(function(){
    if(terminado)return;
    terminado=true;
    limpiar();

    document.getElementById('physicsBox').innerHTML=
      '<div class="box msg">'+
      'La conexión con Google Apps Script tardó demasiado. '+
      'El servicio respondió correctamente en la prueba directa, por lo que vuelve a intentar actualizar la página.'+
      '</div>';
  },20000);
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
    '<div style="margin:12px 0"><button class="secondary" onclick="openPhysicsActivityManager()">⚙️ Administrar actividades</button></div>'+
    '<div id="physicsActivityManager"></div>'+
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



let physicsActivityPeriod='1';

function openPhysicsActivityManager(){
  const box=document.getElementById('physicsActivityManager');
  if(!box)return;
  box.innerHTML='<div class="box" style="margin:12px 0">'+
    '<div class="eyebrow">ADMINISTRAR ACTIVIDADES · FÍSICA</div>'+
    '<h3 style="margin:4px 0 10px">Actividades y porcentajes</h3>'+
    '<div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap"><div><label>Periodo</label><select id="physicsAdminPeriod" onchange="physicsActivityPeriod=this.value;loadPhysicsActivityManager()"><option value="1">Periodo 1</option><option value="2">Periodo 2</option><option value="3">Periodo 3</option></select></div><button class="secondary" onclick="closePhysicsActivityManager()">Cerrar administración</button></div>'+
    '<div id="physicsAdminBody" style="margin-top:12px">Cargando...</div></div>';
  document.getElementById('physicsAdminPeriod').value=physicsActivityPeriod;
  loadPhysicsActivityManager();
}

function closePhysicsActivityManager(){
  const box=document.getElementById('physicsActivityManager');
  if(box){
    box.innerHTML=
      '<div class="teacher-note" style="margin:12px 0;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap">'+
        '<span><b>Administración de actividades</b><br><span class="muted">Agrega, edita o activa/desactiva actividades sin entrar a Google Sheets.</span></span>'+
        '<button class="secondary" onclick="openPhysicsActivityManager()">⚙️ Administrar actividades</button>'+
      '</div>';
  }
}

function loadPhysicsActivityManager(){
  const body=document.getElementById('physicsAdminBody');
  if(!body)return;
  body.innerHTML='<div class="muted">Cargando actividades...</div>';
  const u=PHYSICS_STUDENT_SCRIPT_URL+'?action=activityAdmin&op=list&pin='+encodeURIComponent(physicsTeacherPinSession||'2468')+'&materia='+encodeURIComponent('Física')+'&_='+Date.now();
  jsonpPhysics(u,function(d){
    if(!d||!d.ok){body.innerHTML='<div class="msg">'+escapeHtml((d&&d.error)||'No se pudo cargar el catálogo.')+'</div>';return;}
    window.physicsCurrentPeriod=String(d.periodoActual||'1');
    renderPhysicsActivityManager(d.actividades||[]);
  },function(){body.innerHTML='<div class="msg">No se pudo conectar con Google Sheets.</div>';});
}

function renderPhysicsActivityManager(all){
  const body=document.getElementById('physicsAdminBody');
  if(!body)return;
  const period=physicsActivityPeriod;
  const current=window.physicsCurrentPeriod||'1';
  const acts=all.filter(a=>String(a.periodo).trim()===String(period));
  const total=acts.filter(a=>a.activa).reduce((s,a)=>s+Number(a.porcentaje||0),0);
  const disponible=Math.max(0,100-total);
  let html='<div class="teacher-note"><b>Periodo '+period+'</b> · Total activo: '+Math.round(total*100)/100+'% · Disponible: '+Math.round(disponible*100)/100+'%'+(String(period)===String(current)?' · 🟢 ACTUAL':'')+' </div>';
  if(String(period)!==String(current)) html+='<div style="margin-top:8px"><button class="secondary" onclick="setPhysicsCurrentPeriod(\''+period+'\')">Usar Periodo '+period+' como actual</button></div>';
  html+='<div style="overflow:auto;margin-top:10px"><table class="table"><thead><tr><th>ID</th><th>Actividad</th><th>%</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
  acts.forEach(a=>{
    html+='<tr><td>'+escapeHtml(a.idActividad)+'</td><td><b>'+escapeHtml(a.actividad)+'</b></td><td>'+Number(a.porcentaje)+'%</td><td>'+(a.activa?'🟢 Activa':'⚪ Inactiva')+'</td><td style="white-space:nowrap"><button class="secondary" onclick="editPhysicsActivity(\''+escapeHtml(a.idActividad)+'\',\''+escapeHtml(a.actividad).replace(/'/g,"&#39;")+'\','+Number(a.porcentaje)+','+Number(a.periodo||1)+')">✏️ Editar</button> <button class="secondary" onclick="togglePhysicsActivity(\''+escapeHtml(a.idActividad)+'\','+(!a.activa)+')">'+(a.activa?'Desactivar':'Activar')+'</button></td></tr>';
  });
  html+='</tbody></table></div>';
  html+='<div class="box" style="margin-top:12px"><h4 style="margin:0 0 8px">➕ Agregar actividad al Periodo '+period+'</h4><div style="display:grid;grid-template-columns:minmax(220px,1fr) 120px auto;gap:8px;align-items:end"><div><label>Actividad</label><input id="physicsNewActivity" placeholder="Nombre de la actividad"></div><div><label>Porcentaje</label><input id="physicsNewPct" type="number" min="0.1" max="100" step="0.1" placeholder="%"></div><button class="primary" onclick="addPhysicsActivity()">Agregar</button></div><div class="muted" style="margin-top:8px">No se puede superar el 100% del periodo.</div></div>';
  body.innerHTML=html;
}

function setPhysicsCurrentPeriod(periodo){
  if(!confirm('¿Cambiar el periodo actual de Física al Periodo '+periodo+'? Los alumnos verán las actividades activas de ese periodo.'))return;
  activityAdminPhysics('setCurrentPeriod',{periodo:periodo});
}

function addPhysicsActivity(){
  const nombre=document.getElementById('physicsNewActivity').value.trim();
  const pct=document.getElementById('physicsNewPct').value.trim();
  if(!nombre||!pct){alert('Escribe el nombre y el porcentaje.');return;}
  activityAdminPhysics('add',{actividad:nombre,porcentaje:pct,periodo:physicsActivityPeriod});
}
function editPhysicsActivity(id,nombre,pct,periodo){
  const nuevoNombre=prompt('Nombre de la actividad:',nombre);
  if(nuevoNombre===null)return;
  const nuevoPct=prompt('Porcentaje:',pct);
  if(nuevoPct===null)return;
  activityAdminPhysics('edit',{idActividad:id,actividad:nuevoNombre,porcentaje:nuevoPct});
}
function togglePhysicsActivity(id,activa){
  activityAdminPhysics('toggle',{idActividad:id,activa:String(activa)});
}
function activityAdminPhysics(op,extra){
  const params=Object.assign({action:'activityAdmin',op:op,pin:physicsTeacherPinSession||'2468',materia:'Física',_:Date.now()},extra||{});
  const u=PHYSICS_STUDENT_SCRIPT_URL+'?'+Object.keys(params).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');

  jsonpPhysics(u,function(d){
    if(!d||!d.ok){
      alert((d&&d.error)||'No se pudo guardar el cambio.');
      return;
    }

    loadPhysicsActivityManager();

    // Recargar la información completa para que las actividades nuevas,
    // porcentajes y cambios de estado aparezcan inmediatamente en la captura.
    const refreshUrl=PHYSICS_STUDENT_SCRIPT_URL+
      '?action=all'+
      '&pin='+encodeURIComponent(physicsTeacherPinSession||'2468')+
      '&materia='+encodeURIComponent('Física')+
      '&grupo='+encodeURIComponent('2º A')+
      '&_='+Date.now();

    jsonpPhysics(refreshUrl,function(fresh){
      if(fresh&&fresh.ok){
        window.physicsTeacherData=fresh;
      }
      renderPhysicsTeacher();
    },function(){
      renderPhysicsTeacher();
    });

  },function(){
    alert('No se pudo conectar con Google Sheets.');
  });
}

/************************************************************
 * GUARDAR CALIFICACIÓN NUMÉRICA
 ************************************************************/

async function savePhysicsGrade(input){

  const value=input.value.trim();
  const lista=input.dataset.lista;
  const idActividad=input.dataset.actividad;
  const asignacion=window.physicsCurrentAssignment;

  if(value!==''){
    const grade=Number(value);
    if(isNaN(grade)||grade<0||grade>10){
      alert('La calificación debe ser un número de 0 a 10.');
      input.focus();
      return;
    }
  }

  input.disabled=true;

  try{

    const u=PHYSICS_STUDENT_SCRIPT_URL+
      '?action=save'+
      '&pin='+encodeURIComponent(physicsTeacherPinSession)+
      '&idAsignacion='+encodeURIComponent(asignacion.idAsignacion)+
      '&lista='+encodeURIComponent(lista)+
      '&idActividad='+encodeURIComponent(idActividad)+
      '&calificacion='+encodeURIComponent(value)+
      '&_='+Date.now();

    await postPhysicsSave(u);

    const evs=asignacion.evaluaciones||[];

    let ev=evs.find(x=>
      String(x.ID_Asignación||'').trim()===String(asignacion.idAsignacion||'').trim() &&
      normalizarPhysicsNumero(x['No. lista']||x.No_Lista)===normalizarPhysicsNumero(lista) &&
      String(x.ID_Actividad||'').trim()===String(idActividad).trim()
    );

    if(ev){
      ev['Calificación']=value===''?'':Number(value);
    }else if(value!==''){
      ev={
        ID_Asignación:asignacion.idAsignacion,
        'No. lista':lista,
        ID_Actividad:idActividad,
        Calificación:Number(value)
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
