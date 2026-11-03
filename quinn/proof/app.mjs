import {verifyFixture} from './verify.mjs';
const root=document.getElementById('lab');
const status=document.getElementById('lab-status');
const details=document.getElementById('checks');
let fixture;
function show(text,kind,items=[]) {
  status.textContent=text;
  status.dataset.state=kind;
  details.replaceChildren(...items.map(([label,detail])=>{
    const row=document.createElement('div');row.className='check-row';
    const a=document.createElement('span');a.textContent=label;
    const b=document.createElement('span');b.textContent=detail;
    row.append(a,b);return row;
  }));
}
async function run(tampered=false) {
  if(!fixture)return;
  const sample=structuredClone(fixture);
  if(tampered) sample.result_text='{"sum":14}';
  try {
    const proof=await verifyFixture(sample);
    show('SIGNED CLAIMS CONSISTENT','pass',[
      ['Controller signature','VALID'],['Worker signature','VALID'],
      ['Request and result bindings','MATCH'],['Claimed logical units','WITHIN CEILING'],
      ['Authority to execute','NOT ESTABLISHED'],['External key trust','NOT ESTABLISHED']
    ]);
  } catch (err) {
    show('PROOF REJECTED','fail',[
      ['Verification failure',String(err.message||'INVALID EVIDENCE')],
      ['Execution permission','NOT GRANTED'],['Financial authority','NONE']
    ]);
  }
}
async function init(){
  try{
    const response=await fetch('./fixture.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Fixture unavailable');
    fixture=await response.json();
    await run(false);
  }catch(err){show('DEMO UNAVAILABLE','fail',[['Reason',String(err.message)]]);}
}
document.getElementById('verify-btn').addEventListener('click',()=>run(false));
document.getElementById('tamper-btn').addEventListener('click',()=>run(true));
init();
