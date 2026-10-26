import { shop } from "@/data/shop";
import { dayOf, type Booking } from "@/lib/slots";

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** pretend bookings, so the demo looks like a busy shop. The same date always gives the same result. */
export function demoBooked(date: string, branch: string, barbers: string[]): Booking[] {
  const hours = shop.hours[dayOf(date)];
  if (!hours) return [];
  const open = toMin(hours[0]);
  const close = toMin(hours[1]);
  const n = Math.max(1, Math.floor((close - open - 30) / shop.slotStepMinutes));
  const out: Booking[] = [];
  for (const barber of barbers) {
    for (let k = 0; k < 3; k++) {
      const r = hash(`${date}|${branch}|${barber}|${k}`);
      const minutes = (r >>> 4) % 3 === 0 ? 60 : 30;
      const start = open + (r % n) * shop.slotStepMinutes;
      if (start + minutes <= close) out.push({ date, start: toTime(start), minutes, barber });
    }
  }
  return out;
}
