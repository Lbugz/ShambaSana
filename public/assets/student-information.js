(() => {
  // A course link should reveal its outline as well as scroll to it.
  function revealOutline() {
    const outline = document.getElementById(window.location.hash.slice(1));
    if (outline?.tagName === 'DETAILS') outline.open = true;
  }
  revealOutline();
  window.addEventListener('hashchange', revealOutline);
})();
