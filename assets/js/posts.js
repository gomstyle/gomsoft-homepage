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

function getPostsByCategory(posts, category) {
  return (posts.posts || [])
    .filter((p) => p.category === category)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
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
  return `/post.html?category=${encodeURIComponent(post.category)}&slug=${encodeURIComponent(post.slug)}`;
}

function renderPostCards(posts, container) {
  if (!posts.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>등록된 게시글이 없습니다.</p>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="post-grid">${posts
    .map((post) => {
      const thumb = post.thumbnail || "/gomsoft_logo.png";
      return `
      <a class="post-card" href="${postDetailUrl(post)}">
        <div class="post-card-thumb">
          <img src="${thumb}" alt="" loading="lazy">
        </div>
        <div class="post-card-body">
          <span class="post-card-date">${formatDate(post.date)}</span>
          <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
          <p class="post-card-summary">${escapeHtml(post.summary || "")}</p>
        </div>
      </a>`;
    })
    .join("")}</div>`;
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

async function renderPostDetail(category, slug) {
  const raw = await loadPostMarkdown(category, slug);
  const { meta, body } = parseFrontmatter(raw);
  const title = meta.title || slug;
  const date = meta.date || "";
  const images = Array.isArray(meta.images) ? meta.images : meta.images ? [meta.images] : [];
  const link = meta.link || "";

  setPageMeta({
    title,
    description: meta.summary || GOMSOFT_CONFIG.headline,
    path: `/post.html?category=${category}&slug=${slug}`,
    image: meta.thumbnail,
  });

  document.getElementById("postTitle").textContent = title;
  document.getElementById("postDate").textContent = formatDate(date);

  const contentEl = document.getElementById("postContent");
  contentEl.innerHTML = renderMarkdownSimple(body);

  const gallery = document.getElementById("postGallery");
  if (images.length && gallery) {
    gallery.innerHTML = images
      .filter(Boolean)
      .map((src) => `<img src="${src}" alt="" loading="lazy">`)
      .join("");
    gallery.className = "post-gallery";
  }

  const linkWrap = document.getElementById("postLink");
  if (link && linkWrap) {
    linkWrap.innerHTML = `<a href="${link}" class="btn btn-primary" target="_blank" rel="noopener">관련 링크 보기</a>`;
    linkWrap.className = "post-external-link";
  }
}

async function initCategoryList(category) {
  const data = await loadPostsIndex();
  const posts = getPostsByCategory(data, category);
  const grid = document.getElementById("postList");
  if (grid) renderPostCards(posts, grid);
}
