import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { fetchBlogPostById } from "@/services/Blog/BlogService";
import { getFakeAuthor } from "@/utils/fakeAuthor";
import { toast } from "sonner";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso);
  }
}

function getErrorMessage(err) {
  const e = err?.response?.data?.error;
  if (typeof e === "string") return e;
  return e?.message || err?.message || "Không tải được bài viết";
}

export default function BlogDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetchBlogPostById(id);
        const data = res?.data ?? res;
        if (!cancelled) setPost(data);
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err));
          setPost(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const author = post ? getFakeAuthor(post.id) : null;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-24">
        <Loader2 className="h-10 w-10 animate-spin text-luxury-gold" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 pt-28 text-center">
        <p className="text-[var(--muted-foreground)]">Không tìm thấy bài viết.</p>
        <Link
          to="/blog"
          className="mt-4 inline-flex text-luxury-gold hover:underline"
        >
          Về danh sách Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-10 pt-28">
      <Link
        to="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-luxury-gold transition-colors"
      >
        <ArrowLeft size={18} />
        Quay lại Blog
      </Link>

      {post.image && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--muted)]">
          <img
            src={post.image}
            alt=""
            className="w-full max-h-[420px] object-cover"
          />
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] leading-tight">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-4 text-lg text-[var(--muted-foreground)] leading-relaxed">
            {post.description}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
          {author && (
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white shadow"
                style={{ backgroundColor: author.color }}
              >
                {author.initials}
              </span>
              <div>
                <p className="font-medium text-[var(--foreground)]">{author.name}</p>
                <p className="text-xs">Biên tập viên</p>
              </div>
            </div>
          )}
          <span className="flex items-center gap-2">
            <Calendar size={16} />
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          {post.minRead != null && (
            <span>· khoảng {post.minRead} phút đọc</span>
          )}
        </div>
      </header>

      <div
        className="blog-markdown max-w-none space-y-4 text-[var(--foreground)] leading-relaxed
          [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-3
          [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3
          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2
          [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
          [&_li]:mb-1 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-[var(--muted)] [&_code]:px-1"
      >
        <ReactMarkdown>{post.content || ""}</ReactMarkdown>
      </div>
    </article>
  );
}
