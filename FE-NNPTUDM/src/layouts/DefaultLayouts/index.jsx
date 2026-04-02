import { Outlet, useLocation } from "react-router";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import FilterModal from "./FilterModal";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProducts,
  getBrands,
  getCategories,
} from "@/services/Product/ProductService";
import TopBar from "./Topbar";
import useTrackRouteHistory from "@/hooks/useTrackRouteHistory";
import { getMyCart } from "@/services/Cart/CartService";
import { SlidersHorizontal } from "lucide-react";

export default function DefaultLayout() {
  useTrackRouteHistory();
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [sort, setSort] = useState("Mặc định");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isProductDetail = location.pathname.startsWith("/product/");
  const isCart = location.pathname.startsWith("/cart");
  const isCheckout = location.pathname.startsWith("/checkout");
  const isProfile = location.pathname.startsWith("/profile");
  const isOrder = location.pathname.startsWith("/orders");
  const isBlog = location.pathname.startsWith("/blog");

  const shouldHideLayoutExtras =
    isHome || isProductDetail || isCart || isCheckout || isProfile || isOrder || isBlog;

  const user = useSelector((state) => state.auth.user);
  const isValidUser = (user) => !!user?.id;

  const allProducts = useSelector((state) => state.product.products);
  const categories = useSelector((state) => state.product.categories);
  const brands = useSelector((state) => state.product.brands);

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setTimeout(() => root.classList.remove("transitioning"), 350);
  }, [isDark]);

  useEffect(() => {
    if (isValidUser(user)) dispatch(getMyCart());
  }, [dispatch, user]);

  useEffect(() => {
    if (!allProducts?.data?.length) dispatch(getAllProducts());
    if (!categories?.length) dispatch(getCategories());
    if (!brands?.length) dispatch(getBrands());
  }, [dispatch, allProducts, categories, brands]);

  return (
    <div className="w-full min-h-screen overflow-x-hidden flex flex-col bg-background text-text-color">
      <Header
        isHome={isHome}
        isDark={isDark}
        onToggleTheme={() => setIsDark((v) => !v)}
      />

      <main className="w-full flex-1">
        {!shouldHideLayoutExtras && (
          <div className="flex justify-center pt-24">
            <h1 className="text-2xl font-semibold mb-2">{title}</h1>
          </div>
        )}

        <div
          className={`flex justify-center gap-10 ${
            shouldHideLayoutExtras ? "" : "py-24 px-4 md:px-24"
          }`}
        >
          {/* Sidebar — ẩn trên mobile */}
          {!shouldHideLayoutExtras && (
            <div className="hidden lg:block">
              <Sidebar />
            </div>
          )}

          <div className="w-full">
            {/* TopBar — ẩn trên mobile */}
            {!shouldHideLayoutExtras && (
              <>
                <div className="hidden lg:block">
                  <TopBar title={title} sort={sort} setSort={setSort} />
                </div>

                {/* Nút lọc — chỉ hiện trên mobile */}
                <div className="flex lg:hidden justify-end mb-4">
                  <button
                    onClick={() => setFilterModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-luxury-border text-sm font-medium text-luxury-text hover:bg-luxury-surface-2 transition-colors"
                  >
                    <SlidersHorizontal size={16} className="text-luxury-gold" />
                    Lọc & Sắp xếp
                  </button>
                </div>
              </>
            )}

            <Outlet context={{ user, setTitle, sort, setSort }} />
          </div>
        </div>
      </main>

      {!isProfile && <Footer />}

      {/* Filter Modal — chỉ dùng trên mobile */}
      {!shouldHideLayoutExtras && (
        <FilterModal
          open={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          sort={sort}
          setSort={setSort}
        />
      )}
    </div>
  );
}
