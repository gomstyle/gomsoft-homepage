const PROJECT_TYPES = {
  app: { label: "App", category: "apps" },
  media: { label: "Media", category: "media" },
  welding: { label: "Welding", category: "welding" },
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

function normalizePost(post) {
  const projectType = post.projectType || projectTypeFromCategory(post.category);
  const category = post.category || categoryFromProjectType(projectType);
  return { ...post, projectType, category };
}
