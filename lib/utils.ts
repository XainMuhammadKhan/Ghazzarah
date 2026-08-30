export const formatPrice = (value: number, currency: string = "PKR"): string => {
  const locale = currency === "PKR" ? "en-PK" : undefined;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};