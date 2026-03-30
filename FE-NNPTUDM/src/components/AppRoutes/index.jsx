import AdminLayout from "@/layouts/AdminLayouts";
import AuthLayouts from "@/layouts/AuthLayouts";
import DefaultLayout from "@/layouts/DefaultLayouts";
import AdminHome from "@/pages/Admin/AdminHome";
import Products from "@/pages/Admin/Products";
import User from "@/pages/Admin/User";
import UserDetail from "@/pages/Admin/UserDetail";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import BrandPage from "@/pages/Brand";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Home from "@/pages/Home";
import MenPerfume from "@/pages/MenPerfume";
import Order from "@/pages/Order";
import ProductDetail from "@/pages/ProductDetail";
import ProductsPage from "@/pages/Products";
import Profile from "@/pages/Profile";
import Unisex from "@/pages/Unisex";
import WomenPerfume from "@/pages/WomenPerfume";
import RequireAdmin from "@/utils/requireAdmin";
import ScrollToTop from "@/utils/scrollToTop";
import { HashRouter, Route, Routes } from "react-router";

export default function AppRoutes() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<AuthLayouts />}>
          <Route path="register" element={<Register />}></Route>
          <Route path="login" element={<Login />}></Route>
        </Route>
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Home />}></Route>
          <Route path="men-perfume" element={<MenPerfume />}></Route>
          <Route path="women-perfume" element={<WomenPerfume />}></Route>
          <Route path="unisex-perfume" element={<Unisex />}></Route>
          <Route path="products" element={<ProductsPage />}></Route>
          <Route path="brand/:slug" element={<BrandPage />}></Route>
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Order />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route element={<RequireAdmin />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route path="home" element={<AdminHome />} />
            <Route path="users" element={<User />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="products" element={<Products />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}
