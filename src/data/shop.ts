export type Service = { id: string; name: string; minutes: number; price: number; blurb: string };
export type Barber = { id: string; name: string; role: string };
export type Branch = { id: string; name: string; address: string };

/* Change this one line when you have permission to use their brand */
const BRAND = "Polished";

export const shop = {
  name: BRAND,
  tagline: "For the signature man.",
  concept: true,
  address: "Choose your store when you book",
  phone: "",
  /** 0 = Sunday ... 6 = Saturday. Placeholder hours: confirm with the store. */
  hours: {
    1: ["09:00", "17:00"],
    2: ["09:00", "17:00"],
    3: ["09:00", "17:00"],
    4: ["09:00", "18:00"],
    5: ["09:00", "18:00"],
    6: ["08:00", "14:00"],
  } as Record<number, [string, string]>,
  slotStepMinutes: 30,
};

/* Placeholder stores: replace with the real list from the Signature Barber shops page */
export const branches: Branch[] = [
  { id: "b1", name: "Store one", address: "Address to confirm" },
  { id: "b2", name: "Store two", address: "Address to confirm" },
];

/* Durations and prices are placeholders: confirm them with the store */
export const services: Service[] = [
  { id: "cut", name: "Hair cut", minutes: 30, price: 0, blurb: "Cut and style by one of our barbers." },
  { id: "shave", name: "Hot towel shave", minutes: 30, price: 0, blurb: "A traditional shave with hot towels." },
  { id: "beard", name: "Beard maintenance", minutes: 30, price: 0, blurb: "Shaped, lined and conditioned." },
  { id: "colour", name: "Hair and beard colouring", minutes: 60, price: 0, blurb: "Natural-looking colour, tailored to you." },
  { id: "treat", name: "Hair treatment", minutes: 45, price: 0, blurb: "Treatments for scalp and hair health." },
  { id: "facial", name: "Hot towel facial", minutes: 45, price: 0, blurb: "Cleansing and skincare for a fresh finish." },
  { id: "thread", name: "Threading and waxing", minutes: 20, price: 0, blurb: "Quick, precise grooming." },
  { id: "brow", name: "Brow tinting", minutes: 20, price: 0, blurb: "Defined brows with a natural tint." },
];

export const barbers: Barber[] = [
  { id: "any", name: "Anyone free", role: "First available" },
  { id: "b-one", name: "Barber one", role: "Senior barber" },
  { id: "b-two", name: "Barber two", role: "Barber" },
];
