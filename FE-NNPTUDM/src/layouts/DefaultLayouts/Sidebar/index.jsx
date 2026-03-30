import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useMemo, useState } from "react";

import PriceRange from "@/utils/priceRange";

export default function Sidebar() {
  const navigate = useNavigate();

  const categories = useSelector((state) => state.product.categories);
  const brands = useSelector((state) => state.product.brands);

  const [brandKeyword, setBrandKeyword] = useState("");
  const [resetSignal, setResetSignal] = useState(0);

  const [localFilters, setLocalFilters] = useState({
    category: null, // lưu slug
    brands: [], // lưu slug[]
    price: { min: 0, max: 17500000 },
  });

  const filteredBrands = useMemo(() => {
    if (!brandKeyword.trim()) return brands;

    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(brandKeyword.toLowerCase()),
    );
  }, [brands, brandKeyword]);

  const handleCategory = (slug) => {
    setLocalFilters((prev) => ({
      ...prev,
      category: prev.category === slug ? null : slug,
    }));
  };

  const handleBrand = (slug) => {
    setLocalFilters((prev) => {
      const exists = prev.brands.includes(slug);
      return {
        ...prev,
        brands: exists
          ? prev.brands.filter((s) => s !== slug)
          : [...prev.brands, slug],
      };
    });
  };

  const handlePrice = (min, max) => {
    setLocalFilters((prev) => ({
      ...prev,
      price: {
        min,
        max,
      },
    }));
  };

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (localFilters.category) params.append("category", localFilters.category);
    if (localFilters.brands.length)
      params.append("brands", localFilters.brands.join(","));
    params.append("min", localFilters.price.min);
    params.append("max", localFilters.price.max);
    params.append("page", 1);
    params.append("limit", 6);
    navigate(`/products?${params}`);
  };

  const handleReset = () => {
    setLocalFilters({
      category: null,
      brands: [],
      price: { min: 0, max: 17500000 },
    });
    setBrandKeyword("");
    setResetSignal((prev) => prev + 1);
  };

  return (
    <aside className="sidebar-filter-card w-[320px] shrink-0">
      <div className="sidebar-filter-header">
        <div className="sidebar-filter-icon-wrap">
          <SlidersHorizontal size={18} />
        </div>

        <div>
          <h2 className="sidebar-filter-title">Bộ lọc sản phẩm</h2>
          <p className="sidebar-filter-subtitle">
            Tinh chỉnh để tìm mùi hương phù hợp
          </p>
        </div>
      </div>

      {/* Category */}
      <section className="filter-section">
        <div className="filter-section-head">
          <h3 className="filter-section-title">Bộ sưu tập nước hoa</h3>
        </div>

        <div className="filter-option-list">
          {categories.map((category) => (
            <label key={category.id} className="filter-option-item">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="category"
                  checked={localFilters.category === category.slug}
                  onChange={() => handleCategory(category.slug)}
                  className="filter-radio"
                />
                <span className="filter-option-text">
                  Nước hoa {category.name}
                </span>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Brand */}
      <section className="filter-section">
        <div className="filter-section-head">
          <h3 className="filter-section-title">Thương hiệu</h3>
        </div>

        <div className="filter-search-wrap">
          <Search size={17} className="filter-search-icon" />
          <input
            value={brandKeyword}
            onChange={(e) => setBrandKeyword(e.target.value)}
            placeholder="Tìm thương hiệu..."
            className="filter-search-input"
          />
        </div>

        <div className="filter-brand-list">
          {filteredBrands.map((brand) => (
            <label key={brand.id} className="filter-option-item">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localFilters.brands.includes(brand.slug)}
                  onChange={() => handleBrand(brand.slug)}
                  className="filter-checkbox"
                />
                <span className="filter-option-text">{brand.name}</span>
              </div>
            </label>
          ))}

          {filteredBrands.length === 0 && (
            <div className="filter-empty-state">
              Không tìm thấy thương hiệu phù hợp
            </div>
          )}
        </div>
      </section>

      {/* Price */}
      <section className="filter-section">
        <div className="filter-section-head">
          <h3 className="filter-section-title">Khoảng giá</h3>
          <span className="filter-price-badge">VND</span>
        </div>

        <div className="mt-5">
          <PriceRange
            key={resetSignal}
            resetSignal={resetSignal}
            price={localFilters.price}
            onChange={handlePrice}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="filter-action-row">
        <button onClick={handleFilter} className="filter-primary-button">
          Áp dụng bộ lọc
        </button>

        <button onClick={handleReset} className="filter-secondary-button">
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </aside>
  );
}
