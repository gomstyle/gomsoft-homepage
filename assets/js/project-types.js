const PROJECT_TYPES = {
  app: { label: "App", category: "apps", color: "app" },
  media: { label: "Media", category: "media", color: "media" },
  welding: { label: "Welding", category: "welding", color: "welding" },
};

const CATEGORY_TO_TYPE = {
  apps: "app",
  media: "media",
  welding: "welding",
};

function categoryFromProjectType(projectType) {
  return PROJECT_TYPES[projectType]?.category || "apps";
}

function projectTypeFromCategory(category) {
  return CATEGORY_TO_TYPE[category] || "app";
}

function projectTypeLabel(projectType) {
  return PROJECT_TYPES[projectType]?.label || projectType;
}

function projectTypeBadgeClass(projectType) {
  const color = PROJECT_TYPES[projectType]?.color || "app";
  return `badge-${color}`;
}

function normalizePost(post) {
  const projectType = post.projectType || projectTypeFromCategory(post.category);
  const category = post.category || categoryFromProjectType(projectType);
  return { ...post, projectType, category };
}

function getPostStatusOverlayLabel(status) {
  const s = String(status || "");
  if (s.includes("리뉴얼")) return "리뉴얼 중";
  if (s.includes("준비") && !s.includes("운영")) return "준비 중";
  return "";
}
