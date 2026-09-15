import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
   import api from "@/services/api";
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
import {
  Search,
  Eye,
  Trash2,
  Archive,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";

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

        // استفاده از کلاینت استاندارد و آدرس صحیح endpoint
        const res = await api.get("/archives", { params });
        const resData = res.data;

        let list = [];
        let curPage = 1;
        let lPage = 1;
        let totalCount = 0;

        // پشتیبانی از ساختارهای مختلف پاسخ کنترلر لاراول
        if (Array.isArray(resData)) {
          list = resData;
          totalCount = resData.length;
        } else if (resData?.data && Array.isArray(resData.data)) {
          list = resData.data;
          curPage = resData.current_page || 1;
          lPage = resData.last_page || 1;
          totalCount = resData.total || resData.data.length;
        } else if (resData?.archives) {
          list = Array.isArray(resData.archives)
            ? resData.archives
            : resData.archives.data || [];
          curPage = resData.archives.current_page || 1;
          lPage = resData.archives.last_page || 1;
          totalCount = resData.archives.total || list.length;
        }

        setArchives(list);
        setCurrentPage(curPage);
        setLastPage(lPage);
        setTotal(totalCount);
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
      await api.delete(`/archives/${id}`);
      fetchArchives(currentPage);
    } catch (err) {
      console.error("خطا در حذف رکورد:", err);
      alert(err.response?.data?.message || "خطا در حذف رکورد");
    }
  };

  // حذف گروهی
  const handleBulkDelete = async () => {
    if (!bulkFrom || !bulkTo) {
      setBulkError("هر دو فیلد تاریخ باید وارد شوند.");
      return;
    }
    try {
      const res = await api.post("/archives/bulk-delete", {
        from_date: bulkFrom,
        to_date: bulkTo,
      });
      alert(res.data?.message || "حذف با موفقیت انجام شد");
      setShowBulkModal(false);
      setBulkFrom("");
      setBulkTo("");
      setBulkError("");
      fetchArchives(1);
    } catch (err) {
      console.error("خطا در حذف گروهی:", err);
      setBulkError(err.response?.data?.message || "خطا در حذف بایگانی‌ها.");
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
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
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
            <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Archive className="w-6 h-6 text-teal-600" />
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
        <Card className="shadow-2xs border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-700">
              جستجو و فیلتر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">
                  جستجو (نام / کد ملی / پرونده / موبایل)
                </Label>
                <div className="relative">
                  <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    className="pr-8 h-10 border-slate-300"
                    placeholder="جستجو..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchArchives(1)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">
                  از تاریخ
                </Label>
                <PersianDatePicker value={fromDate} onChange={setFromDate} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">
                  تا تاریخ
                </Label>
                <PersianDatePicker value={toDate} onChange={setToDate} />
              </div>
              <Button
                onClick={() => fetchArchives(1)}
                disabled={loading}
                className="h-10 bg-teal-600 hover:bg-teal-700 text-white"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "اعمال فیلتر"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* جدول داده‌ها */}
        <Card className="shadow-2xs border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto min-h-[250px] relative">
              {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
              )}

              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="text-right font-bold">
                      نام بیمار
                    </TableHead>
                    <TableHead className="text-center font-bold">
                      کد ملی
                    </TableHead>
                    <TableHead className="text-center font-bold">
                      شماره پرونده
                    </TableHead>
                    <TableHead className="text-center font-bold">
                      موبایل
                    </TableHead>
                    <TableHead className="text-center font-bold">
                      صدورکننده جواب
                    </TableHead>
                    <TableHead className="text-center font-bold">
                      تاریخ ثبت صدور
                    </TableHead>
                    <TableHead className="text-center font-bold">
                      عملیات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archives.length === 0 && !loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-slate-400"
                      >
                        رکوردی یافت نشد
                      </TableCell>
                    </TableRow>
                  ) : (
                    archives.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/70">
                        <TableCell className="font-semibold text-slate-800">
                          {item.patient_name || item.patient?.name || "—"}
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs text-slate-600">
                          {item.national_code ||
                            item.patient?.national_code ||
                            "—"}
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs text-slate-600">
                          {item.file_number || item.patient?.case_number || "—"}
                        </TableCell>
                        <TableCell
                          className="text-center font-mono text-xs text-slate-600"
                          dir="ltr"
                        >
                          {item.mobile || item.patient?.phone || "—"}
                        </TableCell>
                        <TableCell className="text-center text-slate-700">
                          {item.issued_by_name || item.issuer?.name || "—"}
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs text-slate-500">
                          {item.issued_at || item.created_at || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 text-teal-600 border-slate-300"
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
                                  className="h-8 w-8 bg-rose-600 hover:bg-rose-700"
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
            </div>
          </CardContent>
        </Card>

        {/* صفحه‌بندی */}
        <div className="flex items-center justify-between p-2">
          <span className="text-xs text-slate-500">
            مجموع: {total} رکورد — صفحه {currentPage} از {lastPage}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || loading}
              onClick={() => fetchArchives(currentPage - 1)}
            >
              قبلی
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= lastPage || loading}
              onClick={() => fetchArchives(currentPage + 1)}
            >
              بعدی
            </Button>
          </div>
        </div>

        {/* مودال مشاهده جزئیات */}
        {detailItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 border border-slate-200">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-lg font-bold text-slate-800">
                  جزئیات پرونده بایگانی
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDetailItem(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* مشخصات پایه */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p>
                  <b>نام بیمار:</b>{" "}
                  {detailItem.patient_name || detailItem.patient?.name || "—"}
                </p>
                <p>
                  <b>کد ملی:</b>{" "}
                  {detailItem.national_code ||
                    detailItem.patient?.national_code ||
                    "—"}
                </p>
                <p>
                  <b>شماره پرونده:</b>{" "}
                  {detailItem.file_number ||
                    detailItem.patient?.case_number ||
                    "—"}
                </p>
                <p>
                  <b>موبایل:</b>{" "}
                  {detailItem.mobile || detailItem.patient?.phone || "—"}
                </p>
                <p>
                  <b>صدورکننده:</b>{" "}
                  {detailItem.issued_by_name || detailItem.issuer?.name || "—"}
                </p>
                <p>
                  <b>تاریخ صدور:</b>{" "}
                  {detailItem.issued_at || detailItem.created_at || "—"}
                </p>
              </div>

              {/* اطلاعات فرم جوابدهی */}
              {detailItem.form_data && (
                <div>
                  <h3 className="font-bold text-sm text-slate-700 mb-2">
                    اطلاعات فرم جواب‌دهی
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs border border-slate-200 rounded-lg p-3 bg-white">
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
                <h3 className="font-bold text-sm text-slate-700 mb-2">
                  فایل‌های پیوست
                </h3>
                {getAttachments(detailItem).length === 0 ? (
                  <p className="text-xs text-slate-400">
                    فایلی پیوست نشده است.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {getAttachments(detailItem).map((path, i) => (
                      <li key={i}>
                        <a
                          href={`http://188.121.114.194:9000/api/archives/${detailItem.id}/attachments/${i}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-600 hover:underline text-xs flex items-center gap-1 font-mono"
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
            <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-base font-bold text-rose-600">
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
              <p className="text-xs text-slate-500 leading-relaxed">
                تمام رکوردهای بایگانی در بازه تاریخ انتخابی به‌طور کامل حذف
                خواهند شد. این عمل قابل بازگشت نیست.
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    از تاریخ
                  </Label>
                  <PersianDatePicker value={bulkFrom} onChange={setBulkFrom} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    تا تاریخ
                  </Label>
                  <PersianDatePicker value={bulkTo} onChange={setBulkTo} />
                </div>
              </div>
              {bulkError && (
                <p className="text-xs text-rose-600">{bulkError}</p>
              )}
              <Button
                variant="destructive"
                className="w-full bg-rose-600 hover:bg-rose-700 text-xs h-10"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 ml-1.5" />
                تایید و حذف بایگانی‌ها
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
