import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useMemo, useState } from "react";

import PriceRange from "@/utils/priceRange";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FilterModal({ open, onClose, sort, setSort }) {
  const navigate = useNavigate();

  const categories = useSelector((state) => state.product.categories);
  const brands = useSelector((state) => state.product.brands);

  const [brandKeyword, setBrandKeyword] = useState("");
  const [resetSignal, setResetSignal] = useState(0);

  const [localFilters, setLocalFilters] = useState({
    category: null, // slug
    brands: [], // slug[]
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
    setLocalFilters((prev) => ({ ...prev, price: { min, max } }));
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
    onClose();
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-zinc-900">
        <DialogHeader className="sticky top-0 z-10 bg-white dark:bg-zinc-900 px-5 pt-5 pb-4 border-b border-luxury-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base">
              <SlidersHorizontal size={18} className="text-luxury-gold" />
              Bộ lọc & Sắp xếp
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={18} />
            </button>
          </div>
        </DialogHeader>

        <div className="px-5 py-4 flex flex-col gap-5">
          {/* Sort */}
          <section>
            <h3 className="filter-section-title mb-3">Sắp xếp theo giá</h3>
            <div className="relative">
              <select
                className="product-sort-select w-full"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option>Mặc định</option>
                <option>Giá tăng</option>
                <option>Giá giảm</option>
              </select>
              <ChevronDown
                size={16}
                className="product-sort-chevron pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              />
            </div>
          </section>

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
                      name="category-modal"
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
        </div>

        {/* Actions */}
        <div className="filter-action-row px-5 pb-5">
          <button onClick={handleFilter} className="filter-primary-button">
            Áp dụng bộ lọc
          </button>
          <button onClick={handleReset} className="filter-secondary-button">
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
