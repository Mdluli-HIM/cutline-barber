import type { Booking } from "@/lib/slots";

export type Saved = Booking & {
  id: string;
  branch: string;
  service: string;
  name: string;
  phone: string;
  email: string;
  note: string;
  created: string;
};

/* Demo storage: this browser only. The real build swaps these four functions for a database. */
const KEY = "cutline:bookings";

export function loadBookings(): Saved[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Saved[];
  } catch {
    return [];
  }
}
function save(list: Saved[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  window.dispatchEvent(new Event("cutline:bookings"));
}
export const addBooking = (b: Saved) => save([...loadBookings(), b]);
export const cancelBooking = (id: string) => save(loadBookings().filter((b) => b.id !== id));
export const clearBookings = () => save([]);
export const newRef = () => "CL-" + Math.random().toString(36).slice(2, 6).toUpperCase();
