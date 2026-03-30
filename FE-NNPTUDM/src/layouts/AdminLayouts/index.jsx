import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { Outlet } from "react-router";
import { getAllProducts } from "@/services/Product/ProductService";
import { getAllUsers, getTotalQuantity } from "@/services/Admin/AdminService";
import { useDispatch } from "react-redux";

export default function AdminLayout() {
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(getAllUsers());
    dispatch(getTotalQuantity());
  }, [dispatch])

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Phần main chừa chỗ cho sidebar ở desktop */}
      <div className="lg:ml-72">
        <AdminHeader
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <Outlet />
      </div>
    </div>
  );
}
