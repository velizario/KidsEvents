import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function toCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
}

export function keysToCamelCase(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(keysToCamelCase);
  }
  return Object.keys(obj).reduce((acc: any, key: string) => {
    acc[toCamelCase(key)] = keysToCamelCase(obj[key]);
    return acc;
  }, {});
}

/**
 * Transforms a Bulgarian mobile number to E.164 format
 * Example: 0898788555 -> +359898788555
 */
export function transformBulgarianMobileToE164(phone: string): string {
  if (!phone) return "";

  let cleanedPhone = phone.replace(/[\s()-]/g, "");

  if (cleanedPhone.startsWith("00")) {
    cleanedPhone = "+" + cleanedPhone.slice(2);
  }

  if (cleanedPhone.startsWith("0")) {
    cleanedPhone = "+359" + cleanedPhone.slice(1);
  }

  return cleanedPhone;
}

/**
 * Transforms an E.164 phone number to Bulgarian local format
 * Example: +359898788555 -> 0898788555
 */
export function transformE164ToBulgarianLocal(phone: string): string {
  if (!phone) return "";

  const p = phone.replace(/[\s()-]/g, "");
  return p.startsWith("+359") ? "0" + p.slice(4) : p;
}
