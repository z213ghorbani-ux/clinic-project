import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  FolderArchive,
  BarChart3,
  UserPlus,
  FileText,
  LogOut,
  Clock,
  Calendar,
  ChevronLeft,
  Activity,
} from "lucide-react";

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // استخراج نام کاربر از لاگین قبلی یا مقدار پیش‌فرض
  const user = JSON.parse(
    localStorage.getItem("user") ||
      '{"name": "علی عزیز", "role": "مدیر سیستم"}',
  );

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // ساعت و دقیقه بدون ثانیه
      const timeStr = new Intl.DateTimeFormat("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);

      // تاریخ کامل شمسی
      const dateStr = new Intl.DateTimeFormat("fa-IR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now);

      setCurrentTime(timeStr);
      setCurrentDate(dateStr);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 10000); // به‌روزرسانی هر ۱۰ ثانیه کافی است
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    try {
      // ۱. ابتدا سعی کن تابع پاس داده شده را اجرا کنی
      if (onLogout && typeof onLogout === "function") {
        onLogout();
      } else {
        // ۲. اگر پاس داده نشده بود، خودت پاکسازی کن
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // ۳. هدایت به صفحه لاگین
        navigate("/login");
      }
    } catch (error) {
      console.error("خطا در خروج:", error);
      // خروج اضطراری در صورت بروز خطا
      window.location.href = "/login";
    }
  };
  return (
    <div
      className="min-h-screen bg-slate-50/60 text-slate-800 antialiased font-['Vazirmatn']"
      dir="rtl"
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
              {user.name ? user.name[0] : "U"}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {user.name}
              </div>
              <div className="text-xs text-slate-400 font-normal">
                {user.role || "کاربر سیستم"}
              </div>
            </div>
          </div>

          {/* Date & Time (Minimalist Capsule) */}
          <div className="hidden md:flex items-center gap-4 bg-slate-100/70 border border-slate-200/60 px-4 py-1.5 rounded-full text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentDate}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">
                {currentTime}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9">
        {/* Section: Management */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
            <h2 className="text-sm font-bold text-slate-800">مدیریت سیستم</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Doctors */}
            <div
              onClick={() => navigate("/doctors")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/doctors")}
              className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">
                  <Users className="w-5 h-5" />
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:-translate-x-1 transition-all duration-200" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                  مدیریت پزشکان
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-1">
                  مشاهده، ویرایش و ثبت اطلاعات پزشکان
                </p>
              </div>
            </div>

            {/* Secretaries */}
            <div
              onClick={() => navigate("/secretaries")}
              className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                  مدیریت منشی‌ها
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-1">
                  کنترل دسترسی‌ها و پرسنل پذیرش
                </p>
              </div>
            </div>

            {/* Archive */}
            <div
              onClick={() => navigate("/archive")}
              className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-amber-100 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors">
                  بایگانی و سوابق
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-1">
                  سوابق پزشکی، پرونده‌ها و فاکتورها
                </p>
              </div>
            </div>

            {/* Reports */}
            <div
              onClick={() => navigate("/reports")}
              className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-purple-100 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-purple-600 transition-colors">
                  گزارش‌ها و آمار
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-1">
                  گزارش‌های مالی و عملکرد درمانگاه
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Quick Actions */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
            <h2 className="text-sm font-bold text-slate-800">
              عملیات سریع پذیرش و درمان
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New Patient Registration */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-500/5 transition-all flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    مدیریت بیماران
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                     پرونده ها مشخصات بیمار
                  </p>
                  <button
                    onClick={() => navigate("/Patients")}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    <span>مشاهده اطلاعات</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Test Results / Reports */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-teal-100 hover:shadow-lg hover:shadow-teal-500/5 transition-all flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    ثبت جوابدهی
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    ثبت نتایج آزمایش‌ها، عکس‌ها و فایل‌های ضمیمه
                  </p>
                  <button
                    onClick={() => navigate("/results")}
                    className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    <span>ثبت و ویرایش جواب</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
