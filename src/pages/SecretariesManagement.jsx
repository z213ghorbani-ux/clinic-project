import React, { useEffect, useMemo, useState } from "react";
import { Users, UserPlus, Pencil, Trash2, Phone, IdCard, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "secretaries_management";
const PAGE_SIZE = 5;

const initialForm = {
  fullName: "",
  nationalId: "",
  mobile: "",
  userLevel: "",
};

export default function SecretariesManagement() {
  const [secretaries, setSecretaries] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(secretaries));
  }, [secretaries]);

  const validate = () => {
    const errs = {};

    if (!formData.fullName.trim()) {
      errs.fullName = "نام و نام خانوادگی منشی الزامی است";
    }

    if (!/^\d{10}$/.test(formData.nationalId.trim())) {
      errs.nationalId = "کد ملی باید ۱۰ رقم باشد";
    }

    if (!/^09\d{9}$/.test(formData.mobile.trim())) {
      errs.mobile = "شماره موبایل معتبر نیست";
    }

    if (!formData.userLevel) {
      errs.userLevel = "نوع کاربر را انتخاب کنید";
    }

    return errs;
  };

  const resetForm = () => {
    setFormData(initialForm);
    setErrors({});
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      id: editingId ?? Date.now(),
      fullName: formData.fullName.trim(),
      nationalId: formData.nationalId.trim(),
      mobile: formData.mobile.trim(),
      userLevel: formData.userLevel,
    };

    if (editingId) {
      setSecretaries((prev) =>
        prev.map((item) => (item.id === editingId ? payload : item)),
      );
      toast.success("اطلاعات منشی با موفقیت ویرایش شد");
    } else {
      setSecretaries((prev) => [payload, ...prev]);
      toast.success("منشی جدید با موفقیت ثبت شد");
    }

    resetForm();
  };

  const handleEdit = (item) => {
    setFormData({
      fullName: item.fullName,
      nationalId: item.nationalId,
      mobile: item.mobile,
      userLevel: item.userLevel,
    });
    setErrors({});
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    setSecretaries((prev) =>
      prev.filter((item) => item.id !== deleteTarget.id),
    );

    if (editingId === deleteTarget.id) {
      resetForm();
    }

    toast.success("منشی با موفقیت حذف شد");
    setDeleteTarget(null);
  };

  const totalPages = Math.max(1, Math.ceil(secretaries.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedSecretaries = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return secretaries.slice(start, end);
  }, [secretaries, safePage]);

  return (
    <TooltipProvider>
      <div dir="rtl" className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* دکمه برگشت به داشبورد */}
            <Link
              to="/dashboard"
              className="group flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              برگشت به داشبورد
            </Link>

            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  مدیریت منشی‌ها
                </h1>
                <p className="text-xs text-slate-500">
                  کنترل دسترسی‌ها و پرسنل پذیرش
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              {secretaries.length.toLocaleString("fa-IR")} منشی ثبت‌شده
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4 text-emerald-600" />
                {editingId ? "ویرایش اطلاعات منشی" : "ثبت منشی جدید"}
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-5 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label>
                    نام و نام خانوادگی منشی
                    <span className="mr-1 text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder="مثال: سارا محمدی"
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    کد ملی
                    <span className="mr-1 text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <IdCard className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      maxLength={10}
                      value={formData.nationalId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          nationalId: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="۱۰ رقم بدون خط تیره"
                      className={`pr-9 ${errors.nationalId ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.nationalId && (
                    <p className="text-xs text-red-500">{errors.nationalId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    شماره موبایل
                    <span className="mr-1 text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="tel"
                      maxLength={11}
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mobile: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="09xxxxxxxxx"
                      className={`pr-9 ${errors.mobile ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.mobile && (
                    <p className="text-xs text-red-500">{errors.mobile}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>
                    نوع کاربر
                    <span className="mr-1 text-red-500">*</span>
                  </Label>

                  <RadioGroup
                    value={formData.userLevel}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, userLevel: value }))
                    }
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="سطح یک" id="level-1" />
                      <Label htmlFor="level-1" className="cursor-pointer">
                        سطح یک
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="سطح دو" id="level-2" />
                      <Label htmlFor="level-2" className="cursor-pointer">
                        سطح دو
                      </Label>
                    </div>
                  </RadioGroup>

                  {errors.userLevel && (
                    <p className="text-xs text-red-500">{errors.userLevel}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 md:col-span-2">
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      انصراف
                    </Button>
                  )}

                  <Button type="submit">
                    {editingId ? "ذخیره تغییرات" : "ثبت منشی"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-base">لیست منشی‌ها</CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              {secretaries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">
                  هنوز هیچ منشی‌ای ثبت نشده است.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">
                            نام و نام خانوادگی
                          </TableHead>
                          <TableHead className="text-left">کد ملی</TableHead>
                          <TableHead className="text-left">
                            شماره موبایل
                          </TableHead>
                          <TableHead className="text-right">
                            نوع کاربر
                          </TableHead>
                          <TableHead className="text-center">عملیات</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {paginatedSecretaries.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.fullName}
                            </TableCell>

                            <TableCell dir="ltr" className="font-mono">
                              {item.nationalId || "-"}
                            </TableCell>

                            <TableCell dir="ltr" className="font-mono">
                              {item.mobile || "-"}
                            </TableCell>

                            <TableCell>
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                {item.userLevel}
                              </span>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="text-slate-500 hover:text-blue-600"
                                      onClick={() => handleEdit(item)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>ویرایش</p>
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="text-slate-500 hover:text-red-600"
                                      onClick={() => setDeleteTarget(item)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>حذف</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safePage === 1}
                        onClick={() => setPage((prev) => prev - 1)}
                      >
                        قبلی
                      </Button>

                      <span className="text-sm text-slate-500">
                        صفحه {safePage.toLocaleString("fa-IR")} از{" "}
                        {totalPages.toLocaleString("fa-IR")}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safePage === totalPages}
                        onClick={() => setPage((prev) => prev + 1)}
                      >
                        بعدی
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>حذف منشی</DialogTitle>
              <DialogDescription className="leading-6">
                {deleteTarget
                  ? `آیا از حذف "${deleteTarget.fullName}" مطمئن هستید؟`
                  : ""}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-row-reverse gap-2 sm:justify-start">
              <Button variant="destructive" onClick={confirmDelete}>
                حذف
              </Button>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                انصراف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
