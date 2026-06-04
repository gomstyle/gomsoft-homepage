let postsCache = null;

async function loadPostsIndex() {
  if (postsCache) return postsCache;
  const res = await fetch("/data/posts.json?" + Date.now());
  if (!res.ok) {
    postsCache = { posts: [] };
    return postsCache;
  }
  postsCache = await res.json();
  return postsCache;
}

function invalidatePostsCache() {
  postsCache = null;
}

function getAllProjectPosts(data) {
  return (data.posts || []).map(normalizePost).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getPostsByProjectType(data, projectType) {
  const all = getAllProjectPosts(data);
  if (!projectType || projectType === "all") return all;
  return all.filter((p) => p.projectType === projectType);
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function postDetailUrl(post) {
  const p = normalizePost(post);
  return `/post.html?category=${encodeURIComponent(p.category)}&slug=${encodeURIComponent(p.slug)}`;
}

function renderPostCards(posts, container) {
  if (!posts.length) {
    container.innerHTML = `<div class="empty-state"><p>등록된 프로젝트가 없습니다.</p></div>`;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "post-grid";
  grid.innerHTML = posts
    .map((post) => {
      const p = normalizePost(post);
      const thumb = p.thumbnail || "/gomsoft_logo.png";
      const url = postDetailUrl(p);
      const title = escapeHtml(p.title);
      const summary = escapeHtml(p.summary || "프로젝트 상세 내용을 확인해 보세요.");
      const badgeClass = projectTypeBadgeClass(p.projectType);
      const typeLabel = projectTypeLabel(p.projectType);
      const statusOverlay = getPostStatusOverlayLabel(p.status);
      const statusBadge = statusOverlay
        ? `<span class="post-card-status-overlay">${escapeHtml(statusOverlay)}</span>`
        : "";
      return `
      <article class="post-card">
        <a class="post-card-thumb-link" href="${url}" tabindex="-1" aria-hidden="true">
          <div class="post-card-thumb">
            ${statusBadge}
            <img src="${thumb}" alt="" width="640" height="360" loading="lazy" decoding="async">
          </div>
        </a>
        <div class="post-card-body">
          <span class="post-card-badge ${badgeClass}">${typeLabel}</span>
          <h2 class="post-card-title"><a href="${url}">${title}</a></h2>
          <p class="post-card-summary">${summary}</p>
          <a href="${url}" class="btn btn-secondary post-card-cta">자세히 보기 →</a>
        </div>
      </article>`;
    })
    .join("");
  container.innerHTML = "";
  container.appendChild(grid);
}

function renderProjectStats(statsEl, stats, options = {}) {
  if (!statsEl) return;
  const { showFounder = true, showFilterNote = true } = options;
  const founderStat = showFounder
    ? `
      <div class="stat-item">
        <span class="stat-value">${stats.founder}</span>
        <span class="stat-label">Founder</span>
      </div>`
    : "";
  const statsClass = showFounder ? "projects-stats" : "projects-stats projects-stats--three";
  const filterNote =
    showFilterNote && stats.total !== stats.totalAll
      ? `<p class="projects-stats-note">현재 필터: <strong>${stats.total}</strong>개 표시</p>`
      : "";

  statsEl.innerHTML = `
    <div class="${statsClass}">
      <div class="stat-item">
        <span class="stat-value">${stats.totalAll}</span>
        <span class="stat-label">총 프로젝트 수</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${stats.operating}</span>
        <span class="stat-label">운영 중 프로젝트</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${stats.areas}</span>
        <span class="stat-label">서비스 분야</span>
      </div>
      ${founderStat}
    </div>
    ${filterNote}`;
}

function renderAboutStats(statsEl, stats) {
  if (!statsEl) return;
  const items = [
    {
      value: stats.launched,
      label: "출시 서비스",
      desc: "Play 출시·웹 실서비스",
    },
    {
      value: stats.operating,
      label: "운영 프로젝트",
      desc: "현재 진행 중",
    },
    {
      value: stats.areas,
      label: "서비스 분야",
      desc: "App·Media·Welding",
    },
    {
      value: stats.founder,
      label: "Founder",
      desc: "1인 개발·운영",
    },
  ];

  statsEl.innerHTML = `
    <div class="projects-stats about-stats">
      ${items
        .map(
          (item) => `
      <div class="stat-item">
        <span class="stat-value">${item.value}</span>
        <span class="stat-label">${item.label}</span>
        <span class="stat-desc">${item.desc}</span>
      </div>`
        )
        .join("")}
    </div>`;
}

async function initAboutBusinessStats() {
  const statsEl = document.getElementById("aboutProjectStats");
  if (!statsEl) return;
  try {
    const data = await loadPostsIndex();
    const allPosts = getAllProjectPosts(data);
    const stats = computeAboutStats(allPosts);
    renderAboutStats(statsEl, stats);
  } catch {
    statsEl.innerHTML = "";
  }
}

function countOperatingProjects(posts) {
  return posts.filter((p) => isOperatingStatus(p.status)).length;
}

async function updateHeroRunningCount() {
  const el = document.getElementById("heroRunning");
  if (!el) return;
  try {
    const data = await loadPostsIndex();
    const count = countOperatingProjects(getAllProjectPosts(data));
    el.textContent = count > 0 ? `현재 운영 프로젝트 ${count}개` : "";
    el.hidden = count === 0;
  } catch {
    el.hidden = true;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function loadPostMarkdown(category, slug) {
  const path = `content/${category}/${slug}.md`;
  const res = await fetch("/" + path + "?" + Date.now());
  if (!res.ok) throw new Error("게시글을 찾을 수 없습니다.");
  return res.text();
}

function renderPostDetailActions(projectType, links) {
  const backHref = projectType ? `/projects/?type=${encodeURIComponent(projectType)}` : "/projects/";
  const linkBtns = (links || [])
    .map((l) => {
      const external = /^https?:\/\//i.test(l.url);
      const safeUrl = String(l.url).replace(/"/g, "&quot;");
      const targetAttr = external ? ' target="_blank" rel="noopener"' : "";
      return `<a href="${safeUrl}" class="btn btn-primary"${targetAttr}>${escapeHtml(l.label)}</a>`;
    })
    .join("");

  return `
    <div class="post-detail-actions-row">
      <a href="${backHref}" class="btn btn-secondary">Projects 목록</a>
      ${linkBtns}
    </div>`;
}

async function renderPostDetail(category, slug) {
  const raw = await loadPostMarkdown(category, slug);
  const { meta, body } = parseFrontmatter(raw);
  const title = meta.title || slug;
  const date = meta.date || "";
  const projectType = meta.projectType || projectTypeFromCategory(category);
  const images = Array.isArray(meta.images) ? meta.images : meta.images ? [meta.images] : [];
  const links = parseProjectLinks(meta);
  const coverSrc = meta.coverImage || meta.thumbnail;

  setPageMeta({
    title,
    description: meta.summary || GOMSOFT_CONFIG.headline,
    path: `/post.html?category=${category}&slug=${slug}`,
    image: coverSrc || meta.thumbnail,
  });

  const coverEl = document.getElementById("postCover");
  if (coverEl) {
    if (coverSrc) {
      coverEl.innerHTML = `<img src="${coverSrc}" alt="" width="600" loading="eager" decoding="async">`;
      coverEl.className = "post-cover";
      coverEl.hidden = false;
    } else {
      coverEl.innerHTML = "";
      coverEl.hidden = true;
    }
  }

  document.getElementById("postTitle").textContent = title;
  const metaEl = document.getElementById("postDate");
  const statusText = meta.status ? ` · ${meta.status}` : "";
  if (metaEl) {
    metaEl.innerHTML = `<span class="post-detail-type">${projectTypeLabel(projectType)}</span>${statusText} · ${formatDate(date)}`;
  }

  document.getElementById("postContent").innerHTML = renderMarkdownSimple(body);

  const gallery = document.getElementById("postGallery");
  if (images.length && gallery) {
    gallery.innerHTML = images
      .filter(Boolean)
      .map((src) => `<img src="${src}" alt="" width="600" loading="lazy" decoding="async">`)
      .join("");
    gallery.className = "post-gallery";
  } else if (gallery) {
    gallery.innerHTML = "";
  }

  const actionsEl = document.getElementById("postDetailActions");
  if (actionsEl) {
    actionsEl.innerHTML = renderPostDetailActions(projectType, links);
  }
}

async function initHomeProjectsPreview() {
  const el = document.getElementById("projectsPreview");
  if (!el) return;
  el.innerHTML = `<div class="empty-state"><p>불러오는 중…</p></div>`;
  try {
    const data = await loadPostsIndex();
    const posts = getAllProjectPosts(data).slice(0, 4);
    renderPostCards(posts, el);
  } catch {
    el.innerHTML = `<div class="empty-state"><p>프로젝트를 불러올 수 없습니다.</p></div>`;
  }
}

function initProjectsBoard() {
  const listEl = document.getElementById("projectsPostList");
  const tabsEl = document.getElementById("projectFilterTabs");
  const statsEl = document.getElementById("projectsStats");
  if (!listEl || !tabsEl) return;

  const params = new URLSearchParams(location.search);
  let activeType = params.get("type") || "all";
  if (!["all", "app", "media", "welding"].includes(activeType)) activeType = "all";

  const tabs = [
    { id: "all", label: "전체" },
    { id: "app", label: "App" },
    { id: "media", label: "Media" },
    { id: "welding", label: "Welding" },
  ];

  let allPosts = [];

  function renderTabs() {
    tabsEl.innerHTML = `<div class="project-filter-bar" role="tablist">${tabs
      .map(
        (t) =>
          `<button type="button" role="tab" aria-selected="${activeType === t.id}" class="filter-tab${activeType === t.id ? " active" : ""}" data-type="${t.id}">${t.label}</button>`
      )
      .join("")}</div>`;

    tabsEl.querySelectorAll(".filter-tab").forEach((btn) => {
      btn.onclick = () => {
        activeType = btn.dataset.type;
        const url = activeType === "all" ? "/projects/" : `/projects/?type=${activeType}`;
        history.replaceState(null, "", url);
        renderTabs();
        renderList(true);
      };
    });
  }

  async function renderList(animate) {
    if (animate) listEl.classList.add("is-filtering");
    if (!animate) listEl.innerHTML = `<div class="empty-state"><p>불러오는 중…</p></div>`;
    try {
      const data = await loadPostsIndex();
      allPosts = getAllProjectPosts(data);
      const posts = getPostsByProjectType(data, activeType);
      const stats = computeProjectStats(allPosts, posts);
      renderProjectStats(statsEl, stats, { showFounder: false });

      const paint = () => {
        renderPostCards(posts, listEl);
        requestAnimationFrame(() => listEl.classList.remove("is-filtering"));
      };

      if (animate) {
        setTimeout(paint, 180);
      } else {
        paint();
      }
    } catch {
      listEl.classList.remove("is-filtering");
      listEl.innerHTML = `<div class="empty-state"><p>프로젝트를 불러올 수 없습니다.</p></div>`;
    }
  }

  renderTabs();
  renderList();
}
