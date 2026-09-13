import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Hospital,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/services/api";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password) {
      setError("لطفاً نام کاربری و کلمه عبور را وارد کنید.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login", {
        username: normalizedUsername,
        password,
      });

      console.log("Login response:", response.data);

      /*
       * ساختار فعلی پاسخ بک‌اند:
       * response.data.data.token
       *
       * حالت‌های دیگر هم برای سازگاری پشتیبانی شده‌اند.
       */
      const token =
        response.data?.data?.token ||
        response.data?.token ||
        response.data?.access_token;

      const user = response.data?.data?.user || response.data?.user || null;

      if (!token) {
        console.error("Token not found in response:", response.data);
        setError("ورود موفق بود، اما توکن احراز هویت دریافت نشد.");
        return;
      }

      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        /*
         * در پاسخ فعلی بک‌اند اطلاعات user دیده نمی‌شود؛
         * بنابراین حداقل اطلاعات لازم را ذخیره می‌کنیم.
         */
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: normalizedUsername,
            name: "علی حسینی",
            role: "مدیر کل",
          }),
        );
      }

      // به‌روزرسانی وضعیت احراز هویت در App.jsx
      if (typeof onLoginSuccess === "function") {
        onLoginSuccess(token, user);
      }

      // هدایت قطعی به داشبورد
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);

      const responseData = err.response?.data;
      const validationErrors = responseData?.errors;

      const errorMessage =
        validationErrors?.username?.[0] ||
        validationErrors?.password?.[0] ||
        responseData?.message ||
        (err.code === "ERR_NETWORK"
          ? "ارتباط با سرور برقرار نشد. وضعیت بک‌اند را بررسی کنید."
          : "خطایی هنگام ورود به سامانه رخ داد.");

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10"
      style={{ fontFamily: "Vazirmatn, sans-serif" }}
    >
      {/* پس‌زمینه تزئینی */}
      <div
        aria-hidden="true"
        className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-sky-100/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-100/70 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        {/* عنوان بالای کارت */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/15">
            <Hospital className="h-7 w-7" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            سامانه مدیریت یکپارچه درمانگاه
          </p>
        </div>

        <Card className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur">
          <CardHeader className="space-y-2 px-6 pb-5 pt-7 text-center sm:px-8">
            <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">
              ورود به سامانه
            </CardTitle>

            <CardDescription className="text-sm leading-6 text-slate-500">
              برای دسترسی به داشبورد، اطلاعات حساب خود را وارد کنید
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-5 px-6 sm:px-8">
              {error && (
                <Alert
                  variant="destructive"
                  role="alert"
                  className="rounded-xl border-red-200 bg-red-50 text-right text-red-700"
                >
                  <AlertDescription className="leading-6">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-semibold text-slate-700"
                >
                  نام کاربری
                </Label>

                <div className="relative">
                  <UserRound className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="نام کاربری خود را وارد کنید"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                    autoFocus
                    dir="ltr"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 pr-11 text-left text-base text-slate-900 transition-colors placeholder:text-right placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  کلمه عبور
                </Label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="کلمه عبور خود را وارد کنید"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    dir="ltr"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 px-11 text-left text-base text-slate-900 transition-colors placeholder:text-right placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-slate-200"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "مخفی کردن کلمه عبور" : "نمایش کلمه عبور"
                    }
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 rounded-md text-slate-400 transition-colors hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 px-6 pb-7 pt-6 sm:px-8">
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-slate-900 text-base font-bold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="ml-2 h-5 w-5 animate-spin" />
                    در حال بررسی اطلاعات...
                  </>
                ) : (
                  "ورود به داشبورد"
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4" />
                <span>ورود امن به سامانه مدیریت درمانگاه</span>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-5 text-center text-xs text-slate-400">
          اطلاعات ورود شما به‌صورت امن پردازش می‌شود
        </p>
      </div>
    </main>
  );
}
