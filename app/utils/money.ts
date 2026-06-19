// Narxni so'm ko'rinishida formatlash. Narxlar butun so'mda saqlanadi.
export function formatMoney(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "0 so'm";
  return `${Math.round(amount).toLocaleString("ru-RU")} so'm`;
}
