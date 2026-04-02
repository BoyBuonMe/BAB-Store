import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Calendar, Loader2 } from "lucide-react";
import { fetchBlogPosts } from "@/services/Blog/BlogService";
import { getFakeAuthor } from "@/utils/fakeAuthor";
import { toast } from "sonner";

function truncate(text, max = 160) {
  if (!text) return "";
  const t = String(text).replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return String(iso);
  }
}

function getErrorMessage(err) {
  const e = err?.response?.data?.error;
  if (typeof e === "string") return e;
  return e?.message || err?.message || "Không tải được danh sách bài viết";
}

export default function BlogPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBlogPosts({ page, limit });
      console.log(res);
      
      setPosts(res?.posts ?? []);
      setTotalPages(res?.data?.pagination?.total_pages ?? 1);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 pt-28">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Blog nước hoa</h1>
        <p className="mt-2 text-[var(--muted-foreground)] max-w-2xl mx-auto">
          Mẹo chọn mùi, phong cách và kiến thức về hương — cập nhật thường xuyên.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-luxury-gold" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-12 text-center text-[var(--muted-foreground)]">
          Chưa có bài viết nào.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const author = getFakeAuthor(post.id);
              return (
                <article
                  key={String(post.id)}
                  className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {post.image && (
                    <Link to={`/blog/${post.id}`} className="aspect-[16/9] overflow-hidden bg-[var(--muted)]">
                      <img
                        src={post.image}
                        alt=""
                        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      />
                    </Link>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <Link to={`/blog/${post.id}`}>
                      <h2 className="text-lg font-semibold text-[var(--foreground)] line-clamp-2 group-hover:text-luxury-gold transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)] line-clamp-3 flex-1">
                      {truncate(post.description)}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{ backgroundColor: author.color }}
                        >
                          {author.initials}
                        </span>
                        <span className="truncate font-medium text-[var(--foreground)]">
                          {author.name}
                        </span>
                      </div>
                      <span className="flex shrink-0 items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                    <Link
                      to={`/blog/${post.id}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-luxury-gold/40 bg-transparent px-4 py-2.5 text-sm font-medium hover:bg-luxury-gold/10 transition-colors"
                    >
                      Đọc tiếp
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)] disabled:opacity-50 cursor-pointer"
              >
                Trước
              </button>
              <span className="text-sm text-[var(--muted-foreground)]">
                Trang {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)] disabled:opacity-50 cursor-pointer"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
