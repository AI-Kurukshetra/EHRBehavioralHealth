import { addDays, format } from "date-fns";

export const formatRange = (start = new Date(), days = 7) => {
  const end = addDays(start, days);
  return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
};
