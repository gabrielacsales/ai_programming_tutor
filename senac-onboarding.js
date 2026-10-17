(function(){
"use strict";
const client=window.TutorAuth?.client;
const $=id=>document.getElementById(id);
let status=null,info=null,researchStatus=null;
function show(step){document.querySelectorAll(".step").forEach(el=>el.classList.toggle("active",el.id===step));$("onboarding-status").textContent="";}
function error(text){$("onboarding-error").hidden=false;$("onboarding-error").textContent=String(text);}
function clearError(){$("onboarding-error").hidden=true;$("onboarding-error").textContent="";}
async function rpc(name,params={}){const {data,error:err}=await client.rpc(name,params);if(err)throw new Error(err.message);return data;}
function label(tag,value){const el=document.createElement(tag);el.textContent=String(value);return el;}
async function initialize(){
 status=await rpc("senac_my_onboarding");
 if(!status||!status.affiliation){show("identify-step");return;}
 if(status.affiliation==="other"||status.diagnostic_done){show("ready-step");return;}
 try{info=await rpc("research_public_info");}catch(e){console.warn("Pesquisa opcional indisponível:",e.message);info=null;}
 try{researchStatus=await rpc("research_my_status");}catch(e){researchStatus=null;}
 const ready=!!info?.ready;
 $("research-disabled").hidden=ready;
 $("research-consent").hidden=!ready||!!researchStatus?.enrolled||!!researchStatus?.withdrawn;
 $("research-enrolled").hidden=!researchStatus?.enrolled;
 if(ready){
   const m=[["study-institution","institution"],["study-contact","contact"],["study-protocol","protocol"],["study-retention","retention"],["institutional-consent","consent"]];
   for(const [id,key]of m)$(id).textContent=String(info[key]||"");
 }
 show("diagnostic-step");
}
function renderQuestions(){
 const box=$("diagnostic-questions");box.replaceChildren();
 RESEARCH_INSTRUMENTS.pre.forEach((q,i)=>{
   const field=document.createElement("fieldset");field.className="question";field.style.border="none";
   const legend=label("legend",(i+1)+". "+q.prompt);legend.style.fontWeight="700";field.appendChild(legend);
   if(q.code){const pre=document.createElement("pre");pre.appendChild(label("code",q.code));field.appendChild(pre);}
   const all={...q.options,E:"Não sei"};
   Object.entries(all).forEach(([key,val])=>{
     const item=label("label","");item.className="option";
     const input=document.createElement("input");input.type="radio";input.name=q.id;input.value=key;input.required=true;
     item.append(input,document.createTextNode(key+". "+val));field.append(item);
   });
   box.appendChild(field);
 });
}
document.addEventListener("DOMContentLoaded",async()=>{
 $("logout").addEventListener("click",()=>TutorAuth.logout());
 $("identity-form").addEventListener("submit",async e=>{
   e.preventDefault();clearError();const v=new FormData(e.target).get("senac-affiliation");
   if(!["yes","no"].includes(v))return error("Selecione Sim ou Não.");
   try{status=await rpc("senac_set_affiliation",{p_is_senac:v==="yes"});await initialize();}
   catch(err){error(err.message);}
 });
 $("research-enroll").addEventListener("click",async()=>{
   clearError();
   if(!$("research-adult").checked||!$("research-agree").checked)return error("Confirme a maioridade e o consentimento para participar da pesquisa.");
   if(!info?.ready)return error("A coleta da pesquisa está fechada.");
   try{
     await rpc("enroll_in_research",{p_adult:true,p_consent:true,p_version:"tcc-v1"});
     await initialize();
   }catch(err){error(err.message);}
 });
 $("open-diagnostic").addEventListener("click",()=>{clearError();renderQuestions();show("questions-step");});
 $("close-diagnostic").addEventListener("click",()=>show("diagnostic-step"));
 $("diagnostic-form").addEventListener("submit",async e=>{
   e.preventDefault();clearError();
   const answers={};const data=new FormData(e.target);
   for(let i=1;i<=8;i++){const v=data.get("q"+i);if(!v)return error("Responda as oito questões. Pode marcar Não sei.");answers["q"+i]=v;}
   if(!confirm("Enviar o diagnóstico inicial? Não será possível alterar as respostas depois."))return;
   const btn=$("finish-diagnostic");btn.disabled=true;
   try{await rpc("senac_submit_diagnostic",{p_answers:answers});await initialize();}
   catch(err){error(err.message);}finally{btn.disabled=false;}
 });
 try{if(!await TutorAuth.requireLogin())return;await initialize();}
 catch(err){$("onboarding-status").textContent="Não foi possível carregar o início.";error(err.message+". Confira se senac-onboarding.sql foi executado no Supabase.");}
});
})();