/* =========================================================
   VELTRIX — data layer
   All records are stored in localStorage. The first time the
   system opens, a starter dataset is created relative to today's
   date so dashboards and charts always have recent activity.
   ========================================================= */

const KEYS = {
  users: "vx_users",
  vehicles: "vx_vehicles",
  customers: "vx_customers",
  bookings: "vx_bookings",
  payments: "vx_payments",
  inspections: "vx_inspections",
  notifications: "vx_notifications",
  seeded: "vx_seed_version",
  theme: "vx_theme",
  session: "vx_session",
};
const SEED_VERSION = "1.3";

const CATEGORY_MODELS = {
  Economy: ["Axia", "Viva"],
  Compact: ["Myvi", "Iriz"],
  Sedan: ["Bezza", "Saga", "Persona"],
  MPV: ["Alza", "Exora"],
  SUV: ["Ativa", "Aruz", "X50", "X70"],
};
const MODEL_BRAND = {
  Axia: "Perodua", Viva: "Perodua", Myvi: "Perodua", Bezza: "Perodua", Alza: "Perodua", Ativa: "Perodua", Aruz: "Perodua",
  Iriz: "Proton", Saga: "Proton", Persona: "Proton", Exora: "Proton", X50: "Proton", X70: "Proton",
};
const CATEGORIES = Object.keys(CATEGORY_MODELS);
const BRANCHES = ["Shah Alam HQ", "KLIA Terminal 1", "Bangsar South", "Petaling Jaya (SS2)"];
const BOOKING_STATUSES = ["Pending", "Confirmed", "Ongoing", "Completed", "Cancelled"];
const CHECKLIST = [
  { group: "Exterior", items: [
    ["body", "Body panels & paintwork"],
    ["glass", "Windscreen, windows & mirrors"],
    ["lights", "Headlamps, brake lights & indicators"],
    ["tyres", "Tyres, tread depth & rims"],
  ]},
  { group: "Interior", items: [
    ["seats", "Seats, seatbelts & upholstery"],
    ["dash", "Dashboard warning lights"],
    ["aircond", "Air-conditioning"],
    ["clean", "Cleanliness & odour"],
  ]},
  { group: "Safety & documents", items: [
    ["brakes", "Brakes & handbrake"],
    ["wipers", "Horn & wipers"],
    ["spare", "Spare tyre, jack & warning triangle"],
    ["docs", "Road tax, insurance & registration card"],
  ]},
];

/* ---------------- storage helpers ---------------- */
const Store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (window.UI) UI.toast("Browser storage is full. Remove some inspection photos and try again.", "error");
      return false;
    }
  },
};

/* ---------------- date helpers ---------------- */
const DateUtil = {
  today() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; },
  iso(d) {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  },
  todayIso() { return this.iso(this.today()); },
  nowLocal() {
    const d = new Date();
    return this.iso(d) + "T" + [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":");
  },
  parse(iso) { const [y, m, d] = iso.slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); },
  add(iso, n) { const d = this.parse(iso); d.setDate(d.getDate() + n); return this.iso(d); },
  diff(a, b) { return Math.round((this.parse(b) - this.parse(a)) / 86400000); },
  fmt(iso, opts) {
    if (!iso) return "-";
    return this.parse(iso).toLocaleDateString("en-MY", opts || { day: "numeric", month: "short", year: "numeric" });
  },
  fmtShort(iso) { return this.fmt(iso, { day: "numeric", month: "short" }); },
  fmtDateTime(isoDT) {
    const d = new Date(isoDT);
    return d.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) + ", " +
      d.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
  },
  monthKey(iso) { return iso.slice(0, 7); },
  monthLabel(key) { const [y, m] = key.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString("en-MY", { month: "short", year: "2-digit" }); },
  relative(isoDT) {
    const s = Math.round((Date.now() - new Date(isoDT).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (s < 86400) return Math.floor(s / 3600) + " h ago";
    if (s < 86400 * 7) return Math.floor(s / 86400) + " d ago";
    return this.fmt(isoDT.slice(0, 10));
  },
};

/* ---------------- seed data ---------------- */
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function seedData() {
  if (Store.get(KEYS.seeded) === SEED_VERSION) return;
  const T = DateUtil.todayIso();
  const add = (n) => DateUtil.add(T, n);
  const rnd = seededRandom(566);

  const vehicles = [
    ["V01", "Axia", "1.0 G (Auto)", "HWA 2318", 2023, "Ivory White", "#f1f1ee", 90, 5, 21430, 20, 140],
    ["V02", "Axia", "1.0 AV", "HWA 7745", 2024, "Glittering Silver", "#b9bec2", 95, 5, 12880, 160, 210],
    ["V03", "Viva", "1.0 EZi", "HWB 1204", 2021, "Ocean Blue", "#2f5f8a", 80, 5, 68450, -3, 75],
    ["V04", "Myvi", "1.5 AV", "HWC 5521", 2024, "Electric Blue", "#2a62b8", 130, 5, 18320, 95, 95],
    ["V05", "Myvi", "1.3 G", "HWC 6630", 2023, "Granite Grey", "#5f6468", 120, 5, 33700, 240, 12],
    ["V06", "Iriz", "1.6 Premium", "HWD 3187", 2022, "Fire Red", "#b8322b", 125, 5, 41210, 38, 180],
    ["V07", "Bezza", "1.3 AV", "HWE 4402", 2024, "Ivory White", "#f1f1ee", 130, 5, 15990, 130, 300],
    ["V08", "Saga", "1.3 Premium", "HWE 8810", 2024, "Snow White", "#f4f4f2", 120, 5, 22150, 300, 60],
    ["V09", "Persona", "1.6 Premium", "HWF 2290", 2023, "Armour Silver", "#a9aeb1", 140, 5, 29880, 9, 220],
    ["V10", "Alza", "1.5 AV", "HWG 1056", 2024, "Garnet Red", "#8c1f28", 210, 7, 14120, 200, 25],
    ["V11", "Exora", "1.6 Premium", "HWG 7731", 2022, "Jet Grey", "#3d4246", 200, 7, 52360, 70, 330],
    ["V12", "Ativa", "1.0 Turbo AV", "HWH 3349", 2023, "Cranberry Red", "#9b2335", 190, 5, 26740, 110, 155],
    ["V13", "Aruz", "1.5 AV", "HWH 9012", 2022, "Elegant Black", "#1d1f21", 200, 7, 47300, 270, 41],
    ["V14", "X50", "1.5 TGDi Flagship", "HWJ 4478", 2024, "Marine Blue", "#203f66", 250, 5, 11980, 175, 260],
    ["V15", "X70", "1.8 TGDi Premium", "HWJ 6623", 2023, "Quartz Black", "#1c1c1e", 300, 5, 24510, 28, 120],
    ["V16", "Saga", "1.3 Standard", "HWK 1180", 2021, "Ruby Red", "#a3262a", 110, 5, 73640, 60, 18],
  ].map(([id, model, variant, plate, year, colorName, color, rate, seats, mileage, taxIn, insIn]) => {
    const category = CATEGORIES.find((c) => CATEGORY_MODELS[c].includes(model));
    return {
      id, brand: MODEL_BRAND[model], model, variant, category, plate, year, colorName, color,
      transmission: "Automatic", fuel: "Petrol RON95", seats, dailyRate: rate, mileage,
      status: "Available",
      roadTaxExpiry: add(taxIn), insuranceExpiry: add(insIn),
      puspakomDue: add(year <= 2021 ? 34 : 400),
      branch: BRANCHES[Number(id.slice(1)) % BRANCHES.length],
      notes: "",
    };
  });

  const people = [
    ["CUS001", "Ahmad Faiz bin Rahman", "012-384 7712", "faiz.rahman@gmail.com", "Shah Alam", 5, -170, -8],
    ["CUS002", "Nur Aisyah binti Kamal", "013-226 9051", "aisyah.kamal@yahoo.com", "Klang", 3, -150, -10],
    ["CUS003", "Tan Wei Ming", "016-771 3408", "weiming.tan@outlook.com", "Petaling Jaya", 4, -168, -9],
    ["CUS004", "Priya a/p Subramaniam", "017-650 2294", "priya.subra@gmail.com", "Subang Jaya", 0, -8, -8],
    ["CUS005", "Muhammad Haziq bin Azmi", "011-2389 4410", "haziq.azmi@gmail.com", "Kajang", 2, -160, -25],
    ["CUS006", "Siti Hajar binti Yusof", "019-332 8127", "sitihajar.y@gmail.com", "Seremban", 2, -175, -120],
    ["CUS007", "Lim Jia Hui", "012-908 1536", "jiahui.lim@gmail.com", "Puchong", 3, -140, -12],
    ["CUS008", "Daniel Raj a/l Kumar", "018-274 6603", "danielraj.k@hotmail.com", "Cyberjaya", 1, -165, -130],
    ["CUS009", "Farah Nabila binti Hassan", "014-519 0278", "farahnabila@gmail.com", "Bangi", 2, -90, -10],
    ["CUS010", "Wong Kar Seng", "016-443 7829", "karseng.wong@gmail.com", "Cheras", 4, -170, -9],
    ["CUS011", "Amirul Hakim bin Zulkifli", "013-887 2045", "amirul.hakim@gmail.com", "Rawang", 1, -60, -15],
    ["CUS012", "Nurul Ain binti Ismail", "011-1574 3392", "nurulain.ismail@gmail.com", "Gombak", 0, 2, 2],
  ];
  const customers = people.map(([id, name, phone, email, city, , from]) => ({
    id, name, phone, email, city,
    licenceExpiry: add(Math.round(rnd() * 900) + 30),
    joinedAt: add(from - 5 - Math.round(rnd() * 20)),
    notes: "",
  }));
  customers[4].licenceExpiry = add(20); // licence expiring soon -> reminder

  const bookings = [];
  let seq = 1001;
  const overlaps = (vid, p, r) => bookings.some((b) => b.vehicleId === vid && b.status !== "Cancelled" && p < b.returnDate && b.pickupDate < r);
  // current activity: vehicles on the road now, confirmed and pending reservations
  const vById = Object.fromEntries(vehicles.map((v) => [v.id, v]));
  [
    ["CUS001", "V14", -2, 4, "Ongoing"], ["CUS003", "V04", -1, 3, "Ongoing"], ["CUS010", "V11", -3, 2, "Ongoing"],
    ["CUS007", "V09", 0, 2, "Ongoing"], ["CUS004", "V01", 1, 3, "Confirmed"], ["CUS011", "V12", 2, 2, "Confirmed"],
    ["CUS002", "V10", 3, 4, "Confirmed"], ["CUS005", "V07", 5, 2, "Confirmed"], ["CUS012", "V06", 2, 3, "Pending"],
    ["CUS009", "V15", 4, 3, "Pending"], ["CUS007", "V02", 6, 2, "Pending"],
  ].forEach(([cid, vid, start, days, status], i) => {
    const v = vById[vid];
    bookings.push({
      id: "", customerId: cid, vehicleId: vid, pickupDate: add(start), returnDate: add(start + days),
      pickupTime: ["09:00", "10:00", "11:30", "14:00", "16:00"][i % 5], days, rate: v.dailyRate, discountPct: 0, total: days * v.dailyRate,
      branch: BRANCHES[i % BRANCHES.length], status, notes: i === 5 ? "Customer requests a child seat." : "",
      createdAt: add(Math.min(start - 3, -1) + (status === "Pending" ? 3 - Math.min(start, 3) : 0)) + "T" + String(9 + i).padStart(2, "0") + ":15:00",
      cancelReason: "",
    });
  });
  people.forEach(([cid, , , , , count, from, to]) => {
    for (let i = 0; i < count; i++) {
      for (let attempt = 0; attempt < 60; attempt++) {
        const span = to - from;
        const start = from + Math.round((span / count) * i + rnd() * (span / count));
        const v = vehicles[Math.floor(rnd() * vehicles.length)];
        const days = 1 + Math.floor(rnd() * (v.category === "MPV" || v.category === "SUV" ? 5 : 4));
        const p = add(start), r = add(start + days);
        if (v.id === "V16" && r >= add(-2)) continue; // V16 is in maintenance now
        if (overlaps(v.id, p, r)) continue;
        let status;
        if (r < T) status = rnd() < 0.09 ? "Cancelled" : "Completed";
        else if (p <= T) status = "Ongoing";
        else status = rnd() < 0.3 ? "Pending" : "Confirmed";
        const created = add(start - 2 - Math.floor(rnd() * 9));
        bookings.push({
          id: "VX-" + seq++, customerId: cid, vehicleId: v.id,
          pickupDate: p, returnDate: r, pickupTime: ["09:00", "10:00", "11:30", "14:00", "16:00"][Math.floor(rnd() * 5)],
          days, rate: v.dailyRate, discountPct: 0, total: days * v.dailyRate,
          branch: BRANCHES[Math.floor(rnd() * BRANCHES.length)],
          status, notes: "",
          createdAt: (created > T ? T : created) + "T" + String(8 + Math.floor(rnd() * 10)).padStart(2, "0") + ":" + String(Math.floor(rnd() * 60)).padStart(2, "0") + ":00",
          cancelReason: status === "Cancelled" ? "Customer changed travel plans" : "",
        });
        break;
      }
    }
  });
  bookings.sort((a, b) => a.pickupDate.localeCompare(b.pickupDate));
  bookings.forEach((b, i) => { b.id = "VX-" + (1001 + i); });

  const methods = ["FPX Online Banking", "Credit / Debit Card", "DuitNow QR", "Cash"];
  const payments = bookings.filter((b) => b.status !== "Pending").map((b, i) => ({
    id: "PAY-" + (5001 + i), bookingId: b.id, amount: b.total,
    method: methods[Math.floor(rnd() * methods.length)],
    date: b.createdAt.slice(0, 10),
    status: b.status === "Cancelled" ? "Refunded" : "Paid",
  }));

  // vehicle statuses from bookings
  bookings.forEach((b) => { if (b.status === "Ongoing") vehicles.find((v) => v.id === b.vehicleId).status = "Rented"; });
  vehicles.find((v) => v.id === "V16").status = "Maintenance";

  // inspections for recent bookings
  const inspections = [];
  let ins = 1;
  const inspectors = ["Hafiz Kamarudin", "Shalini Devi", "Azlan Musa"];
  const allOk = () => Object.fromEntries(CHECKLIST.flatMap((g) => g.items.map(([k]) => [k, "ok"])));
  bookings.filter((b) => (b.status === "Completed" && b.returnDate >= add(-45)) || b.status === "Ongoing").forEach((b) => {
    const v = vehicles.find((x) => x.id === b.vehicleId);
    const startKm = v.mileage - (b.status === "Completed" ? 180 + Math.round(rnd() * 400) : 0);
    inspections.push({
      id: "INS-" + String(ins++).padStart(4, "0"), bookingId: b.id, vehicleId: b.vehicleId, type: "Check-out",
      date: b.pickupDate + "T" + b.pickupTime + ":00", inspector: inspectors[Math.floor(rnd() * 3)],
      mileage: startKm, fuel: "Full", checklist: allOk(), notes: "Vehicle handed over in good condition.", photos: [], result: "Pass",
    });
    if (b.status === "Completed") {
      inspections.push({
        id: "INS-" + String(ins++).padStart(4, "0"), bookingId: b.id, vehicleId: b.vehicleId, type: "Check-in",
        date: b.returnDate + "T" + b.pickupTime + ":00", inspector: inspectors[Math.floor(rnd() * 3)],
        mileage: v.mileage, fuel: ["Full", "3/4", "Full", "1/2"][Math.floor(rnd() * 4)], checklist: allOk(),
        notes: "Returned on time. No new damage.", photos: [], result: "Pass",
      });
    }
  });
  // one damage record on V16 (explains Maintenance status)
  const v16Booking = [...bookings].reverse().find((b) => b.vehicleId === "V16" && b.status === "Completed");
  if (v16Booking) {
    const cl = allOk(); cl.body = "issue"; cl.lights = "issue";
    inspections.push({
      id: "INS-" + String(ins++).padStart(4, "0"), bookingId: v16Booking.id, vehicleId: "V16", type: "Check-in",
      date: v16Booking.returnDate + "T17:20:00", inspector: "Azlan Musa", mileage: 73640, fuel: "1/4", checklist: cl,
      notes: "Scratch and small dent on rear bumper (left side). Left tail lamp cracked. Sent to workshop for repair.",
      photos: [], result: "Damage reported",
    });
  }
  inspections.sort((a, b) => a.date.localeCompare(b.date));

  // notifications: newest pending bookings arrive unread
  const nowIso = new Date().toISOString();
  const notifications = bookings.filter((b) => b.status === "Pending").slice(0, 3).map((b, i) => {
    const c = customers.find((x) => x.id === b.customerId);
    const v = vehicles.find((x) => x.id === b.vehicleId);
    return {
      id: "N" + (i + 1), bookingId: b.id, type: "booking",
      title: "Rental record received " + b.id,
      message: `${c.name} booked ${v.brand} ${v.model} for ${DateUtil.fmtShort(b.pickupDate)} – ${DateUtil.fmtShort(b.returnDate)}.`,
      createdAt: new Date(Date.now() - (i + 1) * 47 * 60000).toISOString(), read: false,
    };
  });
  const lastDone = [...bookings].reverse().find((b) => b.status === "Confirmed");
  if (lastDone) notifications.push({
    id: "N9", bookingId: lastDone.id, type: "booking", title: "Rental record " + lastDone.id + " confirmed",
    message: "Payment received. Vehicle reserved for pickup on " + DateUtil.fmt(lastDone.pickupDate) + ".",
    createdAt: new Date(Date.now() - 26 * 3600000).toISOString(), read: true,
  });

  Store.set(KEYS.vehicles, vehicles);
  Store.set(KEYS.customers, customers);
  Store.set(KEYS.bookings, bookings);
  Store.set(KEYS.payments, payments);
  Store.set(KEYS.inspections, inspections);
  Store.set(KEYS.notifications, notifications);
  Store.set(KEYS.seeded, SEED_VERSION);
  void nowIso;
}

/* ---------------- domain helpers ---------------- */
const DB = {
  vehicles: () => Store.get(KEYS.vehicles, []),
  customers: () => Store.get(KEYS.customers, []),
  bookings: () => Store.get(KEYS.bookings, []),
  payments: () => Store.get(KEYS.payments, []),
  inspections: () => Store.get(KEYS.inspections, []),
  notifications: () => Store.get(KEYS.notifications, []),
  save(name, list) { return Store.set(KEYS[name], list); },

  vehicle(id) { return this.vehicles().find((v) => v.id === id); },
  customer(id) { return this.customers().find((c) => c.id === id); },
  booking(id) { return this.bookings().find((b) => b.id === id); },

  vehicleName(v) { return v ? `${v.brand} ${v.model}` : "Unknown vehicle"; },

  nextId(list, prefix, start, pad) {
    const nums = list.map((x) => parseInt(String(x.id).replace(/\D/g, ""), 10)).filter((n) => !isNaN(n));
    const n = nums.length ? Math.max(...nums) + 1 : start;
    return prefix + (pad ? String(n).padStart(pad, "0") : n);
  },

  /* booking that blocks a vehicle between two dates (null if free) */
  conflict(vehicleId, pickup, ret, excludeId) {
    return this.bookings().find((b) =>
      b.vehicleId === vehicleId && b.id !== excludeId &&
      ["Pending", "Confirmed", "Ongoing"].includes(b.status) &&
      pickup < b.returnDate && b.pickupDate < ret) || null;
  },

  customerStats(cid, bookingsList) {
    const all = (bookingsList || this.bookings()).filter((b) => b.customerId === cid);
    const valid = all.filter((b) => b.status !== "Cancelled");
    const spend = valid.reduce((s, b) => s + b.total, 0);
    const sorted = [...all].sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));
    const cutoff = DateUtil.add(DateUtil.todayIso(), -90);
    const active = valid.some((b) => b.returnDate >= cutoff);
    let type = "New";
    if (valid.length >= 5 || spend >= 3000) type = "VIP";
    else if (valid.length >= 2) type = "Regular";
    return { bookings: all, count: valid.length, spend, latest: sorted[0] || null, type, status: active ? "Active" : "Inactive" };
  },

  discountFor(type) { return type === "VIP" ? 10 : type === "Regular" ? 5 : 0; },

  quote(vehicle, pickup, ret, customerId) {
    const days = Math.max(DateUtil.diff(pickup, ret), 0);
    const base = days * vehicle.dailyRate;
    const type = customerId ? this.customerStats(customerId).type : "New";
    let discountPct = this.discountFor(type);
    if (days >= 7) discountPct += 5;
    const discount = Math.round(base * discountPct) / 100;
    return { days, rate: vehicle.dailyRate, base, discountPct, discount, total: +(base - discount).toFixed(2), deposit: vehicle.category === "SUV" || vehicle.category === "MPV" ? 300 : 200, type };
  },

  pushNotification(n) {
    const list = this.notifications();
    list.unshift({ id: "N" + Date.now(), read: false, createdAt: new Date().toISOString(), type: "booking", ...n });
    this.save("notifications", list.slice(0, 40));
  },
};

seedData();
