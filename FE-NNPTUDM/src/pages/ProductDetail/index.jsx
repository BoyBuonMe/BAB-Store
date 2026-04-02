import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/services/Cart/CartService";
import { toast } from "sonner";

// ─── Fake review generators ───────────────────────────────────────────────────

const FIRST_NAMES = [
  "Minh", "Lan", "Hùng", "Linh", "Tuấn", "Mai", "Đức", "Hà", "Phong", "Ngọc",
  "Khoa", "Trang", "Bảo", "Yến", "Thiện", "Cẩm", "Quân", "Thảo", "Duy", "Kim",
];
const LAST_NAMES = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ",
];
const REVIEW_TEXTS = [
  "Sản phẩm rất thơm, mùi hương lâu phai, dùng được cả ngày mà vẫn còn nguyên mùi. Đóng gói cẩn thận, giao hàng nhanh. Sẽ quay lại mua lần sau!",
  "Mình đã dùng nhiều loại nước hoa khác nhau nhưng cái này thật sự ấn tượng. Mùi sang trọng, không bị ngột ngạt. Rất đáng tiền!",
  "Lần đầu mua nước hoa online mà hài lòng quá. Đúng như mô tả, mùi hương rất dịu nhẹ và tinh tế. Cảm ơn shop!",
  "Chai thuỷ tinh dày dặn, thiết kế đẹp, mùi hương phù hợp đi làm lẫn dự tiệc. Tôi đã mua 2 chai cho mình và 1 chai làm quà.",
  "Hương lưu rất lâu, khoảng 8-10 tiếng mà vẫn còn mùi nhẹ. Shop tư vấn nhiệt tình, gói hàng kỹ. 5 sao không hối hận!",
  "Mùi hương đúng như hình ảnh mô tả, ngọt ngào nhưng không quá gắt. Thích hợp cho nữ đi làm văn phòng. Sẽ ủng hộ shop dài dài.",
  "Đặt tối, sáng hôm sau đã nhận được hàng. Nước hoa thơm lắm, mình đã nhận được nhiều lời khen từ đồng nghiệp. Cực kỳ hài lòng!",
  "Shop uy tín, hàng chuẩn 100%. Mùi hương nam tính, mạnh mẽ nhưng không khó chịu. Dùng 1 lần là ghiền ngay.",
  "Packaging rất sang, tặng người thân rất phù hợp. Mùi nước hoa quyến rũ, lưu hương tốt. Đây sẽ là shop yêu thích của mình.",
  "Mình là khách hàng thân thiết của shop, lần nào mua cũng chất lượng. Lần này thêm nước hoa mới vào bộ sưu tập. Tuyệt vời!",
];

const AVATAR_COLORS = [
  "#7c3aed", "#0891b2", "#059669", "#dc2626",
  "#d97706", "#db2777", "#2563eb", "#65a30d",
];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateReviews(productId, count = 8) {
  const rand = seededRandom((productId || 1) * 31337);
  return Array.from({ length: count }, (_, i) => {
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const rating = +(4.5 + rand() * 0.5).toFixed(1);
    const text = REVIEW_TEXTS[Math.floor(rand() * REVIEW_TEXTS.length)];
    const daysAgo = Math.floor(rand() * 30) + 1;
    const liked = Math.floor(rand() * 20) + 1;
    return {
      id: i + 1,
      name: `${lastName} ${firstName}`,
      avatar: firstName[0] + lastName[0],
      rating,
      text,
      daysAgo,
      liked,
    };
  });
}

function randomFakeName() {
  const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return { name: `${ln} ${fn}`, avatar: fn[0] + ln[0] };
}

// ─── Star component ────────────────────────────────────────────────────────────

function Stars({ rating, size = 14 }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ display: "inline-flex", gap: 1, alignItems: "center" }}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < full;
        const isHalf = !filled && i === full && half;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24">
            {isHalf ? (
              <>
                <defs>
                  <linearGradient id={`hg-${i}`}>
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#e5e7eb" />
                  </linearGradient>
                </defs>
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  fill={`url(#hg-${i})`}
                  stroke="#f59e0b"
                  strokeWidth="0.5"
                />
              </>
            ) : (
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill={filled ? "#f59e0b" : "#e5e7eb"}
                stroke={filled ? "#f59e0b" : "#d1d5db"}
                strokeWidth="0.5"
              />
            )}
          </svg>
        );
      })}
    </span>
  );
}

// ─── ReviewSection component ───────────────────────────────────────────────────

function ReviewSection({ productId }) {
  const baseReviews = useMemo(() => generateReviews(productId), [productId]);
  const [extraReviews, setExtraReviews] = useState([]);
  const [visible, setVisible] = useState(4);
  const [inputText, setInputText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reviews = useMemo(() => [...extraReviews, ...baseReviews], [extraReviews, baseReviews]);

  const avgRating = (
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  ).toFixed(1);

  const handleSubmit = () => {
    if (!inputText.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const { name, avatar } = randomFakeName();
      const rating = +(4.5 + Math.random() * 0.5).toFixed(1);
      const newReview = {
        id: Date.now(),
        name,
        avatar,
        rating,
        text: inputText.trim(),
        daysAgo: 0,
        liked: 0,
        isNew: true,
      };

      setExtraReviews((prev) => [newReview, ...prev]);
      setInputText("");
      setVisible((v) => v + 1);
      setSubmitting(false);
      toast.success("Đã gửi đánh giá của bạn!");
    }, 600);
  };

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900">Đánh giá sản phẩm</h2>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-amber-500">{avgRating}</span>
          <div>
            <Stars rating={parseFloat(avgRating)} size={13} />
            <p className="text-xs text-gray-400 mt-0.5">{reviews.length} đánh giá</p>
          </div>
        </div>
      </div>

      {/* Rating bar summary */}
      <div className="mb-5 space-y-1.5">
        {[5, 4].map((star) => {
          const count = reviews.filter((r) => Math.round(r.rating) === star).length;
          const pct = Math.round((count / reviews.length) * 100);
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-4">{star}</span>
              <svg width="11" height="11" viewBox="0 0 24 24">
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  fill="#f59e0b"
                />
              </svg>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Input gửi đánh giá */}
      <div className="mb-6 bg-gray-50 rounded-xl border border-gray-100 p-4">
        <p className="text-sm font-semibold text-gray-800 mb-2">Viết đánh giá của bạn</p>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
          rows={3}
          className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none resize-none focus:border-black transition placeholder:text-gray-400"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:opacity-80 transition disabled:opacity-50"
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </div>

      {/* Review cards */}
      <div className="space-y-3">
        {reviews.slice(0, visible).map((r, idx) => (
          <div
            key={r.id}
            className="bg-gray-50 rounded-xl p-4 border border-gray-100"
            style={{
              animation: `fadeSlideIn 0.35s ease both`,
              animationDelay: `${idx * 0.04}s`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
              >
                {r.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-800">{r.name}</span>
                  <span className="text-xs text-gray-400">
                    {r.daysAgo === 0 ? "Vừa xong" : `${r.daysAgo} ngày trước`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Stars rating={r.rating} size={12} />
                  <span className="text-xs text-amber-500 font-medium">{r.rating}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.text}</p>
                {r.liked > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                    <span>Hữu ích ({r.liked})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more */}
      {visible < reviews.length && (
        <button
          onClick={() => setVisible((v) => Math.min(v + 4, reviews.length))}
          className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-black hover:text-black transition"
        >
          Xem thêm đánh giá ({reviews.length - visible} còn lại)
        </button>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const products = useSelector((state) => state.product.products?.data || []);

  // ✅ Fix: useMemo luôn được gọi trước mọi return có điều kiện
  const product = products.find((item) => item.id === Number(id));
  const variants = product?.variants || product?.productVariants || [];

  const capacityOptions = useMemo(() => {
    if (!variants.length) return [];
    return variants.map((variant, index) => ({
      id: variant.id ?? variant._id,
      label: variant.capacity || variant.size || `${index + 1}0ml`,
      price: variant.price || 0,
      quantity: Number(variant.quantity || 0),
    }));
  }, [variants]);

  const fakeReviews = useMemo(() => generateReviews(Number(id)), [id]);

  const avgRating = (
    fakeReviews.reduce((s, r) => s + r.rating, 0) / fakeReviews.length
  ).toFixed(1);

  const [selectedCapacity, setSelectedCapacity] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const currentVariant = selectedCapacity || capacityOptions[0] || null;
  const remainQuantity = Number(currentVariant?.quantity || 0);

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("vi-VN") + "₫";

  const handleDecrease = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleIncrease = () => {
    if (remainQuantity <= 0) { toast.error("Sản phẩm đã hết hàng"); return; }
    if (quantity >= remainQuantity) {
      toast.error(`Số lượng vượt quá tồn kho. Chỉ còn ${remainQuantity} sản phẩm`);
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = async () => {
    try {
      if (!user || Object.keys(user).length === 0) { toast.error("Vui lòng đăng nhập"); return; }
      if (!currentVariant?.id) { toast.error("Không tìm thấy biến thể sản phẩm"); return; }
      if (remainQuantity <= 0) { toast.error("Sản phẩm đã hết hàng"); return; }
      if (quantity > remainQuantity) {
        toast.error(`Số lượng vượt quá tồn kho. Chỉ còn ${remainQuantity} sản phẩm`);
        return;
      }
      await dispatch(addToCart({ productVariantId: currentVariant.id, quantity })).unwrap();
      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Có lỗi xảy ra");
    }
  };

  const handleBuyNow = () => {
    if (!user || Object.keys(user).length === 0) { navigate("/login"); toast.error("Vui lòng đăng nhập"); return; }
    if (!currentVariant?.id) { toast.error("Không tìm thấy biến thể sản phẩm"); return; }
    if (remainQuantity <= 0) { toast.error("Sản phẩm đã hết hàng"); return; }
    if (quantity > remainQuantity) {
      toast.error(`Số lượng vượt quá tồn kho. Chỉ còn ${remainQuantity} sản phẩm`);
      return;
    }
    navigate("/checkout", {
      state: { checkoutItems: [{ product, productVariant: currentVariant, quantity }] },
    });
  };

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {/* Product info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Image */}
          <div className="bg-gray-50 p-4 lg:p-5">
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
              <img
                src={`${import.meta.env.VITE_BASE_URL_IMAGE}${product?.images?.[0]?.url}`}
                alt={product?.name}
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
          </div>

          {/* Right - Info */}
          <div className="p-5 lg:p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-2">Chi tiết sản phẩm</p>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">
                {product?.name}
              </h1>

              <div className="flex items-center gap-2 mt-2">
                <Stars rating={parseFloat(avgRating)} size={14} />
                <span className="text-sm font-semibold text-amber-500">{avgRating}</span>
                <span className="text-xs text-gray-400">({fakeReviews.length} đánh giá)</span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Năm sản xuất:{" "}
                <span className="font-medium text-gray-700">
                  {product?.year || product?.manufactureYear || "2024"}
                </span>
              </p>

              <div className="mt-4">
                <p className="text-2xl font-bold text-red-500">
                  {formatPrice(currentVariant?.price)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Giá đã bao gồm VAT</p>
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Chọn dung tích</h3>
                <div className="flex flex-wrap gap-2">
                  {capacityOptions.slice(0, 3).map((option, index) => {
                    const isActive = currentVariant?.id === option.id;
                    return (
                      <button
                        key={option.id ?? `option-${index}`}
                        onClick={() => setSelectedCapacity(option)}
                        className={`px-3 py-1.5 rounded-full border text-sm font-medium transition ${
                          isActive
                            ? "bg-black text-white border-black shadow-sm"
                            : "bg-white text-gray-700 border-gray-300 hover:border-black hover:text-black"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Số lượng</h3>
                <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button onClick={handleDecrease} className="w-9 h-9 text-base font-semibold hover:bg-gray-100 transition">-</button>
                  <div className="w-12 h-9 flex items-center justify-center border-x border-gray-300 font-medium text-sm">{quantity}</div>
                  <button onClick={handleIncrease} className="w-9 h-9 text-base font-semibold hover:bg-gray-100 transition">+</button>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Mô tả sản phẩm</h3>
                <p className="text-sm text-gray-600 leading-6">
                  {product?.description || "Chưa có mô tả cho sản phẩm này."}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition"
                >
                  Mua ngay
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 border border-black text-black py-2.5 rounded-lg text-sm font-semibold hover:bg-black hover:text-white transition"
                >
                  Thêm vào giỏ hàng
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-gray-600">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">🚚 Giao hàng toàn quốc</div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">🔒 Thanh toán an toàn</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="px-5 lg:px-6 pb-6">
          <ReviewSection productId={Number(id)} />
        </div>
      </div>
    </div>
  );
}