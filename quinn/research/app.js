/* Public synthetic research instrument. Browser-only; no QUINN runtime calls. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const checks = $('checks');
  const chart = $('chart');
  const ctx = chart.getContext('2d');
  const range = $('timeline');
  const buttons = {run:$('run-checks'),alter:$('tamper'),restore:$('restore')};
  let source = null, modified = null, raw = '', catalog = null, position = 200;
  const encoder = new TextEncoder();
  const format = value => Number(value).toFixed(4);
  const fail = (test, condition) => ({test, pass:Boolean(condition)});
  function addCheck(label, state) {
    const line = document.createElement('div');
    line.className = `check ${state === 'pass' ? 'pass' : state === 'fail' ? 'fail' : 'loading'}`;
    const icon = document.createElement('i'); icon.setAttribute('aria-hidden', 'true');
    const title = document.createElement('span'); title.textContent = label;
    line.append(icon, title); checks.append(line);
  }
  function status(results, invalid = false) {
    checks.replaceChildren();
    results.forEach(result => addCheck(`${result.pass ? 'PASS' : 'FAIL'} / ${result.test}`, result.pass ? 'pass' : 'fail'));
    const all = results.every(result => result.pass) && !invalid;
    $('chart-mode').textContent = all ? 'LOCAL CHECKS / PASSED' : 'LOCAL CHECKS / REJECTED';
    $('verdict').textContent = all
      ? 'Mathematical self-consistency confirmed for this synthetic example. Not a scientific validation of QUINN.'
      : 'One or more checks rejected the record. The data cannot be trusted as the unchanged published example.';
    $('verdict').style.color = all ? '#b7decb' : '#edb4a0';
  }
  const digest = async data => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(data))), v => v.toString(16).padStart(2,'0')).join('');
  function rkStep(x, v, h, coeffs, force) {
    const d=(px,pv)=>[pv,coeffs[0]*px+coeffs[1]*pv+coeffs[2]*force];
    const a=d(x,v), b=d(x+h*a[0]/2,v+h*a[1]/2),c=d(x+h*b[0]/2,v+h*b[1]/2),e=d(x+h*c[0],v+h*c[1]);
    return [x+h*(a[0]+2*b[0]+2*c[0]+e[0])/6,v+h*(a[1]+2*b[1]+2*c[1]+e[1])/6];
  }
  function independentlyReproduce(model, count) {
    const {reference_parameters:p,candidate_coefficients:q,initial_conditions:i,timestep_seconds:h}=model;
    const ref=[-p.stiffness_N_m/p.mass_kg,-p.damping_Ns_m/p.mass_kg,1/p.mass_kg];
    const cand=[q.x_coefficient_s2,q.v_coefficient_s,q.force_coefficient_kg_inverse];
    const alpha=p.damping_Ns_m/(2*p.mass_kg), freq=Math.sqrt(p.stiffness_N_m/p.mass_kg-alpha**2);
    const resting=i.constant_force_N/p.stiffness_N_m, A=i.x_m-resting, B=(i.v_m_s+alpha*A)/freq;
    const solution=t=>resting+Math.exp(-alpha*t)*(A*Math.cos(freq*t)+B*Math.sin(freq*t));
    let r=[i.x_m,i.v_m_s], c=[i.x_m,i.v_m_s];
    const arr=[];
    for(let j=0;j<count;j++){
      const t=j*h;arr.push([t,r[0],solution(t),c[0],c[0]-r[0]]);
      r=rkStep(...r,h,ref,i.constant_force_N);
      c=rkStep(...c,h,cand,i.constant_force_N);
    }
    return arr;
  }
  function verifyStructure(record) {
    if(record?.schema!=='quinn-public-synthetic-oscillator/v1'||record?.id!=='synthetic-oscillator-001')throw Error('Unrecognized record schema');
    if(record.provenance?.private_runtime_connected!==false||record.provenance?.external_replication!==false||record.provenance?.independent_audit!==false)throw Error('Provenance labels inconsistent');
    const rows=record.samples?.rows;
    if(!Array.isArray(rows)||rows.length!==401||record.model?.integration!=='RK4'||record.model?.total_duration_seconds!==12||record.model?.timestep_seconds!==.03)throw Error('Unexpected parameters or rows');
    const p=record.model.reference_parameters;
    if(p.mass_kg!==2||p.stiffness_N_m!==5||p.damping_Ns_m!==.6)throw Error('Unexpected reference parameters');
    if(rows.some(row=>!Array.isArray(row)||row.length!==5||row.some(v=>!Number.isFinite(v))))throw Error('Malformed sample values');
    return rows;
  }
  function inspect(record, expected) {
    const rows=verifyStructure(record); const calculated=independentlyReproduce(record.model,rows.length);
    let maxDifference=0,maxRefError=0,rmseSquare=0;
    for(let j=0;j<rows.length;j++){
      const sample=rows[j], independent=calculated[j];
      for(let k=0;k<5;k++)maxDifference=Math.max(maxDifference,Math.abs(sample[k]-independent[k]));
      maxRefError=Math.max(maxRefError,Math.abs(sample[1]-sample[2]));
      rmseSquare+=(sample[3]-sample[1])**2;
    }
    const measuredRMSE=Math.sqrt(rmseSquare/rows.length);
    const claimedRMSE=record.checks?.rmse_candidate_vs_reference_m;
    const result={recompute:maxDifference<5e-10,analytic:maxRefError<2e-6,metric:Math.abs(measuredRMSE-claimedRMSE)<5e-10,rmse:measuredRMSE,rows,expected};
    return result;
  }
  async function run() {
    if(!source||!catalog)return;
    const working=modified||source;
    const bytes=modified?JSON.stringify(working):raw;
    const verified=await digest(bytes);
    let findings=[];
    findings.push(fail('SHA-256 matches public catalog',verified===catalog.records[0].sha256));
    try {
      const result=inspect(working);
      findings.push(fail('401 finite samples, expected schema',true));
      findings.push(fail('RK4 replay matches each recorded sample',result.recompute));
      findings.push(fail('Reference agrees with analytic solution',result.analytic));
      findings.push(fail('Full-window metric recomputed',result.metric));
      $('rmse').textContent=`${result.rmse.toFixed(6)} m`;
    } catch (error) {
      findings.push(fail(`Structure rejected: ${error.message}`,false));$('rmse').textContent='REJECTED';
    }
    status(findings);
    draw();updateReadout();
  }
  function updateReadout() {
    const row=(modified||source)?.samples?.rows?.[position];
    if(!row)return;
    $('time-readout').textContent=`${row[0].toFixed(2)} S`;
    $('metric-reference').textContent=format(row[1]);
    $('metric-candidate').textContent=format(row[3]);
    $('metric-residual').textContent=(row[4]>=0?'+':'')+format(row[4]);
  }
  function draw() {
    if(!ctx)return;
    const bounds=chart.getBoundingClientRect();const width=Math.max(1,Math.round(bounds.width)),height=Math.max(1,Math.round(bounds.height)),dpr=Math.min(devicePixelRatio||1,2);
    chart.width=Math.round(width*dpr);chart.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,width,height);
    const pad={left:47,right:12,top:19,bottom:32}, cw=width-pad.left-pad.right,ch=height-pad.top-pad.bottom;
    const rows=(modified||source)?.samples?.rows;
    const ymin=-.85,ymax=.9;
    const px=t=>pad.left+cw*t/12,py=v=>pad.top+ch*(ymax-v)/(ymax-ymin);
    ctx.font='10px Consolas,monospace';ctx.textBaseline='middle';
    for(let value=-.8;value<=.81;value+=.4){let y=py(value);ctx.strokeStyle='rgba(152,185,203,.18)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(width-pad.right,y);ctx.stroke();ctx.fillStyle='#8195a6';ctx.fillText(value.toFixed(1),6,y);}
    for(let t=0;t<=12;t+=3){const x=px(t);ctx.strokeStyle='rgba(152,185,203,.1)';ctx.beginPath();ctx.moveTo(x,pad.top);ctx.lineTo(x,height-pad.bottom);ctx.stroke();ctx.fillStyle='#8195a6';ctx.fillText(`${t}s`,x-7,height-15);}
    if(!rows)return;
    const drawSeries=(index,color,stroke=1.7,dashes=[])=>{ctx.strokeStyle=color;ctx.lineWidth=stroke;ctx.setLineDash(dashes);ctx.beginPath();rows.forEach((r,j)=>{const x=px(r[0]),y=py(r[index]);if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();ctx.setLineDash([]);};
    drawSeries(2,'#e0ebe3',1,[3,5]);drawSeries(3,'#f0b09c',2.1);drawSeries(1,'#a9e3d0',2.3);
    const r=rows[position], x=px(r[0]);ctx.strokeStyle='#a7b5c8';ctx.setLineDash([3,5]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,pad.top);ctx.lineTo(x,height-pad.bottom);ctx.stroke();ctx.setLineDash([]);
    for(const [idx,color] of [[1,'#afe3d2'],[3,'#f0b09c']]){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,py(r[idx]),4.7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#0d1621';ctx.lineWidth=2;ctx.stroke();}
  }
  range.addEventListener('input',()=>{position=Number(range.value);updateReadout();draw();});
  buttons.run.addEventListener('click',()=>run().catch(e=>{checks.replaceChildren();addCheck(e.message,'fail');}));
  buttons.alter.addEventListener('click',()=>{modified=JSON.parse(JSON.stringify(source));modified.samples.rows[160][3]+=0.12;modified.samples.rows[160][4]+=0.12;run();});
  buttons.restore.addEventListener('click',()=>{modified=null;run();});
  if('ResizeObserver' in window)new ResizeObserver(draw).observe(chart);else window.addEventListener('resize',draw,{passive:true});
  (async()=>{
    try{
      const catalogResponse=await fetch('./catalog.json',{credentials:'omit',cache:'no-store'});
      if(!catalogResponse.ok)throw Error('Catalog unavailable');catalog=await catalogResponse.json();
      if(catalog.schema!=='quinn-public-research-catalog/v1'||catalog.records?.length!==1||!/^([0-9a-f]{64})$/.test(catalog.records[0].sha256)||catalog.records[0].path!=='./data/synthetic-oscillator-001.json')throw Error('Catalog rejected');
      const artifactResponse=await fetch(catalog.records[0].path,{credentials:'omit',cache:'no-store'});
      if(!artifactResponse.ok)throw Error('Research artifact unavailable');
      raw=await artifactResponse.text();source=JSON.parse(raw);
      $('checksum').textContent=catalog.records[0].sha256;
      range.disabled=false;Object.values(buttons).forEach(b=>b.disabled=false);
      await run();
    }catch(error){checks.replaceChildren();addCheck(`RECORD UNAVAILABLE / ${error.message}`,'fail');$('verdict').textContent='The public dataset could not be loaded. The methodology and downloadable links remain accessible. This does not imply a verified result.';$('chart-mode').textContent='OFFLINE / NO ARTIFACT';}
  })();
})();
