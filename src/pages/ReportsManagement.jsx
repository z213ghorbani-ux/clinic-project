import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Trash2,
  FileText,
  Clock,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Receipt,
  Loader2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

// کامپوننت تقویم شمسی پروژه و سرویس API
import { PersianDatePicker } from "@/components/ui/persian-datepicker";
import reportService from "@/services/reportService";

export default function ReportsManagement() {
  const navigate = useNavigate();

  // استیت‌های داده و بارگذاری
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  // استیت‌های فیلتر
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // استیت‌های حذف گروهی
  const [deleteFromDate, setDeleteFromDate] = useState("");
  const [deleteToDate, setDeleteToDate] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // استیت مودال فاکتور
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // دریافت داده از بک‌ند
  const fetchReports = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const result = await reportService.getReports({
          page,
          search: searchTerm,
          from_date: fromDate,
          to_date: toDate,
        });

        console.log("پاسخ سرور برای گزارش‌ها:", result);

        let list = [];
        let currentPage = 1;
        let lastPage = 1;
        let totalRecords = 0;

        // سناریو ۱: اگر پاسخ مستقیم یک آرایه باشد
        if (Array.isArray(result)) {
          list = result;
          totalRecords = result.length;
        }
        // سناریو ۲: پاسخ استاندارد لاراول با متد paginate (دارای data داخل خودش)
        else if (result?.data && Array.isArray(result.data)) {
          list = result.data;
          currentPage = result.current_page || 1;
          lastPage = result.last_page || 1;
          totalRecords = result.total ?? result.data.length;
        }
        // سناریو ۳: ساختار تو در تو { status: "success", data: { data: [...], current_page: 1 } }
        else if (result?.data?.data && Array.isArray(result.data.data)) {
          list = result.data.data;
          currentPage = result.data.current_page || 1;
          lastPage = result.data.last_page || 1;
          totalRecords = result.data.total ?? list.length;
        }
        // سناریو ۴: ساختار دارای کلید reports
        else if (result?.reports) {
          list = Array.isArray(result.reports)
            ? result.reports
            : result.reports.data || [];
          totalRecords = result.reports.total || list.length;
          currentPage = result.reports.current_page || 1;
          lastPage = result.reports.last_page || 1;
        }

        setReports(list);
        setPagination({
          currentPage,
          lastPage,
          total: totalRecords,
        });
      } catch (error) {
        console.error("خطا در دریافت گزارش‌ها:", error);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, fromDate, toDate],
  );

  // ریست کردن فیلترها
  const handleResetFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setTimeout(() => {
      reportService.getReports({ page: 1 }).then((res) => {
        if (res.status === "success" && res.data) {
          setReports(res.data.data || []);
          setPagination({
            currentPage: res.data.current_page || 1,
            lastPage: res.data.last_page || 1,
            total: res.data.total || 0,
          });
        }
      });
    }, 50);
  };

  // حذف گروهی
  const handleConfirmBatchDelete = async () => {
    if (!deleteFromDate || !deleteToDate) {
      alert("لطفاً هر دو تاریخ شروع و پایان را انتخاب کنید.");
      return;
    }

    setDeleting(true);
    try {
      const res = await reportService.batchDeleteReports(
        deleteFromDate,
        deleteToDate,
      );
      alert(res.message || "سوابق بازه انتخابی با موفقیت حذف شدند.");
      setIsDeleteDialogOpen(false);
      setDeleteFromDate("");
      setDeleteToDate("");
      fetchReports(1);
    } catch (error) {
      alert(error.response?.data?.message || "خطا در انجام عملیات حذف.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* هدر صفحه به همراه دکمه بازگشت */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              گزارش‌ها و آمار مراجعین
            </h1>
            <p className="text-xs text-slate-500">
              مشاهده چرخه جوابدهی، فاکتورها و سوابق اقدامات کاربران
            </p>
          </div>
        </div>

        {/* دکمه بازگشت */}
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت</span>
        </Button>
      </div>

      {/* باکس فیلترها با تقویم شمسی */}
      <Card className="shadow-2xs border-slate-200">
        <CardContent className="pt-6">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
          >
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                جستجوی سوابق
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                <Input
                  type="text"
                  placeholder="نام بیمار، کدملی، موبایل یا پرونده..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9 h-10 border-slate-300"
                />
              </div>
            </div>

            {/* تقویم شمسی از تاریخ */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                از تاریخ:
              </label>
              <PersianDatePicker
                value={fromDate}
                onChange={(date) => setFromDate(date)}
                placeholder="انتخاب تاریخ شروع"
              />
            </div>

            {/* تقویم شمسی تا تاریخ */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                تا تاریخ:
              </label>
              <PersianDatePicker
                value={toDate}
                onChange={(date) => setToDate(date)}
                placeholder="انتخاب تاریخ پایان"
              />
            </div>

            {/* دکمه‌های فیلتر و ریست */}
            <div className="md:col-span-2 flex gap-2">
              <Button
                type="submit"
                className="flex-1 h-10 bg-teal-600 hover:bg-teal-700 text-xs"
              >
                اعمال فیلتر
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
                className="h-10 px-3 border-slate-300 text-slate-600 hover:bg-slate-100"
                title="پاک‌سازی فیلترها"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* جدول داده‌ها */}
      <Card className="shadow-2xs border-slate-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[300px] relative">
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            )}

            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-right font-bold w-40">
                    نام بیمار
                  </TableHead>
                  <TableHead className="text-center font-bold w-28">
                    کد ملی
                  </TableHead>
                  <TableHead className="text-center font-bold w-28">
                    موبایل
                  </TableHead>
                  <TableHead className="text-center font-bold w-24">
                    پرونده
                  </TableHead>
                  <TableHead className="text-right font-bold min-w-[340px]">
                    سوابق و چرخه جوابدهی (اقدامات کاربران / پزشک)
                  </TableHead>
                  <TableHead className="text-center font-bold w-36">
                    فاکتور و امور مالی
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-slate-400"
                    >
                      هیچ رکوردی برای نمایش یافت نشد.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-slate-50/70 border-b"
                    >
                      <TableCell className="font-semibold text-slate-800">
                        {row.patient?.name || "نامشخص"}
                        <span className="block text-[11px] text-slate-400 font-normal mt-0.5">
                          {row.created_at?.substring(0, 10)}
                        </span>
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs text-slate-600">
                        {row.patient?.national_code || "-"}
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs text-slate-600">
                        {row.patient?.phone || "-"}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs text-slate-700 bg-slate-50"
                        >
                          {row.patient?.case_number || row.id}
                        </Badge>
                      </TableCell>

                      {/* چرخه جوابدهی و اقدامات */}
                      <TableCell className="py-3">
                        <div className="space-y-2">
                          {row.audit_logs && row.audit_logs.length > 0 ? (
                            row.audit_logs.map((log) => (
                              <div
                                key={log.id}
                                className="p-2.5 rounded-lg border bg-white border-slate-200 text-xs shadow-2xs"
                              >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                                    {log.user?.name || "کاربر سیستم"}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {log.created_at}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-[11px]">
                                  {log.action_description || log.action}
                                </p>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">
                              اقدامی ثبت نشده است.
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* فاکتور مالی */}
                      <TableCell className="text-center">
                        {row.invoice ? (
                          <div className="space-y-1.5">
                            <div className="font-mono text-xs font-bold text-slate-800">
                              {Number(
                                row.invoice.final_amount ||
                                  row.invoice.total_amount,
                              ).toLocaleString("fa-IR")}{" "}
                              ت
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1 border-slate-300 w-full"
                              onClick={() => {
                                setSelectedInvoice(row.invoice);
                                setIsInvoiceOpen(true);
                              }}
                            >
                              <Receipt className="w-3.5 h-3.5 text-teal-600" />
                              مشاهده فاکتور
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            فاقد فاکتور
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* صفحه‌بندی (Pagination) */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              مجموع سوابق: {pagination.total} رکورد
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={pagination.currentPage <= 1}
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    currentPage: p.currentPage - 1,
                  }))
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="text-xs font-mono">
                {pagination.currentPage} از {pagination.lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={pagination.currentPage >= pagination.lastPage}
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    currentPage: p.currentPage + 1,
                  }))
                }
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* باکس حذف دسته‌ای مراجعین با تقویم شمسی */}
      <Card className="border-rose-200 bg-rose-50/40 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-rose-800 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>مدیریت و حذف گروهی سوابق گزارش‌ها</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                از تاریخ:
              </label>
              <PersianDatePicker
                value={deleteFromDate}
                onChange={(date) => setDeleteFromDate(date)}
                placeholder="شروع بازه حذف"
              />
            </div>
            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                تا تاریخ:
              </label>
              <PersianDatePicker
                value={deleteToDate}
                onChange={(date) => setDeleteToDate(date)}
                placeholder="پایان بازه حذف"
              />
            </div>
            <div className="md:col-span-4">
              <Button
                variant="destructive"
                className="w-full h-10 text-xs gap-1.5 bg-rose-600 hover:bg-rose-700"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                حذف سوابق این بازه
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* مودال تایید حذف گروهی */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-rose-700 flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              تایید عملیات حذف سوابق
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-600 leading-relaxed py-2">
            آیا از حذف کلیه گزارش‌ها و مراجعات ثبت‌شده از تاریخ{" "}
            <span className="font-bold text-slate-800">{deleteFromDate}</span>{" "}
            تا <span className="font-bold text-slate-800">{deleteToDate}</span>{" "}
            اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
          </p>
          <DialogFooter className="gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={handleConfirmBatchDelete}
            >
              {deleting ? "در حال حذف..." : "بله، حذف شود"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
