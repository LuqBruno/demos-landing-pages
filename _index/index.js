/**
 * Palco das demonstrações: leque 3D sincronizado com o seletor.
 * - Ponteiro/foco em uma demo traz a tela correspondente para frente.
 * - Sem interação, alterna sozinho a cada 4,5 s (pausa fora da tela, aba oculta e movimento reduzido).
 * - Inclinação sutil do palco seguindo o ponteiro (apenas ponteiro fino).
 * Tudo é decorativo: os links continuam sendo a única forma de navegar.
 */
(() => {
  const screens = [...document.querySelectorAll('[data-screen]')];
  const phones = [...document.querySelectorAll('[data-phone]')];
  const demos = [...document.querySelectorAll('[data-demo]')];
  const rig = document.querySelector('[data-rig]');
  const stage = document.querySelector('.stage');
  const caption = document.querySelector('[data-caption]');
  const captionIndex = document.querySelector('[data-caption-index]');
  const data = JSON.parse(document.getElementById('demo-data')?.textContent || '[]');
  const total = screens.length;
  if (!total) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let active = -1;
  let timer = 0;
  let hovering = false;
  let visible = true;

  function setActive(index) {
    if (index === active) return;
    active = index;
    screens.forEach((el, i) => el.setAttribute('data-pos', String((i - index + total) % total)));
    phones.forEach((el) => el.toggleAttribute('data-on', Number(el.dataset.phone) === index));
    demos.forEach((el) => el.toggleAttribute('data-active', Number(el.dataset.demo) === index));
    const tint = getComputedStyle(screens[index]).getPropertyValue('--tint').trim();
    if (tint) document.documentElement.style.setProperty('--tint', tint);
    if (caption) caption.textContent = data[index]?.label ?? '';
    if (captionIndex) captionIndex.textContent = String(index + 1).padStart(2, '0');
  }

  function schedule() {
    clearTimeout(timer);
    if (reduce.matches || hovering || !visible || document.hidden) return;
    timer = setTimeout(() => {
      setActive((active + 1) % total);
      schedule();
    }, 4500);
  }

  demos.forEach((el) => {
    const i = Number(el.dataset.demo);
    el.addEventListener('pointerenter', () => {
      hovering = true;
      setActive(i);
      schedule();
    });
    el.addEventListener('pointerleave', () => {
      hovering = false;
      schedule();
    });
    el.addEventListener('focus', () => {
      hovering = true;
      setActive(i);
      schedule();
    });
    el.addEventListener('blur', () => {
      hovering = false;
      schedule();
    });
  });

  // Inclinação do palco acompanhando o ponteiro
  if (rig && stage && fine.matches && !reduce.matches) {
    let raf = 0;
    let px = 0;
    let py = 0;
    window.addEventListener(
      'pointermove',
      (e) => {
        px = e.clientX / innerWidth - 0.5;
        py = e.clientY / innerHeight - 0.5;
        if (!raf)
          raf = requestAnimationFrame(() => {
            raf = 0;
            rig.style.setProperty('--ry', `${(px * 7).toFixed(2)}deg`);
            rig.style.setProperty('--rx', `${(-py * 5).toFixed(2)}deg`);
          });
      },
      { passive: true },
    );
  }

  // Pausa quando o palco sai da tela ou a aba fica oculta
  if (stage && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }).observe(stage);
  }
  document.addEventListener('visibilitychange', schedule);
  reduce.addEventListener?.('change', schedule);

  setActive(0);
  schedule();
})();
