function renderSiteHeader(activePage) {
  const pages = [
    { id: "home", label: "Home", href: "/" },
    { id: "about", label: "About", href: "/about/" },
    { id: "projects", label: "Projects", href: "/projects/" },
    { id: "contact", label: "Contact", href: "/contact/" },
  ];

  const navLinks = pages
    .map(
      (p) =>
        `<li><a href="${p.href}" class="${activePage === p.id ? "active" : ""}">${p.label}</a></li>`
    )
    .join("");

  return `
<header class="site-header">
  <div class="nav-inner">
    <a href="/" class="logo">${GOMSOFT_CONFIG.siteName}</a>
    <button type="button" class="nav-toggle" aria-label="메뉴 열기" aria-expanded="false" id="navToggle">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-menu" id="navMenu">${navLinks}</ul>
  </div>
</header>`;
}

function renderSiteFooter() {
  const year = new Date().getFullYear();
  return `
<footer class="site-footer">
  <p>Copyright © ${year} ${GOMSOFT_CONFIG.siteName}</p>
  <p>${GOMSOFT_CONFIG.businessInfo}</p>
</footer>`;
}

function initNavigation() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open && window.innerWidth < 768 ? "hidden" : "";
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });
}

function setPageMeta({ title, description, path, image }) {
  const base = GOMSOFT_CONFIG.domain;
  const fullTitle = title ? `${title} | ${GOMSOFT_CONFIG.siteName}` : `${GOMSOFT_CONFIG.siteName} | ${GOMSOFT_CONFIG.tagline}`;
  const desc = description || GOMSOFT_CONFIG.headline;
  const url = path ? `${base}${path}` : base;
  const ogImage = image ? (image.startsWith("http") ? image : `${base}${image}`) : `${base}/gomsoft_logo.png`;

  document.title = fullTitle;

  const setMeta = (selector, attr, value) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      const [key, name] = attr.split("=");
      if (key === "property") el.setAttribute("property", name);
      else el.setAttribute("name", name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  };

  setMeta('meta[name="description"]', "name=description", desc);
  setMeta('meta[property="og:title"]', "property=og:title", fullTitle);
  setMeta('meta[property="og:description"]', "property=og:description", desc);
  setMeta('meta[property="og:url"]', "property=og:url", url);
  setMeta('meta[property="og:image"]', "property=og:image", ogImage);
  setMeta('meta[property="og:type"]', "property=og:type", "website");
  setMeta('meta[name="twitter:card"]', "name=twitter:card", "summary_large_image");
}

function formatRichText(text) {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function renderHeroActions() {
  return `
    <div class="hero-actions">
      <a href="/about/" class="btn btn-secondary">회사 소개</a>
      <a href="/projects/" class="btn btn-primary">프로젝트 보기</a>
    </div>`;
}

function renderCompanyProfile() {
  const p = GOMSOFT_CONFIG.companyProfile;
  const facts = p.facts
    .map((f) => `<div class="profile-fact"><span class="profile-fact-label">${f.label}</span><span class="profile-fact-value">${f.value}</span></div>`)
    .join("");
  const strengths = p.strengths.map((s) => `<li>${s}</li>`).join("");

  return `
  <section class="section profile-section" id="company-profile">
    <div class="container">
      <div class="profile-card">
        <div class="profile-intro">
          <p class="profile-label">${p.title}</p>
          <h2 class="profile-headline">${p.oneLiner}</h2>
          <p class="profile-summary">${p.summary}</p>
        </div>
        <div class="profile-facts">${facts}</div>
        <div class="profile-strengths">
          <p class="profile-strengths-title">핵심 강점</p>
          <ul>${strengths}</ul>
        </div>
        <div class="profile-cta">
          <a href="/about/" class="btn btn-secondary">About 전체 보기</a>
          <a href="/projects/" class="btn btn-primary">Projects 보기</a>
        </div>
      </div>
    </div>
  </section>`;
}

function renderProjectCards(linkToDetail) {
  return GOMSOFT_CONFIG.projects
    .map((proj) => {
      const detailUrl =
        linkToDetail && proj.postSlug
          ? `/post.html?category=${encodeURIComponent(proj.postCategory)}&slug=${encodeURIComponent(proj.postSlug)}`
          : null;
      const primaryLink = proj.link || detailUrl || "/projects/";
      const highlights = proj.highlights.map((h) => `<span class="project-chip">${h}</span>`).join("");

      let actions = "";
      if (proj.link) {
        actions += `<a href="${proj.link}" class="project-link" target="_blank" rel="noopener">서비스 보기</a>`;
      }
      if (detailUrl) {
        actions += `<a href="${detailUrl}" class="project-link project-link-muted">상세 소개</a>`;
      }

      return `
      <article class="project-card">
        <div class="project-card-visual">
          <img src="${proj.thumbnail}" alt="${proj.name}" width="80" height="80" loading="lazy">
        </div>
        <div class="project-card-body">
          <div class="project-card-meta">
            <span class="project-tag">${proj.tag}</span>
            <span class="project-status">${proj.status}</span>
          </div>
          <h3>${proj.name}</h3>
          <p>${proj.desc}</p>
          <div class="project-chips">${highlights}</div>
          ${actions ? `<div class="project-card-actions">${actions}</div>` : ""}
        </div>
      </article>`;
    })
    .join("");
}

function renderAboutPageContent() {
  const a = GOMSOFT_CONFIG.about;
  const caps = a.capabilities.items
    .map(
      (c) => `
      <div class="capability-card">
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
      </div>`
    )
    .join("");

  const companyParas = a.company.paragraphs.map((p) => `<p>${formatRichText(p)}</p>`).join("");
  const repBio = a.representative.bio.map((p) => `<p>${formatRichText(p)}</p>`).join("");
  const visionParas = a.vision.paragraphs.map((p) => `<p>${formatRichText(p)}</p>`).join("");
  const goals = a.vision.goals.map((g) => `<li>${g}</li>`).join("");

  return `
    <section class="content-section">
      <div class="container content-narrow">
        <h2>${a.company.title}</h2>
        ${companyParas}
      </div>
    </section>
    <section class="content-section section-alt">
      <div class="container content-narrow">
        <h2>${a.representative.title}</h2>
        <p class="rep-name">${a.representative.name} <span>${a.representative.role}</span></p>
        ${repBio}
      </div>
    </section>
    <section class="content-section">
      <div class="container">
        <h2 class="content-center-title">${a.capabilities.title}</h2>
        <div class="capability-grid">${caps}</div>
      </div>
    </section>
    <section class="content-section section-alt">
      <div class="container">
        <div class="section-header">
          <h2>${a.businesses.title}</h2>
          <p>${a.businesses.intro}</p>
        </div>
        <div class="project-grid">${renderProjectCards(true)}</div>
      </div>
    </section>
    <section class="content-section">
      <div class="container content-narrow">
        <h2>${a.vision.title}</h2>
        ${visionParas}
        <ul class="vision-list">${goals}</ul>
      </div>
    </section>`;
}

function initHomePage() {
  document.getElementById("heroTagline").textContent = GOMSOFT_CONFIG.tagline;
  document.getElementById("heroHeadline").textContent = GOMSOFT_CONFIG.headline;
  document.getElementById("heroLead").textContent = GOMSOFT_CONFIG.subHeadline;
  const actions = document.getElementById("heroActions");
  if (actions) actions.innerHTML = renderHeroActions();
  const profile = document.getElementById("companyProfile");
  if (profile) profile.innerHTML = renderCompanyProfile();
}
