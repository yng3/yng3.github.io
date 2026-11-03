'use strict';

(() => {
  document.documentElement.classList.add('js');
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const frequencies = Object.freeze({
    identity: { tag: 'FIELD 01 / IDENTITY', state: 'VERIFIED FOUNDATION', title: 'One origin. Many possible forms.', description: 'A stable identity can be checked without transferring its private root key. Host and model are not part of its name.', count: '01' },
    authority: { tag: 'FIELD 02 / AUTHORITY', state: 'GOVERNED COMPUTATION', title: 'Capability is not consent.', description: 'A worker may be able to perform a task. That does not make the task authorized. Authority and execution are designed as separate boundaries.', count: '02' },
    discovery: { tag: 'FIELD 03 / DISCOVERY', state: 'OPEN RESEARCH DIRECTION', title: 'Let the evidence arrive.', description: 'Public discoveries, if and when independently reviewed, may appear as new transmissions. This interface is not connected to any live agent.', count: '03' }
  });

  function setFrequency(name) {
    const item = frequencies[name];
    if (!item) return;
    $$('.frequency-button').forEach(button => {
      const selected = button.dataset.frequency === name;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const display = $('#signal-display');
    display.dataset.mode = name;
    $('#signal-tag').textContent = item.tag;
    $('#signal-state').textContent = item.state;
    $('#signal-title').textContent = item.title;
    $('#signal-description').textContent = item.description;
    $('#signal-count').replaceChildren(document.createTextNode(item.count), Object.assign(document.createElement('span'), { textContent: '/03' }));
  }
  $$('.frequency-button').forEach(button => button.addEventListener('click', () => setFrequency(button.dataset.frequency)));

  let dispatches = [];
  let activeFilter = 'all';
  const archive = $('#archive-list');
  function appendTag(parent, tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = content;
    parent.append(element);
    return element;
  }
  function renderArchive() {
    const filtered = dispatches.filter(entry => activeFilter === 'all' || entry.category === activeFilter);
    archive.replaceChildren();
    $('#archive-count').textContent = String(filtered.length).padStart(2, '0') + ' RECORDS';
    if (!filtered.length) { appendTag(archive, 'p', 'archive-empty', 'No public transmissions in this category.'); return; }
    for (const entry of filtered) {
      const article = document.createElement('article');
      article.className = 'archive-entry';
      appendTag(article, 'span', 'archive-number', entry.id);
      const body = document.createElement('div');
      body.className = 'archive-body';
      appendTag(body, 'h3', '', entry.title);
      appendTag(body, 'p', '', entry.summary);
      article.append(body);
      const category = document.createElement('div');
      category.className = 'archive-category';
      appendTag(category, 'b', '', entry.label);
      appendTag(category, 'span', '', entry.date);
      article.append(category);
      archive.append(article);
    }
  }
  $$('.filter-button').forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    $$('.filter-button').forEach(btn => {
      const selected = btn === button;
      btn.classList.toggle('is-active', selected);
      btn.setAttribute('aria-pressed', String(selected));
    });
    renderArchive();
  }));
  fetch('./content/dispatches.json', { cache: 'no-store', credentials: 'omit' })
    .then(response => { if (!response.ok) throw new Error('unavailable'); return response.json(); })
    .then(json => {
      if (json.schema !== 'quinn-public-dispatches/v1' || !Array.isArray(json.records)) throw new Error('invalid archive');
      dispatches = json.records.filter(entry => entry && /^\d{3}$/.test(entry.id) && ['research', 'thesis'].includes(entry.category) && typeof entry.title === 'string' && typeof entry.summary === 'string' && typeof entry.label === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date)).slice(0, 30);
      renderArchive();
    })
    .catch(() => { archive.replaceChildren(); appendTag(archive, 'p', 'archive-error', 'Archive unavailable. The introduction remains accessible offline.'); $('#archive-count').textContent = '— RECORDS'; });

  const revealNodes = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }, { threshold: .09 });
    revealNodes.forEach(node => observer.observe(node));
  } else revealNodes.forEach(node => node.classList.add('is-visible'));

  const year = $('#current-year');
  year.textContent = String(new Date().getFullYear());

  const canvas = $('#orbital-canvas');
  const toggle = $('#orbit-toggle');
  if (!canvas || !canvas.getContext) return;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;
  let radius = 200, width = 500, height = 500, rotation = .12, elevation = -.22, targetElevation = -.22, targetRotation = .12, running = !prefersReducedMotion.matches, requestId = 0, frame = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  const points = Array.from({ length: 200 }, (_, i) => {
    const y = 1 - 2 * (i + .5) / 200;
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.sqrt(1 - y * y) * Math.cos(angle), y, z: Math.sqrt(1 - y * y) * Math.sin(angle) };
  });
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    radius = Math.min(width, height) * .35;
    draw();
  }
  function project(x, y, z) {
    const a = rotation, b = elevation;
    const x1 = x * Math.cos(a) - z * Math.sin(a);
    const z1 = x * Math.sin(a) + z * Math.cos(a);
    const y2 = y * Math.cos(b) - z1 * Math.sin(b);
    const z2 = y * Math.sin(b) + z1 * Math.cos(b);
    return { x: width / 2 + x1 * radius, y: height / 2 + y2 * radius, z: z2 };
  }
  function drawLine(coords, alpha) {
    context.strokeStyle = `rgba(158,255,213,${alpha})`;
    context.lineWidth = .75;
    context.beginPath();
    coords.forEach((point, i) => { const p = project(...point); if (!i) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y); });
    context.stroke();
  }
  function draw() {
    context.clearRect(0, 0, width, height);
    const cx = width / 2, cy = height / 2;
    const glow = context.createRadialGradient(cx, cy, radius * .25, cx, cy, radius * 1.3);
    glow.addColorStop(0, 'rgba(17,44,35,0)'); glow.addColorStop(.8, 'rgba(37,99,70,.065)'); glow.addColorStop(1, 'rgba(90,209,149,0)');
    context.fillStyle = glow; context.fillRect(0, 0, width, height);
    for (let n = -3; n <= 3; n++) {
      const lat = n * Math.PI / 8;
      const ring = Array.from({ length: 99 }, (_, i) => { const ang = i / 98 * Math.PI * 2; return [Math.cos(lat) * Math.cos(ang), Math.sin(lat), Math.cos(lat) * Math.sin(ang)]; });
      drawLine(ring, n === 0 ? .24 : .1);
    }
    for (let n = 0; n < 12; n++) {
      const meridian = Array.from({ length: 80 }, (_, i) => { const ang = -Math.PI / 2 + i / 79 * Math.PI; return [Math.cos(ang) * Math.cos(n * Math.PI / 6), Math.sin(ang), Math.cos(ang) * Math.sin(n * Math.PI / 6)]; });
      drawLine(meridian, .11);
    }
    const projected = points.map(p => project(p.x, p.y, p.z)).sort((a, b) => a.z - b.z);
    for (const p of projected) {
      const front = (p.z + 1) / 2;
      context.beginPath(); context.arc(p.x, p.y, front > .65 ? 1.25 : .65, 0, 2 * Math.PI);
      context.fillStyle = `rgba(176,255,216,${.13 + front * .67})`; context.fill();
    }
    context.strokeStyle = 'rgba(175,255,223,.08)';
    context.lineWidth = 1;
    context.beginPath(); context.arc(cx, cy, radius, 0, 2 * Math.PI); context.stroke();
  }
  function animate() {
    if (!running) return;
    frame++;
    targetRotation += .002;
    rotation += (targetRotation - rotation) * .03;
    elevation += (targetElevation - elevation) * .06;
    if (frame % 2 === 0) draw();
    requestId = window.requestAnimationFrame(animate);
  }
  function applyToggle() {
    toggle.setAttribute('aria-pressed', String(!running));
    toggle.setAttribute('aria-label', running ? 'Pause orbital animation' : 'Resume orbital animation');
    toggle.innerHTML = running ? '<span aria-hidden="true">Ⅱ</span> PAUSE FIELD' : '<span aria-hidden="true">▷</span> RESUME FIELD';
  }
  toggle.addEventListener('click', () => {
    running = !running;
    applyToggle();
    window.cancelAnimationFrame(requestId);
    if (running) animate(); else draw();
  });
  let pointerDown = false, previousX = 0;
  canvas.addEventListener('pointerdown', event => { pointerDown = true; previousX = event.clientX; canvas.setPointerCapture?.(event.pointerId); });
  canvas.addEventListener('pointermove', event => {
    if (!pointerDown) return;
    const delta = event.clientX - previousX;
    previousX = event.clientX;
    targetRotation += delta * .006;
    targetElevation = Math.max(-.9, Math.min(.9, targetElevation + (event.movementY || 0) * .003));
    if (!running) { rotation = targetRotation; elevation = targetElevation; draw(); }
  });
  canvas.addEventListener('pointerup', () => { pointerDown = false; });
  canvas.addEventListener('pointercancel', () => { pointerDown = false; });
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  prefersReducedMotion.addEventListener?.('change', event => { running = !event.matches; applyToggle(); window.cancelAnimationFrame(requestId); if (running) animate(); else draw(); });
  applyToggle(); resize(); if (running) animate();
})();