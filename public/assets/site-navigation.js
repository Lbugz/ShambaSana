(() => {
  document.querySelectorAll("header.site-header, header.institute-header").forEach((header) => {
    const toggle = header.querySelector(".menu-toggle");
    const nav = header.querySelector("nav");
    const sectionLinks = [...(nav?.querySelectorAll('.chrome-section-links a[href^="#"]') ?? [])];

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
      const activationPoint = header.getBoundingClientRect().height + 32;
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

  const icon = (name) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.classList.add("site-icon", `site-icon-${name}`);
    const paths = name === "external" ? ["M7 17 17 7M7 7h10v10"]
      : name === "left" ? ["M19 12H5m7-7-7 7 7 7"]
      : name === "disclosure" ? ["M5 12h14", "M12 5v14"]
      : ["M5 12h14m-7-7 7 7-7 7"];
    paths.forEach((data, index) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", data);
      if (name === "disclosure" && index === 1) path.classList.add("disclosure-vertical");
      svg.append(path);
    });
    return svg;
  };

  document.querySelectorAll("a, button").forEach((control) => {
    const walker = document.createTreeWalker(control, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      if (/[↗→←]/.test(walker.currentNode.textContent)) textNodes.push(walker.currentNode);
    }
    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/([↗→←])/).forEach((part) => {
        fragment.append(/[↗→←]/.test(part)
          ? icon(part === "↗" ? "external" : part === "←" ? "left" : "right")
          : document.createTextNode(part));
      });
      node.replaceWith(fragment);
    });
  });

  document.querySelectorAll(".student-information details > summary").forEach((summary) => {
    summary.classList.add("site-disclosure-summary");
    summary.append(icon("disclosure"));
  });

  const mobileFooter = window.matchMedia("(max-width: 639px)");
  document.querySelectorAll(".site-chrome-footer nav").forEach((nav, index) => {
    const heading = nav.querySelector("h2");
    const links = [...nav.children].filter((child) => child.tagName === "A");
    if (!heading || links.length === 0) return;
    const label = heading.textContent;
    const desktopLabel = document.createElement("span");
    desktopLabel.className = "footer-heading-label";
    desktopLabel.textContent = label;
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "footer-group-toggle";
    toggle.append(document.createTextNode(label), icon("disclosure"));
    const group = document.createElement("div");
    group.id = `footer-link-group-${index + 1}`;
    group.className = "footer-link-group";
    group.append(...links);
    toggle.setAttribute("aria-controls", group.id);
    heading.replaceChildren(desktopLabel, toggle);
    nav.append(group);
    let expanded = false;
    const updateGroup = () => {
      const open = !mobileFooter.matches || expanded;
      group.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => {
      expanded = !expanded;
      updateGroup();
    });
    mobileFooter.addEventListener("change", updateGroup);
    updateGroup();
  });
})();
