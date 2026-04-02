import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Sparkles,
  User,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";

import { logout as logoutApi } from "@/services/Auth/AuthService";
import SmartNavLink from "@/components/SmartNavLink";
import { logout } from "@/features/Auth/AuthSlice";
import { toast } from "sonner";
import { getMyCart } from "@/services/Cart/CartService";

export default function Header({ isHome, isDark, onToggleTheme }) {
  const dispatch = useDispatch();
  const [scrolled, setScrolled] = useState(false);
  const [show, setShow] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [mobileBrandOpen, setMobileBrandOpen] = useState(false);

  const lastScrollRef = useRef(0);

  const categories = useSelector((state) => state.product.categories);
  const brands = useSelector((state) => state.product.brands);
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart.cart);

  const isAdmin = user?.role === "ADMIN";

  const cartCount = cart?.items?.length || 0;

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      throw new Error(error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      toast.success("Đăng xuất thành công");
      dispatch(logout());
      dispatch(getMyCart())
      setMobileOpen(false);
    }
  };

  // Đóng drawer khi resize lên desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Khóa scroll body khi drawer mở
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const lastScroll = lastScrollRef.current;
      const diff = Math.abs(currentScroll - lastScroll);

      setScrolled(currentScroll >= 100);

      if (diff < 6) {
        lastScrollRef.current = currentScroll;
        return;
      }

      if (currentScroll > lastScroll && currentScroll > 100) {
        setShow(false);
      } else if (currentScroll < lastScroll) {
        setShow(true);
      }

      lastScrollRef.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50
          transform will-change-transform
          transition-[transform,background-color,box-shadow,border-color,color,backdrop-filter] duration-500 ease-out
          ${scrolled ? "header-shell header-shell-scrolled" : isHome ? "header-shell header-shell-home" : "header-shell header-shell-default"}
          ${show ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-8 xl:px-10">
          {/* Logo */}
          <SmartNavLink to="/" className="flex shrink-0 items-center gap-3">
            <div className="header-logo-wrap">
              <img
                className="w-12 md:w-14"
                src="/Logo/LogoBAB.png"
                alt="BAB Store"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs uppercase tracking-[0.35em] text-luxury-gold">
                BAB Store
              </p>
              <p className="text-sm text-inherit/80">Luxury Perfume Boutique</p>
            </div>
          </SmartNavLink>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9 text-sm">
            <SmartNavLink to="/" className="header-nav-link">
              Trang chủ
            </SmartNavLink>

            <SmartNavLink to="/blog" className="header-nav-link">
              Blog
            </SmartNavLink>

            <HoverCard openDelay={50} closeDelay={80}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="header-nav-link header-nav-trigger"
                >
                  <span>Bộ sưu tập nước hoa</span>
                  <ChevronDown size={16} className="header-nav-icon" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent
                align="start"
                sideOffset={18}
                className="header-dropdown w-70 p-3"
              >
                <div className="mb-2 flex items-center gap-2 px-2">
                  <Sparkles size={14} className="text-luxury-gold" />
                  <p className="text-xs uppercase tracking-[0.25em] text-luxury-text-soft">
                    Danh mục
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {categories.length > 0 &&
                    categories.map((category) => (
                      <SmartNavLink
                        to={`/${category.slug}`}
                        key={category.id}
                        className="header-dropdown-link"
                      >
                        <div>
                          <p className="font-medium text-luxury-text">
                            Nước hoa {category.name}
                          </p>
                          <p className="text-xs text-luxury-text-soft">
                            Khám phá bộ sưu tập {category.name.toLowerCase()}
                          </p>
                        </div>
                        <span className="header-dropdown-arrow">→</span>
                      </SmartNavLink>
                    ))}
                </div>
              </HoverCardContent>
            </HoverCard>

            <HoverCard openDelay={50} closeDelay={80}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="header-nav-link header-nav-trigger"
                >
                  <span>Thương hiệu</span>
                  <ChevronDown size={16} className="header-nav-icon" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent
                align="start"
                sideOffset={18}
                className="header-dropdown w-70 p-3"
              >
                <div className="mb-2 flex items-center gap-2 px-2">
                  <Sparkles size={14} className="text-luxury-gold" />
                  <p className="text-xs uppercase tracking-[0.25em] text-luxury-text-soft">
                    Brands
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {brands.length > 0 &&
                    brands.map((brand) => (
                      <SmartNavLink
                        to={`/brand/${brand.slug}`}
                        key={brand.id}
                        className="header-dropdown-link"
                      >
                        <div>
                          <p className="font-medium text-luxury-text">
                            {brand.name}
                          </p>
                          <p className="text-xs text-luxury-text-soft">
                            Khám phá mùi hương đặc trưng
                          </p>
                        </div>
                        <span className="header-dropdown-arrow">→</span>
                      </SmartNavLink>
                    ))}
                </div>
              </HoverCardContent>
            </HoverCard>
          </nav>

          {/* Right icons */}
          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <button
              type="button"
              className="header-icon-button"
              onClick={onToggleTheme}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <SmartNavLink to="/cart" className="relative">
              <button
                type="button"
                className="header-info-chip relative"
                aria-label="Giỏ hàng"
              >
                <ShoppingCart size={16} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                    {cartCount}
                  </span>
                )}
              </button>
            </SmartNavLink>

            {/* Desktop: login / avatar */}
            {!user || Object.keys(user).length === 0 ? (
              <SmartNavLink to="/login" className="hidden lg:block">
                <Button className="header-login-button cursor-pointer">
                  <User size={16} />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Button>
              </SmartNavLink>
            ) : (
              <HoverCard openDelay={50} closeDelay={80}>
                <HoverCardTrigger asChild>
                  <button className="header-avatar-button hidden lg:block">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="header-dropdown w-55 p-3">
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">{user.name}</p>
                    <SmartNavLink
                      to="/profile"
                      className="header-dropdown-link cursor-pointer"
                    >
                      Trang cá nhân
                    </SmartNavLink>
                    <SmartNavLink
                      to="/orders"
                      className="header-dropdown-link cursor-pointer"
                    >
                      Đơn hàng
                    </SmartNavLink>
                    {isAdmin && (
                      <SmartNavLink
                        to="/admin/home"
                        className="header-dropdown-link cursor-pointer text-luxury-gold"
                      >
                        Quản trị
                      </SmartNavLink>
                    )}
                    <button
                      className="header-dropdown-link cursor-pointer text-red-500 text-left"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}

            {/* Hamburger — mobile only */}
            <button
              type="button"
              className="header-icon-button lg:hidden"
              style={{ display: window.innerWidth >= 1024 ? "none" : "flex" }}
              aria-label="Mở menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-[280px] max-w-[85vw]
    bg-[var(--card)] shadow-2xl flex flex-col
    transform transition-transform duration-300 ease-out
    ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <img className="w-8" src="/Logo/LogoBAB.png" alt="BAB Store" />
            <p className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-semibold">
              BAB Store
            </p>
          </div>
          <button
            type="button"
            className="header-icon-button"
            aria-label="Đóng menu"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
          <SmartNavLink
            to="/"
            className="px-3 py-3 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Trang chủ
          </SmartNavLink>
          <SmartNavLink
            to="/blog"
            className="px-3 py-3 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Blog
          </SmartNavLink>

          {/* Bộ sưu tập — accordion */}
          <div>
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              onClick={() => setMobileCategoryOpen((v) => !v)}
            >
              <span>Bộ sưu tập nước hoa</span>
              <ChevronDown
                size={16}
                className={`text-[var(--muted-foreground)] transition-transform duration-200 ${mobileCategoryOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobileCategoryOpen && (
              <div className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-[var(--border)] pl-3">
                {categories.map((category) => (
                  <SmartNavLink
                    to={`/${category.slug}`}
                    key={category.id}
                    className="flex items-center gap-2 px-2 py-2.5 rounded-md text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <ChevronRight
                      size={13}
                      className="text-luxury-gold shrink-0"
                    />
                    Nước hoa {category.name}
                  </SmartNavLink>
                ))}
              </div>
            )}
          </div>

          {/* Thương hiệu — accordion */}
          <div>
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              onClick={() => setMobileBrandOpen((v) => !v)}
            >
              <span>Thương hiệu</span>
              <ChevronDown
                size={16}
                className={`text-[var(--muted-foreground)] transition-transform duration-200 ${mobileBrandOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobileBrandOpen && (
              <div className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-[var(--border)] pl-3">
                {brands.map((brand) => (
                  <SmartNavLink
                    to={`/brand/${brand.slug}`}
                    key={brand.id}
                    className="flex items-center gap-2 px-2 py-2.5 rounded-md text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <ChevronRight
                      size={13}
                      className="text-luxury-gold shrink-0"
                    />
                    {brand.name}
                  </SmartNavLink>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer footer — user */}
        <div className="border-t border-[var(--border)] px-4 py-4">
          {!user || Object.keys(user).length === 0 ? (
            <SmartNavLink to="/login" onClick={() => setMobileOpen(false)}>
              <Button className="header-login-button w-full cursor-pointer justify-center">
                <User size={16} />
                Đăng nhập
              </Button>
            </SmartNavLink>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 px-1 mb-2">
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover border border-[var(--border)]"
                />
                <p className="font-medium text-sm text-[var(--foreground)]">
                  {user.name}
                </p>
              </div>
              <SmartNavLink
                to="/profile"
                className="px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Trang cá nhân
              </SmartNavLink>
              <SmartNavLink
                to="/orders"
                className="px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Đơn hàng
              </SmartNavLink>
              {isAdmin && (
                <SmartNavLink
                  to="/admin/home"
                  className="px-3 py-2.5 rounded-lg text-sm text-luxury-gold hover:bg-[var(--muted)] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Quản trị
                </SmartNavLink>
              )}
              <button
                className="px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left w-full"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
