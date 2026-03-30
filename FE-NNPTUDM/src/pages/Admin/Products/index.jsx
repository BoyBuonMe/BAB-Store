import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import Pagination from "@/utils/Pagination";
import { paginate } from "@/utils/paginate";
import { Plus, Search, Pencil, Trash2, Sparkles } from "lucide-react";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/services/Admin/AdminService";
import CreateProductDialog from "./CreateProductDialog";
import { getAllProducts } from "@/services/Product/ProductService";
import { toast } from "sonner";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const productsState = useSelector((state) => state.product.products);
  const products = productsState?.data;

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null); // 🔥 thêm
  const [dialogOpen, setDialogOpen] = useState(false);

  const page = Number(searchParams.get("page")) || 1;
  const limit = 6;

  const refreshProducts = () => {
    dispatch(getAllProducts());
  };

  // 🔥 tìm product đang edit
  const editingProduct = useMemo(() => {
    return products?.find((p) => p.id === editingId);
  }, [products, editingId]);

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase();

    return products?.filter((product) => {
      return (
        product?.name?.toLowerCase().includes(keyword) ||
        product?.category?.name?.toLowerCase().includes(keyword) ||
        String(product?.id || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [products, search]);

  const { data: paginatedProducts, pagination } = useMemo(() => {
    return paginate(filteredProducts, page, limit);
  }, [filteredProducts, page]);

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      toast.success("Xóa sản phẩm thành công");
      dispatch(getAllProducts());
    } catch (error) {
      toast.error(error?.message || "Lỗi xóa sản phẩm");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400">
            <Sparkles size={16} />
            Quản lý sản phẩm
          </div>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            Danh sách Products
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Theo dõi, chỉnh sửa và quản lý toàn bộ sản phẩm trong hệ thống.
          </p>
        </div>

        {/* 🔥 dialog dùng chung create + edit */}
        <CreateProductDialog
          key={editingId || "create"}
          open={dialogOpen}
          onOpenChange={(value) => {
            setDialogOpen(value);
            if (!value) {
              setEditingId(null);
            }
          }}
          initialData={editingProduct}
          createProduct={createProduct}
          updateProduct={updateProduct}
          onCreated={() => {
            setDialogOpen(false);
            setEditingId(null);
            refreshProducts();
          }}
          trigger={
            <button
              onClick={() => {
                setEditingId(null);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700"
            >
              <Plus size={18} />
              Thêm sản phẩm
            </button>
          }
        />
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, danh mục, mã..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                params.delete("page");
                return params;
              });
            }}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:focus:border-indigo-500 dark:focus:bg-gray-900"
          />
        </div>
      </div>

      <div className="space-y-4">
        {paginatedProducts?.length > 0 ? (
          paginatedProducts.map((product, index) => {
            const image =
              product?.images?.[0]?.url ||
              "https://via.placeholder.com/300x300?text=Product";

            // const price = product?.variants?.[0]?.price || 0;
            // const stock = product?.variants?.[0]?.quantity || 0;
            const category = product?.category?.name || "Chưa phân loại";

            return (
              <div
                key={product?.id || index}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-500"
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-gray-800 sm:h-52 lg:w-64">
                    <img
                      src={`${import.meta.env.VITE_BASE_URL_IMAGE}${image}`}
                      alt={product?.name}
                      className="h-full w-full object-contain p-3"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
                            {category}
                          </span>
                        </div>

                        <h2 className="text-xl font-bold">{product?.name}</h2>

                        <p className="mt-2 text-sm text-gray-500">
                          {product?.description}
                        </p>
                      </div>

                      <div className="flex flex-row gap-3 xl:flex-col">
                        {/* 🔥 SỬA */}
                        <button
                          onClick={() => {
                            setEditingId(product.id);
                            setDialogOpen(true);
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600"
                        >
                          <Pencil size={16} />
                          Sửa
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-600"
                        >
                          <Trash2 size={16} />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-10 text-center shadow-sm">
            <h3 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              Không tìm thấy sản phẩm
            </h3>
          </div>
        )}
      </div>

      <Pagination
        pagination={pagination}
        page={page}
        setSearchParams={setSearchParams}
      />
    </div>
  );
}
