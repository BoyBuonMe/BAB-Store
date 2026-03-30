import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/services/Cart/CartService";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  const products = useSelector((state) => state.product.products?.data || []);

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

  const [selectedCapacity, setSelectedCapacity] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const currentVariant = selectedCapacity || capacityOptions[0] || null;
  const remainQuantity = Number(currentVariant?.quantity || 0);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + "₫";
  };

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    if (remainQuantity <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    if (quantity >= remainQuantity) {
      toast.error(
        `Số lượng vượt quá tồn kho. Chỉ còn ${remainQuantity} sản phẩm`,
      );
      return;
    }

    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = async () => {
    try {
      if (!user || Object.keys(user).length === 0) {
        toast.error("Vui lòng đăng nhập");
        return;
      }

      if (!currentVariant?.id) {
        toast.error("Không tìm thấy biến thể sản phẩm");
        return;
      }

      if (remainQuantity <= 0) {
        toast.error("Sản phẩm đã hết hàng");
        return;
      }

      if (quantity > remainQuantity) {
        toast.error(
          `Số lượng vượt quá tồn kho. Chỉ còn ${remainQuantity} sản phẩm`,
        );
        return;
      }

      await dispatch(
        addToCart({
          productVariantId: currentVariant.id,
          quantity,
        }),
      ).unwrap();

      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Có lỗi xảy ra");
    }
  };

  const handleBuyNow = () => {
    if (!user || Object.keys(user).length === 0) {
      navigate("/login");
      toast.error("Vui lòng đăng nhập");
      return;
    }

    // check cơ bản giống addToCart
    if (!currentVariant?.id) {
      toast.error("Không tìm thấy biến thể sản phẩm");
      return;
    }

    if (remainQuantity <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    if (quantity > remainQuantity) {
      toast.error(
        `Số lượng vượt quá tồn kho. Chỉ còn ${remainQuantity} sản phẩm`,
      );
      return;
    }

    navigate("/checkout", {
      state: {
        checkoutItems: [
          {
            product,
            productVariant: currentVariant,
            quantity,
          },
        ],
      },
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {/* Left - Image */}
        <div className="bg-gray-50 p-4 lg:p-5">
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
            <img
              src={`http://127.0.0.1:3001${product?.images?.[0]?.url}`}
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
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Chọn dung tích
              </h3>

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
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Số lượng
              </h3>

              <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={handleDecrease}
                  className="w-9 h-9 text-base font-semibold hover:bg-gray-100 transition"
                >
                  -
                </button>

                <div className="w-12 h-9 flex items-center justify-center border-x border-gray-300 font-medium text-sm">
                  {quantity}
                </div>

                <button
                  onClick={handleIncrease}
                  className="w-9 h-9 text-base font-semibold hover:bg-gray-100 transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Mô tả sản phẩm
              </h3>
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
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                🚚 Giao hàng toàn quốc
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                🔒 Thanh toán an toàn
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
