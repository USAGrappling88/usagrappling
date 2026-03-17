import { format } from "date-fns";

export const US_CENTRAL_TIMEZONE = "America/Chicago";

const centralDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: US_CENTRAL_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const parseDateOnly = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getTodayCentralDateString = (now = new Date()) => {
  const parts = centralDateFormatter.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return format(now, "yyyy-MM-dd");
  }

  return `${year}-${month}-${day}`;
};
