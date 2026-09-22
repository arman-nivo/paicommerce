/** Bangladesh-flavoured people, phones and addresses. */
import type { Address } from "../../schema";
import type { Rng } from "./rng";

const MALE_FIRST = [
  "Rahim", "Karim", "Tanvir", "Sabbir", "Arif", "Fahim", "Nayeem", "Rakib", "Shakil", "Imran", "Mehedi", "Shahriar",
  "Asif", "Rafiq", "Jamal", "Habib", "Sakib", "Tamim", "Mahmud", "Farhan", "Ashraf", "Ridwan", "Zubair", "Minhaz",
  "Tahsin", "Nafis", "Siam", "Rifat", "Arman", "Emon", "Sohel", "Shuvo", "Anik", "Mashrafe", "Towhid", "Kamrul",
  "Hasan", "Ehsan", "Adnan", "Nabil", "Riyad", "Samiul", "Mushfiq", "Jubayer", "Ovi", "Rashed", "Monir", "Faisal",
];
const FEMALE_FIRST = [
  "Nusrat", "Farhana", "Sadia", "Tasnim", "Ayesha", "Fatema", "Sumaiya", "Jannat", "Mim", "Nabila", "Rumana", "Sharmin",
  "Tahmina", "Lamia", "Anika", "Maliha", "Raisa", "Nadia", "Sabrina", "Afsana", "Mehnaz", "Samia", "Tanjila", "Ishrat",
  "Sanjida", "Faria", "Zarin", "Nishat", "Rubaiya", "Tania", "Munira", "Shirin", "Priya", "Joya", "Oishee", "Puja",
  "Nafisa", "Ruksana", "Sultana", "Tisha", "Mahiya", "Sneha", "Bushra", "Humaira", "Arpita", "Shammi", "Rima", "Lubna",
];
const LAST = [
  "Rahman", "Hossain", "Ahmed", "Islam", "Uddin", "Chowdhury", "Khan", "Akter", "Begum", "Sarkar", "Talukder", "Miah",
  "Haque", "Karim", "Alam", "Siddique", "Bhuiyan", "Mollah", "Sheikh", "Majumder", "Das", "Roy", "Saha", "Paul",
  "Biswas", "Kabir", "Hasan", "Mahmud", "Sultana", "Parvin", "Nahar", "Khatun", "Mridha", "Howlader", "Sikder", "Mondal",
];

export function personName(rng: Rng): { name: string; female: boolean } {
  const female = rng.chance(0.5);
  const first = rng.pick(female ? FEMALE_FIRST : MALE_FIRST);
  let last = rng.pick(LAST);
  if (!female && ["Akter", "Begum", "Sultana", "Parvin", "Nahar", "Khatun"].includes(last)) last = "Hossain";
  return { name: `${first} ${last}`, female };
}

const OPERATORS = ["013", "014", "015", "016", "017", "017", "018", "019", "019"];
export function phone(rng: Rng): string {
  return rng.pick(OPERATORS) + rng.digits(8);
}

/** Unique phone generator (per store). */
export function phoneFactory(rng: Rng) {
  const used = new Set<string>();
  return () => {
    for (;;) {
      const p = phone(rng);
      if (!used.has(p)) {
        used.add(p);
        return p;
      }
    }
  };
}

const EMAIL_DOMAINS = ["gmail.com", "gmail.com", "gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
export function emailFor(rng: Rng, name: string): string {
  const [f, l] = name.toLowerCase().split(" ");
  const style = rng.int(0, 3);
  const local = style === 0 ? `${f}.${l}` : style === 1 ? `${f}${l}${rng.int(1, 99)}` : style === 2 ? `${f}_${rng.int(90, 2005)}` : `${f}${l![0]}${rng.int(10, 999)}`;
  return `${local}@${rng.pick(EMAIL_DOMAINS)}`;
}

export type ZoneId = "inside-dhaka" | "dhaka-sub" | "outside-dhaka";

type Place = { city: string; district: string; areas: string[]; zone: ZoneId; weight: number; postal: string };
const PLACES: Place[] = [
  { city: "Dhaka", district: "Dhaka", zone: "inside-dhaka", weight: 48, postal: "12", areas: ["Dhanmondi", "Gulshan", "Banani", "Mirpur", "Uttara", "Mohammadpur", "Bashundhara R/A", "Badda", "Rampura", "Motijheel", "Khilgaon", "Tejgaon", "Farmgate", "Malibagh", "Wari", "Lalmatia", "Shyamoli", "Baridhara", "Mohakhali", "Jatrabari"] },
  { city: "Savar", district: "Dhaka", zone: "dhaka-sub", weight: 4, postal: "1340", areas: ["Savar Bazar", "Ashulia", "Hemayetpur"] },
  { city: "Keraniganj", district: "Dhaka", zone: "dhaka-sub", weight: 3, postal: "1310", areas: ["Zinjira", "Aganagar"] },
  { city: "Gazipur", district: "Gazipur", zone: "dhaka-sub", weight: 5, postal: "1700", areas: ["Tongi", "Joydebpur", "Board Bazar", "Konabari"] },
  { city: "Narayanganj", district: "Narayanganj", zone: "dhaka-sub", weight: 4, postal: "1400", areas: ["Chashara", "Fatullah", "Siddhirganj"] },
  { city: "Chattogram", district: "Chattogram", zone: "outside-dhaka", weight: 13, postal: "4", areas: ["Agrabad", "GEC Circle", "Nasirabad", "Halishahar", "Panchlaish", "Khulshi", "Chawkbazar", "Bahaddarhat"] },
  { city: "Sylhet", district: "Sylhet", zone: "outside-dhaka", weight: 6, postal: "3100", areas: ["Zindabazar", "Ambarkhana", "Uposhohor", "Shibganj", "Mirabazar"] },
  { city: "Rajshahi", district: "Rajshahi", zone: "outside-dhaka", weight: 5, postal: "6000", areas: ["Shaheb Bazar", "Uposhohor", "Kazla", "Laxmipur"] },
  { city: "Khulna", district: "Khulna", zone: "outside-dhaka", weight: 5, postal: "9100", areas: ["Sonadanga", "Khalishpur", "Boyra", "Daulatpur"] },
  { city: "Cumilla", district: "Cumilla", zone: "outside-dhaka", weight: 3, postal: "3500", areas: ["Kandirpar", "Tomsom Bridge", "Race Course"] },
  { city: "Bogura", district: "Bogura", zone: "outside-dhaka", weight: 2, postal: "5800", areas: ["Satmatha", "Jaleshwaritola"] },
  { city: "Mymensingh", district: "Mymensingh", zone: "outside-dhaka", weight: 2, postal: "2200", areas: ["Ganginarpar", "Charpara"] },
];

export type BdAddress = Address & { zone: ZoneId };

export function address(rng: Rng, name: string, phoneNo: string): BdAddress {
  const place = rng.weighted(PLACES.map((p) => [p, p.weight] as const));
  const area = rng.pick(place.areas);
  const style = rng.int(0, 3);
  const line1 =
    style === 0
      ? `House ${rng.int(1, 120)}, Road ${rng.int(1, 32)}`
      : style === 1
        ? `Flat ${rng.int(1, 12)}${rng.pick(["A", "B", "C", "D"])}, House ${rng.int(2, 90)}, Road ${rng.int(1, 27)}`
        : style === 2
          ? `${rng.int(10, 480)}/${rng.pick(["A", "B", "1", "2"])}, ${rng.pick(["Lake", "Station", "College", "Mosque", "Bazar", "School"])} Road`
          : `Holding ${rng.int(12, 220)}, ${rng.pick(["Block", "Sector", "Lane"])} ${rng.pick(["A", "B", "C", "D", "E", "F", "7", "11", "4"])}`;
  const postalCode = place.postal.length === 4 ? place.postal : place.postal + rng.digits(2);
  return { name, phone: phoneNo, line1, area, city: place.city, district: place.district, postalCode, country: "BD", zone: place.zone };
}

/** Strip the internal `zone` key before persisting. */
export function toAddress(a: BdAddress): Address {
  const { zone: _z, ...rest } = a;
  return rest;
}

export const DELIVERY_ZONES = [
  { id: "inside-dhaka", name: "Inside Dhaka", charge: 7000, estimatedDays: "1–2 days" },
  { id: "dhaka-sub", name: "Dhaka Sub-area", charge: 10000, estimatedDays: "2–3 days" },
  { id: "outside-dhaka", name: "Outside Dhaka", charge: 13000, estimatedDays: "3–5 days" },
] as const;

export function zoneFor(id: ZoneId) {
  return DELIVERY_ZONES.find((z) => z.id === id)!;
}
