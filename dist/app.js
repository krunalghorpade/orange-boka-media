(() => {
  'use strict';
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('.service-panel')];
  function selectService(name, focus = false) {
    tabs.forEach(tab => {
      const active = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach(panel => { panel.hidden = panel.id !== `panel-${name}`; });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectService(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = tabs[(index + 1) % tabs.length];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (next) { event.preventDefault(); selectService(next.dataset.tab, true); }
    });
  });
  const requestedPlan = new URLSearchParams(window.location.search).get('plan');
  if (tabs.some(tab => tab.dataset.tab === requestedPlan)) selectService(requestedPlan);
  document.querySelectorAll('[data-service]').forEach(link => {
    link.addEventListener('click', () => selectService(link.dataset.service));
  });
  document.querySelectorAll('.package').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) item.parentElement.querySelectorAll('.package').forEach(other => {
        if (other !== item) other.open = false;
      });
    });
  });
  document.getElementById('year').textContent = new Date().getFullYear();

  const cat = document.getElementById('boka');
  const head = document.getElementById('cat-head');
  const track = document.getElementById('cat-track');
  const hero = document.querySelector('.hero');
  if (!cat || !head || !track || !hero) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let maxX = 0, position = 0, target = 0, lastTime = 0, frame = 0, visible = true;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function measure() {
    maxX = Math.max(0, track.clientWidth - cat.clientWidth);
    position = maxX * .72;
    target = position;
    cat.style.transform = `translateX(${position}px)`;
    head.style.transform = '';
  }
  function animate(time) {
    frame = 0;
    if (!visible || document.hidden || reducedMotion.matches) {
      cat.classList.remove('walking');
      return;
    }
    const elapsed = Math.min((time - lastTime) || 16, 50);
    lastTime = time;
    const distance = target - position;
    position += distance * (1 - Math.exp(-elapsed / 230));
    cat.style.transform = `translateX(${position.toFixed(2)}px)`;
    cat.classList.toggle('walking', Math.abs(distance) > 4);
    if (Math.abs(distance) > .2) frame = requestAnimationFrame(animate);
    else cat.classList.remove('walking');
  }
  function follow(event) {
    if (reducedMotion.matches || !visible) return;
    const box = track.getBoundingClientRect();
    const heroBox = hero.getBoundingClientRect();
    const local = clamp((event.clientX - heroBox.left) / heroBox.width, 0, 1);
    target = local * maxX;
    const center = box.left + position + cat.clientWidth * .45;
    const angle = clamp((event.clientX - center) / 25, -13, 13);
    const tilt = clamp((event.clientY - (box.top + box.height * .45)) / 120, -3, 3);
    head.style.transform = `rotate(${angle.toFixed(1)}deg) translateY(${tilt.toFixed(1)}px)`;
    if (!frame) { lastTime = 0; frame = requestAnimationFrame(animate); }
  }
  hero.addEventListener('pointermove', follow, { passive: true });
  hero.addEventListener('pointerdown', follow, { passive: true });
  hero.addEventListener('pointerleave', () => {
    head.style.transform = '';
    cat.classList.remove('walking');
  });
  new ResizeObserver(measure).observe(track);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    cat.style.setProperty('visibility', visible ? 'visible' : 'hidden');
    if (!visible) { cancelAnimationFrame(frame); frame = 0; cat.classList.remove('walking'); }
  }).observe(track);
  reducedMotion.addEventListener('change', () => {
    cancelAnimationFrame(frame); frame = 0;
    cat.classList.remove('walking');
    measure();
  });
  measure();
})();
