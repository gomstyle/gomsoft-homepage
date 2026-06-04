const CMS_SESSION_KEY = "gomsoft_cms_session";
const CMS_LOCAL_KEY = "gomsoft_cms_local";
const CMS_LEGACY_KEY = "gomsoft_cms_settings";
const CMS_REMEMBER_MS = 7 * 24 * 60 * 60 * 1000;

let _cmsSettingsCache = null;

function clearCmsSettings() {
  sessionStorage.removeItem(CMS_SESSION_KEY);
  localStorage.removeItem(CMS_LOCAL_KEY);
  localStorage.removeItem(CMS_LEGACY_KEY);
  _cmsSettingsCache = null;
}

function readStoredBundle() {
  try {
    const localRaw = localStorage.getItem(CMS_LOCAL_KEY);
    if (localRaw) {
      const bundle = JSON.parse(localRaw);
      if (bundle.expiresAt && Date.now() > bundle.expiresAt) {
        localStorage.removeItem(CMS_LOCAL_KEY);
      } else if (bundle.settings?.token) {
        return { settings: bundle.settings, persist: "local" };
      }
    }
  } catch {
    localStorage.removeItem(CMS_LOCAL_KEY);
  }

  try {
    const sessionRaw = sessionStorage.getItem(CMS_SESSION_KEY);
    if (sessionRaw) {
      const bundle = JSON.parse(sessionRaw);
      if (bundle.settings?.token) {
        return { settings: bundle.settings, persist: "session" };
      }
    }
  } catch {
    sessionStorage.removeItem(CMS_SESSION_KEY);
  }

  try {
    const legacy = localStorage.getItem(CMS_LEGACY_KEY);
    if (legacy) {
      const settings = JSON.parse(legacy);
      localStorage.removeItem(CMS_LEGACY_KEY);
      if (settings.token) {
        saveCmsSettings(settings, !!settings.remember);
        return getCmsSettings();
      }
    }
  } catch {
    localStorage.removeItem(CMS_LEGACY_KEY);
  }

  return null;
}

function getCmsSettings() {
  if (_cmsSettingsCache?.token) return _cmsSettingsCache;
  const stored = readStoredBundle();
  if (stored) {
    _cmsSettingsCache = stored.settings;
    return _cmsSettingsCache;
  }
  return {};
}

function saveCmsSettings(settings, remember) {
  clearCmsSettings();
  const payload = {
    owner: settings.owner,
    repo: settings.repo,
    branch: settings.branch || "main",
    token: settings.token,
    githubLogin: settings.githubLogin || "",
    githubName: settings.githubName || "",
    remember: !!remember,
  };
  _cmsSettingsCache = payload;

  if (remember) {
    localStorage.setItem(
      CMS_LOCAL_KEY,
      JSON.stringify({
        expiresAt: Date.now() + CMS_REMEMBER_MS,
        settings: payload,
      })
    );
  } else {
    sessionStorage.setItem(CMS_SESSION_KEY, JSON.stringify({ settings: payload }));
  }
}

function getGithubDisplayName(settings) {
  if (!settings) return "";
  if (settings.githubName) return `${settings.githubName} (@${settings.githubLogin})`;
  if (settings.githubLogin) return `@${settings.githubLogin}`;
  return "";
}

async function githubRequest(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || `GitHub API 오류 (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

async function verifyGithubCmsAccess({ owner, repo, branch, token }) {
  if (!token) throw new Error("GitHub Token을 입력해 주세요.");

  const user = await githubRequest("https://api.github.com/user", token);
  await githubRequest(`https://api.github.com/repos/${owner}/${repo}`, token);

  try {
    await githubRequest(
      `https://api.github.com/repos/${owner}/${repo}/contents/data/posts.json?ref=${encodeURIComponent(branch || "main")}`,
      token
    );
  } catch (e) {
    if (String(e.message).includes("Not Found")) {
      /* posts.json 없음 — 읽기 권한은 있을 수 있음 */
    } else {
      throw e;
    }
  }

  return {
    githubLogin: user.login,
    githubName: user.name || user.login,
  };
}

function githubApi(path, options = {}) {
  const settings = getCmsSettings();
  const { owner, repo, token } = settings;
  if (!token) throw new Error("GitHub Personal Access Token이 필요합니다.");

  const base = `https://api.github.com/repos/${owner}/${repo}`;
  return githubRequest(`${base}${path}`, token, options);
}

async function getFileContent(filePath) {
  const { branch } = getCmsSettings();
  const data = await githubApi(`/contents/${filePath}?ref=${branch}`);
  const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ""))));
  return { content, sha: data.sha };
}

async function putFileContent(filePath, content, message, sha) {
  const { branch } = getCmsSettings();
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
  };
  if (sha) body.sha = sha;
  return githubApi(`/contents/${filePath}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function deleteFile(filePath, message, sha) {
  const { branch } = getCmsSettings();
  return githubApi(`/contents/${filePath}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sha, branch }),
  });
}

async function loadPostsIndexFromGithub() {
  try {
    const { content } = await getFileContent("data/posts.json");
    return JSON.parse(content);
  } catch (e) {
    if (String(e.message).includes("Not Found")) return { posts: [] };
    throw e;
  }
}

async function savePostsIndex(index) {
  const json = JSON.stringify(index, null, 2);
  let sha;
  try {
    const existing = await getFileContent("data/posts.json");
    sha = existing.sha;
  } catch {
    sha = undefined;
  }
  await putFileContent("data/posts.json", json, "CMS: posts index 업데이트", sha);
}

function slugify(title, date) {
  const base = title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u3131-\uD79D-]+/g, "")
    .slice(0, 40);
  return `${date}-${base || "post"}`;
}

function upsertPostInIndex(index, entry) {
  const posts = index.posts || [];
  const i = posts.findIndex((p) => p.slug === entry.slug && p.category === entry.category);
  if (i >= 0) posts[i] = entry;
  else posts.push(entry);
  index.posts = posts;
  return index;
}

function removePostFromIndex(index, category, slug) {
  index.posts = (index.posts || []).filter((p) => !(p.category === category && p.slug === slug));
  return index;
}

async function publishPost(formData, existingSlug) {
  const projectType = formData.projectType || "app";
  const category = categoryFromProjectType(projectType);
  const date = formData.date || new Date().toISOString().slice(0, 10);
  const slug = existingSlug || slugify(formData.title, date);
  const mdPath = `content/${category}/${slug}.md`;

  if (existingSlug && formData.previousCategory && formData.previousCategory !== category) {
    try {
      const oldPath = `content/${formData.previousCategory}/${existingSlug}.md`;
      const { sha } = await getFileContent(oldPath);
      await deleteFile(oldPath, `CMS: 유형 변경으로 ${existingSlug} 이동`, sha);
      const index = await loadPostsIndexFromGithub();
      removePostFromIndex(index, formData.previousCategory, existingSlug);
      await savePostsIndex(index);
    } catch {
      /* 이전 파일 없음 */
    }
  }

  const links = formData.links || [];
  const md = buildFrontmatter({
    title: formData.title,
    date,
    summary: formData.summary,
    thumbnail: formData.thumbnail,
    images: formData.images,
    status: formData.status,
    link: links[0] ? links[0].url : "",
    links,
    projectType,
    body: formData.body,
  });

  let mdSha;
  try {
    const existing = await getFileContent(mdPath);
    mdSha = existing.sha;
  } catch {
    mdSha = undefined;
  }

  await putFileContent(mdPath, md, `CMS: ${formData.title} 저장`, mdSha);

  const index = await loadPostsIndexFromGithub();
  upsertPostInIndex(index, {
    id: `${category}-${slug}`,
    category,
    projectType,
    slug,
    title: formData.title,
    summary: formData.summary,
    thumbnail: formData.thumbnail,
    status: formData.status || "",
    links,
    date,
    path: mdPath,
  });
  await savePostsIndex(index);
  if (typeof invalidatePostsCache === "function") invalidatePostsCache();
  return slug;
}

async function removePost(category, slug) {
  const mdPath = `content/${category}/${slug}.md`;
  const { sha } = await getFileContent(mdPath);
  await deleteFile(mdPath, `CMS: ${slug} 삭제`, sha);

  const index = await loadPostsIndexFromGithub();
  removePostFromIndex(index, category, slug);
  await savePostsIndex(index);
  if (typeof invalidatePostsCache === "function") invalidatePostsCache();
}

async function uploadImageToRepo(file, projectType) {
  const category = categoryFromProjectType(projectType || "app");
  const ext = file.name.split(".").pop() || "png";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `assets/uploads/${category}/${name}`;

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const base64 = btoa(binary);

  const { branch } = getCmsSettings();
  await githubApi(`/contents/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `CMS: 이미지 업로드 ${name}`,
      content: base64,
      branch,
    }),
  });

  return `/${path}`;
}
