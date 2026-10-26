import Link from "next/link";
import { shop, services, branches } from "@/data/shop";
import { money } from "@/lib/money";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>{shop.tagline}</h1>
        <p>Pick a service, choose your barber and grab a time that is actually free. No calls, no waiting for replies.</p>
        <div><Link href="/book" className="btn">Book a cut</Link></div>
      </section>

      <section className="section">
        <h2>How it works</h2>
        <div className="cards">
          {["Choose a store and a service", "Pick your barber and a free time", "Get your confirmation and add it to your calendar"].map((t, i) => (
            <article key={t} className="card">
              <span className="price">0{i + 1}</span>
              <p>{t}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Services</h2>
        <div className="cards">
          {services.map((s) => (
            <article key={s.id} className="card">
              <h3>{s.name}</h3>
              <p>{s.blurb}</p>
              <small>{s.minutes} min</small>
              <span className="price">{money(s.price)}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Stores and hours</h2>
        <div className="cards">
          {branches.map((b) => (
            <article key={b.id} className="card">
              <h3>{b.name}</h3>
              <p>{b.address}</p>
            </article>
          ))}
          <article className="card">
            <h3>Opening hours</h3>
            {Object.entries(shop.hours).map(([d, h]) => (
              <small key={d}>{DAYS[Number(d)]}: {h[0]} to {h[1]}</small>
            ))}
            <small>Sunday: closed</small>
          </article>
        </div>
      </section>
    </main>
  );
}
