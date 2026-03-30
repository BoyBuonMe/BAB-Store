import { ChevronDown, Sparkles } from "lucide-react";

export default function TopBar({ title, sort, setSort }) {
  return (
    <div className="product-page-topbar">
      <div>
        <div className="product-page-badge">
          <Sparkles size={14} />
          Danh mục nổi bật
        </div>

        <h1 className="product-page-title">{title}</h1>
        <p className="product-page-subtitle">
          Những mùi hương mạnh mẽ, lịch lãm và đầy chiều sâu dành cho phong cách
          nam tính hiện đại.
        </p>
      </div>

      <div className="product-sort-wrap">
        <label className="product-sort-label">Sắp xếp</label>

        <div className="product-sort-select-wrap">
          <select
            className="product-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option>Mặc định</option>
            <option>Giá tăng</option>
            <option>Giá giảm</option>
          </select>
          <ChevronDown size={16} className="product-sort-chevron" />
        </div>
      </div>
    </div>
  );
}
