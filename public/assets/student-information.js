(() => {
  const links = [...document.querySelectorAll('.guide-nav a')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);

  function updateCurrentSection() {
    const threshold = window.innerWidth <= 800 ? 170 : 130;
    const current = sections.filter(section => section.getBoundingClientRect().top <= threshold).pop() || sections[0];
    links.forEach(link => {
      if (link.hash === `#${current?.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  // Direct course links reveal the relevant outline.
  function revealOutline() {
    const outline = document.getElementById(window.location.hash.slice(1));
    if (outline?.tagName === 'DETAILS') outline.open = true;
    updateCurrentSection();
  }

  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      updateCurrentSection();
      scheduled = false;
    });
  }, { passive: true });
  window.addEventListener('resize', updateCurrentSection);
  window.addEventListener('hashchange', revealOutline);
  revealOutline();
})();
