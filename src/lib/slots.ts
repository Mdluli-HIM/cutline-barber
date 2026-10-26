import { shop } from "@/data/shop";

export type Booking = { date: string; start: string; minutes: number; barber: string };

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** the day of the week for a YYYY-MM-DD string, read as a local date */
export const dayOf = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
};

/** free start times for one barber on one date */
function freeFor(date: string, minutes: number, barber: string, booked: Booking[], now: Date) {
  const hours = shop.hours[dayOf(date)];
  if (!hours) return [];
  const open = toMin(hours[0]);
  const close = toMin(hours[1]);
  const mine = booked.filter((b) => b.date === date && b.barber === barber);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [y, mo, d] = date.split("-").map(Number);
  const isToday = new Date(y, mo - 1, d).getTime() === today.getTime();
  const nowMin = now.getHours() * 60 + now.getMinutes() + 30; /* 30 minutes notice */

  const out: string[] = [];
  for (let s = open; s + minutes <= close; s += shop.slotStepMinutes) {
    if (isToday && s < nowMin) continue;
    const clash = mine.some((b) => {
      const bs = toMin(b.start);
      return s < bs + b.minutes && bs < s + minutes;
    });
    if (!clash) out.push(toTime(s));
  }
  return out;
}

/** free times for a barber, or for "any" the times when at least one real barber is free */
export function availableSlots(date: string, minutes: number, barber: string, booked: Booking[], barberIds: string[], now = new Date()) {
  if (barber !== "any") return freeFor(date, minutes, barber, booked, now);
  const all = new Set<string>();
  barberIds.forEach((id) => freeFor(date, minutes, id, booked, now).forEach((t) => all.add(t)));
  return [...all].sort();
}
