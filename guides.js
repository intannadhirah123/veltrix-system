/* =========================================================
   VELTRIX — Guides & Regulations (guides.html)
   ========================================================= */
const ARTICLES = [
  {
    id: "licensing",
    tag: "Regulation",
    title: "Running a Licensed Car Rental Business in Malaysia",
    summary: "Which agencies are involved, how rental vehicles are registered, and the paperwork a rental counter should keep on file.",
    cover: "assets/img/guide-licensing.svg",
    reviewed: "2026-11-04",
    author: "Veltrix Compliance Desk",
    intro: [
      "A rental car carries paying customers, so it is treated as a commercial vehicle rather than a private one. That changes who you deal with: besides JPJ for registration and road tax, a rental operator in Peninsular Malaysia needs an operating licence from the Land Public Transport Agency (APAD). Operators in Sabah and Sarawak apply through the state Commercial Vehicle Licensing Board (LPKP).",
      "Getting this wrong is expensive. An unlicensed rental vehicle may not be covered by insurance when it is hired out, and enforcement officers can seize it. This guide sets out the order in which the paperwork usually happens.",
    ],
    sections: [
      { h: "Who does what", p: ["<b>SSM</b> registers the business entity. <b>APAD</b> (or LPKP in East Malaysia) licenses the rental operation and attaches conditions to it. <b>JPJ</b> registers each vehicle for rental use and collects road tax. <b>Your insurer</b> must issue a policy that covers vehicles let out for hire — a private car policy normally does not."] },
      { h: "Rental registration", p: ["Vehicles registered for rental use are recorded separately from private cars, and their registration numbers commonly begin with the letter H. Keep the registration card (VOC/geran) for each unit and make sure the registered use matches how the car is actually used."] },
    ],
    steps: [
      "Register the company with SSM and open a business bank account.",
      "Apply for the rental car operating licence with APAD (Peninsular) or LPKP (Sabah/Sarawak) and note every licence condition.",
      "Register each vehicle with JPJ under the rental category and pay road tax.",
      "Buy commercial insurance that names hire and reward use, and keep the cover note with the vehicle file.",
      "Set up a booking record for every hire: customer identity, licence class and expiry, rental period and vehicle plate.",
    ],
    operator: [
      "Keep a digital file per vehicle with VOC, insurance schedule, road tax status and PUSPAKOM results.",
      "Check every customer's driving licence class and expiry before handing over keys — Veltrix blocks bookings when the licence expires before the return date.",
      "Review licence conditions yearly and before adding new vehicles to the fleet.",
      "Do not let staff or relatives use rental-registered cars privately without a booking record.",
    ],
    refs: [
      ["Agensi Pengangkutan Awam Darat (APAD)", "https://www.apad.gov.my"],
      ["Jabatan Pengangkutan Jalan Malaysia (JPJ)", "https://www.jpj.gov.my"],
      ["Suruhanjaya Syarikat Malaysia (SSM)", "https://www.ssm.com.my"],
      ["Kementerian Pengangkutan Malaysia", "https://www.mot.gov.my"],
    ],
  },
  {
    id: "puspakom",
    tag: "Regulation",
    title: "PUSPAKOM Inspections: What Rental Operators Need to Know",
    summary: "When rental cars may need to go to PUSPAKOM, how to prepare so they pass first time, and what to do after a failed test.",
    cover: "assets/img/guide-puspakom.svg",
    reviewed: "2026-10-28",
    author: "Veltrix Fleet Team",
    intro: [
      "PUSPAKOM is the company appointed by the government to carry out mandatory vehicle inspections in Malaysia. Commercial vehicles go through periodic inspections, and most vehicles also need an inspection when ownership is transferred or a vehicle is re-registered.",
      "For a rental fleet, the inspection schedule depends on the vehicle category, its age and the conditions attached to your operating licence. Treat the due date like road tax: a car that misses it should not be rented out.",
    ],
    sections: [
      { h: "Common reasons a car fails", p: ["Most failures are small and avoidable: a blown bulb, worn wiper blades, tyres near the wear indicator, excessive window tint, a cracked windscreen in the driver's view, or exhaust and brake readings outside the limit. A ten-minute pre-check at the branch saves a second trip."] },
      { h: "Booking an appointment", p: ["Appointments can be made online through PUSPAKOM's website or app. Bring the vehicle registration card and the documents listed for the inspection type. Plan the slot when the car is not booked — the Veltrix calendar shows free days for each vehicle."] },
    ],
    steps: [
      "Record the next PUSPAKOM due date for each vehicle in Fleet Management.",
      "Two weeks before, run the Veltrix inspection checklist and fix any item marked as an issue.",
      "Book the PUSPAKOM slot on a day the car has no booking, and block that day in the calendar.",
      "Attend with the registration card and the person authorised by the company.",
      "If the car fails, repair the listed items and return for re-inspection within the period stated on the result slip.",
    ],
    operator: [
      "Never send a car with a pending booking the same day — inspections can take longer than planned.",
      "Keep the latest result slip in the vehicle file and scan it into your records.",
      "Use failed items as a signal: if several cars fail for tyres, review your tyre replacement interval.",
    ],
    refs: [
      ["PUSPAKOM — Pusat Pemeriksaan Kenderaan Berkomputer", "https://www.puspakom.com.my"],
      ["JPJ — Vehicle registration services", "https://www.jpj.gov.my"],
      ["APAD — Operator licence conditions", "https://www.apad.gov.my"],
    ],
  },
  {
    id: "roadtax",
    tag: "Fleet",
    title: "Road Tax and Insurance: Building a Renewal Routine",
    summary: "A simple routine so no car goes out with expired road tax or insurance, using the Regulatory Reminder on the dashboard.",
    cover: "assets/img/guide-roadtax.svg",
    reviewed: "2026-11-02",
    author: "Veltrix Operations",
    intro: [
      "Under the Road Transport Act 1987, using a vehicle on the road without valid road tax (Lesen Kenderaan Motor, LKM) or insurance is an offence. For a rental company, the risk is larger: the customer is driving, and an accident in an uninsured car becomes the operator's problem.",
      "With a fleet, renewal dates are spread across the year, so they are easy to miss. The fix is a routine, not memory.",
    ],
    sections: [
      { h: "Insurance first, then road tax", p: ["Road tax can only be renewed when the vehicle has valid insurance, so always renew the policy first. Check that the new policy still covers hire use and that the sum insured reflects the car's current market value."] },
      { h: "Where to renew", p: ["Road tax can be renewed at JPJ counters, Pos Malaysia branches and authorised online channels, and JPJ now offers digital road tax through the MyJPJ app. Confirm whether your vehicle category still needs a printed LKM to be carried or displayed."] },
    ],
    steps: [
      "Enter the road tax and insurance expiry dates for every car in Fleet Management.",
      "Check the Regulatory Reminder on the dashboard every Monday — it lists everything due in the next 45 days.",
      "Request insurance quotes 30 days before expiry and renew the policy.",
      "Renew road tax immediately after the policy is active.",
      "Update the new expiry dates in Veltrix so the reminder clears.",
    ],
    operator: [
      "Give one person ownership of renewals and a backup for when they are on leave.",
      "Do not confirm a booking that runs past a car's road tax or insurance expiry until it is renewed.",
      "Keep a copy of each policy schedule and road tax record with the vehicle file for at least the life of the car.",
    ],
    refs: [
      ["JPJ — Road tax (LKM) renewal", "https://www.jpj.gov.my"],
      ["Bank Negara Malaysia — Motor insurance information", "https://www.bnm.gov.my"],
      ["Pos Malaysia — Road tax renewal counters", "https://www.pos.com.my"],
    ],
  },
  {
    id: "safety",
    tag: "Safety",
    title: "Safety Practices for Rental Vehicles: Tyres, Seatbelts and Child Seats",
    summary: "Everyday safety checks that protect customers and reduce claims, from tyre wear to child restraint rules.",
    cover: "assets/img/guide-safety.svg",
    reviewed: "2026-10-30",
    author: "Veltrix Fleet Team",
    intro: [
      "A rental car is driven by many different people, often on unfamiliar roads and long holiday trips. Small faults that a private owner would notice and fix can go unreported for weeks. The handover inspection is your best chance to catch them.",
      "Malaysia requires seatbelts for front and rear passengers, and child restraint systems have been required for young children in private vehicles since 2020. Customers travelling with children will often ask for a child seat, so keep some ready at each branch.",
    ],
    sections: [
      { h: "Tyres", p: ["Check tread depth and pressure at every check-out. Replace tyres before they reach the tread wear indicator, and do not mix very old and new tyres on the same axle. Inflate to the pressure on the driver's door placard, not the maximum printed on the tyre."] },
      { h: "Seatbelts and child seats", p: ["Test every seatbelt buckle and retractor, including the rear seats. Child seats should be the right type for the child's age and weight, fitted correctly and free from cracks. Show the customer how the seat is fixed."] },
      { h: "Customer briefing", p: ["Take one minute at handover to point out the hazard light switch, spare tyre location and the emergency number. For long trips, remind drivers to rest every two hours."] },
    ],
    steps: [
      "Run the full Veltrix checklist at every check-out and check-in — no skipped items.",
      "Photograph any existing damage before the customer leaves and attach it to the inspection.",
      "Move a car to Maintenance straight away if brakes, tyres or lights are marked as an issue.",
      "Keep at least two child seats per branch and log them as an add-on in booking notes.",
      "Brief the customer on emergency equipment and the Veltrix 24-hour line.",
    ],
    operator: [
      "Set a tyre replacement interval by mileage and review it with inspection results each quarter.",
      "Never release a car with a dashboard warning light on.",
      "Clean and inspect child seats after every rental.",
      "Track damage reports per vehicle — repeated issues on one car may mean it should leave the fleet.",
    ],
    refs: [
      ["Institut Penyelidikan Keselamatan Jalan Raya Malaysia (MIROS)", "https://www.miros.gov.my"],
      ["Jabatan Keselamatan Jalan Raya (JKJR)", "https://www.jkjr.gov.my"],
      ["Kementerian Pengangkutan Malaysia", "https://www.mot.gov.my"],
      ["JPJ — Road safety and enforcement", "https://www.jpj.gov.my"],
    ],
  },
];

(function () {
  if (!Layout.init()) return;
  const $ = (id) => document.getElementById(id);
  let tag = "";

  const words = (a) => [...a.intro, ...a.sections.flatMap((s) => s.p), ...a.steps, ...a.operator].join(" ").split(/\s+/).length;
  const readTime = (a) => Math.max(2, Math.round(words(a) / 200)) + " min read";

  function render() {
    const q = $("search").value.trim().toLowerCase();
    const list = ARTICLES.filter((a) => (!tag || a.tag === tag) && (!q || (a.title + a.summary + a.intro.join(" ")).toLowerCase().includes(q)));
    $("guideGrid").innerHTML = list.length ? list.map((a) => `
      <button class="card gcard" data-open="${a.id}" aria-label="Read: ${UI.esc(a.title)}">
        <img src="${a.cover}" alt="" loading="lazy">
        <div class="gcard-body">
          <span class="tag" style="align-self:flex-start">${a.tag}</span>
          <h3>${UI.esc(a.title)}</h3>
          <p>${UI.esc(a.summary)}</p>
          <div class="gcard-meta"><span><i class="bi bi-clock"></i> ${readTime(a)}</span><span>Reviewed ${DateUtil.fmt(a.reviewed)}</span></div>
        </div>
      </button>`).join("") : '<div class="empty-note" style="grid-column:1/-1">No guides match your search.</div>';
  }

  function open(id) {
    const a = ARTICLES.find((x) => x.id === id);
    if (!a) return;
    $("arTag").textContent = a.tag;
    $("arBody").innerHTML = `
      <img class="cover" src="${a.cover}" alt="">
      <h2>${UI.esc(a.title)}</h2>
      <div class="meta-line"><span><i class="bi bi-person"></i> ${a.author}</span><span><i class="bi bi-clock"></i> ${readTime(a)}</span><span><i class="bi bi-calendar-check"></i> Last reviewed ${DateUtil.fmt(a.reviewed)}</span></div>
      <h3>Introduction</h3>
      ${a.intro.map((p) => `<p>${p}</p>`).join("")}
      ${a.sections.map((s) => `<h3>${s.h}</h3>${s.p.map((p) => `<p>${p}</p>`).join("")}`).join("")}
      <h3>Practical steps</h3>
      <ol>${a.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      <h3>What should rental operators do?</h3>
      <div class="operator-box"><ul>${a.operator.map((s) => `<li>${s}</li>`).join("")}</ul></div>
      <h3>Official references</h3>
      <ul class="refs">${a.refs.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${t}</a> <span class="muted small">— ${u.replace("https://", "")}</span></li>`).join("")}</ul>
      <p class="small muted mt-16" style="border-top:1px solid var(--border);padding-top:12px">Last reviewed on ${DateUtil.fmt(a.reviewed)} by ${a.author}. This summary is for staff guidance and is not legal advice; confirm current requirements with the agency.</p>`;
    UI.openModal("articleModal");
    $("arBody").scrollTop = 0;
    history.replaceState(null, "", "#" + a.id);
  }

  $("guideGrid").addEventListener("click", (e) => { const b = e.target.closest("[data-open]"); if (b) open(b.dataset.open); });
  $("search").addEventListener("input", render);
  UI.$$("#tagFilter button").forEach((b) => b.addEventListener("click", () => { tag = b.dataset.tag; UI.$$("#tagFilter button").forEach((x) => x.classList.toggle("active", x === b)); render(); }));
  document.getElementById("articleModal").addEventListener("click", (e) => { if (e.target.id === "articleModal" || e.target.closest("[data-close]")) history.replaceState(null, "", location.pathname); });

  render();
  if (location.hash) open(location.hash.slice(1));
})();
