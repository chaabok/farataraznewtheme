/**
 * Task 134 (درخواست مالک) — خروجی اکسلِ واقعی برای دیتاگریدها:
 *   · «همه اطلاعات در یک ستون» قدیمی ریشه‌کن می‌شود — به‌جای CSV متنی، یک
 *     فایل xlsx واقعی ساخته می‌شود که «هر ستونِ گرید در یک ستونِ مجزای اکسل»
 *     می‌نشیند (هدر در سطر ۱ و داده‌ها از سطر ۲).
 *   · «جهت نمایش هم‌گام با زبان داشبورد»: rtl=true ⇒ SheetView اکسل با
 *     rightToLeft="1" ساخته می‌شود (ستون A از راست)؛ در داشبورد LTR شیت عادی
 *     چپ‌به‌راست است.
 *   · عرض هر ستون اکسل از بلندترین محتوای همان ستون تخمین زده می‌شود.
 *
 * کتابخانهٔ SheetJS با import پویا بارگذاری می‌شود تا به باندل اولیه اضافه
 * نشود (فقط با اولین کلیکِ خروجی دانلود می‌شود).
 */

export interface ExcelExportInput {
  /** متن سرستون‌ها (سطر ۱) — به ترتیبِ فعلیِ گرید */
  headers: string[];
  /** سطرهای داده؛ هر عنصر داخلی = یک ستون اکسل */
  rows: (string | number | null | undefined)[][];
  /** نام پایهٔ فایل (بدون پسوند) — نام شیت اکسل هم از همین ساخته می‌شود */
  fileName: string;
  /** true ⇒ شیت راست‌به‌چپ (زبان‌های RTL داشبورد) */
  rtl: boolean;
}

const EXCEL_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/* محدودیت‌های خودِ اکسل: نام شیت ≤۳۱ نویسه و بدون این حروف */
const MAX_SHEET_NAME = 31;
const ILLEGAL_SHEET_CHARS = /[\\/*?:[\]]/g;

function sheetNameOf(fileName: string): string {
  const clean = fileName.replace(ILLEGAL_SHEET_CHARS, " ").trim();
  const name = (clean.length > 0 ? clean : "Data").slice(0, MAX_SHEET_NAME);
  return name;
}

/** ساخت بایت‌های xlsx — تابع خالص تا خارج از مرورگر هم بازپخش‌پذیر باشد */
export async function buildExcelWorkbook(
  input: ExcelExportInput,
): Promise<Uint8Array> {
  const XLSX = await import("xlsx");

  const aoa: (string | number)[][] = [
    input.headers,
    ...input.rows.map((r) => r.map((v) => (v == null ? "" : v))),
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  /* عرضِ هر ستون: بلندترین متنِ همان ستون + حاشیه؛ محدود به بازهٔ معقول */
  const widths: { wch: number }[] = input.headers.map((h, i) => {
    let len = String(h ?? "").length;
    for (const row of input.rows)
      len = Math.max(len, String(row[i] ?? "").length);
    return { wch: Math.min(48, Math.max(10, len + 4)) };
  });
  ws["!cols"] = widths;

  /* Task 134 — جهتِ شیت = جهتِ داشبورد */
  ws["!views"] = [{ RTL: input.rtl }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetNameOf(input.fileName));

  const out = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    compression: true,
  }) as ArrayBuffer;
  return out instanceof Uint8Array ? out : new Uint8Array(out);
}

/** ساخت فایل و دانلود در مرورگر (xlsx) */
export async function downloadExcel(input: ExcelExportInput): Promise<void> {
  const bytes = await buildExcelWorkbook(input);
  const blob = new Blob([bytes], { type: EXCEL_MIME });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${input.fileName || "export"}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
