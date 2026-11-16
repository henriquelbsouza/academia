const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const KEY = "treino-forte-v1";
const uid = () => Math.random().toString(36).slice(2,10);
const defaultData = {
  rest:90,
  workouts:[
    {id:"A",name:"Força geral",exercises:[
      ex("Leg press 45°",3,10,"Quadríceps e glúteos"),
      ex("Supino máquina",3,10,"Peitoral"),
      ex("Mesa flexora",2,12,"Posteriores"),
      ex("Remada baixa",3,12,"Costas"),
      ex("Panturrilha em pé",2,15,"Panturrilhas"),
      ex("Dead bug",2,10,"Por lado · Core","")
    ]},
    {id:"B",name:"Glúteos e estabilidade",exercises:[
      ex("Agachamento goblet",3,10,"Quadríceps e glúteos"),
      ex("Puxada alta",3,12,"Costas"),
      ex("Hip thrust",3,12,"Glúteos"),
      ex("Supino inclinado com halteres",2,10,"Peitoral"),
      ex("Panturrilha sentada",2,15,"Sóleo e panturrilhas"),
      ex("Prancha lateral",2,30,"Segundos por lado · Core","")
    ]}
  ],
  history:[]
};
function ex(name,sets,reps,notes="",unit="kg"){return {id:uid(),name,sets,reps,notes,unit};}
let data = load();
let current = null, startedAt = null, elapsedTimer = null, restTimer = null, restRemaining = 0, restPaused = false, toastTimer = null;
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&Array.isArray(d.workouts)&&Array.isArray(d.history))return d;}catch(e){}return structuredClone(defaultData);}
function save(){localStorage.setItem(KEY,JSON.stringify(data));}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function fmtDate(v){return new Date(v).toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});}
function fmtTime(sec){return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2100);}
function showView(id){$$(".view").forEach(v=>v.classList.toggle("active",v.id===id));$$(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===id));if(id==="homeView")renderHome();if(id==="historyView")renderHistory();if(id==="manageView")renderManage();}
function renderHome(){
  $("#workoutCards").innerHTML=data.workouts.map(w=>`<article class="workout-card"><span class="letter">TREINO ${esc(w.id)}</span><h3>${esc(w.name)}</h3><p>${w.exercises.length} exercícios · ${w.exercises.reduce((a,e)=>a+Number(e.sets),0)} séries</p><div class="card-bottom"><span class="muted small">Full-body</span><button data-start="${esc(w.id)}">Iniciar →</button></div></article>`).join("")||'<div class="empty">Crie seu primeiro treino.</div>';
  const total=data.history.length, volume=data.history.reduce((a,h)=>a+(h.volume||0),0);
  $("#totalWorkouts").textContent=total;$("#totalVolume").textContent=volume.toLocaleString("pt-BR")+" kg";$("#lastWorkout").textContent=total?fmtDate(data.history[0].date):"—";
  $("#recentList").innerHTML=data.history.slice(0,3).map(h=>`<div class="recent-item"><div><strong>${esc(h.name)}</strong><small>${fmtDate(h.date)} · ${h.exerciseCount} exercícios</small></div><strong>${Math.round(h.volume||0).toLocaleString("pt-BR")} kg</strong></div>`).join("")||'<div class="empty">Seus treinos concluídos aparecerão aqui.</div>';
}
// Delegação de clique dos botões Iniciar nos cartões da tela inicial.
$("#workoutCards").addEventListener("click", e => {
  const button = e.target.closest("[data-start]");
  if (button) startWorkout(button.dataset.start);
});

function startWorkout(id){
  const w=data.workouts.find(x=>x.id===id);if(!w)return;
  current={id:w.id,name:w.name,exercises:w.exercises.map(e=>({...e,entries:Array.from({length:e.sets},()=>({weight:"",reps:String(e.reps),done:false}))}))};
  startedAt=Date.now();showView("sessionView");$("#sessionLabel").textContent="TREINO "+w.id;$("#sessionTitle").textContent=w.name;
  clearInterval(elapsedTimer);elapsedTimer=setInterval(()=>{$("#elapsed").textContent=fmtTime(Math.floor((Date.now()-startedAt)/1000));},1000);$("#elapsed").textContent="00:00";renderSession();
}
function renderSession(){
  const total=current.exercises.reduce((a,e)=>a+e.entries.length,0),done=current.exercises.reduce((a,e)=>a+e.entries.filter(s=>s.done).length,0);
  $("#progressText").textContent=`${done} de ${total} séries concluídas`;$("#progressBar").style.width=(total?done/total*100:0)+"%";
  $("#sessionExercises").innerHTML=current.exercises.map((e,ei)=>`<article class="exercise-card"><div class="exercise-top"><div><h3>${esc(e.name)}</h3><p>${esc(e.notes||"")} ${e.unit==="kg"?"· Carga em kg":""}</p></div><button class="mini-btn" data-addset="${ei}">＋ Série</button></div><div class="set-head"><span>SÉRIE</span><span>${e.unit==="kg"?"PESO (KG)":"VALOR"}</span><span>${e.unit==="kg"?"REPS":"REPS / SEG."}</span><span>✓</span></div>${e.entries.map((s,si)=>`<div class="set-row"><span class="set-num">${si+1}</span><input class="set-input" type="number" min="0" step="${e.unit==="kg"?"0.5":"1"}" inputmode="decimal" placeholder="${e.unit==="kg"?"0":"—"}" value="${esc(s.weight)}" data-entry="weight" data-e="${ei}" data-s="${si}"><input class="set-input" type="number" min="0" step="1" inputmode="numeric" placeholder="${e.reps}" value="${esc(s.reps)}" data-entry="reps" data-e="${ei}" data-s="${si}"><button class="set-check ${s.done?"done":""}" data-check="${ei},${si}" aria-label="Concluir série">${s.done?"✓":"○"}</button></div>`).join("")}</article>`).join("");
}
$("#sessionExercises").addEventListener("input",e=>{const t=e.target;if(!t.matches("[data-entry]"))return;const {e:ei,s:si,entry}=t.dataset;current.exercises[+ei].entries[+si][entry]=t.value;});
$("#sessionExercises").addEventListener("click",e=>{
  const c=e.target.closest("[data-check]");if(c){const [ei,si]=c.dataset.check.split(",").map(Number);const set=current.exercises[ei].entries[si];set.done=!set.done;renderSession();if(set.done)startRest();return;}
  const a=e.target.closest("[data-addset]");if(a){const ex=current.exercises[+a.dataset.addset];const last=ex.entries.at(-1)||{weight:"",reps:String(ex.reps),done:false};ex.entries.push({...last,done:false});renderSession();}
});
function startRest(){restRemaining=Number(data.rest||90);restPaused=false;$("#restWidget").classList.remove("hidden");$("#restPause").textContent="Pausar";renderRest();clearInterval(restTimer);restTimer=setInterval(()=>{if(!restPaused){restRemaining--;renderRest();if(restRemaining<=0){clearInterval(restTimer);beep();toast("Descanso concluído!");$("#restWidget").classList.add("hidden");}}},1000);}
function renderRest(){$("#restTime").textContent=fmtTime(Math.max(0,restRemaining));}
function beep(){try{const c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.value=.08;o.start();o.stop(c.currentTime+.18);}catch(e){}}
$("#restPause").onclick=()=>{restPaused=!restPaused;$("#restPause").textContent=restPaused?"Retomar":"Pausar";};
$("#restSkip").onclick=()=>{clearInterval(restTimer);$("#restWidget").classList.add("hidden");};
$("#cancelSession").onclick=()=>{if(confirm("Sair do treino? O registro desta sessão não será salvo.")){clearInterval(elapsedTimer);clearInterval(restTimer);$("#restWidget").classList.add("hidden");showView("homeView");}};
$("#finishWorkout").onclick=()=>{
  if(!current)return;
  const entries=current.exercises.flatMap(e=>e.entries.map(s=>({...s,exercise:e.name,unit:e.unit}))).filter(s=>s.done);
  if(!entries.length){toast("Conclua pelo menos uma série antes de finalizar.");return;}
  const volume=entries.reduce((a,s)=>a+(s.unit==="kg"?(Number(s.weight)||0)*(Number(s.reps)||0):0),0);
  const record={id:uid(),workoutId:current.id,name:current.name,date:new Date().toISOString(),duration:Math.floor((Date.now()-startedAt)/1000),volume,exerciseCount:current.exercises.length,exercises:current.exercises.map(e=>({name:e.name,unit:e.unit,sets:e.entries.filter(s=>s.done).map(s=>({weight:s.weight,reps:s.reps}))}))};
  data.history.unshift(record);save();clearInterval(elapsedTimer);clearInterval(restTimer);$("#restWidget").classList.add("hidden");current=null;toast("Treino salvo com sucesso!");showView("homeView");
};
function renderHistory(){
  $("#historyList").innerHTML=data.history.map(h=>`<article class="history-item"><div><strong>${esc(h.name)}</strong><small>${fmtDate(h.date)} · ${fmtTime(h.duration||0)} · ${h.exerciseCount} exercícios</small></div><div style="text-align:right"><strong>${Math.round(h.volume||0).toLocaleString("pt-BR")} kg</strong><small>volume</small></div></article>`).join("")||'<div class="empty">Nenhum treino registrado ainda.</div>';
  const names=[...new Set(data.history.flatMap(h=>h.exercises.map(e=>e.name)))].sort();const sel=$("#progressExercise"),old=sel.value;sel.innerHTML=names.map(n=>`<option>${esc(n)}</option>`).join("");if(names.includes(old))sel.value=old;drawChart();
}
$("#progressExercise").onchange=drawChart;
function drawChart(){
  const name=$("#progressExercise").value,canvas=$("#progressChart"),ctx=canvas.getContext("2d"),wrap=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;canvas.width=Math.max(280,wrap.width)*dpr;canvas.height=190*dpr;ctx.scale(dpr,dpr);const w=canvas.width/dpr,h=190;ctx.clearRect(0,0,w,h);
  const points=data.history.slice().reverse().map(h=>{const e=h.exercises.find(x=>x.name===name);if(!e)return null;const vals=e.sets.filter(s=>s.weight!==""&&Number(s.weight)>0).map(s=>Number(s.weight));return vals.length?{date:fmtDate(h.date),value:Math.max(...vals)}:null;}).filter(Boolean);
  $("#progressSummary").textContent=points.length?`Maior carga registrada: ${Math.max(...points.map(p=>p.value))} kg`:"Registre séries com carga para visualizar sua evolução.";
  if(!points.length){ctx.fillStyle="#9aa79e";ctx.font="12px sans-serif";ctx.textAlign="center";ctx.fillText("Sem dados de carga para este exercício",w/2,95);return;}
  const pad={l:32,r:12,t:18,b:30},max=Math.max(...points.map(p=>p.value))*1.15,min=Math.min(0,...points.map(p=>p.value)*.8),x=i=>pad.l+(points.length===1?(w-pad.l-pad.r)/2:i*(w-pad.l-pad.r)/(points.length-1)),y=v=>h-pad.b-(v-min)/(max-min||1)*(h-pad.t-pad.b);
  ctx.strokeStyle="#303a33";ctx.lineWidth=1;for(let i=0;i<4;i++){let yy=pad.t+i*(h-pad.t-pad.b)/3;ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();}
  ctx.strokeStyle="#b6f36b";ctx.lineWidth=2.5;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(x(i),y(p.value)):ctx.moveTo(x(i),y(p.value)));ctx.stroke();
  points.forEach((p,i)=>{ctx.fillStyle="#b6f36b";ctx.beginPath();ctx.arc(x(i),y(p.value),4,0,Math.PI*2);ctx.fill();ctx.fillStyle="#f3f6f3";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText(p.value+"kg",x(i),y(p.value)-10);if(i===0||i===points.length-1)ctx.fillText(p.date,x(i),h-8);});
}
function openModal(html){$("#modalContent").innerHTML=html;$("#modal").classList.remove("hidden");}
function closeModal(){$("#modal").classList.add("hidden");}
$("#modal").addEventListener("click",e=>{if(e.target.dataset.close)closeModal();});
function workoutForm(w=null){
  openModal(`<h2>${w?"Editar treino":"Criar treino"}</h2><div class="form-row"><label>Nome do treino</label><input id="wName" value="${esc(w?.name||"")}" placeholder="Ex.: Full-body C"></div><div class="form-row"><label>Identificador curto</label><input id="wId" maxlength="8" value="${esc(w?.id||"")}" placeholder="Ex.: C"></div><div class="modal-actions"><button class="secondary-btn" id="modalCancel">Cancelar</button><button class="primary-btn" id="saveWorkout">Salvar</button></div>`);
  $("#modalCancel").onclick=closeModal;$("#saveWorkout").onclick=()=>{const name=$("#wName").value.trim(),id=$("#wId").value.trim().toUpperCase();if(!name||!id){toast("Preencha nome e identificador.");return;}if(!w&&data.workouts.some(x=>x.id===id)){toast("Esse identificador já existe.");return;}if(w){w.name=name;w.id=id;}else data.workouts.push({id,name,exercises:[]});save();closeModal();renderHome();renderManage();};
}
function exerciseForm(w,e=null){
  openModal(`<h2>${e?"Editar exercício":"Adicionar exercício"}</h2><div class="form-row"><label>Nome do exercício</label><input id="eName" value="${esc(e?.name||"")}" placeholder="Ex.: Cadeira extensora"></div><div class="form-row"><label>Quantidade de séries</label><input id="eSets" type="number" min="1" max="10" value="${e?.sets||3}"></div><div class="form-row"><label>Repetições (ou segundos)</label><input id="eReps" type="number" min="1" value="${e?.reps||10}"></div><div class="form-row"><label>Unidade</label><select id="eUnit"><option value="kg" ${(!e||e.unit==="kg")?"selected":""}>Peso em kg</option><option value="body" ${e?.unit==="body"?"selected":""}>Peso corporal / sem carga</option></select></div><div class="form-row"><label>Observação</label><input id="eNotes" value="${esc(e?.notes||"")}" placeholder="Opcional"></div><div class="modal-actions"><button class="secondary-btn" id="modalCancel">Cancelar</button><button class="primary-btn" id="saveExercise">Salvar</button></div>`);
  $("#modalCancel").onclick=closeModal;$("#saveExercise").onclick=()=>{const name=$("#eName").value.trim(),sets=Math.max(1,Math.min(10,Number($("#eSets").value)||3)),reps=Math.max(1,Number($("#eReps").value)||10),unit=$("#eUnit").value,notes=$("#eNotes").value.trim();if(!name){toast("Informe o nome do exercício.");return;}if(e)Object.assign(e,{name,sets,reps,unit,notes});else w.exercises.push({...ex(name,sets,reps,notes,unit)});save();closeModal();renderManage();renderHome();};
}
function renderManage(){
  $("#manageWorkouts").innerHTML=data.workouts.map(w=>`<section class="manage-workout"><div class="exercise-top"><div><span class="pill">TREINO ${esc(w.id)}</span><h3 style="margin:9px 0 0">${esc(w.name)}</h3></div><div class="manage-actions"><button data-editwork="${esc(w.id)}">Editar</button><button data-delwork="${esc(w.id)}">Excluir</button></div></div>${w.exercises.map(e=>`<div class="manage-ex"><span>${esc(e.name)} <span class="muted">· ${e.sets}×${e.reps}</span></span><div class="manage-actions"><button data-editex="${w.id},${e.id}">Editar</button><button data-delex="${w.id},${e.id}">×</button></div></div>`).join("")}<button class="small-link" data-addex="${esc(w.id)}">＋ Adicionar exercício</button></section>`).join("")||'<div class="empty">Nenhum treino cadastrado.</div>';
}
$("#manageWorkouts").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.editwork){workoutForm(data.workouts.find(w=>w.id===b.dataset.editwork));return;}
  if(b.dataset.delwork){if(confirm("Excluir este treino? O histórico já salvo será mantido.")){data.workouts=data.workouts.filter(w=>w.id!==b.dataset.delwork);save();renderManage();renderHome();}return;}
  if(b.dataset.addex){exerciseForm(data.workouts.find(w=>w.id===b.dataset.addex));return;}
  if(b.dataset.editex){const [wid,eid]=b.dataset.editex.split(","),w=data.workouts.find(w=>w.id===wid);exerciseForm(w,w.exercises.find(x=>x.id===eid));return;}
  if(b.dataset.delex){const [wid,eid]=b.dataset.delex.split(","),w=data.workouts.find(w=>w.id===wid);if(confirm("Remover exercício?")){w.exercises=w.exercises.filter(x=>x.id!==eid);save();renderManage();renderHome();}}
});
$("#addWorkoutBtn").onclick=()=>workoutForm();$("#manageAddWorkout").onclick=()=>workoutForm();
$("#settingsBtn").onclick=()=>showView("settingsView");
$$(".tab").forEach(b=>b.onclick=()=>showView(b.dataset.view));
$$("[data-view='historyView']").forEach(b=>b.onclick=()=>showView("historyView"));
$("#restDefault").value=String(data.rest||90);$("#restDefault").onchange=e=>{data.rest=Number(e.target.value);save();toast("Descanso atualizado.");};
$("#exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`treino-forte-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);toast("Backup exportado.");};
$("#importFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(!Array.isArray(d.workouts)||!Array.isArray(d.history))throw Error();if(confirm("Importar substituirá os dados atuais. Continuar?")){data=d;save();renderHome();toast("Backup importado.");}}catch(err){alert("Arquivo de backup inválido.");}e.target.value="";};
$("#resetBtn").onclick=()=>{if(confirm("Tem certeza? Todos os treinos e históricos locais serão apagados.")){data=structuredClone(defaultData);save();renderHome();renderManage();toast("Dados apagados.");}};
window.addEventListener("resize",()=>{if($("#historyView").classList.contains("active"))drawChart();});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
renderHome();
