export function parseSignedNumber(str) {
  const v = String(str ?? '')
    .trim()
    .replace(',', '.')
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
