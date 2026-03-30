import { useEffect, useMemo, useState } from "react";
import SmartNavLink from "@/components/SmartNavLink";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { Trash2 } from "lucide-react";
import {
  removeCartItem,
  updateCartItemQuantity,
} from "@/services/Cart/CartService";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart.cart);
  const cartItems = cart?.items || [];

  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (!user || Object.keys(user).length === 0) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
  }, [user]);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + "₫";
  };

  const getItemKey = (item, index) => {
    return item?.id || item?.productVariant?.id || index;
  };

  const getItemPrice = (item) => {
    return item?.productVariant?.price || 0;
  };

  const getItemSubtotal = (item) => {
    return getItemPrice(item) * getItemQuantity(item);
  };

  const isChecked = (item, index) => {
    const key = getItemKey(item, index);
    return selectedItems.includes(key);
  };

  const handleToggleItem = (item, index) => {
    const key = getItemKey(item, index);

    setSelectedItems((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key],
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
      return;
    }

    const allKeys = cartItems.map((item, index) => getItemKey(item, index));
    setSelectedItems(allKeys);
  };

  const getItemQuantity = (item) => {
    return item?.quantity || 1;
  };

  const getRemainQuantity = (item) => {
    return Number(item?.productVariant?.quantity || 0);
  };

  const handleDecrease = (item) => {
    if (!item?.id || item.quantity <= 1) return;

    dispatch(
      updateCartItemQuantity({
        cartItemId: item.id,
        quantity: item.quantity - 1,
      }),
    );
  };

  const handleIncrease = (item) => {
    if (!item?.id) return;

    const remainQuantity = getRemainQuantity(item);
    const currentQuantity = getItemQuantity(item);

    if (remainQuantity <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    if (currentQuantity >= remainQuantity) {
      toast.error(
        `Số lượng vượt quá tồn kho. Chỉ còn ${remainQuantity} sản phẩm`,
      );
      return;
    }

    dispatch(
      updateCartItemQuantity({
        cartItemId: item.id,
        quantity: currentQuantity + 1,
      }),
    );
  };

  const handleRemoveItem = (item, index) => {
    if (!item?.id) return;

    dispatch(removeCartItem(item.id));

    // remove khỏi selectedItems
    const key = getItemKey(item, index);
    setSelectedItems((prev) => prev.filter((id) => id !== key));
  };

  const selectedCartItems = useMemo(() => {
    return cartItems.filter((item, index) => {
      const key = getItemKey(item, index);
      return selectedItems.includes(key);
    });
  }, [cartItems, selectedItems]);

  const totalSelectedQuantity = selectedCartItems.reduce((sum, item) => {
    return sum + getItemQuantity(item);
  }, 0);

  const totalAmount = selectedCartItems.reduce((sum, item) => {
    return sum + getItemSubtotal(item);
  }, 0);

  const hasSelectedItems = selectedItems.length > 0;

  const handleCheckout = () => {
    if (!hasSelectedItems) return;

    navigate("/checkout", {
      state: {
        checkoutItems: selectedCartItems,
      },
    });
  };

  if (!user || Object.keys(user).length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 pt-28">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
          Giỏ hàng
        </h1>
        <div className="border border-[var(--border)] rounded-2xl shadow-sm p-10 text-center bg-[var(--card)]">
          <p className="text-[var(--muted-foreground)] text-lg">
            Bạn chưa đăng nhập, vui lòng đăng nhập để thanh toán
          </p>
          <SmartNavLink to="/login">
            <Button className="mt-5">Đăng nhập</Button>
          </SmartNavLink>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 pt-28">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
          Giỏ hàng
        </h1>
        <div className="border border-[var(--border)] rounded-2xl shadow-sm p-10 text-center bg-[var(--card)]">
          <p className="text-[var(--muted-foreground)] text-lg">
            Giỏ hàng của bạn đang trống
          </p>
          <SmartNavLink to="/">
            <Button className="mt-5">Tiếp tục mua sắm</Button>
          </SmartNavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 pt-28">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        Giỏ hàng
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Select all */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-4 flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                cartItems.length > 0 &&
                selectedItems.length === cartItems.length
              }
              onChange={handleSelectAll}
              className="w-4 h-4 cursor-pointer accent-[var(--luxury-gold)]"
            />
            <span className="text-sm font-medium text-[var(--foreground)]">
              Chọn tất cả
            </span>
          </div>

          {/* Cart items */}
          {cartItems.map((item, index) => {
            const product = item?.product;
            const variant = item?.productVariant;
            const itemKey = getItemKey(item, index);
            const imageUrl = product?.images?.[0]?.url
              ? `http://127.0.0.1:3001/${product.images[0].url}`
              : "/default-product.png";

            return (
              <div
                key={itemKey}
                onClick={() => handleToggleItem(item, index)}
                className={`bg-[var(--card)] border rounded-2xl shadow-sm p-4 cursor-pointer transition ${
                  isChecked(item, index)
                    ? "border-[var(--luxury-gold)] ring-1 ring-[var(--luxury-gold)]/20"
                    : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                }`}
              >
                <div className="flex gap-4">
                  <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked(item, index)}
                      onChange={() => handleToggleItem(item, index)}
                      className="w-4 h-4 cursor-pointer accent-[var(--luxury-gold)]"
                    />
                  </div>

                  <div className="w-full flex flex-col sm:flex-row gap-4">
                    <div
                      className="w-full sm:w-28 h-28 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--muted)] shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src={imageUrl}
                        alt={product?.name || "Sản phẩm"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2
                            className="text-lg font-semibold text-[var(--foreground)]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {product?.name || "Tên sản phẩm"}
                          </h2>

                          <p
                            className="text-sm text-[var(--muted-foreground)] mt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Dung tích:{" "}
                            <span className="font-medium text-[var(--foreground)]">
                              {variant?.capacity || variant?.size || "N/A"}
                            </span>
                          </p>

                          <p
                            className="text-sm text-[var(--muted-foreground)] mt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Đơn giá:{" "}
                            <span className="font-medium text-red-500">
                              {formatPrice(getItemPrice(item))}
                            </span>
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item, index);
                          }}
                          className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition cursor-pointer shrink-0"
                          aria-label="Xóa sản phẩm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div
                        className="flex items-center gap-3 flex-wrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-sm text-[var(--muted-foreground)]">
                          Số lượng:
                        </span>

                        <div className="inline-flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleDecrease(item, index)}
                            className="w-9 h-9 text-base font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition cursor-pointer"
                          >
                            -
                          </button>
                          <div className="w-12 h-9 flex items-center justify-center border-x border-[var(--border)] font-medium text-sm text-[var(--foreground)]">
                            {getItemQuantity(item)}
                          </div>
                          <button
                            onClick={() => handleIncrease(item, index)}
                            className="w-9 h-9 text-base font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-sm text-[var(--muted-foreground)]">
                          Còn lại:{" "}
                          <span
                            className={`font-medium ${getRemainQuantity(item) > 0 ? "text-orange-500" : "text-red-500"}`}
                          >
                            {getRemainQuantity(item)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-5 sticky top-28">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                <span>Sản phẩm đã chọn</span>
                <span>{selectedCartItems.length}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                <span>Tổng số lượng</span>
                <span>{totalSelectedQuantity}</span>
              </div>
              <div className="border-t border-[var(--border)] pt-3 flex items-center justify-between">
                <span className="text-base font-semibold text-[var(--foreground)]">
                  Tổng cộng
                </span>
                <span className="text-lg font-bold text-red-500">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={!hasSelectedItems}
              className={`w-full mt-5 ${
                hasSelectedItems
                  ? "bg-[var(--luxury-gold)] text-[#111] hover:opacity-90 cursor-pointer"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed"
              }`}
            >
              Tiến hành thanh toán
            </Button>

            <SmartNavLink to="/">
              <Button
                variant="outline"
                className="w-full mt-3 cursor-pointer border-[var(--border)] text-[var(--foreground)]"
              >
                Tiếp tục mua sắm
              </Button>
            </SmartNavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
