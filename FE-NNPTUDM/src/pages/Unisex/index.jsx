import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router";

import formatPrice from "@/utils/formatPrice";
import Pagination from "@/utils/Pagination";
import sortProducts from "@/utils/sortProducts";
import { paginate } from "@/utils/paginate";

export default function Unisex() {
  const { setTitle, sort } = useOutletContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const categories = useSelector((state) => state.product.categories);
  const allProducts = useSelector((state) => state.product.products);

  const page = Number(searchParams.get("page")) || 1;
  const limit = 6;

  useEffect(() => {
    setTitle("Nước hoa unisex");
  }, [setTitle]);

  const categoryPath = location.pathname.replace("/", "");

  const currentCategory = useMemo(() => {
    return categories?.find((item) => item.slug === categoryPath);
  }, [categories, categoryPath]);

  const unisexProducts = useMemo(() => {
    if (!Array.isArray(allProducts?.data) || !currentCategory?.id) return [];

    return allProducts.data.filter(
      (item) => item.categoryId === currentCategory.id,
    );
  }, [allProducts, currentCategory]);

  const sortedProducts = useMemo(() => {
    return sortProducts(unisexProducts, sort);
  }, [unisexProducts, sort]);

  const { data: paginatedProducts, pagination } = useMemo(() => {
    return paginate(sortedProducts, page, limit);
  }, [sortedProducts, page, limit]);

  return (
    <div className="flex-1 w-full px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="product-grid-luxury grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        {paginatedProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            className="product-card-luxury group overflow-hidden rounded-2xl"
          >
            <div className="product-card-image-wrap relative h-56 sm:h-64 md:h-72 lg:h-80">
              <div className="product-card-image-bg" />
              <img
                src={`${import.meta.env.VITE_BASE_URL_IMAGE}${product?.images?.[0]?.url}`}
                alt={product.name}
                className="product-card-image h-full w-full object-cover"
              />
              <div className="product-card-glow" />
            </div>

            <div className="product-card-body p-4 sm:p-5 lg:p-6">
              <p className="product-card-tag text-xs sm:text-sm">
                Unisex Collection
              </p>

              <h3 className="product-card-title line-clamp-2 text-base sm:text-lg lg:text-xl">
                {product.name}
              </h3>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div>
                  <p className="product-card-price-label text-xs sm:text-sm">
                    Giá từ
                  </p>
                  <p className="product-card-price text-sm sm:text-base lg:text-lg">
                    {formatPrice(product?.variants?.[0]?.price)}
                  </p>
                </div>

                <button className="product-card-button w-full sm:w-auto text-sm sm:text-base px-4 py-2">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 sm:mt-10">
        <Pagination
          pagination={pagination}
          page={page}
          setSearchParams={setSearchParams}
        />
      </div>
    </div>
  );
}
