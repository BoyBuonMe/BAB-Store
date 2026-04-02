import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { checkoutOrder } from "@/services/Order/OrderService";
import { getMyCart } from "@/services/Cart/CartService";
import http from "@/utils/http";
import provincesData from "@/mocks/provinces.json";
import wardsByCityData from "@/mocks/wards-by-city.json";
// import { getMyCart } from "@/services/Cart/CartService"; // nếu bạn có action này thì bật lên

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Đưa location.state vào local state để có thể chủ động cập nhật UI
  const [checkoutStateItems, setCheckoutStateItems] = useState(
    location.state?.checkoutItems || [],
  );

  const [address, setAddress] = useState("");
  const [cities, setCities] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedCityCode, setSelectedCityCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Đồng bộ local state nếu route state thay đổi
  useEffect(() => {
    setCheckoutStateItems(location.state?.checkoutItems || []);
  }, [location.state]);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + "₫";
  };

  const getItemPrice = (item) => {
    return Number(item?.productVariant?.price || 0);
  };

  const getItemQuantity = (item) => {
    return Number(item?.quantity || 1);
  };

  const getItemSubtotal = (item) => {
    return getItemPrice(item) * getItemQuantity(item);
  };

  const totalQuantity = useMemo(() => {
    return checkoutStateItems.reduce(
      (sum, item) => sum + getItemQuantity(item),
      0,
    );
  }, [checkoutStateItems]);

  const totalAmount = useMemo(() => {
    return checkoutStateItems.reduce(
      (sum, item) => sum + getItemSubtotal(item),
      0,
    );
  }, [checkoutStateItems]);

  const shippingFee = 30000;

  const grandTotal = useMemo(() => {
    return totalAmount + shippingFee;
  }, [totalAmount, shippingFee]);

  // Load danh sách tỉnh / thành phố từ file JSON local
  useEffect(() => {
    try {
      setLoadingCities(true);
      setCities(Array.isArray(provincesData) ? provincesData : []);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách tỉnh / thành phố");
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  // Load danh sách phường / xã từ file JSON local theo cityCode
  useEffect(() => {
    if (!selectedCityCode) {
      setWards([]);
      setSelectedWardCode("");
      return;
    }

    try {
      setLoadingWards(true);
      setSelectedWardCode("");

      const wardList = wardsByCityData[String(selectedCityCode)] || [];
      setWards(Array.isArray(wardList) ? wardList : []);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách phường / xã");
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  }, [selectedCityCode]);

  const selectedCity = cities.find(
    (city) => String(city.code) === String(selectedCityCode),
  );

  const selectedWard = wards.find(
    (ward) => String(ward.code) === String(selectedWardCode),
  );

  const resetCheckoutForm = () => {
    setAddress("");
    setSelectedCityCode("");
    setSelectedWardCode("");
    setWards([]);
    setPaymentMethod("cod");
  };

  console.log(checkoutStateItems);

  const handleSubmitOrder = async () => {
    if (submitting) return;

    if (!checkoutStateItems.length) {
      toast.error("Không có sản phẩm nào để thanh toán");
      return;
    }

    if (!address.trim()) {
      toast.error("Vui lòng nhập địa chỉ cụ thể");
      return;
    }

    if (!selectedCityCode) {
      toast.error("Vui lòng chọn tỉnh / thành phố");
      return;
    }

    if (!selectedWardCode) {
      toast.error("Vui lòng chọn phường / xã");
      return;
    }

    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    const payload = {
      items: checkoutStateItems.map((item) => ({
        cartItemId: item?.id,
        productId: item?.product?.id,
        productVariantId: item?.productVariant?.id,
        productName: item?.product?.name || "Sản phẩm",
        quantity: Number(item?.quantity || 1),
        price: Number(item?.productVariant?.price || 0),
        imageUrl: item?.product?.images[0]?.url,
      })),
      shippingAddress: {
        addressLine: address.trim(),
        ward: selectedWard?.name || "",
        city: selectedCity?.name || "",
      },
      paymentMethod,
      totalQuantity,
      totalAmount,
      shippingFee,
      grandTotal,
    };

    try {
      setSubmitting(true);

      if (paymentMethod === "momo") {
        const resp = await http.post("payment/momo/create", {
          amount: grandTotal,
          orderPayload: payload,
        });

        const payUrl = resp?.payUrl || resp?.data?.payUrl;
        if (!payUrl) throw new Error("Không nhận được payUrl từ MoMo");

        window.location.href = payUrl;
        return;
      }

      await dispatch(checkoutOrder(payload)).unwrap();

      // Nếu có cart redux thì nên gọi lại để đồng bộ
      await dispatch(getMyCart()).unwrap();

      // Clear local state để UI render lại ngay
      setCheckoutStateItems([]);

      // Reset form
      resetCheckoutForm();

      // Ghi đè route state để khi user back/forward không bị giữ item cũ
      navigate("/orders", {
        replace: true,
        state: { checkoutItems: [] },
      });

      toast.success("Đặt hàng thành công");
    } catch (error) {
      console.error(error);
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Thanh toán thất bại",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || Object.keys(user).length === 0) {
    return <Navigate to="/" replace />;
  }

  if (!checkoutStateItems.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 pt-28">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-10 text-center">
          <p className="text-[var(--muted-foreground)] text-lg">
            Không có sản phẩm.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 pt-28">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        Thanh toán
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Sản phẩm */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Sản phẩm thanh toán
            </h2>
            <div className="space-y-4">
              {checkoutStateItems.map((item, index) => {
                const product = item?.product;
                const variant = item?.productVariant;
                const imageUrl = product?.images?.[0]?.url
                  ? `${import.meta.env.VITE_BASE_URL_IMAGE}${product.images[0].url}`
                  : "/default-product.png";

                return (
                  <div
                    key={item?.id || variant?.id || index}
                    className="flex gap-4 border border-[var(--border)] rounded-xl p-4"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--muted)] shrink-0">
                      <img
                        src={imageUrl}
                        alt={product?.name || "Sản phẩm"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-[var(--foreground)]">
                          {product?.name || "Tên sản phẩm"}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                          Dung tích:{" "}
                          <span className="font-medium text-[var(--foreground)]">
                            {variant?.capacity || variant?.size || "N/A"}
                          </span>
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                          Đơn giá:{" "}
                          <span className="font-medium text-red-500">
                            {formatPrice(getItemPrice(item))}
                          </span>
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                          Số lượng:{" "}
                          <span className="font-medium text-[var(--foreground)]">
                            {getItemQuantity(item)}
                          </span>
                        </p>
                      </div>
                      <div className="text-right text-base font-bold text-[var(--foreground)] mt-3">
                        {formatPrice(getItemSubtotal(item))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Địa chỉ giao hàng
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Địa chỉ cụ thể
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ví dụ: 123 Nguyễn Trãi, căn hộ A12..."
                  className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--luxury-gold)] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Tỉnh / Thành phố
                  </label>
                  <select
                    value={selectedCityCode}
                    onChange={(e) => setSelectedCityCode(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] outline-none focus:border-[var(--luxury-gold)] transition"
                  >
                    <option value="">
                      {loadingCities ? "Đang tải..." : "Chọn tỉnh / thành phố"}
                    </option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Phường / Xã
                  </label>
                  <select
                    value={selectedWardCode}
                    onChange={(e) => setSelectedWardCode(e.target.value)}
                    disabled={!selectedCityCode || loadingWards}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] outline-none focus:border-[var(--luxury-gold)] transition disabled:bg-[var(--muted)] disabled:text-[var(--muted-foreground)] disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!selectedCityCode
                        ? "Chọn tỉnh / thành phố trước"
                        : loadingWards
                          ? "Đang tải..."
                          : "Chọn phường / xã"}
                    </option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Phương thức thanh toán
            </h2>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] outline-none focus:border-[var(--luxury-gold)] transition"
            >
              <option value="cod">Thanh toán khi nhận hàng (COD)</option>
              <option value="bank_transfer">Chuyển khoản ngân hàng</option>
              <option value="momo">Ví MoMo</option>
              <option value="vnpay">VNPay</option>
            </select>
          </div>
        </div>

        {/* Tóm tắt */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-5 sticky top-28">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Tóm tắt thanh toán
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                <span>Số sản phẩm</span>
                <span>{checkoutStateItems.length}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                <span>Tổng số lượng</span>
                <span>{totalQuantity}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                <span>Tiền sản phẩm</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                <span>Phí vận chuyển</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="border-t border-[var(--border)] pt-3 flex items-center justify-between">
                <span className="text-base font-semibold text-[var(--foreground)]">
                  Tổng cộng
                </span>
                <span className="text-lg font-bold text-red-500">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            <Button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="w-full mt-5 bg-[var(--luxury-gold)] text-[#111] hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Đang xử lý..." : "Thanh toán"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
