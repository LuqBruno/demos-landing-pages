(() => {
  const creator = document.querySelector('.bruno-creator');
  const floating = document.querySelector('.bruno-demo-contact');
  if (!creator || !floating) return;
  const footer = document.querySelector('footer, .work') || creator;
  const visible = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    document.body.classList.toggle('bruno-footer-visible', visible.size > 0);
  });
  observer.observe(footer);
  observer.observe(creator);
  document.addEventListener('focusin', event => {
    if (floating.contains(event.target)) return;
    const focus = event.target.getBoundingClientRect();
    const button = floating.getBoundingClientRect();
    floating.classList.toggle('bruno-focus-overlap', focus.right > button.left && focus.left < button.right && focus.bottom > button.top && focus.top < button.bottom);
  });
  window.addEventListener('pagehide', () => observer.disconnect(), {once: true});
})();
