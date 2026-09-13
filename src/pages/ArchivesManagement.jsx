import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { PersianDatePicker } from "@/components/ui/persian-datepicker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, Eye, Trash2, Archive, X, ArrowRight } from "lucide-react";

export default function ArchivesManagement() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // لیست بایگانی و صفحه‌بندی
  const [archives, setArchives] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  // مشاهده جزئیات
  const [detailItem, setDetailItem] = useState(null);

  // مودال حذف گروهی
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFrom, setBulkFrom] = useState("");
  const [bulkTo, setBulkTo] = useState("");
  const [bulkError, setBulkError] = useState("");

  // دریافت هدر احراز هویت
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // دریافت لیست رکوردها
  const fetchArchives = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          search: search || undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        };
        const res = await axios.get("/api/archives", {
          params,
          headers: getAuthHeaders(),
        });
        const data = res.data;
        setArchives(Array.isArray(data?.data) ? data.data : []);
        setCurrentPage(data?.current_page ?? 1);
        setLastPage(data?.last_page ?? 1);
        setTotal(data?.total ?? 0);
      } catch (err) {
        console.error("خطا در دریافت بایگانی:", err);
        setArchives([]);
      } finally {
        setLoading(false);
      }
    },
    [search, fromDate, toDate],
  );

  useEffect(() => {
    fetchArchives(1);
  }, [fromDate, toDate]);

  // حذف تک رکورد
  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این رکورد بایگانی مطمئن هستید؟")) return;
    try {
      await axios.delete(`/api/archives/${id}`, {
        headers: getAuthHeaders(),
      });
      fetchArchives(currentPage);
    } catch (err) {
      console.error("خطا در حذف رکورد:", err);
    }
  };

  // حذف گروهی
  const handleBulkDelete = async () => {
    if (!bulkFrom || !bulkTo) {
      setBulkError("هر دو فیلد تاریخ باید وارد شوند.");
      return;
    }
    try {
      const res = await axios.post(
        "/api/archives/bulk-delete",
        {
          from_date: bulkFrom,
          to_date: bulkTo,
        },
        {
          headers: getAuthHeaders(),
        },
      );
      alert(res.data.message || "حذف با موفقیت انجام شد");
      setShowBulkModal(false);
      setBulkFrom("");
      setBulkTo("");
      setBulkError("");
      fetchArchives(1);
    } catch (err) {
      console.error("خطا در حذف گروهی:", err);
      setBulkError("خطا در حذف بایگانی‌ها.");
    }
  };

  // تبدیل لیست اتچمنت‌ها به آرایه
  const getAttachments = (item) => {
    const a = item?.attachments;
    if (Array.isArray(a)) return a;
    try {
      return JSON.parse(a || "[]");
    } catch {
      return [];
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="p-6 space-y-6" dir="rtl">
        {/* هدر صفحه: عنوان، بازگشت به داشبورد و دکمه حذف گروهی */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 border-slate-300 hover:bg-slate-100"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به داشبورد</span>
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Archive className="w-6 h-6" />
              بایگانی و سوابق
            </h1>
          </div>

          <Button
            variant="destructive"
            onClick={() => {
              setShowBulkModal(true);
              setBulkError("");
            }}
          >
            <Trash2 className="w-4 h-4 ml-1" />
            حذف بایگانی‌ها
          </Button>
        </div>

        {/* فیلتر و جستجو */}
        <Card>
          <CardHeader>
            <CardTitle>جستجو و فیلتر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label>جستجو (نام / کد ملی / پرونده / موبایل)</Label>
                <div className="relative">
                  <Search className="absolute right-2 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pr-8"
                    placeholder="جستجو..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>از تاریخ</Label>
                <PersianDatePicker value={fromDate} onChange={setFromDate} />
              </div>
              <div className="space-y-2">
                <Label>تا تاریخ</Label>
                <PersianDatePicker value={toDate} onChange={setToDate} />
              </div>
              <Button onClick={() => fetchArchives(1)} disabled={loading}>
                {loading ? "در حال بارگذاری..." : "اعمال فیلتر"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* جدول داده‌ها */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام بیمار</TableHead>
                  <TableHead>کد ملی</TableHead>
                  <TableHead>شماره پرونده</TableHead>
                  <TableHead>موبایل</TableHead>
                  <TableHead>صدورکننده جواب</TableHead>
                  <TableHead>تاریخ ثبت صدور</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archives.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {loading ? "در حال دریافت..." : "رکوردی یافت نشد"}
                    </TableCell>
                  </TableRow>
                ) : (
                  archives.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.patient_name}</TableCell>
                      <TableCell>{item.national_code}</TableCell>
                      <TableCell>{item.file_number ?? "—"}</TableCell>
                      <TableCell dir="ltr">{item.mobile ?? "—"}</TableCell>
                      <TableCell>{item.issued_by_name ?? "—"}</TableCell>
                      <TableCell>{item.issued_at}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setDetailItem(item)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>مشاهده جزئیات</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>حذف رکورد</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* صفحه‌بندی */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            مجموع: {total} رکورد — صفحه {currentPage} از {lastPage}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => fetchArchives(currentPage - 1)}
            >
              قبلی
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= lastPage}
              onClick={() => fetchArchives(currentPage + 1)}
            >
              بعدی
            </Button>
          </div>
        </div>

        {/* مودال مشاهده جزئیات */}
        {detailItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-xl font-bold">جزئیات پرونده بایگانی</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDetailItem(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* مشخصات پایه */}
              <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-md">
                <p>
                  <b>نام بیمار:</b> {detailItem.patient_name}
                </p>
                <p>
                  <b>کد ملی:</b> {detailItem.national_code}
                </p>
                <p>
                  <b>شماره پرونده:</b> {detailItem.file_number ?? "—"}
                </p>
                <p>
                  <b>موبایل:</b> {detailItem.mobile ?? "—"}
                </p>
                <p>
                  <b>صدورکننده:</b> {detailItem.issued_by_name ?? "—"}
                </p>
                <p>
                  <b>تاریخ صدور:</b> {detailItem.issued_at}
                </p>
              </div>

              {/* اطلاعات فرم جوابدهی */}
              {detailItem.form_data && (
                <div>
                  <h3 className="font-bold mb-2">اطلاعات فرم جواب‌دهی</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm border rounded p-3 bg-card">
                    {Object.entries(detailItem.form_data).map(
                      ([key, value]) => (
                        <p key={key}>
                          <b>{key}:</b> {String(value ?? "—")}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* پیوست‌ها */}
              <div>
                <h3 className="font-bold mb-2">فایل‌های پیوست</h3>
                {getAttachments(detailItem).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    فایلی پیوست نشده است.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {getAttachments(detailItem).map((path, i) => (
                      <li key={i}>
                        <a
                          href={`/api/archives/${detailItem.id}/attachments/${i}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                        >
                          📎 دانلود فایل {i + 1} (
                          {String(path).split("/").pop()})
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* مودال حذف گروهی بایگانی‌ها */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-xl font-bold text-red-600">
                  حذف گروهی بایگانی‌ها
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBulkModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                تمام رکوردهای بایگانی در بازه تاریخ انتخابی به‌طور کامل حذف
                خواهند شد. این عمل قابل بازگشت نیست.
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>از تاریخ</Label>
                  <PersianDatePicker value={bulkFrom} onChange={setBulkFrom} />
                </div>
                <div className="space-y-2">
                  <Label>تا تاریخ</Label>
                  <PersianDatePicker value={bulkTo} onChange={setToDate} />
                </div>
              </div>
              {bulkError && <p className="text-sm text-red-600">{bulkError}</p>}
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 ml-1" />
                تایید و حذف بایگانی‌ها
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
