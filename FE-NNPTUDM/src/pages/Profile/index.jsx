import { Mail, BadgeCheck, ShieldAlert, User2 } from "lucide-react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

export default function Profile() {
  const user = useSelector((state) => state.auth.user);

  if (!user || Object.keys(user).length === 0) {
    sessionStorage.setItem(
      "redirect_toast",
      JSON.stringify({
        type: "warning",
        message: "Bạn cần đăng nhập để truy cập trang này!",
      }),
    );

    return <Navigate to="/login" replace />;
  }

  //   if (!hasUser) {
  //     return (
  //       <main className="min-h-screen bg-[var(--background)] px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pt-32">
  //         <div className="mx-auto max-w-7xl">
  //           <section
  //             className="
  //               mx-auto w-full max-w-3xl rounded-[32px] border
  //               border-[var(--luxury-border)]
  //               bg-[var(--luxury-surface-strong)]
  //               p-6 text-[var(--luxury-text)]
  //               shadow-[var(--luxury-shadow-strong)]
  //               backdrop-blur-[18px]
  //             "
  //           >
  //             <p className="text-sm text-[var(--luxury-text-soft)]">
  //               Không có thông tin người dùng.
  //             </p>
  //           </section>
  //         </div>
  //       </main>
  //     );
  //   }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pt-32">
      <div className="mx-auto max-w-7xl">
        <section
          className="
            mx-auto w-full max-w-3xl overflow-hidden rounded-[32px] border
            border-[var(--luxury-border)]
            bg-[var(--luxury-surface-strong)]
            text-[var(--luxury-text)]
            shadow-[var(--luxury-shadow-strong)]
            backdrop-blur-[18px]
          "
        >
          <div className="relative p-6 sm:p-8">
            <div
              className="
                pointer-events-none absolute inset-x-0 top-0 h-32
                bg-[linear-gradient(135deg,var(--luxury-gold),transparent)]
                opacity-10
              "
            />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="shrink-0">
                <div
                  className="
                    h-24 w-24 overflow-hidden rounded-full border-2
                    border-[var(--luxury-border)]
                    bg-[var(--luxury-surface)]
                    shadow-[var(--luxury-shadow)]
                    sm:h-28 sm:w-28
                  "
                >
                  <img
                    src={
                      user.avatar ||
                      "https://ui-avatars.com/api/?name=User&background=random"
                    }
                    alt={user.username || "avatar"}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-2xl font-semibold text-[var(--luxury-text)] sm:text-3xl">
                    {user.username || "Chưa có username"}
                  </h1>

                  <span
                    className="
                      inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium
                      border-[var(--luxury-border)]
                      text-[var(--luxury-gold)]
                    "
                    style={{
                      background:
                        "color-mix(in srgb, var(--luxury-gold) 10%, transparent)",
                    }}
                  >
                    Hồ sơ cá nhân
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-[var(--luxury-text-soft)] sm:text-base">
                  <Mail size={16} />
                  <span className="truncate">
                    {user.email || "Chưa có email"}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {user.verify ? (
                    <>
                      <BadgeCheck size={18} className="text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-500">
                        Tài khoản đã xác minh
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={18} className="text-rose-500" />
                      <span className="text-sm font-medium text-rose-500">
                        Tài khoản chưa xác minh
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div
                className="
                  rounded-[24px] border p-5
                  border-[var(--luxury-border)]
                  bg-[var(--luxury-surface)]
                  shadow-[var(--luxury-shadow)]
                "
              >
                <div className="flex items-center gap-2 text-sm text-[var(--luxury-text-soft)]">
                  <User2 size={16} />
                  <span>Username</span>
                </div>

                <p className="mt-3 break-all text-lg font-semibold text-[var(--luxury-text)]">
                  @{user.username || "unknown"}
                </p>
              </div>

              <div
                className="
                  rounded-[24px] border p-5
                  border-[var(--luxury-border)]
                  bg-[var(--luxury-surface)]
                  shadow-[var(--luxury-shadow)]
                "
              >
                <div className="text-sm text-[var(--luxury-text-soft)]">
                  Trạng thái
                </div>

                <p
                  className={`mt-3 text-lg font-semibold ${
                    user.verify ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {user.verify ? "Verified" : "Unverified"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
