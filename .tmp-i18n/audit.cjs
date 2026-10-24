/* ممیزی پاریتی واژه‌نامه‌ها — هر بلوک باید دقیقاً ۴۵۹ کلید یکتا و بدون تکرار داشته باشد */
const fs = require("fs");
const src = fs.readFileSync("/home/z/my-project/src/i18n/dictionaries.ts", "utf8");
const lines = src.split("\n");
const starts = [];
lines.forEach((l, i) => {
  const m = l.match(/^const ([a-z]+)[^=]*= \{$/);
  if (m) starts.push({ lang: m[1], line: i + 1 });
});
let allOk = true;
const keySets = {};
for (let i = 0; i < starts.length; i++) {
  const { lang, line } = starts[i];
  let end = line + 1;
  while (end <= lines.length && !/^};$|^} as const;$/.test(lines[end - 1].trim())) end++;
  const keys = [];
  const dups = new Set();
  for (let l = line + 1; l <= end - 1; l++) {
    const m = lines[l - 1]?.match(/^  "([^"]+)":/);
    if (m) {
      if (keys.includes(m[1])) dups.add(m[1]);
      keys.push(m[1]);
    }
  }
  keySets[lang] = new Set(keys);
  const ok = keys.length === 459 && dups.size === 0;
  if (!ok) allOk = false;
  console.log(lang.padEnd(3), "keys:", keys.length, dups.size ? "DUPS: " + [...dups].join(",") : "", ok ? "OK" : "FAIL");
}
const base = keySets.fa;
for (const [lang, set] of Object.entries(keySets)) {
  const missing = [...base].filter((k) => !set.has(k));
  const extra = [...set].filter((k) => !base.has(k));
  if (missing.length || extra.length) {
    allOk = false;
    console.log("PARITY FAIL", lang, "missing:", missing.slice(0, 5), "extra:", extra.slice(0, 5));
  }
}
console.log(allOk ? "ALL 13 BLOCKS PARITY OK" : "FAILURES PRESENT");
