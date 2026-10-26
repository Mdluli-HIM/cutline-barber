"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { shop, branches, services, barbers } from "@/data/shop";
import { availableSlots, type Booking } from "@/lib/slots";
import { demoBooked } from "@/lib/demo";
import { addBooking, loadBookings, newRef, type Saved } from "@/lib/store";
import { downloadIcs } from "@/lib/ics";
import { money } from "@/lib/money";

const REAL = barbers.filter((b) => b.id !== "any").map((b) => b.id);
const STEPS = ["Store", "Service", "Barber", "Day", "Time", "Details"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const nice = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return `${DAYS[new Date(y, m - 1, d).getDay()]} ${d} ${MONTHS[m - 1]}`;
};
const phoneOk = (p: string) => /^(\+27|0)\d{9}$/.test(p.replace(/[\s-]/g, ""));
const takenOn = (date: string, branch: string, mine: Saved[]): Booking[] => [
  ...demoBooked(date, branch, REAL),
  ...mine.filter((b) => b.branch === branch),
];

export default function BookingFlow() {
  const [now, setNow] = useState<Date | null>(null);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState("");
  const [svc, setSvc] = useState("");
  const [barber, setBarber] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Saved | null>(null);

  useEffect(() => {
    setNow(new Date());
    const sync = () => setSaved(loadBookings());
    sync();
    window.addEventListener("cutline:bookings", sync);
    return () => window.removeEventListener("cutline:bookings", sync);
  }, []);

  const service = services.find((s) => s.id === svc);
  const branchName = branches.find((b) => b.id === branch)?.name ?? "";
  const barberName = (id: string) => barbers.find((b) => b.id === id)?.name ?? id;
  const clearWhen = () => {
    setDate("");
    setTime("");
  };

  /* the next days that still have at least one free time */
  const days = useMemo(() => {
    if (!now || !service || !branch || !barber) return [];
    const out: string[] = [];
    for (let i = 0; out.length < 14 && i < 40; i++) {
      const k = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
      if (availableSlots(k, service.minutes, barber, takenOn(k, branch, saved), REAL, now).length) out.push(k);
    }
    return out;
  }, [now, service, branch, barber, saved]);

  const slots =
    date && service && barber && now
      ? availableSlots(date, service.minutes, barber, takenOn(date, branch, saved), REAL, now)
      : [];

  const confirm = () => {
    if (!service || !now) return;
    if (name.trim().length < 2) return setErr("Please enter your name.");
    if (!phoneOk(phone)) return setErr("Please enter a valid South African number, like 082 123 4567.");
    if (!agree) return setErr("Please tick the box so we can save your booking details.");
    const taken = takenOn(date, branch, loadBookings());
    const free = (id: string) => availableSlots(date, service.minutes, id, taken, REAL, now).includes(time);
    const who = barber === "any" ? REAL.find(free) : free(barber) ? barber : undefined;
    if (!who) {
      setErr("Sorry, that time was just taken. Please pick another.");
      setTime("");
      setStep(4);
      return;
    }
    const b: Saved = {
      id: newRef(),
      date,
      start: time,
      minutes: service.minutes,
      barber: who,
      branch,
      service: service.id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      note: note.trim(),
      created: new Date().toISOString(),
    };
    addBooking(b);
    setErr("");
    setDone(b);
  };

  if (done) {
    const sv = services.find((s) => s.id === done.service);
    const br = branches.find((b) => b.id === done.branch);
    return (
      <main className="flow">
        <div className="done card">
          <span className="tick">✓</span>
          <h1>You&apos;re booked</h1>
          <p className="ref">Reference {done.id}</p>
          <dl>
            <div><dt>Service</dt><dd>{sv?.name}</dd></div>
            <div><dt>When</dt><dd>{nice(done.date)} at {done.start}</dd></div>
            <div><dt>Barber</dt><dd>{barberName(done.barber)}</dd></div>
            <div><dt>Store</dt><dd>{br?.name}, {br?.address}</dd></div>
            <div><dt>Name</dt><dd>{done.name}</dd></div>
          </dl>
          <div className="row">
            <button className="btn" onClick={() => downloadIcs(done, `${sv?.name} at ${shop.name}`, `${br?.name}, ${br?.address}`)}>
              Add to calendar
            </button>
            <button className="btn btn--ghost" onClick={() => location.reload()}>Book another</button>
          </div>
          <p className="fine">Demo: no message is sent. In the live version you would get a confirmation by SMS or email.</p>
          <Link href="/" className="fine">Back to home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flow">
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? "is-on" : i < step ? "is-done" : ""}>
            {i < step ? <button onClick={() => setStep(i)}>{s}</button> : <span>{s}</span>}
          </li>
        ))}
      </ol>

      <div className="flow__grid">
        <section className="flow__main">
          {step === 0 && (
            <>
              <h1>Choose your store</h1>
              <div className="opts">
                {branches.map((b) => (
                  <button key={b.id} className="opt" onClick={() => { setBranch(b.id); clearWhen(); setStep(1); }}>
                    <strong>{b.name}</strong>
                    <small>{b.address}</small>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1>What would you like?</h1>
              <div className="opts">
                {services.map((s) => (
                  <button key={s.id} className="opt" onClick={() => { setSvc(s.id); clearWhen(); setStep(2); }}>
                    <strong>{s.name}</strong>
                    <small>{s.blurb}</small>
                    <em>{s.minutes} min · {money(s.price)}</em>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1>Who should cut?</h1>
              <div className="opts">
                {barbers.map((b) => (
                  <button key={b.id} className="opt" onClick={() => { setBarber(b.id); clearWhen(); setStep(3); }}>
                    <strong>{b.name}</strong>
                    <small>{b.role}</small>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1>Pick a day</h1>
              {days.length === 0 && <p>No free days found. Try another barber.</p>}
              <div className="chips">
                {days.map((d) => (
                  <button key={d} className={`chip ${d === date ? "is-on" : ""}`} onClick={() => { setDate(d); setTime(""); setStep(4); }}>
                    {nice(d)}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1>Pick a time</h1>
              <p className="sub">{nice(date)}</p>
              {err && <p className="err" role="alert">{err}</p>}
              {slots.length === 0 && <p>Nothing free that day. Choose another day.</p>}
              <div className="chips">
                {slots.map((t) => (
                  <button key={t} className={`chip ${t === time ? "is-on" : ""}`} onClick={() => { setTime(t); setErr(""); setStep(5); }}>
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h1>Your details</h1>
              <form className="form" onSubmit={(e) => { e.preventDefault(); confirm(); }} noValidate>
                <label>Name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></label>
                <label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="082 123 4567" required /></label>
                <label>Email (optional)<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" /></label>
                <label>Note (optional)<textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} /></label>
                <label className="check">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <span>I agree that my name and number are saved so the shop can manage my booking.</span>
                </label>
                {err && <p className="err" role="alert">{err}</p>}
                <button className="btn" type="submit">Confirm booking</button>
              </form>
            </>
          )}

          {step > 0 && (
            <button className="back" onClick={() => setStep(step - 1)}>← Back</button>
          )}
        </section>

        <aside className="flow__sum card">
          <h2>Your booking</h2>
          <dl>
            <div><dt>Store</dt><dd>{branchName || "—"}</dd></div>
            <div><dt>Service</dt><dd>{service?.name ?? "—"}</dd></div>
            <div><dt>Barber</dt><dd>{barber ? barberName(barber) : "—"}</dd></div>
            <div><dt>When</dt><dd>{date ? `${nice(date)}${time ? ` at ${time}` : ""}` : "—"}</dd></div>
            <div><dt>Price</dt><dd>{service ? money(service.price) : "—"}</dd></div>
          </dl>
        </aside>
      </div>
    </main>
  );
}
