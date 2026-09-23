const PHYSICS_SCRIPT_URL='https://script.google.com/macros/s/AKfycbx-H4rNiEyoLQlmNUQsLyMbjCerDHZ8eOiVZBkyY869k2CR-kP0LOhvxkujkBav8Gab/exec';
let physicsTeacherPinSession='';

function openPhysics(){
  document.getElementById('home').classList.add('hidden');
  document.getElementById('student').classList.add('hidden');
  document.getElementById('teacher').classList.add('hidden');
  document.getElementById('physics').classList.remove('hidden');
  document.getElementById('physicsBox').innerHTML='<div class="box"><div class="eyebrow">FÍSICA · 2.º A</div><h2>Consulta tu evaluación</h2><p>Usa tu número de lista y PIN personal.</p><label>Número de lista</label><select id="fnum"></select><label>PIN personal</label><input id="fpin" maxlength="4" inputmode="numeric" autocomplete="off"><button class="primary" onclick="physicsStudentLogin()">Consultar evaluación</button><button class="secondary" onclick="physicsTeacherLogin()">🔐 Acceso docente</button><div id="fmsg" class="msg"></div></div>';
  physicsNums();
}

function physicsNums(){
  const el=document.getElementById('fnum');
  if(!el)return;
  el.innerHTML=Array.from({length:27},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'</option>').join('');
}

async function physicsStudentLogin(){
  const n=document.getElementById('fnum').value;
  const p=document.getElementById('fpin').value.trim();
  const msg=document.getElementById('fmsg');
  msg.textContent='Consultando...';
  try{
    const u=PHYSICS_SCRIPT_URL+'?action=student&grupo='+encodeURIComponent('2.º A')+'&num='+encodeURIComponent(n)+'&pin='+encodeURIComponent(p)+'&_='+Date.now();
    const r=await fetch(u,{cache:'no-store'});
    const d=await r.json();
    if(!d.ok){msg.textContent=d.error||'Datos incorrectos.';return;}
    renderPhysicsStudent(d);
  }catch(e){
    msg.textContent='No se pudo conectar con Google Sheets de Física.';
  }
}

function renderPhysicsStudent(d){
  const p=Number(d.porcentaje)||0;
  document.getElementById('physicsBox').innerHTML='<div class="box"><button class="back" onclick="openPhysics()">← Regresar</button><div class="eyebrow">'+escapeHtml(d.alumno.grupo)+' · FÍSICA · EN LÍNEA</div><h2>'+escapeHtml(d.alumno.nombre)+'</h2><div class="muted">Solo lectura · Información actualizada desde Google Sheets</div><div class="studentHead"><b>Avance</b><div class="percent">'+p+'%</div></div><div class="progress"><div class="bar" style="width:'+Math.min(p,100)+'%"></div></div>'+d.actividades.map(a=>'<div class="activity"><span>⚛️</span><div class="grow"><b>'+escapeHtml(a.nombre || a.Actividad || a.name || '')+'</b><div class="muted">'+Number(a.porcentaje ?? a.Porcentaje ?? a.weight ?? 0)+'%</div></div><span>'+(a.realizada?'✅':'⬜')+'</span></div>').join('')+'</div>';
}

async function physicsTeacherLogin(){
  const pin=prompt('PIN docente de Física:');
  if(pin!=='2468'){alert('PIN docente incorrecto.');return;}
  physicsTeacherPinSession=pin;
  document.getElementById('physicsBox').innerHTML='<div class="box">Cargando evaluaciones de Física...</div>';
  try{
    const r=await fetch(PHYSICS_SCRIPT_URL+'?action=all&teacherPin='+encodeURIComponent(pin)+'&_='+Date.now(),{cache:'no-store'});
    const d=await r.json();
    if(!d.ok)throw new Error(d.error||'Error');
    window.physicsTeacherData=d;
    renderPhysicsTeacher();
  }catch(e){
    document.getElementById('physicsBox').innerHTML='<div class="box msg">No se pudo conectar con Google Sheets de Física.</div>';
  }
}

function renderPhysicsTeacher(){
  const d=window.physicsTeacherData;
  let html='<div class="box"><button class="back" onclick="openPhysics()">← Física</button><div class="eyebrow">FÍSICA · 2.º A · DOCENTE</div><h2>Panel docente</h2><p class="muted">Marca las actividades realizadas. Los cambios se guardan en Google Sheets.</p><div class="tableWrap"><table class="table"><thead><tr><th>Alumno</th>'+d.actividades.map(a=>'<th>'+escapeHtml(a.ID_Actividad)+'<br>'+Number(a.Porcentaje)+'%</th>').join('')+'<th>Total</th></tr></thead><tbody>';
  d.alumnos.forEach(st=>{
    let total=0;
    html+='<tr><td>'+st.No_Lista+'. <b>'+escapeHtml(st.Alumno)+'</b></td>';
    d.actividades.forEach(a=>{
      const ev=d.evaluaciones.find(x=>String(x.ID_Alumno)===String(st.ID_Alumno)&&String(x.ID_Actividad)===String(a.ID_Actividad));
      const done=ev&&String(ev.Realizada).toUpperCase()==='SI';
      if(done)total+=Number(a.Porcentaje)||0;
      html+='<td><input class="check" type="checkbox" '+(done?'checked':'')+' onchange="togglePhysicsRemote(\''+st.ID_Alumno+'\',\''+a.ID_Actividad+'\',this.checked)"></td>';
    });
    html+='<td class="total">'+total+'%</td></tr>';
  });
  html+='</tbody></table></div></div>';
  document.getElementById('physicsBox').innerHTML=html;
}

async function togglePhysicsRemote(idAlumno,idActividad,checked){
  const box=document.getElementById('physicsBox');
  box.style.opacity='.65';
  try{
    const u=PHYSICS_SCRIPT_URL+'?action=save&teacherPin='+encodeURIComponent(physicsTeacherPinSession)+'&idAlumno='+encodeURIComponent(idAlumno)+'&idActividad='+encodeURIComponent(idActividad)+'&realizada='+(checked?'SI':'NO')+'&_='+Date.now();
    const r=await fetch(u,{cache:'no-store'});
    const d=await r.json();
    if(!d.ok)throw new Error(d.error||'No se guardó');
    const ev=window.physicsTeacherData.evaluaciones.find(x=>String(x.ID_Alumno)===String(idAlumno)&&String(x.ID_Actividad)===String(idActividad));
    if(ev)ev.Realizada=checked?'SI':'NO';
    else window.physicsTeacherData.evaluaciones.push({ID_Alumno:idAlumno,ID_Actividad:idActividad,Realizada:checked?'SI':'NO'});
    renderPhysicsTeacher();
  }catch(e){
    alert('No se pudo guardar en Google Sheets de Física.');
    renderPhysicsTeacher();
  }finally{
    box.style.opacity='1';
  }
}
