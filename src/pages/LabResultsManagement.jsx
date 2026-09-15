import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import {
  ArrowRight,
  Paperclip,
  FileText,
  Receipt,
  CheckCircle2,
  Trash2,
  Printer,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import InvoiceModal from "@/components/InvoiceModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ۱۴ نوع خدمت اعلام شده
const SERVICE_TYPES = [
  { id: "holter_24", title: "هولتر مانیتورینگ 24 ساعته-نوار قلب" },
  { id: "holter_48", title: "هولتر مانیتورینگ 48 ساعته-نوار قلب" },
  { id: "holter_72", title: "هولتر مانیتورینگ 72 ساعته-نوار قلب" },
  { id: "holter_weekly", title: "هولتر هفتگی-نوار قلب" },
  { id: "holter_monthly", title: "هولتر ماهانه-نوار قلب" },
  { id: "holter_bp", title: "هولتر مانیتورینگ فشارخون" },
  { id: "echocardiography", title: "اکوکاردیوگرافی" },
  { id: "stress_echo", title: "استرس اکوکاردیوگرافی" },
  { id: "stress_TDI", title: "نسجی اکوکاردیوگرافی(TDI)" },
  { id: "stress_color", title: "اکوکاردیوگرافی رنگی" },
  { id: "echo_contrast", title: "کانتراست" },
  { id: "ecg", title: "نوار قلب (ECG)" },
  { id: "visit", title: "ویزیت" },
  { id: "consult", title: "مشاوره (consult)" },
  { id: "exercise_test", title: "تست ورزش" },
  { id: "analiz-p.m", title: "آنالیز پیس میکر" },
  { id: "analiz-i.c.d", title: "آنالیز آی‌سی‌دی" },
  { id: "pals-e.p", title: "پالس اکسیمتری حین پروسیجر" },
  { id: "tilt-test", title: "تست تیلت" },
  { id: "monitoring-l", title: "مانیتورینگ مداوم" },
  { id: "pal-e", title: "پالس اکسیمتری" },
  { id: "pro-test", title: "تست پروکائینامید" },
  { id: "cardiac-output", title: "بررسی غیرتهاجمی برون‌ده قلب" },
  { id: "other", title: "سایر" },
];

export default function LabResultsManagement() {
  // دیتای دریافتی واقعی از بک‌اند
  const [doctorsList, setDoctorsList] = useState([]);
  const [patientsSearchResults, setPatientsSearchResults] = useState([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // استیت‌های فرم
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);

  // صف موقت و لیست نهایی
  const [temporaryQueue, setTemporaryQueue] = useState([]);
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [finalRecords, setFinalRecords] = useState([]);

  //---------------
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // ۱. دریافت لیست پزشکان واقعی ثبت شده در سیستم
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoadingDoctors(true);
        const response = await api.get("/doctors");

        const res = response.data;
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : Array.isArray(res?.doctors)
                ? res.doctors
                : [];

        setDoctorsList(list);

        if (list.length === 0) {
          toast.warning("لیست پزشکان خالی است");
        }
      } catch (error) {
        console.error("خطای دریافت پزشکان:", error);
        setDoctorsList([]);
        toast.error("خطا در دریافت لیست پزشکان از سرور");
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // ۲. جستجوی زنده بیماران از دیتابیس با تغییر متن ورودی (Debounce)
  useEffect(() => {
    if (!patientSearch.trim() || selectedPatient?.full_name === patientSearch) {
      setPatientsSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setIsSearchingPatients(true);
        const response = await api.get(
          `/patients?search=${encodeURIComponent(patientSearch)}`,
        );
        const res = response.data;

        const data = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : Array.isArray(res?.patients)
                ? res.patients
                : [];

        setPatientsSearchResults(data);
        setShowPatientDropdown(true);
      } catch (error) {
        console.error("خطا در سرچ بیماران:", error);
      } finally {
        setIsSearchingPatients(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [patientSearch, selectedPatient]);

  // انتخاب بیمار از نتایج سرچ واقعی
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch(
      patient.full_name ||
        `${patient.first_name || ""} ${patient.last_name || ""}`.trim(),
    );
    setShowPatientDropdown(false);
  };

  // مدیریت تیک خدمات و فایل‌ها
  const handleToggleService = (service) => {
    const exists = selectedServices.find((s) => s.serviceId === service.id);
    if (exists) {
      setSelectedServices(
        selectedServices.filter((s) => s.serviceId !== service.id),
      );
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          serviceId: service.id,
          serviceTitle: service.title,
          file: null,
          customName: "",
        },
      ]);
    }
  };

  const handleCustomNameChange = (val) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.serviceId === "other" ? { ...s, customName: val } : s,
      ),
    );
  };

  const handleServiceFileChange = (serviceId, file) => {
    setSelectedServices((prev) =>
      prev.map((s) => (s.serviceId === serviceId ? { ...s, file } : s)),
    );
  };

  // افزودن به لیست موقت
  const handleAddToTemporaryQueue = (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.warning("لطفاً ابتدا بیمار را جستجو و از لیست انتخاب کنید");
      return;
    }
    if (!selectedDoctorId) {
      toast.warning("لطفاً پزشک معالج را انتخاب کنید");
      return;
    }
    if (selectedServices.length === 0) {
      toast.warning("حداقل یک نوع جوابدهی انتخاب نمایید");
      return;
    }

    const doctor = doctorsList.find(
      (d) => String(d.id) === String(selectedDoctorId),
    );

    const newTempItem = {
      tempId: Date.now(),
      patient: selectedPatient,
      doctor: doctor,
      services: [...selectedServices],
      createdAt: new Date().toLocaleTimeString("fa-IR"),
    };

    setTemporaryQueue([...temporaryQueue, newTempItem]);
    toast.success("اطلاعات به لیست موقت اضافه شد");

    // ریست فرم برای ثبت خدمات بعدی
    setSelectedServices([]);
  };

  const handleRemoveFromQueue = (tempId) => {
    setTemporaryQueue(temporaryQueue.filter((item) => item.tempId !== tempId));
    toast.info("مورد از لیست موقت حذف شد");
  };

  const handleCreateInvoice = () => {
    if (temporaryQueue.length === 0) {
      toast.warning("ابتدا باید حداقل یک مورد در لیست موقت وجود داشته باشد");
      return;
    }
    setIsInvoiceModalOpen(true);
  };

  const handleConfirmInvoice = (invoice) => {
    setInvoiceData(invoice);
    setInvoiceCreated(true);
    toast.success(
      `فاکتور ${invoice.invoiceNumber} با مبلغ ${invoice.payableAmount.toLocaleString("fa-IR")} تومان ثبت شد`,
    );
  };

  // ثبت نهایی و ارسال به بک‌اند (/api/archives)
  const handleFinalSubmit = async () => {
    if (temporaryQueue.length === 0) {
      toast.warning("لیست موقت خالی است");
      return;
    }

    try {
      setIsSubmitting(true);

      const primaryPatient = temporaryQueue[0].patient;
      const patientName =
        primaryPatient.full_name ||
        `${primaryPatient.first_name || ""} ${primaryPatient.last_name || ""}`.trim();
      const nationalCode =
        primaryPatient.national_id ||
        primaryPatient.national_code ||
        primaryPatient.nationalId ||
        "0000000000";

      const formData = new FormData();
      formData.append("patient_id", primaryPatient.id || "");
      formData.append("patient_name", patientName);
      formData.append("national_code", nationalCode);
      formData.append("file_number", primaryPatient.file_number || "");
      formData.append(
        "mobile",
        primaryPatient.mobile || primaryPatient.phone || "",
      );
      formData.append("issued_at", new Date().toISOString().split("T")[0]);

      // آماده‌سازی تمام خدمات و پزشکان
      const allServices = [];
      let fileIndex = 0;

      temporaryQueue.forEach((queueItem) => {
        queueItem.services.forEach((s) => {
          const serviceItem = {
            serviceId: s.serviceId,
            serviceTitle:
              s.serviceId === "other" ? s.customName || "سایر" : s.serviceTitle,
            doctorName:
              queueItem.doctor?.name || queueItem.doctor?.full_name || "نامشخص",
            doctorId: queueItem.doctor?.id || null,
          };
          allServices.push(serviceItem);

          if (s.file) {
            formData.append(`files[${fileIndex}]`, s.file);
            fileIndex++;
          }
        });
      });

      const payloadData = {
        hasInvoice: invoiceCreated,
        invoiceDetails: invoiceData,
        services: allServices,
        totalItemsCount: allServices.length,
        submittedAt: new Date().toISOString(),
      };

      formData.append("form_data", JSON.stringify(payloadData));

      // ارسال به بک‌اند
      const response = await api.post("/archives", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uniqueDoctors = Array.from(
        new Set(
          temporaryQueue.map(
            (item) => item.doctor?.name || item.doctor?.full_name,
          ),
        ),
      )
        .filter(Boolean)
        .join(" - ");

      const newFinalRecord = {
        id: response.data?.data?.id || Date.now(),
        patientName: patientName,
        patientNationalId: nationalCode,
        doctors: uniqueDoctors,
        date: new Date().toLocaleDateString("fa-IR"),
        time: new Date().toLocaleTimeString("fa-IR"),
        itemsCount: allServices.length,
        hasInvoice: invoiceCreated,
      };

      setFinalRecords((prev) => [...prev, newFinalRecord]);
      setTemporaryQueue([]);
      setSelectedPatient(null);
      setPatientSearch("");
      setSelectedDoctorId("");
      setInvoiceCreated(false);
      setInvoiceData(null);

      toast.success(
        response.data?.message || "پرونده جوابدهی با موفقیت در سیستم ثبت شد",
      );
    } catch (error) {
      console.error("خطا در ثبت نهایی:", error);
      const serverMessage =
        error.response?.data?.message ||
        "خطا در ثبت اطلاعات در سرور. لطفاً دوباره تلاش کنید.";
      toast.error(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900" dir="rtl">
      {/* هدر */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            داشبورد
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold">ثبت جوابدهی کلینیک</h1>
        </div>

        {/* لینک به صفحه بایگانی */}
        <Link to="/archive">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/5"
          >
            <Paperclip className="w-4 h-4" />
            مشاهده بایگانی پرونده‌ها
          </Button>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* ۱. فرم ورود اطلاعات */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-base font-semibold border-b pb-3 mb-5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            ورود اطلاعات و انتخاب خدمات بیمار
          </h2>

          <form onSubmit={handleAddToTemporaryQueue} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* فیلد ۱: بیمار (متصل به مدیریت بیماران) */}
              <div className="relative">
                <label className="block text-sm font-medium mb-2">
                  نام و نام خانوادگی بیمار
                </label>
                <div className="relative">
                  <Input
                    placeholder="جستجوی نام، فامیلی یا کد ملی بیمار..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      if (
                        selectedPatient &&
                        (selectedPatient.full_name ||
                          selectedPatient.first_name) !== e.target.value
                      ) {
                        setSelectedPatient(null);
                      }
                    }}
                    onFocus={() => {
                      if (patientsSearchResults.length > 0)
                        setShowPatientDropdown(true);
                    }}
                  />
                  <div className="absolute left-3 top-3 text-slate-400">
                    {isSearchingPatients ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* دراپ‌داون بیماران واقعی از دیتابیس */}
                {showPatientDropdown && patientSearch.trim().length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {Array.isArray(patientsSearchResults) &&
                    patientsSearchResults.length > 0
                      ? patientsSearchResults.map((patient) => {
                          const displayName =
                            patient.full_name ||
                            `${patient.first_name || ""} ${patient.last_name || ""}`.trim();
                          const nationalCode =
                            patient.national_id ||
                            patient.national_code ||
                            patient.nationalId;
                          const phone = patient.mobile || patient.phone;

                          return (
                            <div
                              key={patient.id}
                              className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center text-sm"
                              onClick={() => handleSelectPatient(patient)}
                            >
                              <div>
                                <span className="font-semibold text-slate-800">
                                  {displayName}
                                </span>
                                {nationalCode && (
                                  <span className="text-xs text-slate-500 mr-2 font-mono">
                                    ({nationalCode})
                                  </span>
                                )}
                              </div>
                              {phone && (
                                <span className="text-xs font-mono text-slate-500">
                                  {phone}
                                </span>
                              )}
                            </div>
                          );
                        })
                      : !isSearchingPatients && (
                          <div className="p-3 text-sm text-slate-500 text-center">
                            بیماری در سامانه یافت نشد (ابتدا در مدیریت بیماران
                            ثبت کنید)
                          </div>
                        )}
                  </div>
                )}
              </div>

              {/* فیلد ۲: پزشک معالج (متصل به مدیریت پزشکان + امضا) */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  پزشک معالج
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  disabled={isLoadingDoctors}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100"
                >
                  <option value="">
                    {isLoadingDoctors
                      ? "در حال دریافت لیست پزشکان..."
                      : "-- انتخاب پزشک معالج --"}
                  </option>
                  {(Array.isArray(doctorsList) ? doctorsList : []).map(
                    (doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name ||
                          doc.full_name ||
                          doc.user?.name ||
                          `${doc.first_name || ""} ${doc.last_name || ""}`.trim() ||
                          "بدون نام"}

                        {doc.specialty ? ` (${doc.specialty})` : ""}
                      </option>
                    ),
                  )}
                </select>

                {/* نمایش وضعیت امضای پزشک انتخاب شده */}
                {selectedDoctorId &&
                  (() => {
                    const doc = doctorsList.find(
                      (d) => String(d.id) === String(selectedDoctorId),
                    );
                    const hasSig =
                      doc?.signature ||
                      doc?.signature_url ||
                      doc?.signature_path;
                    return (
                      <p
                        className={`text-xs mt-1 ${hasSig ? "text-emerald-600" : "text-amber-600"}`}
                      >
                        {hasSig
                          ? "✓ امضای ثبت‌شده پزشک ضمیمه خواهد شد."
                          : "⚠ پزشک امضای ثبت‌شده در سیستم ندارد."}
                      </p>
                    );
                  })()}
              </div>
            </div>

            {/* فیلد ۳: نوع جوابدهی با فایل اختصاصی */}
            <div>
              <label className="block text-sm font-medium mb-3">
                نوع جوابدهی (امکان انتخاب همزمان):
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border rounded-lg p-4 bg-slate-50/50">
                {SERVICE_TYPES.map((service) => {
                  const isChecked = selectedServices.some(
                    (s) => s.serviceId === service.id,
                  );
                  return (
                    <div
                      key={service.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isChecked
                          ? "bg-white border-primary shadow-sm"
                          : "bg-white/60 border-slate-200"
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input
                          type="checkbox"
                          className="rounded text-primary focus:ring-primary w-4 h-4"
                          checked={isChecked}
                          onChange={() => handleToggleService(service)}
                        />
                        <span className="text-sm font-medium">
                          {service.title}
                        </span>
                      </label>

                      {isChecked && (
                        <div className="mt-2 space-y-2">
                          <input
                            type="file"
                            onChange={(e) =>
                              handleServiceFileChange(
                                service.id,
                                e.target.files[0],
                              )
                            }
                            className="text-xs block w-full file:mr-0 file:ml-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                          />

                          {service.id === "other" && (
                            <Input
                              placeholder="عنوان خدمت را وارد کنید..."
                              className="h-8 text-xs mt-1"
                              onChange={(e) =>
                                handleCustomNameChange(e.target.value)
                              }
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="gap-2">
                افزودن به لیست موقت
              </Button>
            </div>
          </form>
        </div>

        {/* ۲. لیست موقت */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h3 className="font-semibold text-base">
              لیست موقت خدمات پذیرش‌شده
            </h3>
            <Badge variant="outline" className="font-mono">
              {temporaryQueue.length} رکورد
            </Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">نام بیمار</TableHead>
                <TableHead className="text-right">پزشک</TableHead>
                <TableHead className="text-right">خدمات انتخاب‌شده</TableHead>
                <TableHead className="text-center">فایل‌ها</TableHead>
                <TableHead className="text-center">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {temporaryQueue.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-slate-400"
                  >
                    موردی در لیست موقت وجود ندارد.
                  </TableCell>
                </TableRow>
              ) : (
                temporaryQueue.map((item) => (
                  <TableRow key={item.tempId}>
                    <TableCell className="font-medium">
                      {item.patient.full_name ||
                        `${item.patient.first_name || ""} ${item.patient.last_name || ""}`}
                    </TableCell>
                    <TableCell>
                      {item.doctor?.name || item.doctor?.full_name || "---"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.services.map((s, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {s.serviceId === "other"
                              ? s.customName || "سایر"
                              : s.serviceTitle}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">
                      {item.services.filter((s) => s.file).length} فایل
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveFromQueue(item.tempId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* باکس ساخت فاکتور و ثبت نهایی */}
          <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant={invoiceCreated ? "secondary" : "default"}
                onClick={handleCreateInvoice}
                className="gap-2"
              >
                <Receipt className="w-4 h-4" />
                {invoiceCreated ? "فاکتور صادر شد ✓" : "ساخت فاکتور"}
              </Button>
              {invoiceCreated && (
                <span className="text-xs text-emerald-600 font-medium">
                  آماده ثبت نهایی
                </span>
              )}
            </div>

            <Button
              variant="default"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  در حال ثبت و آپلود...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  ثبت نهایی
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ۳. لیست نهایی */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h3 className="font-semibold text-base">لیست نهایی ثبت‌شده‌ها</h3>
            <Badge variant="secondary" className="font-mono">
              {finalRecords.length} پرونده
            </Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right w-[30%]">نام بیمار</TableHead>
                <TableHead className="text-right w-[30%]">
                  پزشکان معالج
                </TableHead>
                <TableHead className="text-center w-[20%]">
                  تاریخ و زمان ثبت
                </TableHead>
                <TableHead className="text-center w-[20%]">
                  وضعیت فاکتور
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finalRecords.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-slate-400"
                  >
                    هنوز پرونده‌ای به ثبت نهایی نرسیده است.
                  </TableCell>
                </TableRow>
              ) : (
                finalRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.patientName}
                      <span className="text-xs text-slate-400 mr-2 font-mono">
                        ({record.patientNationalId})
                      </span>
                    </TableCell>
                    <TableCell>{record.doctors}</TableCell>
                    <TableCell
                      className="text-center font-mono whitespace-nowrap"
                      dir="ltr"
                    >
                      {record.date} - {record.time}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                        {record.hasInvoice ? "فاکتور دارد" : "بدون فاکتور"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* ۴. دکمه صدور جوابدهی */}
          <div className="mt-6 flex justify-end">
            <Button
              size="lg"
              onClick={handleExportResult}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Printer className="w-5 h-5" />
              صدور جوابدهی
            </Button>
          </div>
        </div>
      </div>

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        queueItems={temporaryQueue}
        onConfirmInvoice={handleConfirmInvoice}
      />
    </div>
  );
}
