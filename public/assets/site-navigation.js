(() => {
  document.querySelectorAll("header.site-header, header.institute-header").forEach((header) => {
    const toggle = header.querySelector(".menu-toggle");
    const nav = header.querySelector("nav");
    const sectionLinks = [...(nav?.querySelectorAll('a[href^="#"]') ?? [])];

    const setMenuOpen = (open) => {
      header.classList.toggle("menu-open", open);
      if (toggle) {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      }
    };

    toggle?.addEventListener("click", () => {
      setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav?.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenuOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("menu-open")) {
        setMenuOpen(false);
        toggle?.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) setMenuOpen(false);
    });

    header.addEventListener("focusout", (event) => {
      if (event.relatedTarget && !header.contains(event.relatedTarget)) setMenuOpen(false);
    });

    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 20);
      let activeLink = null;
      const activationPoint = header.getBoundingClientRect().height + 18;
      sectionLinks.forEach((link) => {
        const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
        if (target && target.getBoundingClientRect().top <= activationPoint) activeLink = link;
      });
      sectionLinks.forEach((link) => {
        if (link === activeLink) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
        link.classList.toggle("is-active", link === activeLink);
      });
    };

    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1200) setMenuOpen(false);
      updateHeader();
    });
    updateHeader();
  });
})();
