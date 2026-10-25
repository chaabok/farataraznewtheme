/**
 * calendar-date — Task 77 (owner decision 1405/08/03):
 * «تمامی ستون‌های از نوع تاریخ فقط باید بصورت میلادی در بانک اطلاعاتی ذخیره
 * شوند و نباید به تاریخ‌های دیگر در بانک اطلاعاتی ذخیره شوند ولی موقع نمایش
 * در فرم‌ها باید به تاریخ زبان انتخاب شده نمایش داده شوند»
 *
 * CONTRACT:
 *   · STORE  — every date column everywhere is Gregorian 'YYYY-MM-DD' (ISO).
 *   · SHOW   — the UI renders each date in the SELECTED LANGUAGE's calendar:
 *              fa / ps / ckb → Jalali (شمسی) 'YYYY/MM/DD';
 *              all other locales → Gregorian 'YYYY/MM/DD' (same digit shape
 *              so the Task 49 mask works unchanged for both calendars).
 *   · CONVERT — display ⇄ stored happens in the form layer with the helpers
 *              below; the API/DB never sees or returns non-Gregorian dates.
 *
 * Jalali conversion = faithful port of the canonical jalaali-js algorithm
 * (jalCal/g2d/d2g/j2d/d2j — Behrooz Borkowski, dependency-free). Validity is
 * enforced by ROUND-TRIP checks (j→g→j / g→j→g), so impossible dates like
 * 1404/12/30 (non-leap) or 2025-02-30 are rejected without reimplementing
 * leap tables.
 */

/* --------------------------- jalaali-js core --------------------------- */

const div = (a: number, b: number) => Math.trunc(a / b);
const mod = (a: number, b: number) => a - Math.trunc(a / b) * b;
const pad2 = (n: number) => String(n).padStart(2, "0");

/** Breaks in the 33-year Jalali leap cycle (jalaali-js). */
const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
  2192, 2262, 2324, 2394, 2456, 3178,
];

function jalCal(jy: number): { leap: number; gy: number; march: number } {
  const bl = BREAKS.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  let jump = 0;
  if (jy < jp || jy >= BREAKS[bl - 1]) throw new RangeError(`Invalid Jalali year ${jy}`);
  for (let i = 1; i < bl; i += 1) {
    const jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { leap, gy, march };
}

/** Gregorian (y/m/d) → Julian Day Number. */
function g2d(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

/** Julian Day Number → Gregorian (y/m/d). */
function d2g(jdn: number): { gy: number; gm: number; gd: number } {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

/** Jalali (y/m/d) → Julian Day Number. */
function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

/** Julian Day Number → Jalali (y/m/d). */
function d2j(jdn: number): { jy: number; jm: number; jd: number } {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) {
      return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

/* ----------------------------- locale rule ----------------------------- */

/** Languages whose conventional calendar is Jalali (شمسی). */
export const JALALI_LOCALES = ["fa", "ps", "ckb"] as const;

export function isJalaliLocale(locale: string): boolean {
  return (JALALI_LOCALES as readonly string[]).includes(locale);
}

/* ----------------------------- conversions ----------------------------- */

/** Jalali → Gregorian ISO 'YYYY-MM-DD', or null when the date does not exist. */
export function jalaliToGregorianISO(jy: number, jm: number, jd: number): string | null {
  if (jy < 1300 || jy > 1500 || jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;
  let g: { gy: number; gm: number; gd: number };
  try {
    g = d2g(j2d(jy, jm, jd));
  } catch {
    return null;
  }
  // round-trip — rejects impossible Jalali days (e.g. 12/30 of a non-leap year)
  const back = d2j(g2d(g.gy, g.gm, g.gd));
  if (back.jy !== jy || back.jm !== jm || back.jd !== jd) return null;
  return `${g.gy}-${pad2(g.gm)}-${pad2(g.gd)}`;
}

/** Gregorian ISO 'YYYY-MM-DD' → Jalali triple, or null when not a real date. */
export function gregorianISOToJalali(iso: string): { jy: number; jm: number; jd: number } | null {
  const parts = iso.split("-");
  if (parts.length !== 3) return null;
  const gy = Number(parts[0]);
  const gm = Number(parts[1]);
  const gd = Number(parts[2]);
  if (!Number.isInteger(gy) || !Number.isInteger(gm) || !Number.isInteger(gd)) return null;
  const probe = new Date(Date.UTC(gy, gm - 1, gd));
  if (
    probe.getUTCFullYear() !== gy ||
    probe.getUTCMonth() !== gm - 1 ||
    probe.getUTCDate() !== gd
  ) {
    return null; // e.g. 2025-02-30
  }
  return d2j(g2d(gy, gm, gd));
}

/**
 * STORE → SHOW: Gregorian 'YYYY-MM-DD' → the selected language's calendar.
 * fa/ps/ckb → Jalali 'YYYY/MM/DD'; everything else → Gregorian 'YYYY/MM/DD'.
 * Empty/invalid input renders as '' (never throws).
 */
export function storedToDisplayDate(iso: string | null | undefined, locale: string): string {
  if (!iso || iso.trim() === "") return "";
  const j = gregorianISOToJalali(iso.trim());
  if (!j) return "";
  if (isJalaliLocale(locale)) {
    return `${j.jy}/${pad2(j.jm)}/${pad2(j.jd)}`;
  }
  const [gy, gm, gd] = iso.trim().split("-");
  return `${gy}/${gm}/${gd}`;
}

/**
 * SHOW → STORE: the masked display value ('YYYY/MM/DD' or 'YYYYMMDD', typed
 * in the selected language's calendar) → canonical Gregorian 'YYYY-MM-DD',
 * or null when invalid/incomplete.
 */
export function displayToStoredDate(
  raw: string,
  locale: string,
  normalizeDigits: (s: string) => string,
): string | null {
  const digits = normalizeDigits(raw).replace(/[^0-9]/g, "");
  if (digits.length !== 8) return null;
  const y = Number(digits.slice(0, 4));
  const m = Number(digits.slice(4, 6));
  const d = Number(digits.slice(6, 8));
  if (isJalaliLocale(locale)) {
    return jalaliToGregorianISO(y, m, d);
  }
  if (y < 1900 || y > 2199 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) {
    return null;
  }
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/**
 * تعداد ماهِ سپری‌شدهٔ بازهٔ [start, end] روی تاریخِ ذخیره‌شده (میلادی ISO) —
 * دقیق تا سطح روز: 2025-03-21→2026-03-21 = ۱۲؛ 2025-03-21→2026-03-20 = ۱۱.
 * (همان معنای Task 75 که حالا روی تقویمِ ذخیره‌سازی اعمال می‌شود.)
 */
export function monthsBetweenISO(startISO: string, endISO: string): number {
  const [ay, am, ad] = startISO.split("-").map(Number);
  const [by, bm, bd] = endISO.split("-").map(Number);
  let months = by * 12 + bm - (ay * 12 + am);
  if (bd < ad) months -= 1; // ماهِ آخر کامل نشده
  return months;
}
