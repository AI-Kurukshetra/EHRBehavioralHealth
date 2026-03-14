export const APPOINTMENT_TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
] as const;

export const isValidAppointmentSlot = (time: string) =>
  (APPOINTMENT_TIME_SLOTS as readonly string[]).includes(time);

export const getDateInputValue = (scheduledAt: string) => scheduledAt.slice(0, 10);

export const getTimeInputValue = (scheduledAt: string) => scheduledAt.slice(11, 16);
