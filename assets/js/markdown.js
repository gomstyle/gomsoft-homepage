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
    if ((value.startsWith("[") && value.endsWith("]")) || (value.startsWith("{") && value.endsWith("}"))) {
      try {
        meta[key] = JSON.parse(value);
      } catch {
        try {
          meta[key] = JSON.parse(value.replace(/'/g, '"'));
        } catch {
          meta[key] = value.startsWith("[") ? [] : value;
        }
      }
    } else {
      meta[key] = value;
    }
  });

  return { meta, body: match[2].trim() };
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function applyInlineMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" width="600" loading="lazy" decoding="async">'
  );
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>");
  return html;
}

function renderMarkdownSimple(text) {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraphLines = [];
  let listItems = [];

  function flushParagraph() {
    if (!paragraphLines.length) return;
    const inner = paragraphLines.map((line) => applyInlineMarkdown(line)).join("<br>\n");
    blocks.push(`<p>${inner}</p>`);
    paragraphLines = [];
  }

  function flushList() {
    if (!listItems.length) return;
    blocks.push(`<ul>${listItems.map((item) => `<li>${applyInlineMarkdown(item)}</li>`).join("")}</ul>`);
    listItems = [];
  }

  function flushAll() {
    flushParagraph();
    flushList();
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushAll();
      continue;
    }

    const h3 = trimmed.match(/^### (.+)$/);
    if (h3) {
      flushAll();
      blocks.push(`<h3>${applyInlineMarkdown(h3[1])}</h3>`);
      continue;
    }

    const h2 = trimmed.match(/^## (.+)$/);
    if (h2) {
      flushAll();
      blocks.push(`<h2>${applyInlineMarkdown(h2[1])}</h2>`);
      continue;
    }

    const h1 = trimmed.match(/^# (.+)$/);
    if (h1) {
      flushAll();
      blocks.push(`<h2>${applyInlineMarkdown(h1[1])}</h2>`);
      continue;
    }

    const listItem = trimmed.match(/^[-*] (.+)$/);
    if (listItem) {
      flushParagraph();
      listItems.push(listItem[1]);
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushAll();
  return blocks.join("\n");
}

function buildFrontmatter(data) {
  const media = Array.isArray(data.media) ? data.media : [];
  const imageUrls = media.filter((m) => m.type === "image").map((m) => m.url);
  const lines = [
    "---",
    `title: "${escapeYaml(data.title)}"`,
    `date: "${data.date}"`,
    `summary: "${escapeYaml(data.summary)}"`,
    `thumbnail: "${data.thumbnail || ""}"`,
    `coverImage: "${data.coverImage || ""}"`,
    `media: ${JSON.stringify(media)}`,
    `images: ${JSON.stringify(imageUrls)}`,
    `status: "${escapeYaml(data.status || "")}"`,
    `link: "${data.link || (data.links && data.links[0] ? data.links[0].url : "")}"`,
    `links: ${JSON.stringify(data.links || [])}`,
    `projectType: "${data.projectType || "app"}"`,
    "---",
    "",
  ];
  return lines.join("\n") + (data.body || "");
}

function escapeYaml(str) {
  return String(str || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
