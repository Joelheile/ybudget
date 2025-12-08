export function parseAmount(amount: string): number {
  const cleaned = amount.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}
