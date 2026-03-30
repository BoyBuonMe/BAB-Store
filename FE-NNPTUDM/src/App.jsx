import { useDispatch } from "react-redux";
import AppRoutes from "./components/AppRoutes";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { setUser } from "@/services/Auth/AuthService";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setUser());
  }, [dispatch]);

  useEffect(() => {
    // Apply theme đã lưu
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }

    dispatch(setUser());
  }, [dispatch]);
  return (
    <>
      <Toaster position="top-right" duration={1000} />
      <AppRoutes />
    </>
  );
}

export default App;
