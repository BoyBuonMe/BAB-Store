import { useEffect, useMemo } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router";
import { useSelector } from "react-redux";

import formatPrice from "@/utils/formatPrice";
import Pagination from "@/utils/Pagination";
import sortProducts from "@/utils/sortProducts";
import { paginate } from "@/utils/paginate";

export default function Products() {
  const { setTitle, sort } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const allProducts = useSelector((state) => state.product.products);
  const categories = useSelector((state) => state.product.categories);
  const brands = useSelector((state) => state.product.brands);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 6;

  const categorySlug = searchParams.get("category") || "";
  const brandParams = searchParams.get("brands") || "";
  const min = Number(searchParams.get("min")) || 0;
  const max = Number(searchParams.get("max")) || Infinity;

  useEffect(() => {
    setTitle("Sản phẩm");
  }, [setTitle]);

  const selectedCategory = useMemo(() => {
    if (!categorySlug) return null;
    return categories?.find((item) => item.slug === categorySlug);
  }, [categories, categorySlug]);

  const selectedBrandIds = useMemo(() => {
    if (!brandParams) return [];

    const brandSlugs = brandParams.split(",").map((item) => item.trim());

    return (
      brands
        ?.filter((brand) => brandSlugs.includes(brand.slug))
        .map((brand) => brand.id) || []
    );
  }, [brands, brandParams]);

  const productList = useMemo(() => {
    return Array.isArray(allProducts?.data) ? allProducts.data : [];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
      const matchCategory = selectedCategory
        ? product.categoryId === selectedCategory.id
        : true;

      const matchBrand = selectedBrandIds.length
        ? selectedBrandIds.includes(product.brandId)
        : true;

      const price = product?.variants?.[0]?.price || 0;
      const matchPrice = price >= min && price <= max;

      return matchCategory && matchBrand && matchPrice;
    });
  }, [productList, selectedCategory, selectedBrandIds, min, max]);

  const sortedProducts = useMemo(() => {
    return sortProducts(filteredProducts, sort);
  }, [filteredProducts, sort]);

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
                Filtered Collection
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
