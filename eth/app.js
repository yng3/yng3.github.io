/* ETH Kraken Bot public portfolio: local UI state only, no trades or network requests. */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const stages = [
    {tag:'01 / PUBLIC DATA', meta:'INPUT / VALIDATION',title:'Public Kraken Futures data',description:'Validated closed candles provide strategy inputs. The separate credential-free sentinel monitors public markets without order-execution authority.',source:'paper/market_data.py · paper/sentinel.py',tags:['PUBLIC DATA','CANDLE VALIDATION','READ-ONLY SENTINEL']},
    {tag:'02 / DETERMINISTIC STRATEGY',meta:'SIGNAL / EVALUATION',title:'Rule-based signal evaluation',description:'The slow long-only strategy evaluates completed trend indicators, normalized momentum, volatility limits, and volume. It records named entry blockers with indicator values.',source:'paper/strategy.py',tags:['NO LLM TRADE DECISIONS','NAMED BLOCKERS','DAILY CANDLES']},
    {tag:'03 / RISK VALIDATION',meta:'CONTRACT / INVARIANTS',title:'Risk and contract constraints',description:'Risk limits, stale-data protections, order reconciliation, and kill-switch requirements are evaluated separately from entry signals. Historical configurations use different constraints.',source:'paper/risk.py · paper/contract.py',tags:['FAIL-CLOSED SAFEGUARDS','HISTORICAL CONFIGURATIONS','ONE POSITION']},
    {tag:'04 / PAPER EXECUTION',meta:'PAPER / ADAPTER',title:'Gated paper-execution interface',description:'A Kraken CLI adapter boundary is documented for paper operation. Paper control, reference markets, inverse contracts, and isolated research are separate. The webpage cannot execute orders.',source:'paper/kraken_cli.py · paper/runtime.py',tags:['PAPER-ONLY','NO WEBSITE ORDERS','SEPARATE RESEARCH']},
    {tag:'05 / AUDIT RECORDS',meta:'LEDGER / RECONCILIATION',title:'Reconciliation and hash-chained ledger',description:'A documented append-only SQLite hash chain supports integrity checks and replay. Record integrity alone does not establish correct exchange behavior, predictive edge, or profitability.',source:'paper/ledger.py · paper/stages.py · paper/diagnostics.py',tags:['APPEND-ONLY RECORDS','RECONCILIATION','READ-ONLY REPORTING']}
  ];
  const stageButtons = $$('.stage');
  function selectStage(index, focus) {
    const i = ((index % stages.length) + stages.length) % stages.length;
    const stage = stages[i];
    stageButtons.forEach((button, n) => {
      const active = i === n;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    $('#stage-panel').setAttribute('aria-labelledby', stageButtons[i].id);
    $('#stage-tag').textContent = stage.tag;
    $('#stage-meta').textContent = stage.meta;
    $('#stage-heading').textContent = stage.title;
    $('#stage-description').textContent = stage.description;
    $('#stage-source').textContent = stage.source;
    $('#stage-tags').replaceChildren(...stage.tags.map((name) => {
      const tag = document.createElement('span'); tag.textContent = name; return tag;
    }));
    const node = $('#flow-active');
    if (node) node.setAttribute('x', String([43,172,301,430,430][Math.min(i,4)]));
    if (focus) stageButtons[i].focus();
  }
  stageButtons.forEach((button, i) => {
    button.addEventListener('click', () => selectStage(i, false));
    button.addEventListener('keydown', (event) => {
      let index = null;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') index = i + 1;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') index = i - 1;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = stages.length - 1;
      if (index !== null) {event.preventDefault(); selectStage(index, true);}
    });
  });
  const gateLabels=['Daily close above SMA20','SMA20 above SMA50','SMA50 rising','Volatility ratio within range','Normalized momentum above threshold','Positive candle volume'];
  const cases={pass:[true,true,true,true,true,true],trend:[false,false,true,true,true,true],volatility:[true,true,true,false,true,true]};
  const gates=$$('input[data-gate]');
  const presets=$$('.preset');
  function render() {
    const values=gates.map(x => x.checked);
    const passed=values.filter(Boolean).length;
    $('#gate-count').textContent=String(passed).padStart(2,'0');
    $$('#gate-indicators span').forEach((el,i) => el.classList.toggle('is-on',values[i]));
    const all=passed===6;
    const decision=$('#decision');
    decision.textContent=all?'CONDITIONS MET':'NO ENTRY';
    decision.dataset.status=all?'pass':'blocked';
    $('#decision-description').textContent=all?'All six illustrative conditions pass. No order is authorized or executed.':`${6-passed} required condition${6-passed===1?' is':'s are'} not satisfied. No entry signal is produced.`;
    const missing=gateLabels.filter((_,i)=>!values[i]);
    $('#blockers').replaceChildren(...(missing.length?missing:['None in this hypothetical scenario']).map((label) => {const item=document.createElement('li');item.textContent=label;return item;}));
    presets.forEach(button => {const selected=values.every((v,i)=>v===cases[button.dataset.preset][i]);button.setAttribute('aria-pressed',String(selected));});
  }
  function setPreset(name) {
    if (!Object.prototype.hasOwnProperty.call(cases,name)) return;
    gates.forEach((gate,i)=>{gate.checked=cases[name][i];});render();
  }
  presets.forEach(button=>button.addEventListener('click',()=>setPreset(button.dataset.preset)));
  gates.forEach(gate=>gate.addEventListener('change',render));
  selectStage(0,false);setPreset('trend');
})();
