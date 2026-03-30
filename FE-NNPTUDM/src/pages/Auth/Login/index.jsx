import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { login, setUser } from "@/services/Auth/AuthService";
import SmartNavLink from "@/components/SmartNavLink";
import loginSchema from "@/schemas/loginSchema";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      dispatch(setUser());
      toast.success("Đăng nhập thành công");
      navigate("/", { replace: true });
    } catch (error) {

      const status = error?.response?.status;
      
      const serverMessage =
        error?.response?.data?.message || error?.message || "";

      let message = "Đăng nhập thất bại, vui lòng thử lại";

      if (
        status === 401 ||
        serverMessage.toLowerCase().includes("unauthorized") ||
        serverMessage.toLowerCase().includes("unthorization")
      ) {
        message = "Tài khoản không tồn tại hoặc mật khẩu không đúng";

        setError("email", {
          type: "server",
          message,
        });

        setError("password", {
          type: "server",
          message,
        });
      } else if (
        serverMessage.toLowerCase().includes("email") ||
        serverMessage.toLowerCase().includes("tài khoản")
      ) {
        message = serverMessage;

        setError("email", {
          type: "server",
          message,
        });
      } else if (
        serverMessage.toLowerCase().includes("password") ||
        serverMessage.toLowerCase().includes("mật khẩu")
      ) {
        message = serverMessage;

        setError("password", {
          type: "server",
          message,
        });
      } else {
        message = serverMessage || message;

        setError("root", {
          type: "server",
          message,
        });
      }

      toast.error(message);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-card">
        <div className="mb-8 flex items-center justify-center lg:hidden">
          <div className="auth-mobile-logo-wrap">
            <img src="/Logo/LogoBAB.png" alt="BAB Store" className="w-16" />
          </div>
        </div>

        <div className="mb-8">
          <div className="auth-mini-badge">
            <Sparkles size={14} />
            Chào mừng quay trở lại
          </div>

          <h2 className="auth-title">Đăng nhập</h2>

          <p className="auth-subtitle">
            Đăng nhập để tiếp tục mua sắm, theo dõi đơn hàng và lưu lại những
            mùi hương yêu thích của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {errors.root && (
            <p className="auth-error-text">{errors.root.message}</p>
          )}

          <div className="space-y-2">
            <label className="auth-label">Email</label>

            <div className="auth-input-wrap">
              <Mail size={18} className="auth-input-icon" />
              <Input
                className="auth-input"
                placeholder="Nhập email của bạn"
                {...register("email")}
              />
            </div>

            {errors.email && (
              <p className="auth-error-text">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="auth-label">Mật khẩu</label>

            <div className="auth-input-wrap">
              <LockKeyhole size={18} className="auth-input-icon" />
              <Input
                className="auth-input"
                type="password"
                placeholder="Nhập mật khẩu"
                {...register("password")}
              />
            </div>

            {errors.password && (
              <p className="auth-error-text">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="auth-checkbox-row">
              <Checkbox />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            <a href="#" className="auth-link">
              Quên mật khẩu?
            </a>
          </div>

          <Button
            type="submit"
            className="auth-submit-button"
            disabled={isSubmitting}
          >
            Đăng nhập
            <ArrowRight size={16} />
          </Button>

          <div className="auth-divider">
            <span>Hoặc</span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="auth-google-button"
          >
            Đăng nhập với Gmail
          </Button>
        </form>

        <p className="auth-footer-text">
          Bạn chưa có tài khoản?{" "}
          <SmartNavLink to="/register" className="auth-link font-medium">
            Đăng ký ngay
          </SmartNavLink>
        </p>
      </div>
    </div>
  );
}
