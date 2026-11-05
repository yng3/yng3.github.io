/* YNG3 / ETH portfolio v2. Entirely synthetic, deterministic display; no exchange quotes,
   private trading state, live orders, performance claims, network requests or tracking. */
(() => {
  'use strict';
  const canvas = document.getElementById('marketChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const $ = (id) => document.getElementById(id);
  const rangeButtons = [...document.querySelectorAll('.range-btn')];
  const viewButtons = [...document.querySelectorAll('.view-btn')];
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  // Reproducible synthetic series. Not instrument prices; units are arbitrary.
  function generate() {
    let seed = 794817;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const data = [];
    let last = 53;
    for (let i = 0; i < 72; i++) {
      const drift = i < 23 ? .34 : (i < 42 ? -.21 : .18);
      const change = drift + Math.sin(i * .8) * .48 + (random() - .5) * 4.2;
      const open = last;
      const close = clamp(open + change, 21, 87);
      const high = Math.min(99, Math.max(open, close) + .7 + random() * 3);
      const low = Math.max(1, Math.min(open, close) - .7 - random() * 3);
      const volume = 7 + Math.abs(change) * 5 + random() * 11;
      data.push({open, high, low, close, volume});
      last = close;
    }
    return data;
  }
  const source = generate();
  let range = 48, view = 'candles', selected = range - 1, geometry = null;
  const rows = () => source.slice(-range);
  const fmt = (x) => x.toFixed(2);

  function updateReadout() {
    const data = rows();
    const r = data[selected];
    if (!r) return;
    $('inspect-bar').textContent = `${selected + 1} / ${range}`;
    $('inspect-open').textContent = fmt(r.open);
    $('inspect-high').textContent = fmt(r.high);
    $('inspect-low').textContent = fmt(r.low);
    $('inspect-close').textContent = fmt(r.close);
    $('inspect-volume').textContent = fmt(r.volume);
    $('inspect-prev').disabled = selected <= 0;
    $('inspect-next').disabled = selected >= range - 1;
  }
  function render() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    const w = rect.width, h = rect.height, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const actualW = Math.round(w * dpr), actualH = Math.round(h * dpr);
    if (canvas.width !== actualW) canvas.width = actualW;
    if (canvas.height !== actualH) canvas.height = actualH;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const data = rows();
    const left = 9, right = 9, top = 10, candleHeight = h * .75;
    const plotWidth = w - left - right;
    const spacing = plotWidth / data.length;
    const width = Math.max(2, Math.min(9, spacing * .58));
    const minimum = Math.min(...data.map(r => r.low)) - 4;
    const maximum = Math.max(...data.map(r => r.high)) + 4;
    const posY = value => top + (maximum - value) / (maximum - minimum) * candleHeight;
    const posX = i => left + (i + .5) * spacing;
    geometry = {left, spacing, count:data.length};
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = top + candleHeight * i / 4 + .5;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y);
      ctx.strokeStyle = '#243640'; ctx.stroke();
    }
    for (let i = 1; i < 8; i++) {
      const x = Math.round(w * i / 8) + .5;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h);
      ctx.strokeStyle = '#192831'; ctx.stroke();
    }
    data.forEach((r, i) => {
      const x = posX(i);
      const up = r.close >= r.open;
      ctx.fillStyle = up ? '#78c1a6' : '#c97b77';
      ctx.globalAlpha = .6;
      const volumeHeight = Math.min(h * .13, r.volume * .47);
      ctx.fillRect(x - width / 2, h - volumeHeight - 3, width, volumeHeight);
      ctx.globalAlpha = 1;
    });
    if (view === 'candles') {
      data.forEach((r, i) => {
        const x = posX(i);
        const up = r.close >= r.open;
        ctx.strokeStyle = up ? '#78c1a6' : '#c97b77';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath(); ctx.moveTo(x, posY(r.high)); ctx.lineTo(x, posY(r.low)); ctx.stroke();
        const upper = posY(Math.max(r.open, r.close));
        const lower = posY(Math.min(r.open, r.close));
        ctx.fillRect(x - width / 2, upper, width, Math.max(1.2, lower - upper));
      });
    } else {
      const gradient = ctx.createLinearGradient(0, top, 0, top + candleHeight);
      gradient.addColorStop(0, 'rgba(222,177,113,.24)');
      gradient.addColorStop(1, 'rgba(222,177,113,.004)');
      ctx.beginPath();
      data.forEach((r, i) => {
        if (!i) ctx.moveTo(posX(i), posY(r.close));
        else ctx.lineTo(posX(i), posY(r.close));
      });
      ctx.lineTo(posX(data.length - 1), top + candleHeight);
      ctx.lineTo(posX(0), top + candleHeight);
      ctx.closePath(); ctx.fillStyle = gradient; ctx.fill();
      ctx.beginPath();
      data.forEach((r, i) => {
        if (!i) ctx.moveTo(posX(i), posY(r.close));
        else ctx.lineTo(posX(i), posY(r.close));
      });
      ctx.lineWidth = 1.65; ctx.strokeStyle = '#dbb77c'; ctx.stroke();
    }
    const selectedRow = data[selected];
    if (selectedRow) {
      const x = posX(selected), y = posY(selectedRow.close);
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(233,215,182,.8)';
      ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x, 4); ctx.lineTo(x, h - 1); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#f1d6a6'; ctx.fill();
      ctx.strokeStyle = '#10191f'; ctx.stroke();
    }
    updateReadout();
  }
  function select(index, announce = false) {
    selected = clamp(index, 0, range - 1); render();
    if (announce) $('chart-sr-announcement').textContent = `Synthetic bar ${selected+1} of ${range}; close index ${fmt(rows()[selected].close)}.`;
  }
  function setRange(n) {
    if (![24, 48, 72].includes(n)) return;
    range = n; selected = n - 1;
    rangeButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.range) === n)));
    $('chart-count').textContent = `${n} SYNTHETIC BARS`;
    render();
  }
  function setView(next) {
    if (next !== 'candles' && next !== 'close') return;
    view = next;
    viewButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === next)));
    render();
  }
  function selectPointer(event) {
    if (!geometry) return;
    const bounds = canvas.getBoundingClientRect();
    const position = event.clientX - bounds.left;
    select(Math.floor((position - geometry.left) / geometry.spacing), event.type === 'pointerdown');
  }
  canvas.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse' || event.buttons) selectPointer(event);
  });
  canvas.addEventListener('pointerdown', event => {selectPointer(event); canvas.focus({preventScroll:true});});
  canvas.addEventListener('keydown', event => {
    let next = null;
    if (event.key === 'ArrowLeft') next = selected - 1;
    else if (event.key === 'ArrowRight') next = selected + 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = range - 1;
    if (next !== null) {event.preventDefault(); select(next, true);}
  });
  $('inspect-prev').addEventListener('click', () => select(selected - 1, true));
  $('inspect-next').addEventListener('click', () => select(selected + 1, true));
  rangeButtons.forEach(button => button.addEventListener('click', () => setRange(Number(button.dataset.range))));
  viewButtons.forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  $('export-synthetic').addEventListener('click', () => {
    const header = 'synthetic_bar,open_index,high_index,low_index,close_index,synthetic_volume';
    const csv = [header, ...rows().map((r, index) =>
      [index + 1, fmt(r.open), fmt(r.high), fmt(r.low), fmt(r.close), fmt(r.volume)].join(','))].join('\n') + '\n';
    const url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `eth-synthetic-illustration-${range}-bars.csv`;
    anchor.click();
    // Keep the blob URL until the browser has processed the download event.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  });
  let pending = 0;
  const schedule = () => {if (pending) return; pending = requestAnimationFrame(() => {pending = 0; render();});};
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(canvas);
  else window.addEventListener('resize', schedule, {passive:true});
  setRange(48);
})();
