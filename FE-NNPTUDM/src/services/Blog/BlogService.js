const BASE_URL = import.meta.env.VITE_BASE_API;

export async function fetchBlogPosts({ page = 1, limit = 9 } = {}) {
  const sp = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const res = await fetch(`${BASE_URL}posts?${sp.toString()}`);
  return res.json();
}

export async function fetchBlogPostById(id) {
  const res = await fetch(`${BASE_URL}posts/${id}`);
  return res.json();
}