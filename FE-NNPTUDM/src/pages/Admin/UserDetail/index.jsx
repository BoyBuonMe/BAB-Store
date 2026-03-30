import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import UserDetailForm from "./UserDetailForm";
import { getAllUsers } from "@/services/Admin/AdminService";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const users = useSelector((state) => state.admin.users);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch])

  const user = useMemo(() => {
    return users?.find((item) => String(item.id) === String(id));
  }, [users, id]);

  if (!user) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          Không tìm thấy user
        </div>
        <button
          onClick={() => navigate("/admin/users")}
          className="mt-4 rounded-lg border px-4 py-2"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return <UserDetailForm key={user.id} user={user} />;
}