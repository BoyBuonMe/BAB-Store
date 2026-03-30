import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, Package2, Tags } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const EMPTY_FORM = {
  name: "",
  description: "",
  production: "",
  brandName: "",
  categoryName: "",
  image1: { id: "", url: "" },
  image2: { id: "", url: "" },
  image3: { id: "", url: "" },
  variant30Price: "",
  variant30Quantity: "",
  variant50Price: "",
  variant50Quantity: "",
  variant100Price: "",
  variant100Quantity: "",
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const buildFormFromInitialData = (initialData) => {
  if (!initialData) return EMPTY_FORM;

  const capacities = [30, 50, 100];

  const getVariantMap = (variants = []) => {
    return variants.reduce((acc, v) => {
      acc[v.capacity] = v;
      return acc;
    }, {});
  };

  const variantMap = getVariantMap(initialData?.variants);

  const variantFields = capacities.reduce((acc, cap) => {
    acc[`variant${cap}Id`] = variantMap[cap]?.id || "";

    acc[`variant${cap}Price`] = variantMap[cap]?.price
      ? String(variantMap[cap].price)
      : "";

    acc[`variant${cap}Quantity`] = variantMap[cap]?.quantity
      ? String(variantMap[cap].quantity)
      : "";

    return acc;
  }, {});

  return {
    name: initialData.name || "",
    description: initialData.description || "",
    production:
      initialData.production !== null && initialData.production !== undefined
        ? Number(initialData.production)
        : "",
    brandName: initialData.brand?.name || "",
    categoryName: initialData.category?.name || "",
    image1: {
      id: initialData.images?.[0]?.id || "",
      url: initialData.images?.[0]?.url || "",
    },
    image2: {
      id: initialData.images?.[1]?.id || "",
      url: initialData.images?.[1]?.url || "",
    },
    image3: {
      id: initialData.images?.[2]?.id || "",
      url: initialData.images?.[2]?.url || "",
    },
    ...variantFields,
  };
};

export default function CreateProductDialog({
  trigger,
  createProduct,
  updateProduct,
  initialData,
  onCreated,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) {
  //   const [open, setOpen] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(() => buildFormFromInitialData(initialData));

  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  useEffect(() => {
    setForm(buildFormFromInitialData(initialData));
  }, [initialData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(buildFormFromInitialData(initialData));
  };

  const imageList = useMemo(() => {
    return [form.image1, form.image2, form.image3]
      .filter((item) => item?.url)
      .map((item) => ({ ...item, url: normalizeText(item.url) }));
  }, [form.image1, form.image2, form.image3]);

  const variantList = useMemo(() => {
    const variants = [
      {
        id: form.variant30Id,
        size: "30ml",
        price: form.variant30Price,
        quantity: form.variant30Quantity,
      },
      {
        id: form.variant50Id,
        size: "50ml",
        price: form.variant50Price,
        quantity: form.variant50Quantity,
      },
      {
        id: form.variant100Id,
        size: "100ml",
        price: form.variant100Price,
        quantity: form.variant100Quantity,
      },
    ];

    return variants
      .map((variant) => {
        const rawPrice = String(variant.price ?? "").trim();
        const rawQuantity = String(variant.quantity ?? "").trim();

        if (!rawPrice && !rawQuantity) return null;

        return {
          id: variant.id || null, // thêm id vào đây
          size: variant.size,
          price: Number(rawPrice),
          quantity: Number(rawQuantity),
        };
      })
      .filter(Boolean);
  }, [
    form.variant30Id,
    form.variant30Price,
    form.variant30Quantity,
    form.variant50Id,
    form.variant50Price,
    form.variant50Quantity,
    form.variant100Id,
    form.variant100Price,
    form.variant100Quantity,
  ]);

  const validateForm = () => {
    if (!normalizeText(form.name)) {
      throw new Error("Vui lòng nhập tên sản phẩm");
    }

    if (!String(form.production).trim()) {
      throw new Error("Vui lòng nhập năm sản xuất");
    }

    if (Number.isNaN(Number(form.production))) {
      throw new Error("Năm sản xuất không hợp lệ");
    }

    if (!normalizeText(form.brandName)) {
      throw new Error("Vui lòng nhập thương hiệu");
    }

    if (!normalizeText(form.categoryName)) {
      throw new Error("Vui lòng nhập danh mục");
    }

    if (variantList.length === 0) {
      throw new Error("Vui lòng nhập ít nhất 1 biến thể");
    }

    for (const variant of variantList) {
      if (Number.isNaN(variant.price) || variant.price < 0) {
        throw new Error(`Giá ${variant.size} không hợp lệ`);
      }

      if (Number.isNaN(variant.quantity) || variant.quantity < 0) {
        throw new Error(`Số lượng ${variant.size} không hợp lệ`);
      }
    }
  };

  const handleCreateProduct = async () => {
    try {
      validateForm();

      const payload = {
        id: initialData?.id,
        name: normalizeText(form.name),
        description: normalizeText(form.description) || null,
        production: Number(form.production),
        brandName: normalizeText(form.brandName),
        categoryName: normalizeText(form.categoryName),
        productImages: imageList,
        productVariants: variantList,
      };

      setLoading(true);

      if (initialData?.id && typeof updateProduct === "function") {
        await updateProduct(payload);
      } else {
        await createProduct(payload);
      }

      onCreated?.();
      resetForm();
      setOpen(false);
      toast.success("Tạo sản phẩm thành công");
    } catch (error) {
      console.error(error);
      alert(error?.message || "Tạo sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (value) => {
    if (!value && loading) return;

    setOpen(value);

    if (!value) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="w-[95vw] max-w-4xl border-0 p-0 shadow-2xl sm:rounded-3xl">
        <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-950">
          <DialogHeader className="shrink-0 border-b bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-5 text-white">
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
              <Package2 size={24} />
              Thêm sản phẩm mới
            </DialogTitle>
            <DialogDescription className="text-sm text-indigo-100">
              Nhập thông tin sản phẩm, đường dẫn ảnh, thương hiệu, danh mục và
              giá theo từng dung tích.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Tên sản phẩm</Label>
                  <Input
                    id="product-name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Ví dụ: Dior Sauvage"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="production">Năm sản xuất</Label>
                  <Input
                    id="production"
                    type="number"
                    value={form.production}
                    onChange={(e) => handleChange("production", e.target.value)}
                    placeholder="Ví dụ: 2025"
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Thương hiệu</Label>
                  <Input
                    id="brandName"
                    value={form.brandName}
                    onChange={(e) => handleChange("brandName", e.target.value)}
                    placeholder="Ví dụ: Dior"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryName">Danh mục</Label>
                  <Input
                    id="categoryName"
                    value={form.categoryName}
                    onChange={(e) =>
                      handleChange("categoryName", e.target.value)
                    }
                    placeholder="Ví dụ: Nước hoa nam"
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Nhập mô tả sản phẩm"
                  className="min-h-[120px] rounded-2xl"
                />
              </div>

              <div className="rounded-3xl border bg-slate-50 p-5 dark:bg-slate-900/60">
                <div className="mb-4 flex items-center gap-2">
                  <ImagePlus size={18} className="text-indigo-600" />
                  <h3 className="text-lg font-semibold">
                    Đường dẫn ảnh sản phẩm
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="image1">Ảnh 1</Label>
                    <Input
                      id="image1"
                      value={form.image1?.url || ""}
                      onChange={(e) =>
                        handleChange("image1", {
                          ...form.image1,
                          url: e.target.value,
                        })
                      }
                      placeholder="/uploads/products/image-1.jpg"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image2">Ảnh 2</Label>
                    <Input
                      id="image2"
                      value={form.image2?.url || ""}
                      onChange={(e) =>
                        handleChange("image2", {
                          ...form.image2,
                          url: e.target.value,
                        })
                      }
                      placeholder="/uploads/products/image-2.jpg"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image3">Ảnh 3</Label>
                    <Input
                      id="image3"
                      value={form.image3?.url || ""}
                      onChange={(e) =>
                        handleChange("image3", {
                          ...form.image3,
                          url: e.target.value,
                        })
                      }
                      placeholder="/uploads/products/image-3.jpg"
                      className="rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border bg-gradient-to-br from-indigo-50 to-violet-50 p-5 dark:from-slate-900 dark:to-slate-900">
                <div className="mb-4 flex items-center gap-2">
                  <Tags size={18} className="text-violet-600" />
                  <h3 className="text-lg font-semibold">Biến thể sản phẩm</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-950">
                    <h4 className="mb-3 text-base font-bold text-indigo-600">
                      30ml
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="variant30Price">Giá</Label>
                        <Input
                          id="variant30Price"
                          type="number"
                          min="0"
                          value={form.variant30Price}
                          onChange={(e) =>
                            handleChange("variant30Price", e.target.value)
                          }
                          placeholder="Nhập giá"
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant30Quantity">Số lượng</Label>
                        <Input
                          id="variant30Quantity"
                          type="number"
                          min="0"
                          value={form.variant30Quantity}
                          onChange={(e) =>
                            handleChange("variant30Quantity", e.target.value)
                          }
                          placeholder="Nhập số lượng"
                          className="rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-950">
                    <h4 className="mb-3 text-base font-bold text-violet-600">
                      50ml
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="variant50Price">Giá</Label>
                        <Input
                          id="variant50Price"
                          type="number"
                          min="0"
                          value={form.variant50Price}
                          onChange={(e) =>
                            handleChange("variant50Price", e.target.value)
                          }
                          placeholder="Nhập giá"
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant50Quantity">Số lượng</Label>
                        <Input
                          id="variant50Quantity"
                          type="number"
                          min="0"
                          value={form.variant50Quantity}
                          onChange={(e) =>
                            handleChange("variant50Quantity", e.target.value)
                          }
                          placeholder="Nhập số lượng"
                          className="rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-950">
                    <h4 className="mb-3 text-base font-bold text-fuchsia-600">
                      100ml
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="variant100Price">Giá</Label>
                        <Input
                          id="variant100Price"
                          type="number"
                          min="0"
                          value={form.variant100Price}
                          onChange={(e) =>
                            handleChange("variant100Price", e.target.value)
                          }
                          placeholder="Nhập giá"
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant100Quantity">Số lượng</Label>
                        <Input
                          id="variant100Quantity"
                          type="number"
                          min="0"
                          value={form.variant100Quantity}
                          onChange={(e) =>
                            handleChange("variant100Quantity", e.target.value)
                          }
                          placeholder="Nhập số lượng"
                          className="rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t bg-white px-6 py-4 dark:bg-slate-950">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Hủy
              </Button>

              <Button
                type="button"
                onClick={handleCreateProduct}
                disabled={loading}
                className="rounded-2xl bg-indigo-600 px-6 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={16} />
                    {initialData ? "Đang cập nhật..." : "Đang tạo..."}
                  </>
                ) : initialData ? (
                  "Cập nhật"
                ) : (
                  "Tạo"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
