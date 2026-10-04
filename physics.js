const PHYSICS_STUDENT_SCRIPT_URL='https://script.google.com/macros/s/AKfycbxYs9ZEvfvly_HwWNubtrXCPquZ9Eyln4ZQkhU3qwgbuzjNgwyomFFvhrzV0DgiHE52Fw/exec';
let physicsTeacherPinSession='';

function openPhysics(){
  hideLanding();
  document.querySelector('.hero-target')?.classList.add('hidden');
  document.querySelector('.hero-footer')?.classList.add('hidden');
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
    /*
     * Guardado real mediante GET + JSONP.
     * El backend de Física responde por doGet(action=save).
     * Antes se enviaba POST a un backend que no tenía doPost(),
     * y el iframe se consideraba "cargado" aunque la calificación
     * no hubiera sido guardada.
     */
    jsonpPhysics(url,function(data){
      if(data && data.ok){
        resolve(data);
      }else{
        reject(new Error((data && data.error)||'Google Sheets no confirmó el guardado.'));
      }
    },function(err){
      reject(err || new Error('No se pudo enviar la calificación a Google Sheets.'));
    });
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
    loadPhysicsTeacherActivities(function(){
      renderPhysicsTeacher();
    });
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
 * CARGAR ACTIVIDADES Y PORCENTAJES REALES DEL CATÁLOGO
 ************************************************************/
function loadPhysicsTeacherActivities(done){
  const finish=typeof done==='function'?done:function(){};
  const u=PHYSICS_STUDENT_SCRIPT_URL+
    '?action=activityAdmin&op=list&pin='+encodeURIComponent(physicsTeacherPinSession||'2468')+
    '&materia='+encodeURIComponent('Física')+
    '&_='+Date.now();

  jsonpPhysics(u,function(d){
    if(d&&d.ok){
      window.physicsCurrentPeriod=String(d.periodoActual||d.PeriodoActual||'1')
        .replace(/^Periodo\s*/i,'').trim()||'1';
      window.physicsActivityCatalog=(d.actividades||[]).map(physicsActivityRecord);
    }else{
      window.physicsActivityCatalog=[];
    }
    finish();
  },function(){
    window.physicsActivityCatalog=[];
    finish();
  });
}

function physicsAssignmentId(asignacion){
  if(!asignacion)return '';
  return String(
    asignacion.idAsignacion ??
    asignacion.ID_Asignacion ??
    asignacion['ID_Asignacion'] ??
    asignacion.ID_Asignación ??
    asignacion['ID_Asignación'] ??
    asignacion.id ??
    asignacion.ID ??
    ''
  ).trim();
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

  let actividades=(asignacion.actividades||[]).filter(a=>
    normalizarPhysicsTexto(a.Activa??a.Activo??a.Estado??a.Estatus)!=='no' &&
    normalizarPhysicsTexto(a.Activa??a.Activo??a.Estado??a.Estatus)!=='false' &&
    normalizarPhysicsTexto(a.Activa??a.Activo??a.Estado??a.Estatus)!=='0'
  );

  /*
   * El catálogo de Administración de actividades es la fuente de verdad
   * para los porcentajes. No se deben usar porcentajes de respaldo,
   * porque pueden no coincidir con los que el docente asignó.
   */
  if(!actividades.length && Array.isArray(window.physicsActivityCatalog)){
    actividades=window.physicsActivityCatalog
      .filter(a=>String(a.periodo||'1')===String(window.physicsCurrentPeriod||'1'))
      .filter(a=>a.activa===true);
  }

  asignacion.actividades=actividades;

  const alumnos=asignacion.alumnos||[];
  const evaluaciones=asignacion.evaluaciones||[];

  let html=
    '<div class="box">'+
    '<div class="teacher-panel-actions">'+
    '<button class="back" onclick="teacherBackToGroups()">← Regresar a mis grupos</button>'+
    '<button class="primary" onclick="descargarTablaCalificacionesExcel(&quot;Física&quot;,&quot;2.º A&quot;)">📥 Descargar Excel</button>'+
    '</div>'+
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
        String(x.ID_Asignación||x.ID_Asignacion||'').trim()===physicsAssignmentId(asignacion) &&
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

function physicsAdminShell(){
  return '<div id="physicsActivityManager" class="box" style="margin:12px 0">'+
    '<div class="eyebrow">ADMINISTRAR ACTIVIDADES · FÍSICA</div>'+
    '<h3 style="margin:4px 0 10px">Actividades y porcentajes</h3>'+
    '<div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap">'+
      '<div><label>Periodo</label><select id="physicsAdminPeriod" onchange="physicsActivityPeriod=this.value;loadPhysicsActivityManager()"><option value="1">Periodo 1</option><option value="2">Periodo 2</option><option value="3">Periodo 3</option></select></div>'+
      '<button class="secondary" onclick="closePhysicsActivityManager()">Cerrar administración</button>'+
    '</div>'+
    '<div id="physicsAdminBody" style="margin-top:12px">Cargando...</div>'+
  '</div>';
}

function openPhysicsActivityManager(){
  const box=document.getElementById('physicsActivityManager');
  if(!box)return;
  box.outerHTML=physicsAdminShell();
  document.getElementById('physicsAdminPeriod').value=physicsActivityPeriod;
  loadPhysicsActivityManager();
}

function closePhysicsActivityManager(){
  const m=document.getElementById('physicsActivityManager');
  if(m)m.outerHTML='<div id="physicsActivityManager" class="teacher-note" style="margin:12px 0;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span><b>Administración de actividades</b><br><span class="muted">Agrega, edita o activa/desactiva actividades sin entrar a Google Sheets.</span></span><button class="secondary" onclick="openPhysicsActivityManager()">⚙️ Administrar actividades</button></div>';
}

function loadPhysicsActivityManager(){
  const body=document.getElementById('physicsAdminBody');
  if(!body)return;
  body.innerHTML='<div class="muted">Cargando actividades...</div>';
  const u=PHYSICS_STUDENT_SCRIPT_URL+
    '?action=activityAdmin&op=list&pin='+encodeURIComponent(physicsTeacherPinSession||'2468')+
    '&materia='+encodeURIComponent('Física')+
    '&_='+Date.now();
  jsonpPhysics(u,function(d){
    if(!d||!d.ok){
      body.innerHTML='<div class="msg">'+escapeHtml((d&&d.error)||'No se pudo cargar el catálogo.')+'</div>';
      return;
    }
    window.physicsCurrentPeriod=String(d.periodoActual||d.PeriodoActual||'1').replace(/^Periodo\s*/i,'').trim();
    renderPhysicsActivityManager(d.actividades||[]);
  },function(){
    body.innerHTML='<div class="msg">No se pudo conectar con Google Sheets.</div>';
  });
}

function physicsActivityRecord(a){
  const rawActiva=a.activa ?? a.Activa ?? a.ACTIVO ?? a.Activo;
  const activa=rawActiva===true || ['si','sí','true','1','activa','activo'].includes(String(rawActiva??'').trim().toLowerCase());
  const rawPeriodo=a.periodo ?? a.Periodo ?? a.PERIODO ?? a.period;
  let periodo=String(rawPeriodo??'1').trim().replace(/^periodo\s*/i,'');
  if(!periodo)periodo='1';
  const rawPct=a.porcentaje ?? a.Porcentaje ?? a['Valor_%'] ?? a['Valor %'] ?? a.Valor ?? 0;
  const pct=Number(String(rawPct??0).replace(',','.'));
  const idActividad =
    String(
      a.idActividad ??
      a.ID_Actividad ??
      a['ID_Actividad'] ??
      a.ID ??
      ''
    ).trim();

  return {
    idActividad:idActividad,
    ID_Actividad:idActividad,
    actividad:String(a.actividad ?? a.Actividad ?? a.Nombre ?? a.nombre ?? '').trim(),
    porcentaje:isNaN(pct)?0:pct,
    periodo:periodo,
    activa:activa
  };
}

function renderPhysicsActivityManager(all){
  const body=document.getElementById('physicsAdminBody');
  if(!body)return;

  const period=String(physicsActivityPeriod);
  const current=String(window.physicsCurrentPeriod||'1').replace(/^Periodo\s*/i,'').trim();
  const normalized=(all||[]).map(physicsActivityRecord);
  const acts=normalized.filter(a=>String(a.periodo)===period);
  const total=acts.filter(a=>a.activa).reduce((s,a)=>s+Number(a.porcentaje||0),0);
  const disponible=Math.max(0,100-total);

  let html='<div class="teacher-note"><b>Periodo '+escapeHtml(period)+'</b> · Total activo: '+
    Math.round(total*100)/100+'% · Disponible: '+Math.round(disponible*100)/100+'%'+
    (period===current?' · 🟢 ACTUAL':'')+' </div>';

  if(period!==current){
    html+='<div style="margin-top:8px"><button class="secondary" onclick="setPhysicsCurrentPeriod(\''+
      period+'\')">Usar Periodo '+period+' como actual</button></div>';
  }

  html+='<div style="overflow:auto;margin-top:10px"><table class="table"><thead><tr>'+
    '<th>ID</th><th>Actividad</th><th>%</th><th>Estado</th><th>Acciones</th>'+
    '</tr></thead><tbody>';

  if(!acts.length){
    html+='<tr><td colspan="5"><span class="muted">No hay actividades registradas en este periodo. Puedes agregar la primera abajo.</span></td></tr>';
  }else{
    acts.forEach(a=>{
      html+='<tr>'+
        '<td>'+escapeHtml(a.idActividad)+'</td>'+
        '<td><b>'+escapeHtml(a.actividad)+'</b></td>'+
        '<td>'+Number(a.porcentaje)+'%</td>'+
        '<td>'+(a.activa?'🟢 Activa':'⚪ Inactiva')+'</td>'+
        '<td style="white-space:nowrap">'+
          '<button class="secondary" onclick="editPhysicsActivity(\''+
            escapeHtml(a.idActividad)+'\',\''+
            escapeHtml(a.actividad).replace(/'/g,"&#39;")+'\','+
            Number(a.porcentaje)+','+Number(a.periodo||1)+')">✏️ Editar</button> '+
          '<button class="secondary" onclick="togglePhysicsActivity(\''+
            escapeHtml(a.idActividad)+'\','+(!a.activa)+')">'+
            (a.activa?'Desactivar':'Activar')+
          '</button>'+
        '</td>'+
      '</tr>';
    });
  }

  html+='</tbody></table></div>';

  html+='<div class="box" style="margin-top:12px">'+
    '<h4 style="margin:0 0 8px">➕ Agregar actividad al Periodo '+escapeHtml(period)+'</h4>'+
    '<div style="display:grid;grid-template-columns:minmax(220px,1fr) 120px auto;gap:8px;align-items:end">'+
      '<div><label>Actividad</label><input id="physicsNewActivity" placeholder="Nombre de la actividad"></div>'+
      '<div><label>Porcentaje</label><input id="physicsNewPct" type="number" min="0.1" max="100" step="0.1" placeholder="%"></div>'+
      '<button class="primary" onclick="addPhysicsActivity()">Agregar</button>'+
    '</div>'+
    '<div class="muted" style="margin-top:8px">No se puede superar el 100% del periodo.</div>'+
  '</div>';

  body.innerHTML=html;
}

function setPhysicsCurrentPeriod(periodo){
  if(!confirm('¿Cambiar el periodo actual de Física al Periodo '+periodo+'? Los alumnos verán las actividades activas de ese periodo.'))return;
  activityAdminPhysics('setCurrentPeriod',{periodo:periodo});
}

function addPhysicsActivity(){
  const nombre=document.getElementById('physicsNewActivity').value.trim();
  const pct=document.getElementById('physicsNewPct').value.trim();
  if(!nombre||!pct){
    alert('Escribe el nombre y el porcentaje.');
    return;
  }
  const n=Number(String(pct).replace(',','.'));
  if(isNaN(n)||n<=0||n>100){
    alert('El porcentaje debe ser un número mayor que 0 y no mayor que 100.');
    return;
  }
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
  const params=Object.assign({
    action:'activityAdmin',
    op:op,
    pin:physicsTeacherPinSession||'2468',
    materia:'Física',
    _:Date.now()
  },extra||{});

  const u=PHYSICS_STUDENT_SCRIPT_URL+'?'+
    Object.keys(params).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');

  jsonpPhysics(u,function(d){
    if(!d||!d.ok){
      alert((d&&d.error)||'No se pudo guardar el cambio.');
      return;
    }

    loadPhysicsActivityManager();

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
      '&idAsignacion='+encodeURIComponent(physicsAssignmentId(asignacion))+
      '&lista='+encodeURIComponent(lista)+
      '&idActividad='+encodeURIComponent(idActividad)+
      '&materia='+encodeURIComponent('Física')+
      '&grupo='+encodeURIComponent('2.º A')+
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
        ID_Asignación:physicsAssignmentId(asignacion),
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
    a.porcentaje ??
    a.Porcentaje ??
    a['Valor_%'] ??
    a['Valor %'] ??
    a.Valor ??
    a['valor_%'] ??
    0;

  const n=Number(String(value??0).replace(',','.'));

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
