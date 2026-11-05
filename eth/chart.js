/* Deterministic synthetic chart. Never market data, orders, or investment signals. */
(()=>{'use strict';
  const canvas=document.getElementById('marketChart'); if(!canvas)return;
  const ctx=canvas.getContext('2d'); if(!ctx)return;
  const btns=[...document.querySelectorAll('.range-btn')];
  const count=document.getElementById('chart-count');
  let range=48,resizeObserver;
  function candles(n){
    let seed=794817;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const rows=[]; let last=53;
    for(let i=0;i<72;i++){
      const trend=(i<23?.34:(i<42?-.21:.18));
      const change=trend+Math.sin(i*.8)*.48+(rnd()-.5)*4.2;
      const o=last,c=Math.max(21,Math.min(87,o+change));
      const hi=Math.min(99,Math.max(o,c)+.7+rnd()*3),lo=Math.max(1,Math.min(o,c)-.7-rnd()*3);
      const vol=7+Math.abs(change)*5+rnd()*11;
      rows.push({o,c,hi,lo,vol}); last=c;
    }
    return rows.slice(-n);
  }
  function render(){
    const bounds=canvas.getBoundingClientRect(); if(bounds.width<4)return;
    const w=bounds.width,h=Math.max(185,Math.round(bounds.height||230));
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const rows=candles(range),padL=4,padR=6,padT=10,chartH=h*.78,gridW=w-padL-padR;
    ctx.lineWidth=1;
    for(let j=0;j<=4;j++){
      const y=padT+chartH*j/4+.5;ctx.strokeStyle='#25343d';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
    }
    for(let j=1;j<8;j++){
      const x=Math.round(w*j/8)+.5;ctx.strokeStyle='#1a2931';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();
    }
    const spacing=gridW/rows.length,bar=Math.max(2,Math.min(8,spacing*.56));
    const ymin=Math.min(...rows.map(r=>r.lo))-4,ymax=Math.max(...rows.map(r=>r.hi))+4;
    const py=v=>padT+(ymax-v)/(ymax-ymin)*chartH;
    rows.forEach((r,i)=>{
      const x=padL+(i+.5)*spacing,up=r.c>=r.o,c=up?'#78c1a6':'#c97b77';ctx.strokeStyle=c;ctx.fillStyle=c;
      ctx.beginPath();ctx.moveTo(x,py(r.hi));ctx.lineTo(x,py(r.lo));ctx.stroke();
      const y0=py(Math.max(r.o,r.c)),y1=py(Math.min(r.o,r.c));ctx.fillRect(x-bar/2,y0,bar,Math.max(1.2,y1-y0));
      ctx.globalAlpha=.6;const vh=Math.min(h*.13,r.vol*.47);ctx.fillRect(x-bar/2,h-vh-2,bar,vh);ctx.globalAlpha=1;
    });
    // fixed illustrative reference line, not a market quote
    ctx.strokeStyle='#b9a174';ctx.globalAlpha=.6;ctx.setLineDash([3,5]);ctx.beginPath();const mid=py((ymin+ymax)/2);ctx.moveTo(0,mid);ctx.lineTo(w,mid);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
  }
  function setRange(n){range=n;btns.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.range)===n)));count.textContent=`${n} SYNTHETIC BARS`;render()}
  btns.forEach(b=>b.addEventListener('click',()=>setRange(Number(b.dataset.range))));
  if('ResizeObserver'in window){resizeObserver=new ResizeObserver(render);resizeObserver.observe(canvas)} else window.addEventListener('resize',render,{passive:true});
  setRange(48);
})();
