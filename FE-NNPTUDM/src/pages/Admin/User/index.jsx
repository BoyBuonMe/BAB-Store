import { deleteUser, getAllUsers } from "@/services/Admin/AdminService";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function User() {
  const [keyword, setKeyword] = useState("");
  const users = useSelector((state) => state.admin.users);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const filteredUsers = useMemo(() => {
    if (!keyword.trim()) return users;

    const lowerKeyword = keyword.toLowerCase();

    return users.filter((user) => {
      const values = Object.entries(user || {})
        .filter(([key]) => key !== "role")
        .map(([, value]) => String(value ?? "").toLowerCase());

      return values.some((value) => value.includes(lowerKeyword));
    });
  }, [users, keyword]);

  const getVisibleFields = (data) => {
    if (!data.length) return [];
    return Object.keys(data[0] || {}).filter((key) => key !== "role");
  };

  const visibleFields = getVisibleFields(
    filteredUsers.length ? filteredUsers : users,
  );

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      dispatch(getAllUsers());
      toast.success("Xóa thành công");
    } catch (error) {
      console.error("Xóa user thất bại:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
          <p className="text-gray-500">
            Tổng số user: <strong>{users.length}</strong>
          </p>
        </div>

        <input
          type="text"
          placeholder="Tìm kiếm user..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-72 rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="border-b border-[var(--border)] px-4 py-3 text-left text-[var(--foreground)]">
                STT
              </th>

              {visibleFields.map((field) => (
                <th
                  key={field}
                  className="border-b border-[var(--border)] px-4 py-3 text-left capitalize text-[var(--foreground)]"
                >
                  {field}
                </th>
              ))}

              <th className="border-b border-[var(--border)] px-4 py-3 text-center text-[var(--foreground)]">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr
                  key={user._id || user.id || index}
                  className="hover:bg-[var(--muted)] transition-colors"
                >
                  <td className="border-b border-[var(--border)] px-4 py-3 text-[var(--foreground)]">
                    {index + 1}
                  </td>

                  {visibleFields.map((field) => (
                    <td
                      key={field}
                      className="border-b border-[var(--border)] px-4 py-3 text-[var(--foreground)]"
                    >
                      {renderCell(user[field], field)}
                    </td>
                  ))}

                  <td className="border-b border-[var(--border)] px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button className="rounded-md bg-blue-500 px-3 py-1.5 text-white hover:bg-blue-600">
                        Xem
                      </button>
                      <button
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        className="rounded-md bg-yellow-500 px-3 py-1.5 text-white hover:bg-yellow-600"
                      >
                        Sửa
                      </button>
                      <button
                        className="rounded-md bg-red-500 px-3 py-1.5 text-white hover:bg-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={visibleFields.length + 2}
                  className="px-4 py-6 text-center text-[var(--muted-foreground)]"
                >
                  Không có user nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderCell(value, field) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-gray-400">--</span>;
  }

  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    if (field.toLowerCase().includes("avatar") && value.url) {
      return (
        <img
          src={value.url}
          alt="avatar"
          className="h-10 w-10 rounded-full object-cover"
        />
      );
    }

    return JSON.stringify(value);
  }

  if (
    field.toLowerCase().includes("avatar") ||
    field.toLowerCase().includes("image")
  ) {
    return (
      <img
        src={value}
        alt={field}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }

  return String(value);
}
