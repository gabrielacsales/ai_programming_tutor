(function() {
"use strict";
let state=null,phase=null;
const $=id=>document.getElementById(id);
const client=window.TutorAuth?.client;
const instruments=window.RESEARCH_INSTRUMENTS;
function showError(message){$("error-box").textContent=String(message);$("error-box").hidden=false}
function clearError(){$("error-box").hidden=true;$("error-box").textContent=""}
async function rpc(name,args={}){const {data,error}=await client.rpc(name,args);if(error)throw new Error(error.message);return data}
function showStatus(){const enrolled=!!state?.enrolled;const withdrawn=!!state?.withdrawn;
$("consent-section").hidden=enrolled||withdrawn;$("registered-section").hidden=!enrolled;
$("instrument-section").hidden=true;
$("status").textContent=withdrawn?"Sua participação foi retirada; não serão registrados novos dados de pesquisa.":enrolled?"Participação ativa. Obrigada por colaborar com a pesquisa.":"Você ainda não participa da pesquisa. É possível usar o IA Tutor normalmente.";
if(!enrolled)return;
$("participant-code").textContent=state.code;
$("pre-flag").textContent=state.pre?"Concluído":"Pendente";
$("post-flag").textContent=state.post?"Concluído":"Pendente";
$("survey-flag").textContent=state.survey?"Concluído":"Pendente";
$("open-pre").disabled=!!state.pre;
$("open-post").disabled=!state.pre||!!state.post;
$("open-survey").disabled=!state.post||!!state.survey;
$("progress-message").textContent=!state.pre?"Comece pelo pré-teste antes de praticar nos exercícios.":!state.post?"Realize os exercícios durante o período combinado. Abra o pós-teste ao terminar sua participação.":!state.survey?"O pós-teste está concluído. Você pode responder ao questionário de percepção.":"Todas as etapas do formulário foram concluídas.";
}
async function refresh(){state=await rpc("research_my_status");showStatus();}
function make(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e}
function addScale(container,question,index) {
 const wrapper=make("div",undefined,"question");
 wrapper.append(make("div","Questão "+(index+1),"skill"),make("strong",question.statement));
 const scale=make("div",undefined,"scale");
 [1,2,3,4,5].forEach(v=>{const label=make("label");const radio=document.createElement("input");radio.type="radio";radio.name=question.id;radio.value=String(v);radio.required=true;label.append(radio,document.createTextNode(" "+v));scale.append(label);});
 wrapper.append(scale,make("small","1 = Discordo totalmente · 5 = Concordo totalmente"));
 container.append(wrapper);
}
function addQuestion(container,q,index) {
 const fieldset=make("fieldset",undefined,"question");fieldset.style.border="0";fieldset.style.margin="0";fieldset.style.padding="20px 0";
 const legend=make("legend","Questão "+(index+1)+": "+q.prompt);legend.style.fontWeight="700";fieldset.append(legend);
 fieldset.append(make("p",q.skill,"skill"));
 if(q.code){const pre=make("pre");const code=make("code",q.code);pre.append(code);fieldset.append(pre);}
 for(const [letter,label] of Object.entries(q.options)){
   const wrap=make("label",undefined,"option"),input=document.createElement("input");
   input.type="radio";input.name=q.id;input.value=letter;input.required=true;
   wrap.append(input,document.createTextNode(letter+". "+label));fieldset.append(wrap);
 }
 container.append(fieldset);
}
function showInstrument(name) {
 phase=name;clearError();
 const title=name==="pre"?"Pré-teste de lógica de programação":name==="post"?"Pós-teste de lógica de programação":"Questionário de percepção";
 $("instrument-tag").textContent=name==="survey"?"PERCEPÇÃO / 08 ITENS":"AVALIAÇÃO / 08 QUESTÕES";
 $("instrument-heading").textContent=title;
 $("instrument-intro").textContent=name==="survey"?"Nas primeiras seis afirmações, indique de 1 (discordo totalmente) a 5 (concordo totalmente). Duas questões abertas são opcionais.":"Responda às oito questões de interpretação de código Python. Sem consultar o tutor ou executar os trechos durante a avaliação. Este instrumento serve à pesquisa e não afeta seu acesso aos módulos.";
 $("questions").replaceChildren();
 if(name==="survey"){
   instruments.survey.forEach((q,i)=>{
     if(i<6) addScale($("questions"),q,i);
     else{
       const wrap=make("div",undefined,"question");
       wrap.append(make("strong",(i+1)+". "+q.statement));
       const t=document.createElement("textarea");t.name=q.id;t.maxLength=1000;t.placeholder="Resposta opcional (não coloque nomes ou dados pessoais).";
       wrap.append(t);$("questions").append(wrap);
     }
   });
 }else instruments[name].forEach((q,i)=>addQuestion($("questions"),q,i));
 $("registered-section").hidden=true;$("instrument-section").hidden=false;
 $("instrument-section").scrollIntoView({behavior:"smooth",block:"start"});
}
async function submitInstrument(evt) {
 evt.preventDefault();clearError();
 const btn=evt.target.querySelector("button[type=submit]");
 const fields=new FormData(evt.target),answers={};
 const questions=phase==="survey"?instruments.survey:instruments[phase];
 for(const q of questions){
   const value=String(fields.get(q.id)||"").trim();
   if(!value&&!(phase==="survey"&&(q.id==="s7"||q.id==="s8"))) {showError("Responda a todos os itens obrigatórios.");return;}
   answers[q.id]=value;
 }
 if(!confirm("Enviar definitivamente? Não será possível reenviar esta etapa."))return;
 btn.disabled=true;
 try{
   if(phase==="survey")await rpc("research_submit_survey",{p_responses:answers});
   else await rpc("research_submit_assessment",{p_phase:phase,p_answers:answers});
   await refresh();
   $("status").textContent="Respostas enviadas e registradas. Obrigada!";
 }catch(e){showError(e.message);}finally{btn.disabled=false;}
}
document.addEventListener("DOMContentLoaded",async()=>{
 try{
   if(!await TutorAuth.requireLogin())return;
   $("consent-form").addEventListener("submit",async evt=>{
     evt.preventDefault();clearError();
     if(!$("adult").checked||!$("consent").checked)return showError("Marque ambas as confirmações para participar.");
     try{await rpc("enroll_in_research",{p_adult:true,p_consent:true,p_version:instruments.version});await refresh();}
     catch(e){showError(e.message)}
   });
   $("open-pre").addEventListener("click",()=>showInstrument("pre"));
   $("open-post").addEventListener("click",()=>showInstrument("post"));
   $("open-survey").addEventListener("click",()=>showInstrument("survey"));
   $("close-instrument").addEventListener("click",()=>{showStatus();});
   $("instrument-form").addEventListener("submit",submitInstrument);
   $("withdraw-button").addEventListener("click",async()=>{
     if(!confirm("Retirar participação e excluir os dados desta área de pesquisa? Essa ação não poderá ser desfeita."))return;
     clearError();try{await rpc("research_withdraw");await refresh()}catch(e){showError(e.message)}
   });
   await refresh();
 }catch(e){$("status").textContent="Não foi possível abrir o formulário.";showError(e.message);}
});
})();