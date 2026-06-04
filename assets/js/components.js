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

  const mobileCategoryLinks = pages
    .map(
      (p) =>
        `<a href="${p.href}" class="mobile-category-link${activePage === p.id ? " active" : ""}">${p.label}</a>`
    )
    .join("");

  return `
<div class="site-header-stack">
  <header class="site-header">
    <div class="nav-inner">
      <a href="/" class="logo">${GOMSOFT_CONFIG.siteName}</a>
      <button type="button" class="nav-toggle" aria-label="메뉴 열기" aria-expanded="false" id="navToggle">
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
      </button>
      <ul class="nav-menu" id="navMenu">${navLinks}</ul>
    </div>
  </header>
  <nav class="mobile-category-nav" id="mobileCategoryNav" aria-label="카테고리 메뉴">
    <div class="mobile-category-nav-inner">${mobileCategoryLinks}</div>
  </nav>
</div>`;
}

function footerProjectHref(proj) {
  if (proj.link && /^https?:\/\//i.test(proj.link)) return proj.link;
  if (proj.postSlug && proj.postCategory) {
    return `/post.html?category=${encodeURIComponent(proj.postCategory)}&slug=${encodeURIComponent(proj.postSlug)}`;
  }
  return proj.link || "/projects/";
}

function renderSiteFooter() {
  const cfg = GOMSOFT_CONFIG;
  const footer = cfg.footer || {};
  const intro = footer.intro || [cfg.taglineSub];
  const contact = footer.contact || {};
  const company = footer.company || {};
  const kakaoUrl = cfg.contact?.kakaoChannelUrl || "";
  const kakaoQr = cfg.kakaoQrImage || "/assets/images/kakao-channel-qr.png";
  const kakaoBtnLabel = contact.kakaoButtonLabel || "카카오톡 채널 채팅 상담하기";
  const email = contact.email || cfg.email;
  const phone = contact.phone || cfg.phone;
  const navPages = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about/" },
    { label: "Projects", href: "/projects/" },
    { label: "Contact", href: "/contact/" },
  ];
  const year = new Date().getFullYear();
  const projectLinks = (cfg.projects || [])
    .map(
      (proj) =>
        `<li><a href="${footerProjectHref(proj)}">${proj.name}</a></li>`
    )
    .join("");

  return `
<footer class="site-footer" role="contentinfo">
  <div class="footer-main">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col footer-brand">
          <a href="/" class="footer-logo" aria-label="${cfg.siteName} 홈">
            <img src="${cfg.logoImage}" alt="${cfg.siteName}" width="160" height="36" loading="lazy" decoding="async">
          </a>
          <p class="footer-intro">${intro.map((line) => `<span>${line}</span>`).join("<br>")}</p>
        </div>
        <div class="footer-col">
          <h2 class="footer-heading">Quick Menu</h2>
          <ul class="footer-links">
            ${navPages.map((p) => `<li><a href="${p.href}">${p.label}</a></li>`).join("")}
          </ul>
        </div>
        <div class="footer-col">
          <h2 class="footer-heading">대표 프로젝트</h2>
          <ul class="footer-links">${projectLinks}</ul>
        </div>
        <div class="footer-col">
          <h2 class="footer-heading">Contact</h2>
          <ul class="footer-contact">
            <li>
              <span class="footer-contact-label">이메일</span>
              <a href="mailto:${email}">${email}</a>
            </li>
            <li>
              <span class="footer-contact-label">전화번호</span>
              <a href="tel:${phone.replace(/\s/g, "")}">${phone}</a>
            </li>
            <li class="footer-contact-kakao">
              ${
                kakaoUrl
                  ? `<a href="${kakaoUrl}" class="btn btn-kakao footer-kakao-btn" target="_blank" rel="noopener noreferrer">${kakaoBtnLabel}</a>
              <a href="${kakaoUrl}" class="footer-kakao-qr-link" target="_blank" rel="noopener noreferrer" aria-label="카카오톡 채널 QR 코드 — 스캔하여 채팅 상담">
                <img src="${kakaoQr}" alt="카카오톡 채널 QR 코드" width="88" height="88" loading="lazy" decoding="async">
              </a>`
                  : `<span class="btn btn-kakao btn-kakao-pending">${kakaoBtnLabel}</span>`
              }
            </li>
          </ul>
        </div>
      </div>
      <div class="footer-company" aria-label="회사정보">
        <p><span class="footer-company-label">대표자</span> ${company.representative || cfg.founderName}</p>
        <p><span class="footer-company-label">사업자등록번호</span> ${company.businessRegistrationNumber || "110-33-91602"}</p>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container">
      <p class="footer-copyright">© ${year} ${cfg.siteName}.<br class="footer-copyright-br"> All Rights Reserved.</p>
    </div>
  </div>
</footer>`;
}

function initNavigation() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.classList.toggle("is-open", open);
    document.body.style.overflow = open && window.innerWidth < 768 ? "hidden" : "";
  });

  const closeMenu = () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
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

function formatLineBreaks(text) {
  if (!text) return "";
  const escaped = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\n/g, "<br>");
}

function renderHeroActions() {
  return `
    <div class="hero-actions">
      <a href="/about/" class="btn btn-secondary">회사 소개</a>
      <a href="/projects/" class="btn btn-primary">프로젝트 보기</a>
    </div>`;
}

function overviewCapabilityIcon(id) {
  const icons = {
    plan: `<svg class="overview-cap-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    dev: `<svg class="overview-cap-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>`,
    media: `<svg class="overview-cap-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    field: `<svg class="overview-cap-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 18h16M8 6l4 8 4-8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  return icons[id] || icons.plan;
}

function renderCompanyProfile() {
  const p = GOMSOFT_CONFIG.companyProfile;
  const rep = GOMSOFT_CONFIG.about?.representative || {};
  const caps = (p.capabilities || [])
    .map(
      (c) => `
        <article class="overview-cap-card">
          <span class="overview-cap-icon-wrap">${overviewCapabilityIcon(c.id)}</span>
          <h3 class="overview-cap-title">${c.title}</h3>
          ${c.desc ? `<p class="overview-cap-desc">${c.desc}</p>` : ""}
        </article>`
    )
    .join("");

  return `
  <section class="section company-overview profile-section" id="company-profile" aria-labelledby="company-overview-heading">
    <div class="container company-overview-inner">
      <div class="company-overview-layout">
        <div class="company-overview-visual">
          <figure class="overview-portrait">
            <div class="overview-portrait-frame">
              <img src="${rep.photo || "/assets/images/founder.jpg"}" alt="${rep.name || GOMSOFT_CONFIG.founderName} 대표" width="360" height="480" loading="lazy" decoding="async">
            </div>
            <figcaption class="overview-portrait-caption">
              <span class="overview-portrait-name">${rep.name || GOMSOFT_CONFIG.founderName}</span>
              <span class="overview-portrait-role">${rep.roleTitle || "Founder · Developer"}</span>
            </figcaption>
          </figure>
        </div>
        <div class="company-overview-main">
          <p class="overview-eyebrow">${p.eyebrow || "Digital Product Studio"}</p>
          <h2 class="overview-headline" id="company-overview-heading">${formatLineBreaks(p.headline)}</h2>
          <p class="overview-description">${formatLineBreaks(p.description)}</p>
          <div id="homeOverviewStats" class="overview-kpi-grid" aria-live="polite"></div>
          <div class="overview-capabilities">
            <p class="overview-capabilities-label">핵심 역량</p>
            <div class="overview-cap-grid">${caps}</div>
          </div>
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
        const external = /^https?:\/\//i.test(proj.link);
        actions += `<a href="${proj.link}" class="btn btn-primary project-card-btn"${external ? ' target="_blank" rel="noopener"' : ""}>서비스 보기</a>`;
      }
      if (detailUrl) {
        actions += `<a href="${detailUrl}" class="btn btn-secondary project-card-btn">상세 소개</a>`;
      }

      const statusOverlay = typeof getPostStatusOverlayLabel === "function" ? getPostStatusOverlayLabel(proj.status) : "";
      const statusBadge = statusOverlay ? `<span class="post-card-status-overlay">${statusOverlay}</span>` : "";

      return `
      <article class="project-card">
        <div class="project-card-media">
          ${statusBadge}
          <img src="${proj.thumbnail}" alt="${proj.name}" width="112" height="112" loading="lazy" decoding="async">
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
  const rep = a.representative;
  const repBio = rep.bio.map((p) => `<p>${formatRichText(p)}</p>`).join("");
  const visionParas = a.vision.paragraphs.map((p) => `<p>${formatRichText(p)}</p>`).join("");
  const goals = a.vision.goals.map((g) => `<li>${g}</li>`).join("");

  return `
    <section class="content-section about-page-section">
      <div class="container">
        <header class="about-section-head">
          <h2 class="about-section-title">${a.company.title}</h2>
        </header>
        <div class="about-prose-rail">
          <div class="about-section-body">${companyParas}</div>
        </div>
      </div>
    </section>
    <section class="content-section section-alt founder-section about-page-section" id="founder-profile">
      <div class="container">
        <header class="about-section-head">
          <h2 class="about-section-title">${rep.title}</h2>
        </header>
        <div class="about-prose-rail">
        <div class="founder-profile">
          <div class="founder-profile-text reveal-on-scroll">
            <p class="founder-role-line">${rep.roleLine}</p>
            <div class="founder-bio">${repBio}</div>
          </div>
          <figure class="founder-profile-visual reveal-on-scroll reveal-delay">
            <div class="founder-photo-frame">
              <img
                src="${rep.photo}"
                alt="${rep.name}"
                width="360"
                height="480"
                loading="lazy"
                decoding="async"
              >
            </div>
            <figcaption class="founder-photo-caption">
              <span class="founder-caption-name">${rep.name}</span>
              <span class="founder-caption-role">${rep.roleTitle}</span>
            </figcaption>
          </figure>
        </div>
        </div>
      </div>
    </section>
    <section class="content-section about-page-section">
      <div class="container">
        <header class="about-section-head">
          <h2 class="about-section-title">${a.capabilities.title}</h2>
        </header>
        <div class="capability-grid">${caps}</div>
      </div>
    </section>
    <section class="content-section section-alt about-page-section">
      <div class="container">
        <header class="about-section-head">
          <h2 class="about-section-title">${a.businesses.title}</h2>
          <p class="about-section-lead">${a.businesses.intro}</p>
        </header>
        <div id="aboutProjectStats" class="about-project-stats" aria-live="polite"></div>
        <div class="project-grid">${renderProjectCards(true)}</div>
      </div>
    </section>
    <section class="content-section about-page-section">
      <div class="container">
        <header class="about-section-head">
          <h2 class="about-section-title">${a.vision.title}</h2>
        </header>
        <div class="about-prose-rail">
          <div class="about-section-body">
            ${visionParas}
            <h3 class="vision-goals-title">${a.vision.goalsTitle || "주요 추진 계획"}</h3>
            <ul class="vision-list">${goals}</ul>
          </div>
        </div>
      </div>
    </section>`;
}

function formatTelHref(phone) {
  return "tel:" + String(phone).replace(/[^\d+]/g, "");
}

function renderContactKakaoButton(kakaoUrl) {
  const url = (kakaoUrl || "").trim();
  if (!url) {
    return `<span class="btn btn-kakao btn-kakao-pending" role="status">카카오 채널 채팅 상담</span>`;
  }
  const safeUrl = url.replace(/"/g, "&quot;");
  return `<a href="${safeUrl}" class="btn btn-kakao contact-channel-kakao" target="_blank" rel="noopener">카카오 채널 채팅 상담</a>`;
}

function renderContactChannelCard({ id, title, primaryLabel, primaryText, primaryHref, kakaoUrl }) {
  const primaryLink = primaryHref
    ? `<a href="${primaryHref}" class="contact-channel-value">${primaryText}</a>`
    : `<span class="contact-channel-value">${primaryText}</span>`;

  return `
      <article class="contact-channel-card" id="${id}">
        <h2 class="contact-channel-title">${title}</h2>
        <div class="contact-channel-body">
          <div class="contact-channel-row">
            <span class="contact-channel-label">${primaryLabel}</span>
            ${primaryLink}
          </div>
          ${renderContactKakaoButton(kakaoUrl)}
        </div>
      </article>`;
}

function contactInquiryIcon(type) {
  const icons = {
    app: `<svg class="contact-inquiry-icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>`,
    ai: `<svg class="contact-inquiry-icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12 3v3M12 18v3M5 5l2 2M17 17l2 2M3 12h3M18 12h3M5 19l2-2M17 7l2-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    media: `<svg class="contact-inquiry-icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    welding: `<svg class="contact-inquiry-icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M4 18h16M8 6l4 8 4-8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  return icons[type] || icons.app;
}

function renderContactInquiryTypes() {
  const items = GOMSOFT_CONFIG.contact?.inquiryTypes || [];
  return `
    <section class="contact-block section-alt">
      <div class="container">
        <header class="contact-block-head">
          <h2 class="contact-block-title">문의 유형</h2>
          <p class="contact-block-lead">관심 분야를 선택해 주세요. 아래 연락 방법으로 이어집니다.</p>
        </header>
        <div class="contact-inquiry-grid">
          ${items
            .map(
              (item) => `
          <button type="button" class="contact-inquiry-card" data-scroll="contact-methods">
            <span class="contact-inquiry-icon-wrap">${contactInquiryIcon(item.icon)}</span>
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
          </button>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

function renderContactWhy() {
  const why = GOMSOFT_CONFIG.contact?.why || {};
  const items = (why.items || [])
    .map(
      (text) => `
      <li class="contact-why-item">
        <span class="contact-why-check" aria-hidden="true">✓</span>
        <span>${text}</span>
      </li>`
    )
    .join("");

  return `
    <section class="contact-block">
      <div class="container">
        <header class="contact-block-head">
          <h2 class="contact-block-title">${why.title || "왜 곰소프트를 선택해야 할까요?"}</h2>
        </header>
        <div class="contact-why-panel">
          <ul class="contact-why-list">${items}</ul>
        </div>
      </div>
    </section>`;
}

function renderContactPageContent() {
  const c = GOMSOFT_CONFIG.contact || {};
  const hero = c.hero || {};
  const closing = c.closing || {};

  return `
    <header class="contact-hero">
      <div class="container">
        <h1 class="contact-hero-title">${hero.title || "프로젝트를 함께 만들어보세요"}</h1>
        <p class="contact-hero-lead">${hero.lead || ""}</p>
        <p class="contact-hero-support">${hero.support || ""}</p>
      </div>
    </header>
    ${renderContactInquiryTypes()}
    ${renderContactWhy()}
    <section class="contact-block section-alt" id="contact-methods">
      <div class="container">
        <header class="contact-block-head">
          <h2 class="contact-block-title">${c.methodsTitle || "연락 방법"}</h2>
        </header>
        ${renderContactChannels()}
      </div>
    </section>
    <section class="contact-closing">
      <div class="container">
        <p class="contact-closing-line">${closing.line1 || ""}</p>
        <p class="contact-closing-line contact-closing-em">${closing.line2 || ""}</p>
      </div>
    </section>`;
}

function initContactInquiryScroll() {
  document.querySelectorAll("[data-scroll='contact-methods']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById("contact-methods");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderContactChannels() {
  const c = GOMSOFT_CONFIG.contact || {};
  const project = c.project || {};
  const welding = c.welding || {};
  const defaultKakao = c.kakaoChannelUrl || "https://pf.kakao.com/_TPxmGX";

  return `
    <div class="contact-channels">
      ${renderContactChannelCard({
        id: "contact-project",
        title: project.title || "프로젝트 · 지원사업 · 협업 문의",
        primaryLabel: "이메일",
        primaryText: project.email || "",
        primaryHref: project.email ? `mailto:${project.email}` : "",
        kakaoUrl: project.kakaoChannelUrl || defaultKakao,
      })}
      ${renderContactChannelCard({
        id: "contact-welding",
        title: welding.title || "용접 서비스",
        primaryLabel: "전화",
        primaryText: welding.phone || "",
        primaryHref: welding.phone ? formatTelHref(welding.phone) : "",
        kakaoUrl: welding.kakaoChannelUrl || defaultKakao,
      })}
    </div>`;
}

function initRevealOnScroll() {
  const els = document.querySelectorAll(".reveal-on-scroll");
  if (!els.length) return;

  const show = (el) => el.classList.add("is-visible");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach(show);
    return;
  }

  if (!("IntersectionObserver" in window)) {
    els.forEach(show);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
  );

  els.forEach((el) => observer.observe(el));
}

function initHomePage() {
  const eyebrow = document.getElementById("heroEyebrow");
  if (eyebrow) eyebrow.textContent = GOMSOFT_CONFIG.tagline;
  const headline = document.getElementById("heroHeadline");
  if (headline) headline.textContent = GOMSOFT_CONFIG.headline;
  const lead = document.getElementById("heroLead");
  if (lead) lead.textContent = GOMSOFT_CONFIG.taglineSub || "";
  const support = document.getElementById("heroSupport");
  if (support) {
    support.textContent = String(GOMSOFT_CONFIG.subHeadline || "").replace(/\s*\n\s*/g, " ");
  }
  const profile = document.getElementById("companyProfile");
  if (profile) profile.innerHTML = renderCompanyProfile();
}
