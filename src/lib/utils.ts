export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 200);
}

export function generateOrderReference(): string {
  const prefix = "SG";
  const num = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${num}`;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

export function isValidHttpUrl(maybeUrl: string): boolean {
  try {
    const u = new URL(maybeUrl);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function extractProductIdFromSheinUrl(url: string): string | null {
  const m1 = url.match(/p-(\d+)/i);
  if (m1) return m1[1];
  const m2 = url.match(/goods[/-]?sn=?(\d+)/i);
  if (m2) return m2[1];
  const m3 = url.match(/product[/-](\d+)/i);
  if (m3) return m3[1];
  const m4 = url.match(/(\d{6,})/);
  if (m4) return m4[1];
  return null;
}

export function formatPhoneDisplay(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("244") && digits.length >= 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return phone;
}

export function centsToUnits(cents: number): number {
  return cents / 100;
}
