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
