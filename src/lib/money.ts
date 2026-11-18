/**
 * Formatação de valores para o público angolano.
 *
 * Convenção usada em Angola: ponto para milhares e vírgula para decimais
 * (ex.: 1.234,56 Kz). Nunca usar o formato americano "1,234.56" nem o
 * espaço fino do pt-PT ("1 234,56"), que confunde quem lê à pressa.
 *
 * Kz mostra cêntimos apenas quando existem: "12.500 Kz" ou "17.388,50 Kz".
 */

export type PriceCurrency = "AOA" | "USD" | "EUR" | "CNY";

const CURRENCY_SYMBOL: Record<Exclude<PriceCurrency, "AOA">, string> = {
  USD: "US$",
  EUR: "€",
  CNY: "CN¥",
};

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Formata um número simples (sem símbolo) no padrão angolano.
 * `maximumFractionDigits` limita a 0, 1 ou 2 casas decimais.
 */
export function formatNumber(value: number, maximumFractionDigits = 0): string {
  const safe = Number.isFinite(value) ? value : 0;
  const decimals = Math.min(2, Math.max(0, Math.trunc(maximumFractionDigits)));
  const fixed = Math.abs(safe).toFixed(decimals);
  const [intPart, fracPart] = fixed.split(".");
  const grouped = groupThousands(intPart);
  const sign = safe < 0 ? "-" : "";
  return fracPart ? `${sign}${grouped},${fracPart}` : `${sign}${grouped}`;
}

/**
 * Formata cêntimos de Kwanza. Ex.: 1738850 → "17.388,50 Kz".
 */
export function formatKzCents(cents: number): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0;
  const abs = Math.abs(safe);
  const units = Math.floor(abs / 100);
  const remainder = abs % 100;
  const amount =
    remainder === 0
      ? groupThousands(String(units))
      : `${groupThousands(String(units))},${String(remainder).padStart(2, "0")}`;
  return `${safe < 0 ? "-" : ""}${amount} Kz`;
}

/**
 * Formata um valor em Kwanzas (unidades, não cêntimos). Ex.: 17388.5 → "17.388,50 Kz".
 */
export function formatKzAmount(amount: number): string {
  return formatKzCents(Math.round((Number.isFinite(amount) ? amount : 0) * 100));
}

/**
 * Formata um preço na moeda de origem do fornecedor.
 * Ex.: 18.9 USD → "US$ 18,90"; 450 EUR → "€ 450,00".
 */
export function formatForeign(amount: number, currency: PriceCurrency | string): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  if (currency === "AOA") return formatKzAmount(safe);
  const symbol = CURRENCY_SYMBOL[currency as Exclude<PriceCurrency, "AOA">] ?? "US$";
  return `${symbol} ${formatNumber(safe, 2)}`;
}
