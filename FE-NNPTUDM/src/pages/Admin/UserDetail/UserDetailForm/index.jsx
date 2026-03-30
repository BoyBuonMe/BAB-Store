import React, { useState } from "react";
import { useNavigate } from "react-router";
import { getAllUsers, updateUser } from "@/services/Admin/AdminService";
import { useDispatch } from "react-redux";

export default function UserDetailForm({ user }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    id: user.id ?? "",
    username: user.username ?? "",
    email: user.email ?? "",
    password: "",
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    avatar: user.avatar ?? "",
    isVerified: Boolean(user.isVerified),
    emailVerifiedAt: formatDateTimeLocal(user.emailVerifiedAt),
    createdAt: formatDateTimeLocal(user.createdAt),
    updatedAt: formatDateTimeLocal(user.updatedAt),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id: formData.id,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      avatar: formData.avatar,
      isVerified: formData.isVerified,
      emailVerifiedAt: formData.emailVerifiedAt
        ? new Date(formData.emailVerifiedAt).toISOString()
        : null,
      createdAt: formData.createdAt
        ? new Date(formData.createdAt).toISOString()
        : null,
      updatedAt: formData.updatedAt
        ? new Date(formData.updatedAt).toISOString()
        : null,
    };

    console.log("PUT payload:", payload);
    await updateUser(user.id, payload);
    dispatch(getAllUsers());

    // await axios.put(`/api/users/${user.id}`, payload);
    navigate("/admin/users");
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa người dùng</h1>
          <p className="text-sm text-gray-500">ID: {user.id}</p>
        </div>

        <button
          onClick={() => navigate("/admin/users")}
          className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
        >
          Quay lại
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <InputField
            label="ID"
            name="id"
            value={formData.id}
            onChange={handleChange}
            readOnly
          />

          <InputField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />

          <InputField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
          />

          <InputField
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập password mới nếu muốn đổi"
          />

          <InputField
            label="First name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />

          <InputField
            label="Last name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />

          <div className="md:col-span-2">
            <InputField
              label="Avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Is verified
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3">
              <input
                type="checkbox"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleChange}
              />
              <span>
                {formData.isVerified ? "Đã xác minh" : "Chưa xác minh"}
              </span>
            </label>
          </div>

          <InputField
            label="Email verified at"
            name="emailVerifiedAt"
            type="datetime-local"
            value={formData.emailVerifiedAt}
            onChange={handleChange}
          />

          <InputField
            label="Created at"
            name="createdAt"
            type="datetime-local"
            value={formData.createdAt}
            onChange={handleChange}
          />

          <InputField
            label="Updated at"
            name="updatedAt"
            type="datetime-local"
            value={formData.updatedAt}
            onChange={handleChange}
          />
        </div>

        {formData.avatar && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Xem trước avatar
            </p>
            <img
              src={formData.avatar}
              alt="avatar"
              className="h-24 w-24 rounded-full border object-cover"
            />
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="rounded-lg border border-gray-300 px-5 py-2.5 hover:bg-gray-50"
          >
            Hủy
          </button>

          <button
            type="submit"
            className="rounded-lg bg-yellow-500 px-5 py-2.5 font-medium text-white hover:bg-yellow-600"
          >
            Lưu chỉnh sửa
          </button>
        </div>
      </form>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-4 py-3 outline-none ${
          readOnly
            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
            : "border-gray-300 focus:border-blue-500"
        }`}
      />
    </div>
  );
}

function formatDateTimeLocal(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
