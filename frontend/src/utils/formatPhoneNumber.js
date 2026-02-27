export function formatPhoneNumber(phone) {
  if (!phone) return "-";

  const cleaned = ("" + phone).replace(/\D/g, "");
  if (!cleaned || cleaned.length < 7) {
    return phone;
  }

  let countryCode = "";
  let localNumber = "";

  const ccLength = Math.max(1, Math.min(3, cleaned.length - 10));

  if (cleaned.length >= 10) {
    countryCode = cleaned.slice(0, ccLength);
    localNumber = cleaned.slice(ccLength);
  } else {
    return phone;
  }

  if (countryCode === "1" && localNumber.length === 10) {
    return `+1 (${localNumber.slice(0, 3)}) ${localNumber.slice(3, 6)}-${localNumber.slice(6)}`;
  }

  const groups = localNumber.match(/.{1,3}/g) || [];

  if (groups.length > 1 && groups[groups.length - 1].length === 1) {
    const last = groups.pop();
    groups[groups.length - 1] += last;
  }

  return `+${countryCode} ${groups.join(" ")}`;
}