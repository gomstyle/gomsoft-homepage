/** 프로젝트 상세 미디어 갤러리 (이미지·동영상) */
const PROJECT_MEDIA_IMAGE_EXT = ["jpg", "jpeg", "png", "webp"];
const PROJECT_MEDIA_VIDEO_EXT = ["mp4", "webm"];

function mediaExtensionFromUrl(url) {
  const clean = String(url || "").split("?")[0].split("#")[0];
  const parts = clean.split(".");
  return (parts[parts.length - 1] || "").toLowerCase();
}

function mediaKindFromUrl(url) {
  const ext = mediaExtensionFromUrl(url);
  if (PROJECT_MEDIA_IMAGE_EXT.includes(ext)) return "image";
  if (PROJECT_MEDIA_VIDEO_EXT.includes(ext)) return "video";
  return null;
}

function mediaKindFromFile(file) {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (PROJECT_MEDIA_IMAGE_EXT.includes(ext)) return "image";
  if (PROJECT_MEDIA_VIDEO_EXT.includes(ext)) return "video";
  return null;
}

function normalizeMediaItem(item) {
  if (!item) return null;
  if (typeof item === "string") {
    const url = item.trim();
    if (!url) return null;
    const type = mediaKindFromUrl(url);
    if (!type) return null;
    return { type, url, caption: "" };
  }
  if (typeof item === "object" && item.url) {
    const url = String(item.url).trim();
    if (!url) return null;
    const type = item.type === "video" || item.type === "image" ? item.type : mediaKindFromUrl(url);
    if (!type) return null;
    return {
      type,
      url,
      caption: String(item.caption || "").trim(),
    };
  }
  return null;
}

function parseProjectMedia(meta) {
  const raw = meta?.media;
  let list = [];
  if (Array.isArray(raw)) {
    list = raw.map(normalizeMediaItem).filter(Boolean);
  }
  if (!list.length) {
    const legacy = Array.isArray(meta?.images) ? meta.images : meta?.images ? [meta.images] : [];
    list = legacy.map(normalizeMediaItem).filter(Boolean);
  }
  return list;
}

function mediaListToTextareaValue(media) {
  return media.map((m) => m.url).join("\n");
}

function mediaListFromTextarea(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url) => normalizeMediaItem(url))
    .filter(Boolean);
}

function renderProjectMediaGallery(media, projectTitle) {
  if (!media.length) return "";
  const title = projectTitle ? `${projectTitle} 미디어` : "프로젝트 미디어";
  const items = media
    .map((item, index) => {
      const safeUrl = String(item.url).replace(/"/g, "&quot;");
      const caption = item.caption
        ? `<figcaption class="post-media-caption">${escapeHtmlMedia(item.caption)}</figcaption>`
        : "";
      if (item.type === "video") {
        return `
        <figure class="post-media-item post-media-item--video">
          <div class="post-media-video-wrap">
            <video src="${safeUrl}" autoplay muted loop playsinline preload="metadata" aria-label="${escapeHtmlMedia(
          item.caption || `동영상 ${index + 1}`
        )}"></video>
          </div>
          ${caption}
        </figure>`;
      }
      return `
        <figure class="post-media-item post-media-item--image">
          <img src="${safeUrl}" alt="${escapeHtmlMedia(item.caption || `${title} ${index + 1}`)}" width="600" loading="lazy" decoding="async">
          ${caption}
        </figure>`;
    })
    .join("");

  return `
    <section class="post-media-gallery" aria-label="프로젝트 미디어 갤러리">
      <div class="post-media-grid">${items}</div>
    </section>`;
}

function escapeHtmlMedia(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
