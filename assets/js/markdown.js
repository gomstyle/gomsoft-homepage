function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: raw.trim() };
  }

  const meta = {};
  match[1].split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        meta[key] = JSON.parse(value.replace(/'/g, '"'));
      } catch {
        meta[key] = [];
      }
    } else {
      meta[key] = value;
    }
  });

  return { meta, body: match[2].trim() };
}

function renderMarkdownSimple(text) {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/(?:^|\n\n)([^\n<]+)(?=\n\n|$)/g, (m, p) => {
    if (p.trim().startsWith("<")) return m;
    return `\n\n<p>${p.trim()}</p>`;
  });
  html = html.replace(/\n\n/g, "\n");

  const blocks = html.split(/\n{2,}/).filter(Boolean);
  return blocks
    .map((b) => {
      const t = b.trim();
      if (t.startsWith("<h") || t.startsWith("<p") || t.startsWith("<img") || t.startsWith("<a")) return t;
      if (t.includes("<img") || t.includes("<a href")) return t;
      return `<p>${t.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
}

function buildFrontmatter(data) {
  const images = Array.isArray(data.images) ? data.images : [];
  const lines = [
    "---",
    `title: "${escapeYaml(data.title)}"`,
    `date: "${data.date}"`,
    `summary: "${escapeYaml(data.summary)}"`,
    `thumbnail: "${data.thumbnail || ""}"`,
    `images: ${JSON.stringify(images)}`,
    `link: "${data.link || ""}"`,
    "---",
    "",
  ];
  return lines.join("\n") + (data.body || "");
}

function escapeYaml(str) {
  return String(str || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
