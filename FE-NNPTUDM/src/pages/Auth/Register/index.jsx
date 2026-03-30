import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";

import { registerSchema } from "@/schemas/registerSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { register as authRegister, setUser } from "@/services/Auth/AuthService";
import SmartNavLink from "@/components/SmartNavLink";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await authRegister(data);
      await dispatch(setUser());
      toast.success("Đăng kí thành công");
      navigate("/", { replace: true });
    } catch (error) {

      const status = error?.response?.status;
      const serverMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "";

      const isDuplicateAccount =
        status === 409 ||
        serverMessage.toLowerCase().includes("duplicate entry");

      if (isDuplicateAccount) {
        const message = "Tài khoản đã tồn tại";

        setError("email", {
          type: "server",
          message,
        });

        toast.error(message);
        return;
      }

      const message = serverMessage || "Đăng ký thất bại, vui lòng thử lại";

      setError("root", {
        type: "server",
        message,
      });

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
            Tạo tài khoản mới
          </div>

          <h2 className="auth-title">Đăng ký</h2>

          <p className="auth-subtitle">
            Tạo tài khoản để bắt đầu mua sắm, lưu sản phẩm yêu thích và theo dõi
            hành trình mùi hương của riêng bạn.
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

          <div className="space-y-2">
            <label className="auth-label">Xác nhận mật khẩu</label>

            <div className="auth-input-wrap">
              <LockKeyhole size={18} className="auth-input-icon" />
              <Input
                className="auth-input"
                type="password"
                placeholder="Nhập lại mật khẩu"
                {...register("confirmPassword")}
              />
            </div>

            {errors.confirmPassword && (
              <p className="auth-error-text">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="auth-checkbox-row">
              <Checkbox />
              <span>Tôi đồng ý với điều khoản</span>
            </label>

            <a href="#" className="auth-link">
              Cần hỗ trợ?
            </a>
          </div>

          <Button
            type="submit"
            className="auth-submit-button"
            disabled={isSubmitting}
          >
            Đăng ký
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
            Đăng ký với Gmail
          </Button>
        </form>

        <p className="auth-footer-text">
          Đã có tài khoản?{" "}
          <SmartNavLink to="/login" className="auth-link font-medium">
            Đăng nhập ngay
          </SmartNavLink>
        </p>
      </div>
    </div>
  );
}