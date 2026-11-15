/* =========================================================
   VELTRIX — Dashboard (index.html)
   ========================================================= */
(function () {
  if (!Layout.init()) return;
  const T = DateUtil.todayIso();
  const vehicles = DB.vehicles(), customers = DB.customers(), bookings = DB.bookings();
  const vMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));
  const cMap = Object.fromEntries(customers.map((c) => [c.id, c]));
  const valid = bookings.filter((b) => b.status !== "Cancelled");
  const s = Layout.session;

  /* ----- hero ----- */
  const hr = new Date().getHours();
  const part = hr < 12 ? "Good morning" : hr < 15 ? "Good afternoon" : hr < 19 ? "Good evening" : "Good evening";
  document.getElementById("heroDate").textContent = part + " · " + new Date().toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  document.getElementById("heroName").textContent = s.fullname.split(" ")[0];
  document.getElementById("heroCars").innerHTML =
    CarArt.svg("#2fa36b", "SUV", { label: "SUV" }).replace("<svg ", '<svg class="car-b" ') +
    CarArt.svg("#f4f6f4", "Compact", { label: "Hatchback" }).replace("<svg ", '<svg class="car-a" ');
  const todayPick = bookings.filter((b) => b.pickupDate === T && ["Confirmed", "Pending"].includes(b.status)).length;
  const todayRet = bookings.filter((b) => b.returnDate === T && b.status === "Ongoing").length;
  const pending = bookings.filter((b) => b.status === "Pending").length;
  document.getElementById("heroSummary").textContent =
    `${todayPick} pickup${todayPick === 1 ? "" : "s"} and ${todayRet} return${todayRet === 1 ? "" : "s"} scheduled today. ${pending} booking${pending === 1 ? "" : "s"} waiting for confirmation.`;

  /* ----- KPIs ----- */
  const thisMonth = T.slice(0, 7);
  const lastMonthD = DateUtil.parse(T); lastMonthD.setDate(1); lastMonthD.setMonth(lastMonthD.getMonth() - 1);
  const lastMonth = DateUtil.iso(lastMonthD).slice(0, 7);
  const rev = (m) => valid.filter((b) => b.pickupDate.slice(0, 7) === m).reduce((a, b) => a + b.total, 0);
  const revNow = rev(thisMonth), revPrev = rev(lastMonth);
  const change = revPrev ? ((revNow - revPrev) / revPrev) * 100 : 0;
  const rented = vehicles.filter((v) => v.status === "Rented").length;
  const usable = vehicles.filter((v) => v.status !== "Maintenance").length;
  const util = usable ? Math.round((rented / usable) * 100) : 0;
  const active = bookings.filter((b) => b.status === "Ongoing").length;
  const kpis = [
    ["Revenue this month", UI.money0(revNow), `<span class="${change >= 0 ? "trend-up" : "trend-down"}"><i class="bi bi-arrow-${change >= 0 ? "up" : "down"}-right"></i> ${Math.abs(change).toFixed(1)}%</span> vs ${DateUtil.monthLabel(lastMonth)}`, "bi-cash-stack"],
    ["Active rentals", active, `${rented} of ${vehicles.length} vehicles on the road`, "bi-key"],
    ["Fleet utilisation", util + "%", `${usable} vehicles available for hire`, "bi-speedometer2"],
    ["Pending records", pending, "Awaiting confirmation in the records", "bi-hourglass-split"],
  ];
  document.getElementById("kpis").innerHTML = kpis.map(([l, v, sub, icon]) => `
    <div class="card kpi"><div class="kpi-top"><span>${l}</span><i class="bi ${icon}"></i></div>
    <div class="kpi-value">${v}</div><div class="kpi-sub">${sub}</div></div>`).join("");

  /* ----- fleet showcase: one card per model, photo from assets/img/cars/photos/<model>.svg ----- */
  const models = [];
  vehicles.forEach((v) => { if (!models.some((m) => m.model === v.model)) models.push({ model: v.model, brand: v.brand, category: v.category, sample: v }); });
  models.sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.model.localeCompare(b.model));
  function renderShowcase(brand) {
    document.getElementById("showcase").innerHTML = models.filter((m) => !brand || m.brand === brand).map((m) => {
      const units = vehicles.filter((v) => v.model === m.model);
      const free = units.filter((v) => v.status === "Available").length;
      const rate = Math.min(...units.map((v) => v.dailyRate));
      return `<a class="sc-card" href="vehicles.html?q=${encodeURIComponent(m.model)}">
        <div class="sc-photo">${UI.carVisual({ ...m.sample, photo: "" })}<span class="tag">${m.category}</span></div>
        <div class="sc-body"><div><h3>${m.brand} ${m.model}</h3><div class="small">From RM ${rate}/day · ${m.sample.seats} seats</div></div>
        <span class="sc-avail ${free ? "" : "none"}">${free ? `${free} of ${units.length} available` : "Fully booked"}</span></div></a>`;
    }).join("");
  }
  renderShowcase("");
  UI.$$("#showcaseFilter button").forEach((b) => b.addEventListener("click", () => { UI.$$("#showcaseFilter button").forEach((x) => x.classList.toggle("active", x === b)); renderShowcase(b.dataset.brand); }));
  document.getElementById("scPrev").onclick = () => document.getElementById("showcase").scrollBy({ left: -480 });
  document.getElementById("scNext").onclick = () => document.getElementById("showcase").scrollBy({ left: 480 });

  /* ----- lists ----- */
  const in7 = DateUtil.add(T, 7);
  const li = (b, dateField, label) => {
    const v = vMap[b.vehicleId], c = cMap[b.customerId], d = DateUtil.parse(b[dateField]);
    return `<li><div class="date-chip"><b>${d.getDate()}</b><span>${d.toLocaleDateString("en-MY", { month: "short" })}</span></div>
      <div class="grow"><strong>${UI.esc(c ? c.name : "-")}</strong><span>${UI.esc(DB.vehicleName(v))} · ${v ? v.plate : ""} · ${label}</span></div>
      <span class="badge b-blue">${UI.esc(b.status)}</span></li>`;
  };
  const pick = bookings.filter((b) => ["Pending", "Confirmed"].includes(b.status) && b.pickupDate >= T && b.pickupDate <= in7).sort((a, b) => a.pickupDate.localeCompare(b.pickupDate));
  const ret = bookings.filter((b) => b.status === "Ongoing" && b.returnDate <= in7).sort((a, b) => a.returnDate.localeCompare(b.returnDate));
  document.getElementById("pickups").innerHTML = pick.slice(0, 5).map((b) => li(b, "pickupDate", b.pickupTime + " · " + b.branch)).join("") || '<li class="empty-note">No pickups in the next 7 days.</li>';
  document.getElementById("returns").innerHTML = ret.slice(0, 5).map((b) => li(b, "returnDate", b.returnDate < T ? '<span style="color:var(--red)">Overdue</span>' : b.branch)).join("") || '<li class="empty-note">No returns in the next 7 days.</li>';

  /* last 6 months keys */
  const months = [];
  for (let i = 5; i >= 0; i--) { const d = DateUtil.parse(T); d.setDate(1); d.setMonth(d.getMonth() - i); months.push(DateUtil.iso(d).slice(0, 7)); }
  const from = months[0] + "-01";
  const recentValid = valid.filter((b) => b.pickupDate >= from);

  const byVehicle = {};
  recentValid.forEach((b) => { byVehicle[b.vehicleId] = (byVehicle[b.vehicleId] || 0) + b.total; });
  const top = Object.entries(byVehicle).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxTop = top.length ? top[0][1] : 1;
  document.getElementById("topVehicles").innerHTML = top.map(([vid, total], i) => {
    const v = vMap[vid];
    return `<li><div class="date-chip"><b>${i + 1}</b><span>rank</span></div><div class="grow"><strong>${UI.esc(DB.vehicleName(v))} <span class="muted small">${v.plate}</span></strong>
      <div class="progress mt-8" style="height:6px"><div style="width:${(total / maxTop) * 100}%"></div></div></div><b class="nowrap">${UI.money0(total)}</b></li>`;
  }).join("") || '<li class="empty-note">No bookings yet.</li>';

  /* ----- regulatory reminders ----- */
  const limit = DateUtil.add(T, 45);
  const items = [];
  vehicles.forEach((v) => {
    [["roadTaxExpiry", "Road tax (LKM) renewal", "bi-receipt"], ["insuranceExpiry", "Insurance renewal", "bi-shield-check"], ["puspakomDue", "PUSPAKOM inspection", "bi-clipboard2-pulse"]].forEach(([f, label, icon]) => {
      if (v[f] && v[f] <= limit) items.push({ date: v[f], title: `${label} — ${DB.vehicleName(v)}`, sub: `${v.plate} · ${v.branch}`, icon, link: "vehicles.html?vehicle=" + v.id });
    });
  });
  customers.forEach((c) => {
    if (c.licenceExpiry && c.licenceExpiry <= limit) {
      const upcoming = bookings.find((b) => b.customerId === c.id && ["Pending", "Confirmed"].includes(b.status));
      items.push({ date: c.licenceExpiry, title: `Driving licence expiry — ${c.name}`, sub: upcoming ? `Has booking ${upcoming.id}. Ask for a renewed licence at pickup.` : "Check licence before the next rental.", icon: "bi-person-vcard", link: "customers.html?customer=" + c.id });
    }
  });
  items.sort((a, b) => a.date.localeCompare(b.date));
  document.getElementById("reminders").innerHTML = items.length ? items.slice(0, 6).map((it) => {
    const d = DateUtil.diff(T, it.date);
    const cls = d < 0 ? ["b-red", "Overdue " + Math.abs(d) + "d"] : d <= 14 ? ["b-amber", "In " + d + " days"] : ["b-blue", "In " + d + " days"];
    const tone = d < 0 ? "var(--red-soft);color:var(--red)" : d <= 14 ? "var(--amber-soft);color:var(--amber)" : "var(--blue-soft);color:var(--blue)";
    return `<div class="reminder-item"><div class="reminder-ico" style="background:${tone}"><i class="bi ${it.icon}"></i></div>
      <div><a href="${it.link}" style="color:var(--text);font-weight:600">${UI.esc(it.title)}</a><div class="small muted">${UI.esc(it.sub)} · Due ${DateUtil.fmt(it.date)}</div></div>
      <span class="badge ${cls[0]}">${cls[1]}</span></div>`;
  }).join("") + (items.length > 6 ? `<p class="small muted mt-8">+ ${items.length - 6} more items due within 45 days.</p>` : "")
    : '<div class="empty-note"><i class="bi bi-check2-circle"></i> Nothing due in the next 45 days.</div>';

  /* ----- recent bookings ----- */
  const recent = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  document.getElementById("recentBody").innerHTML = recent.map((b) => {
    const v = vMap[b.vehicleId], c = cMap[b.customerId];
    return `<tr>
      <td><span class="cell-main mono">${b.id}</span><div class="cell-sub">${DateUtil.relative(b.createdAt)}</div></td>
      <td>${UI.esc(c ? c.name : "-")}</td>
      <td>${UI.esc(DB.vehicleName(v))}<div class="cell-sub">${v ? v.plate : ""}</div></td>
      <td class="nowrap">${DateUtil.fmtShort(b.pickupDate)} – ${DateUtil.fmtShort(b.returnDate)}<div class="cell-sub">${b.days} day${b.days > 1 ? "s" : ""}</div></td>
      <td>${UI.statusBadge(b.status)}</td><td class="num nowrap">${UI.money(b.total)}</td></tr>`;
  }).join("");

  /* ----- charts ----- */
  let charts = [];
  function drawCharts() {
    charts.forEach((c) => c.destroy());
    charts = [];
    if (!Charts.defaults()) { ["revenueWrap", "fleetWrap", "catWrap"].forEach((id) => Charts.missing(document.getElementById(id))); return; }
    const p = Charts.palette();

    const revData = months.map((m) => recentValid.filter((b) => b.pickupDate.slice(0, 7) === m).reduce((a, b) => a + b.total, 0));
    const cntData = months.map((m) => recentValid.filter((b) => b.pickupDate.slice(0, 7) === m).length);
    charts.push(new Chart(document.getElementById("revenueChart"), {
      data: {
        labels: months.map(DateUtil.monthLabel),
        datasets: [
          { type: "bar", label: "Revenue (RM)", data: revData, backgroundColor: p.primary, borderRadius: 4, maxBarThickness: 38, yAxisID: "y" },
          { type: "line", label: "Bookings", data: cntData, borderColor: p.series[2], backgroundColor: p.series[2], tension: 0.35, pointRadius: 4, yAxisID: "y1" },
        ],
      },
      options: {
        interaction: { mode: "index", intersect: false },
        plugins: { tooltip: { callbacks: { label: (ctx) => ctx.dataset.yAxisID === "y" ? " Revenue: " + UI.money(ctx.raw) : " Bookings: " + ctx.raw } } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: (v) => "RM " + (v >= 1000 ? v / 1000 + "k" : v) } },
          y1: { beginAtZero: true, position: "right", grid: { display: false }, ticks: { precision: 0 } },
          x: { grid: { display: false } },
        },
        onClick: (e, el) => { if (el.length) location.href = "insights.html"; },
      },
    }));

    const statuses = ["Available", "Rented", "Maintenance"];
    const counts = statuses.map((st) => vehicles.filter((v) => v.status === st).length);
    charts.push(new Chart(document.getElementById("fleetChart"), {
      type: "doughnut",
      data: { labels: statuses, datasets: [{ data: counts, backgroundColor: statuses.map((st) => p.status[st]), borderColor: getComputedStyle(document.body).getPropertyValue("--surface"), borderWidth: 3 }] },
      options: {
        cutout: "66%",
        plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw} vehicle${c.raw === 1 ? "" : "s"}` } } },
        onClick: (e, el) => { if (el.length) location.href = "vehicles.html?status=" + statuses[el[0].index]; },
      },
    }));
    document.getElementById("fleetNote").textContent = `${vehicles.length} vehicles · click a segment to filter`;

    const catCounts = CATEGORIES.map((c) => recentValid.filter((b) => vMap[b.vehicleId] && vMap[b.vehicleId].category === c).length);
    charts.push(new Chart(document.getElementById("categoryChart"), {
      type: "bar",
      data: { labels: CATEGORIES, datasets: [{ label: "Bookings", data: catCounts, backgroundColor: p.series, borderRadius: 4, maxBarThickness: 26 }] },
      options: {
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { precision: 0 } }, y: { grid: { display: false } } },
        onClick: (e, el) => { if (el.length) location.href = "vehicles.html?category=" + CATEGORIES[el[0].index]; },
      },
    }));
  }
  drawCharts();
  document.addEventListener("themechange", drawCharts);
})();
