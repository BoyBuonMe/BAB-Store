import { ChevronDown, Sparkles, ArrowRight, Star } from "lucide-react";
import { useEffect } from "react";
import { NavLink } from "react-router";
import { toast } from "sonner";

const collections = [
  {
    title: "Nam",
    subtitle: "Mạnh mẽ, lịch lãm, cuốn hút",
    image: "/ImageDemo/image-demo-1.jpg",
    to: "men-perfume",
  },
  {
    title: "Nữ",
    subtitle: "Tinh tế, mềm mại, sang trọng",
    image: "/ImageDemo/image-demo-2.jpg",
    to: "women-perfume",
  },
  {
    title: "Unisex",
    subtitle: "Hiện đại, cá tính, tự do",
    image: "/ImageDemo/image-demo-3.jpg",
    to: "unisex-perfume",
  },
];

export default function Home() {
  useEffect(() => {
    const toastData = sessionStorage.getItem("redirect_toast");

    if (toastData) {
      const parsed = JSON.parse(toastData);

      toast[parsed.type || "info"](parsed.message);

      sessionStorage.removeItem("redirect_toast");
    }
  }, []);
  return (
    <div className="w-full bg-background text-foreground">
      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 hero-grid opacity-40" />
        <div className="absolute top-[-120px] left-[-120px] h-[320px] w-[320px] rounded-full bg-luxury-aurora blur-[100px]" />
        <div className="absolute bottom-[-160px] right-[-120px] h-[360px] w-[360px] rounded-full bg-luxury-gold-glow blur-[120px]" />
        <div className="absolute left-1/2 top-24 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-luxury-glow/60 blur-[140px]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-20 md:px-10">
          <div className="grid w-full items-center gap-12 lg:grid-cols-2">
            {/* Left content */}
            <div className="animate-fade-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-luxury-border/80 bg-luxury-card px-4 py-2 text-sm text-luxury-text-soft backdrop-blur-xl">
                <Sparkles size={16} className="text-luxury-gold" />
                Tinh hoa hương thơm dành cho dấu ấn cá nhân
              </div>

              <h1 className="text-5xl font-light leading-tight tracking-[0.12em] text-luxury-text sm:text-6xl lg:text-7xl">
                BAB STORE
              </h1>

              <h2 className="mt-4 text-2xl font-medium text-luxury-gold sm:text-3xl">
                Luxe • Art • Nostalgia
              </h2>

              <p className="mt-8 max-w-2xl text-base leading-8 text-luxury-text-soft sm:text-lg">
                BAB Store mang đến những trải nghiệm hương thơm độc đáo, sang
                trọng và giàu cảm xúc. Mỗi mùi hương không chỉ để sử dụng, mà là
                một cách thể hiện phong cách sống, chiều sâu cá tính và những ký
                ức rất riêng.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a href="#collections" className="premium-button">
                  Khám phá bộ sưu tập
                  <ArrowRight size={18} />
                </a>

                <button className="secondary-luxury-button">
                  Câu chuyện thương hiệu
                </button>
              </div>

              <div className="mt-12 grid max-w-xl grid-cols-3 gap-4">
                <div className="stat-card">
                  <p className="stat-number">150+</p>
                  <p className="stat-label">Mùi hương chọn lọc</p>
                </div>
                <div className="stat-card">
                  <p className="stat-number">10K+</p>
                  <p className="stat-label">Khách hàng yêu thích</p>
                </div>
                <div className="stat-card">
                  <p className="stat-number">4.9</p>
                  <p className="stat-label">Đánh giá trung bình</p>
                </div>
              </div>
            </div>

            {/* Right showcase */}
            <div className="relative animate-float-slow">
              <div className="hero-frame">
                <img
                  src="/ImageDemo/image-demo-1.jpg"
                  alt="BAB Store luxury perfume"
                  className="hero-main-image"
                />

                <div className="hero-image-overlay" />

                <div className="hero-badge hero-badge-top">
                  <Star size={14} className="fill-current" />
                  Signature collection
                </div>

                <div className="hero-badge hero-badge-bottom">
                  Thiết kế hương thơm mang tính cá nhân
                </div>
              </div>

              <div className="floating-mini-card left-[-18px] top-[18%] hidden md:block">
                <p className="text-sm text-luxury-text-soft">Best seller</p>
                <p className="mt-1 text-lg font-medium text-luxury-text">
                  Oud & Amber
                </p>
              </div>

              <div className="floating-mini-card bottom-[8%] right-[-18px] hidden md:block">
                <p className="text-sm text-luxury-text-soft">New arrival</p>
                <p className="mt-1 text-lg font-medium text-luxury-text">
                  White Musk
                </p>
              </div>
            </div>
          </div>
        </div>

        <a
          href="#collections"
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-sm text-luxury-text-soft transition hover:text-luxury-gold"
        >
          Cuộn xuống
          <ChevronDown size={18} className="animate-bounce" />
        </a>
      </section>

      {/* COLLECTION */}
      <section
        id="collections"
        className="luxury-section relative py-24 md:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="section-badge">Bộ sưu tập nổi bật</p>
            <h2 className="mt-4 text-4xl font-medium text-luxury-text md:text-5xl">
              Khám phá thế giới nước hoa
            </h2>
            <p className="mt-5 text-lg leading-8 text-luxury-text-soft">
              Mỗi bộ sưu tập được tuyển chọn để phù hợp với phong cách, cảm xúc
              và cá tính khác nhau.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 xl:grid-cols-3">
            {collections.map((item) => (
              <NavLink
                key={item.title}
                to={item.to}
                className="premium-card group"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="premium-img"
                />
                <div className="premium-overlay" />

                <div className="premium-shine" />

                <div className="premium-content">
                  <div>
                    <p className="mb-3 text-sm uppercase tracking-[0.3em] text-white/70">
                      Collection
                    </p>
                    <h3 className="text-3xl font-medium">{item.title}</h3>
                    <p className="mt-3 max-w-65 text-sm leading-7 text-white/80">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm tracking-[0.2em] text-white/80">
                      Xem ngay
                    </span>
                    <div className="premium-circle">→</div>
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="relative py-24 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:px-10 lg:grid-cols-2">
          <div className="story-card">
            <p className="section-badge">Vì sao là BAB Store?</p>
            <h3 className="mt-4 text-3xl font-medium text-luxury-text md:text-4xl">
              Hương thơm không chỉ để toả hương, mà để kể câu chuyện riêng
            </h3>
            <p className="mt-6 text-lg leading-8 text-luxury-text-soft">
              Chúng tôi lựa chọn những mùi hương có chiều sâu, có cá tính và có
              cảm xúc. Từ sự thanh lịch tối giản đến những nốt hương đậm chất
              nghệ thuật, BAB Store luôn hướng tới trải nghiệm tinh tế và khác
              biệt.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="tag-luxury">Luxury Selection</span>
              <span className="tag-luxury">Signature Scents</span>
              <span className="tag-luxury">Modern Elegance</span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="info-card sm:translate-y-6">
              <h4 className="info-title">Tinh tuyển</h4>
              <p className="info-text">
                Chọn lọc những mùi hương nổi bật và có bản sắc.
              </p>
            </div>

            <div className="info-card">
              <h4 className="info-title">Thẩm mỹ</h4>
              <p className="info-text">
                Giao diện, hình ảnh và trải nghiệm đều hướng đến sự cao cấp.
              </p>
            </div>

            <div className="info-card">
              <h4 className="info-title">Cá nhân hoá</h4>
              <p className="info-text">
                Gợi ý mùi hương phù hợp với phong cách và cảm xúc riêng.
              </p>
            </div>

            <div className="info-card sm:translate-y-6">
              <h4 className="info-title">Cảm xúc</h4>
              <p className="info-text">
                Mỗi chai nước hoa là một câu chuyện được lưu lại bằng hương.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
