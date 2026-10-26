import type { Saved } from "@/lib/store";

const p = (n: number) => String(n).padStart(2, "0");

/** a calendar file the customer can open to save the appointment */
export function downloadIcs(b: Saved, title: string, where: string) {
  const [y, m, d] = b.date.split("-").map(Number);
  const [h, mi] = b.start.split(":").map(Number);
  const start = new Date(y, m - 1, d, h, mi);
  const end = new Date(start.getTime() + b.minutes * 60000);
  const f = (x: Date) => `${x.getFullYear()}${p(x.getMonth() + 1)}${p(x.getDate())}T${p(x.getHours())}${p(x.getMinutes())}00`;
  const text = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cutline//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${b.id}@cutline`,
    `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(start)}`,
    `DTEND:${f(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${where}`,
    `DESCRIPTION:Booking reference ${b.id}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `booking-${b.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
