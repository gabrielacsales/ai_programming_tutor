(function(){
"use strict";
const client=window.TutorAuth?.client;const el=id=>document.getElementById(id);let participants=[];
const set=(id,value)=>el(id).textContent=String(value);
function alertError(msg){el("admin-error").textContent=String(msg);el("admin-error").hidden=false;}
async function rpc(fn,args={}){const {data,error}=await client.rpc(fn,args);if(error)throw new Error(error.message);return data;}
function make(tag,txt){const n=document.createElement(tag);n.textContent=String(txt??"");return n;}
function render(data) {
 participants=Array.isArray(data?.participants)?data.participants:[];
 el("admin-body").hidden=false;el("admin-error").hidden=true;set("admin-status","Dados atualizados. Horário do servidor: "+new Date(data.exported_at).toLocaleString("pt-BR"));
 const n=participants.length;
 set("admin-total",n);set("admin-pre",participants.filter(p=>p.pre_at).length);
 set("admin-post",participants.filter(p=>p.post_at).length);
 set("admin-paired",participants.filter(p=>p.pre_at&&p.post_at).length);
 set("admin-surveys",participants.filter(p=>p.survey_at).length);
 set("admin-events",participants.reduce((a,p)=>a+Number(p.events||0),0));
 const body=el("participants-table").querySelector("tbody");body.replaceChildren();
 const codes=el("interview-participant");
 codes.replaceChildren();const opt=make("option","Escolha um código");opt.value="";codes.appendChild(opt);
 for(const p of participants){
   const row=document.createElement("tr");
   for(const v of [p.code,p.pre_at?"Sim":"Não",p.post_at?"Sim":"Não",p.survey_at?"Sim":"Não",
      p.events,p.code_submissions,p.hints,p.tutor_questions,p.completed_exercises,p.active_days]) row.appendChild(make("td",v));
   body.appendChild(row);
   const option=make("option",p.code);option.value=p.code;codes.appendChild(option);
 }
}
async function refresh(){el("admin-status").textContent="Consultando banco de dados...";try{
  render(await rpc("research_dashboard"));
}catch(err){
  el("admin-body").hidden=true;el("admin-status").textContent="Acesso não autorizado ou painel indisponível.";
  alertError(err.message+" Confira se sua conta foi inserida em researcher_accounts no SQL Editor.");
}}
function safeCell(value) {
 let str=value===null||value===undefined?"":typeof value==="object"?JSON.stringify(value):String(value);
 // CSV injection (Excel/LibreOffice) — neutraliza fórmulas em células de respostas textuais.
 if(/^[\s]*[=+\-@\t\r]/.test(str))str="'"+str;
 return '"'+str.replace(/"/g,'""')+'"';
}
function downloadCsv(filename,rows) {
 const max=rows.length?Object.keys(rows[0]):["sem_registros"];
 const lines=[max.map(safeCell).join(","),...rows.map(row=>max.map(k=>safeCell(row[k])).join(","))];
 const blob=new Blob(["\ufeff"+lines.join("\r\n")],{type:"text/csv;charset=utf-8;"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
 URL.revokeObjectURL(url);
}
function flatten(rows) {
 return rows.map(item=>{
   const values={...item};
   for(const [k,v] of Object.entries(values)){
     if(v&&typeof v==="object"&&!Array.isArray(v)){
       delete values[k];
       for(const [key,val] of Object.entries(v))values[k+"_"+key]=val;
     }
   }
   return values;
 });
}
async function exportKind(kind) {
 try{
 const rows=kind==="summary"?participants:(await rpc("research_export",{p_kind:kind}));
 const safe=flatten(rows);
 downloadCsv("tcc_"+kind+"_"+new Date().toISOString().slice(0,10)+".csv",safe);
 set("admin-action-message","CSV de "+kind+" preparado, com "+safe.length+" registros.");
 }catch(e){alertError(e.message);}
}
document.addEventListener("DOMContentLoaded",async()=>{
 if(!await TutorAuth.requireLogin())return;
 el("reload-admin").addEventListener("click",refresh);
 document.querySelectorAll("[data-export]").forEach(b=>b.addEventListener("click",()=>exportKind(b.dataset.export)));
 el("interview-form").addEventListener("submit",async e=>{
   e.preventDefault();el("admin-error").hidden=true;
   const btn=e.target.querySelector("button[type=submit]");btn.disabled=true;
   try{await rpc("research_save_interview",{p_code:el("interview-participant").value,
      p_theme:el("interview-theme").value,p_excerpt:el("interview-excerpt").value.trim()});
      el("interview-excerpt").value="";set("admin-action-message","Trecho codificado salvo.");
   }catch(err){alertError(err.message);}finally{btn.disabled=false;}
 });
 await refresh();
});
})();