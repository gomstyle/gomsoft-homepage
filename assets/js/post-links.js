function parseLinksText(text) {
  return String(text || "")
    .split("\n")
    .map((line) => {
      const i = line.indexOf("|");
      if (i === -1) return null;
      const label = line.slice(0, i).trim();
      const url = line.slice(i + 1).trim();
      return label && url ? { label, url } : null;
    })
    .filter(Boolean);
}

function linksToText(links) {
  if (!Array.isArray(links) || !links.length) return "";
  return links.map((l) => `${l.label}|${l.url}`).join("\n");
}

function parseProjectLinks(meta) {
  if (Array.isArray(meta.links)) return meta.links.filter((l) => l && l.url);
  if (typeof meta.links === "string" && meta.links.startsWith("[")) {
    try {
      const arr = JSON.parse(meta.links.replace(/'/g, '"'));
      if (Array.isArray(arr)) return arr;
    } catch {
      /* ignore */
    }
  }
  if (meta.link) return [{ label: "관련 링크", url: meta.link }];
  return [];
}

function isOperatingStatus(status) {
  if (!status) return false;
  return String(status).includes("운영");
}

function hasPlayStoreLink(post) {
  const links = Array.isArray(post.links) ? post.links : [];
  return links.some((l) => l && /play\.google\.com/i.test(String(l.url)));
}

/** 출시 서비스: status「운영」+ 앱은 Play 링크, 미디어·현장은 실서비스 운영 */
function isLaunchedService(post) {
  const p = normalizePost(post);
  const status = String(p.status || "");
  if (!status.includes("운영")) return false;
  if (p.projectType === "app") return hasPlayStoreLink(p);
  if (p.projectType === "media" || p.projectType === "welding") return true;
  return false;
}

/** 운영 프로젝트: 현재 진행 중(운영·준비·리뉴얼) */
function isOperatingProject(post) {
  const status = String(post.status || "");
  if (!status) return false;
  return status.includes("운영") || status.includes("준비") || status.includes("리뉴얼");
}

function computeAboutStats(allPosts) {
  const all = allPosts.map(normalizePost);
  const types = new Set(all.map((p) => p.projectType).filter(Boolean));
  return {
    launched: all.filter(isLaunchedService).length,
    operating: all.filter(isOperatingProject).length,
    areas: types.size,
    founder: 1,
  };
}

function computeProjectStats(allPosts, filteredPosts) {
  const all = allPosts.map(normalizePost);
  const types = new Set(all.map((p) => p.projectType).filter(Boolean));
  return {
    total: filteredPosts.length,
    totalAll: all.length,
    operating: all.filter((p) => isOperatingStatus(p.status)).length,
    areas: types.size,
    founder: 1,
  };
}
