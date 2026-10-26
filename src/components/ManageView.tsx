"use client";
import { useEffect, useState } from "react";
import { branches, services, barbers } from "@/data/shop";
import { cancelBooking, clearBookings, addBooking, loadBookings, newRef, type Saved } from "@/lib/store";
import { demoBooked } from "@/lib/demo";
import { nice } from "@/components/BookingFlow";

const REAL = barbers.filter((b) => b.id !== "any").map((b) => b.id);
const NAMES = ["Sipho M.", "Naledi K.", "Johan v.d.M.", "Thandi N.", "Pieter B.", "Aisha P.", "Lwazi D.", "Ruan S."];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function ManageView() {
  const [list, setList] = useState<Saved[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const sync = () => setList(loadBookings());
    sync();
    window.addEventListener("cutline:bookings", sync);
    return () => window.removeEventListener("cutline:bookings", sync);
  }, []);

  const samples = () => {
    const t = new Date();
    let n = 0;
    for (let i = 0; i < 4; i++) {
      const date = iso(new Date(t.getFullYear(), t.getMonth(), t.getDate() + i));
      demoBooked(date, "b1", REAL).slice(0, 3).forEach((b) => {
        addBooking({
          ...b,
          id: newRef(),
          branch: "b1",
          service: services[n % services.length].id,
          name: NAMES[n % NAMES.length],
          phone: "082 000 0000",
          email: "",
          note: "Sample booking",
          created: new Date().toISOString(),
        });
        n++;
      });
    }
  };

  const shown = list
    .filter((b) => filter === "all" || b.branch === filter)
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const dates = [...new Set(shown.map((b) => b.date))];

  return (
    <main className="flow">
      <h1>Bookings</h1>
      <p className="sub">Demo owner view. In the live version this sits behind a login, and every device sees the same bookings.</p>
      <div className="row">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by store">
          <option value="all">All stores</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <button className="btn btn--ghost" onClick={samples}>Add sample bookings</button>
        <button className="btn btn--ghost" onClick={() => confirm("Remove all demo bookings?") && clearBookings()}>Clear all</button>
      </div>

      {shown.length === 0 && <p>No bookings yet. Make one on the booking page, or add samples.</p>}
      {dates.map((d) => (
        <section key={d} className="day">
          <h2>{nice(d)}</h2>
          {shown.filter((b) => b.date === d).map((b) => (
            <article key={b.id} className="booking card">
              <strong>{b.start}</strong>
              <div>
                <b>{b.name}</b> · {b.phone}
                <br />
                {services.find((s) => s.id === b.service)?.name} · {barbers.find((x) => x.id === b.barber)?.name} · {branches.find((x) => x.id === b.branch)?.name}
                {b.note && <><br /><small>{b.note}</small></>}
              </div>
              <button className="btn btn--ghost" onClick={() => cancelBooking(b.id)}>Cancel</button>
            </article>
          ))}
        </section>
      ))}
    </main>
  );
}
