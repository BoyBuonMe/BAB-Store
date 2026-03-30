import useTrackRouteHistory from "@/hooks/useTrackRouteHistory";
import { Outlet, useNavigate } from "react-router";

export default function AuthLayouts() {
  const navigate = useNavigate();
  useTrackRouteHistory();
  return (
    <div className="auth-layout min-h-dvh w-full">
      {/* Left showcase */}
      <div className="auth-showcase hidden lg:flex">
        <div className="auth-showcase-bg" />
        <div className="auth-showcase-grid" />

        <div className="auth-showcase-content">
          <div className="auth-brand-chip">BAB Store • Luxury Perfume</div>

          <div onClick={() => navigate("/", {replace: true})} className="auth-logo-wrap cursor-pointer">
            <img src="/Logo/LogoBAB.png" alt="BAB Store" className="auth-logo" />
          </div>

          <div className="max-w-xl">
            <h1 className="auth-showcase-title">
              Tinh hoa hương thơm cho phong cách sống đẳng cấp
            </h1>

            <p className="auth-showcase-text">
              Khám phá thế giới nước hoa được tuyển chọn dành cho những cá tính
              riêng biệt. Thanh lịch, tinh tế và giàu cảm xúc.
            </p>
          </div>

          <div className="auth-feature-list">
            <div className="auth-feature-card">
              <p className="auth-feature-number">150+</p>
              <p className="auth-feature-label">Mùi hương chọn lọc</p>
            </div>

            <div className="auth-feature-card">
              <p className="auth-feature-number">10K+</p>
              <p className="auth-feature-label">Khách hàng tin chọn</p>
            </div>

            <div className="auth-feature-card">
              <p className="auth-feature-number">4.9</p>
              <p className="auth-feature-label">Đánh giá trung bình</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form area */}
      <div className="auth-form-side">
        <Outlet />
      </div>
    </div>
  );
}