import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, Check, X, FileText, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InvoiceModal({
  isOpen,
  onClose,
  queueItems = [],
  onConfirmInvoice,
}) {
  // نگهداری مبالغ بر اساس کلید یکتا برای جلوگیری از پاک شدن هنگام رندر
  const [itemPrices, setItemPrices] = useState({});
  const [discount, setDiscount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // استخراج تمام خدمات صف
  const flattenedServices = (queueItems || []).flatMap((q, qIdx) =>
    (q.services || []).map((s, sIdx) => ({
      uniqueKey: `${q.tempId || qIdx}-${s.serviceId || sIdx}`,
      tempId: q.tempId,
      serviceId: s.serviceId,
      patientName:
        q.patient?.full_name ||
        `${q.patient?.first_name || ""} ${q.patient?.last_name || ""}`.trim() ||
        q.patientName ||
        "نامشخص",
      nationalCode:
        q.patient?.national_id ||
        q.patient?.national_code ||
        q.nationalCode ||
        "---",
      doctorName:
        q.doctor?.name || q.doctor?.full_name || q.doctorName || "---",
      serviceTitle:
        s.serviceId === "other"
          ? s.customName || "سایر خدمات"
          : s.serviceTitle || s.name || s.title || s.serviceId,
      defaultPrice: Number(s.price) || 0,
    })),
  );

  // مقداردهی اولیه قیمت‌ها فقط یک‌بار هنگام باز شدن مودال
  useEffect(() => {
    if (isOpen) {
      const initialPrices = {};
      flattenedServices.forEach((item) => {
        initialPrices[item.uniqueKey] = item.defaultPrice;
      });
      setItemPrices(initialPrices);
      setDiscount(0);
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [isOpen]);

  const handlePriceChange = (key, value) => {
    const numericValue = value === "" ? "" : Number(value);
    setItemPrices((prev) => ({
      ...prev,
      [key]: numericValue,
    }));
  };

  const totalPrice = flattenedServices.reduce(
    (sum, item) => sum + (Number(itemPrices[item.uniqueKey]) || 0),
    0,
  );

  const discountValue = Number(discount) || 0;
  const payableAmount = Math.max(0, totalPrice - discountValue);

  // تابع استاندارد پرینت و ذخیره به عنوان PDF
  const handlePrint = () => {
    const invoiceDate = new Date().toLocaleDateString("fa-IR");
    const invoiceTime = new Date().toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const rowsHtml = flattenedServices
      .map((item, idx) => {
        const price = Number(itemPrices[item.uniqueKey]) || 0;
        return `
          <tr>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px;">${idx + 1}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">${item.serviceTitle}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">${item.patientName} (${item.nationalCode})</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">${item.doctorName}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; font-family: Tahoma, sans-serif;">
              ${price.toLocaleString("fa-IR")} تومان
            </td>
          </tr>
        `;
      })
      .join("");

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <title>صورت‌حساب - ${invoiceNumber}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body {
            font-family: Tahoma, Arial, sans-serif;
            margin: 0;
            padding: 10px;
            color: #1e293b;
            direction: rtl;
            font-size: 12px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #0f766e;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header h2 { margin: 0 0 4px; color: #0f766e; font-size: 18px; }
          .meta-box {
            display: flex;
            justify-content: space-between;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #f1f5f9;
            color: #334155;
            padding: 8px;
            border: 1px solid #cbd5e1;
            text-align: right;
          }
          .summary-wrap {
            display: flex;
            justify-content: flex-end;
          }
          .summary-table {
            width: 280px;
            border-collapse: collapse;
          }
          .summary-table td {
            padding: 6px 10px;
            border: 1px solid #e2e8f0;
          }
          .total-row {
            background: #0f766e;
            color: #fff;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
            border-top: 1px dashed #cbd5e1;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>صورت‌حساب خدمات آزمایشگاه و کلینیک</h2>
          <p style="margin: 0; color: #64748b;">سیستم مدیریت یکپارچه درمانگاه</p>
        </div>
        <div class="meta-box">
          <span><strong>شماره فاکتور:</strong> ${invoiceNumber}</span>
          <span><strong>تاریخ:</strong> ${invoiceDate} - ${invoiceTime}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th>عنوان خدمت</th>
              <th>بیمار (کد ملی)</th>
              <th>پزشک</th>
              <th style="width: 130px; text-align: center;">مبلغ</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="summary-wrap">
          <table class="summary-table">
            <tr>
              <td>جمع کل:</td>
              <td style="text-align: left;">${totalPrice.toLocaleString("fa-IR")} تومان</td>
            </tr>
            <tr>
              <td>تخفیف:</td>
              <td style="text-align: left;">${discountValue.toLocaleString("fa-IR")} تومان</td>
            </tr>
            <tr class="total-row">
              <td style="border-color: #0f766e;">مبلغ قابل پرداخت:</td>
              <td style="text-align: left; border-color: #0f766e;">${payableAmount.toLocaleString("fa-IR")} تومان</td>
            </tr>
          </table>
        </div>
        <div class="footer">
          این برگه به عنوان تاییدیه مالی خدمات صادر شده است.
        </div>
      </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }, 500);
  };

  // تایید و برگرداندن آیتم‌های صف همراه با قیمت‌های جدید
  const handleConfirm = () => {
    // بازسازی queueItems با اعمال مبالغ جدید به هر سرویس
    const updatedQueue = queueItems.map((q, qIdx) => {
      const updatedServices = (q.services || []).map((s, sIdx) => {
        const key = `${q.tempId || qIdx}-${s.serviceId || sIdx}`;
        return {
          ...s,
          price: Number(itemPrices[key]) || 0,
        };
      });

      return {
        ...q,
        services: updatedServices,
      };
    });

    if (onConfirmInvoice) {
      onConfirmInvoice({
        updatedQueue,
        totalPrice,
        discount: discountValue,
        payableAmount,
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl w-[95vw] lg:max-w-5xl max-h-[90vh] overflow-y-auto p-6"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center justify-between border-b pb-3 text-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>پیش‌فاکتور و تسویه خدمات ثبت‌شده</span>
            </div>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              تعداد ردیف‌ها: {flattenedServices.length}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* جدول آیتم‌ها */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead className="text-right font-bold">خدمت</TableHead>
                  <TableHead className="text-right font-bold">بیمار</TableHead>
                  <TableHead className="text-right font-bold">پزشک</TableHead>
                  <TableHead className="text-center w-48 font-bold">
                    تعرفه / مبلغ (تومان)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flattenedServices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-slate-400"
                    >
                      هیچ آیتمی برای صدور فاکتور در صف وجود ندارد.
                    </TableCell>
                  </TableRow>
                ) : (
                  flattenedServices.map((item, idx) => (
                    <TableRow
                      key={item.uniqueKey}
                      className="hover:bg-slate-50/60"
                    >
                      <TableCell className="text-center text-slate-500">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800">
                        {item.serviceTitle}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {item.patientName}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {item.doctorName}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={itemPrices[item.uniqueKey] ?? ""}
                          placeholder="0"
                          onChange={(e) =>
                            handlePriceChange(item.uniqueKey, e.target.value)
                          }
                          className="h-9 text-center font-mono font-medium text-sm border-slate-300 focus:border-teal-500"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* نوار خلاصه مالیات و تخفیف */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">جمع خدمات:</span>
              <span className="font-bold text-slate-800 font-mono">
                {totalPrice.toLocaleString("fa-IR")} تومان
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">تخفیف کل:</span>
              <Input
                type="number"
                value={discount === 0 ? "" : discount}
                placeholder="0"
                onChange={(e) =>
                  setDiscount(e.target.value === "" ? 0 : e.target.value)
                }
                className="w-28 h-9 text-center font-mono text-sm bg-white"
              />
              <span className="text-xs text-slate-500">تومان</span>
            </div>

            <div className="flex items-center gap-2 font-bold text-teal-900 bg-teal-100/70 px-4 py-2 rounded-lg border border-teal-200">
              <span className="text-sm">مبلغ نهایی:</span>
              <span className="font-mono text-base">
                {payableAmount.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-between items-center gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            disabled={flattenedServices.length === 0}
            className="gap-2 border-slate-300"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            چاپ فاکتور / PDF
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              انصراف
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={flattenedServices.length === 0}
              className="bg-teal-600 hover:bg-teal-700 text-white gap-2 px-6"
            >
              <Check className="w-4 h-4" />
              تایید و اعمال قیمت‌ها
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
