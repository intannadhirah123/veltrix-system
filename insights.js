/* =========================================================
   VELTRIX — Business Insights (insights.html)
   Every figure is calculated from localStorage records.
   ========================================================= */
(function () {
  if (!Layout.init()) return;
  const $ = (id) => document.getElementById(id);
  const T = DateUtil.todayIso();
  const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  let charts = {};
  let drill = null;
  let current = null;

  $("dFrom").value = DateUtil.add(T, -179);
  $("dTo").value = T;

  function overlapDays(b, from, toExcl) {
    const s = b.pickupDate > from ? b.pickupDate : from;
    const e = b.returnDate < toExcl ? b.returnDate : toExcl;
    return Math.max(0, DateUtil.diff(s, e));
  }

  function compute() {
    const from = $("dFrom").value, to = $("dTo").value, brand = $("fBrand").value;
    const vehicles = DB.vehicles().filter((v) => !brand || v.brand === brand);
    const vMap = Object.fromEntries(DB.vehicles().map((v) => [v.id, v]));
    const cMap = Object.fromEntries(DB.customers().map((c) => [c.id, c]));
    const allBookings = DB.bookings();
    const inBrand = (b) => vMap[b.vehicleId] && (!brand || vMap[b.vehicleId].brand === brand);
    const range = allBookings.filter((b) => b.pickupDate >= from && b.pickupDate <= to && inBrand(b));
    const valid = range.filter((b) => b.status !== "Cancelled");
    const len = DateUtil.diff(from, to) + 1;
    const pFrom = DateUtil.add(from, -len), pTo = DateUtil.add(from, -1);
    const prevValid = allBookings.filter((b) => b.pickupDate >= pFrom && b.pickupDate <= pTo && inBrand(b) && b.status !== "Cancelled");
    const ids = new Set(valid.map((b) => b.id));
    const collected = DB.payments().filter((p) => ids.has(p.bookingId) && p.status === "Paid").reduce((a, p) => a + p.amount, 0);
    const revenue = valid.reduce((a, b) => a + b.total, 0);
    const prevRevenue = prevValid.reduce((a, b) => a + b.total, 0);
    const toExcl = DateUtil.add(to, 1);
    const util = vehicles.map((v) => {
      const days = allBookings.filter((b) => b.vehicleId === v.id && b.status !== "Cancelled").reduce((a, b) => a + overlapDays(b, from, toExcl), 0);
      return { v, days, pct: Math.min(100, (days / len) * 100) };
    }).sort((a, b) => b.pct - a.pct);
    const fleetUtil = util.length ? util.reduce((a, u) => a + u.days, 0) / (util.length * len) * 100 : 0;
    const types = {};
    DB.customers().forEach((c) => (types[c.id] = DB.customerStats(c.id, allBookings).type));
    return { from, to, brand, len, vehicles, vMap, cMap, range, valid, prevValid, revenue, prevRevenue, collected, util, fleetUtil, types };
  }

  const pct = (a, b) => (b ? ((a - b) / b) * 100 : null);
  const trendTxt = (ch) => ch === null ? '<span class="muted">no data in previous period</span>' :
    `<span class="${ch >= 0 ? "trend-up" : "trend-down"}"><i class="bi bi-arrow-${ch >= 0 ? "up" : "down"}-right"></i> ${Math.abs(ch).toFixed(1)}%</span> vs previous ${current.len} days`;

  function render() {
    const err = $("rangeErr");
    if (!$("dFrom").value || !$("dTo").value || $("dFrom").value > $("dTo").value) {
      err.innerHTML = '<i class="bi bi-exclamation-circle"></i>The "From" date must be on or before the "To" date.';
      err.classList.add("show");
      $("dFrom").classList.add("invalid"); $("dTo").classList.add("invalid");
      return;
    }
    err.classList.remove("show"); $("dFrom").classList.remove("invalid"); $("dTo").classList.remove("invalid");
    current = compute();
    const d = current;
    $("periodText").textContent = `${DateUtil.fmt(d.from)} – ${DateUtil.fmt(d.to)} (${d.len} days) · ${d.brand || "Perodua & Proton"} · calculated from saved records`;

    const avgVal = d.valid.length ? d.revenue / d.valid.length : 0;
    const prevAvg = d.prevValid.length ? d.prevRevenue / d.prevValid.length : 0;
    const avgDays = d.valid.length ? d.valid.reduce((a, b) => a + b.days, 0) / d.valid.length : 0;
    const cancelRate = d.range.length ? (d.range.filter((b) => b.status === "Cancelled").length / d.range.length) * 100 : 0;
    $("kpis").innerHTML = [
      ["Revenue", UI.money0(d.revenue), trendTxt(pct(d.revenue, d.prevRevenue)), "bi-cash-stack"],
      ["Bookings", d.valid.length, trendTxt(pct(d.valid.length, d.prevValid.length)), "bi-calendar2-check"],
      ["Average booking value", UI.money(avgVal), trendTxt(pct(avgVal, prevAvg)), "bi-receipt"],
      ["Payments collected", UI.money0(d.collected), `${d.revenue ? ((d.collected / d.revenue) * 100).toFixed(0) : 0}% of booked revenue`, "bi-wallet2"],
      ["Fleet utilisation", d.fleetUtil.toFixed(1) + "%", `${d.vehicles.length} vehicles · avg ${avgDays.toFixed(1)} days per rental`, "bi-speedometer2"],
      ["Cancellation rate", cancelRate.toFixed(1) + "%", `${d.range.filter((b) => b.status === "Cancelled").length} of ${d.range.length} bookings cancelled`, "bi-x-octagon"],
    ].map(([l, v, s, i]) => `<div class="card kpi"><div class="kpi-top"><span>${l}</span><i class="bi ${i}"></i></div><div class="kpi-value">${v}</div><div class="kpi-sub">${s}</div></div>`).join("");

    renderHighlights(d, cancelRate);
    drawCharts();
    renderDrill();
  }

  function renderHighlights(d, cancelRate) {
    const hl = [];
    if (!d.valid.length) {
      $("highlights").innerHTML = '<div class="empty-note">No bookings in this period. Try a wider date range.</div>';
      return;
    }
    const ch = pct(d.revenue, d.prevRevenue);
    if (ch !== null) hl.push([ch >= 0 ? "bi-graph-up-arrow" : "bi-graph-down-arrow", ch >= 0 ? "Revenue is growing" : "Revenue has dropped",
      `${UI.money0(d.revenue)} this period, ${ch >= 0 ? "up" : "down"} ${Math.abs(ch).toFixed(1)}% from ${UI.money0(d.prevRevenue)} in the previous ${d.len} days.`]);
    const cat = {};
    d.valid.forEach((b) => { const c = d.vMap[b.vehicleId].category; cat[c] = (cat[c] || 0) + b.total; });
    const topCat = Object.entries(cat).sort((a, b) => b[1] - a[1])[0];
    hl.push(["bi-trophy", `${topCat[0]} leads revenue`, `${topCat[0]} vehicles earned ${UI.money0(topCat[1])}, ${((topCat[1] / d.revenue) * 100).toFixed(0)}% of the total.`]);
    if (!d.brand) {
      const br = { Perodua: 0, Proton: 0 };
      d.valid.forEach((b) => (br[d.vMap[b.vehicleId].brand] += b.total));
      const lead = br.Perodua >= br.Proton ? "Perodua" : "Proton", other = lead === "Perodua" ? "Proton" : "Perodua";
      hl.push(["bi-car-front", `${lead} brings in more`, `${lead} ${UI.money0(br[lead])} vs ${other} ${UI.money0(br[other])} (${((br[lead] / d.revenue) * 100).toFixed(0)}% share).`]);
    }
    const top = d.util[0], low = d.util[d.util.length - 1];
    if (top) hl.push(["bi-speedometer", `Busiest car: ${top.v.model} ${top.v.plate}`, `On rent ${top.days} of ${d.len} days (${top.pct.toFixed(0)}%).${low && low.pct < 15 ? ` ${low.v.model} ${low.v.plate} was used only ${low.pct.toFixed(0)}% — consider a promotion or moving it to a busier branch.` : ""}`]);
    const wd = Array(7).fill(0);
    d.valid.forEach((b) => wd[(DateUtil.parse(b.pickupDate).getDay() + 6) % 7]++);
    const peak = wd.indexOf(Math.max(...wd));
    hl.push(["bi-calendar-week", `${DOW[peak]} is the busiest pickup day`, `${wd[peak]} pickups fell on a ${DOW[peak]}. Plan counter staff and car washing around it.`]);
    const cs = {};
    d.valid.forEach((b) => (cs[b.customerId] = (cs[b.customerId] || 0) + b.total));
    const tc = Object.entries(cs).sort((a, b) => b[1] - a[1])[0];
    if (tc) hl.push(["bi-person-star", `Top customer: ${d.cMap[tc[0]]?.name || tc[0]}`, `Spent ${UI.money0(tc[1])} in this period (${d.types[tc[0]]} customer).`]);
    if (cancelRate > 10) hl.push(["bi-exclamation-triangle", "Cancellations are high", `${cancelRate.toFixed(1)}% of bookings were cancelled. Consider asking for a deposit at booking.`]);
    $("highlights").innerHTML = hl.slice(0, 6).map(([i, t, p]) => `<div class="hl"><i class="bi ${i}"></i><div><strong>${UI.esc(t)}</strong><p>${UI.esc(p)}</p></div></div>`).join("");
  }

  function setDrill(label, fn) {
    drill = { label, fn };
    renderDrill();
    $("drillCard").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function renderDrill() {
    const d = current;
    const list = (drill ? d.range.filter(drill.fn) : d.range).sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));
    $("drillLabel").innerHTML = drill ? `<span class="drill-label">${UI.esc(drill.label)} <button id="clearDrill" aria-label="Clear selection"><i class="bi bi-x"></i></button></span>` : '<span class="small muted">Showing all bookings in period</span>';
    const c = $("clearDrill"); if (c) c.onclick = () => { drill = null; renderDrill(); };
    $("drillBody").innerHTML = list.length ? list.slice(0, 40).map((b) => {
      const v = d.vMap[b.vehicleId];
      return `<tr><td class="mono"><a href="index.html#recentBookings">${b.id}</a></td><td>${UI.esc(d.cMap[b.customerId]?.name || "-")}</td><td>${UI.esc(DB.vehicleName(v))}<div class="cell-sub">${v?.plate}</div></td><td>${v?.category}</td><td class="nowrap">${DateUtil.fmt(b.pickupDate)}</td><td class="num">${b.days}</td><td>${UI.statusBadge(b.status)}</td><td class="num nowrap">${UI.money(b.total)}</td></tr>`;
    }).join("") : '<tr><td colspan="8" class="table-empty">No bookings for this selection.</td></tr>';
    const sum = list.filter((b) => b.status !== "Cancelled").reduce((a, b) => a + b.total, 0);
    $("drillFoot").textContent = `${list.length} booking(s) · ${UI.money(sum)} revenue${list.length > 40 ? " · showing latest 40 (export CSV for all)" : ""}`;
  }

  function drawCharts() {
    Object.values(charts).forEach((c) => c.destroy());
    charts = {};
    if (!Charts.defaults()) { UI.$$("canvas").forEach((c) => Charts.missing(c.parentElement)); return; }
    const p = Charts.palette(), d = current;
    const surface = getComputedStyle(document.body).getPropertyValue("--surface");

    // monthly trend
    const months = [];
    const cur = DateUtil.parse(d.from); cur.setDate(1);
    const end = d.to.slice(0, 7);
    while (DateUtil.iso(cur).slice(0, 7) <= end) { months.push(DateUtil.iso(cur).slice(0, 7)); cur.setMonth(cur.getMonth() + 1); }
    const mRev = months.map((m) => d.valid.filter((b) => b.pickupDate.slice(0, 7) === m).reduce((a, b) => a + b.total, 0));
    const mCnt = months.map((m) => d.valid.filter((b) => b.pickupDate.slice(0, 7) === m).length);
    charts.trend = new Chart($("trendChart"), {
      type: "line",
      data: { labels: months.map(DateUtil.monthLabel), datasets: [
        { label: "Revenue (RM)", data: mRev, borderColor: p.primary, backgroundColor: p.primarySoft, fill: true, tension: 0.35, pointRadius: 5, pointHoverRadius: 7, yAxisID: "y" },
        { label: "Bookings", data: mCnt, borderColor: p.series[2], backgroundColor: p.series[2], borderDash: [5, 4], tension: 0.35, pointRadius: 4, yAxisID: "y1" },
      ]},
      options: {
        interaction: { mode: "index", intersect: false },
        plugins: { tooltip: { callbacks: { label: (c) => c.datasetIndex === 0 ? ` Revenue: ${UI.money(c.raw)}` : ` Bookings: ${c.raw}`, footer: (items) => { const i = items[0].dataIndex; return mCnt[i] ? `Avg per booking: ${UI.money(mRev[i] / mCnt[i])}` : ""; } } } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => "RM " + (v >= 1000 ? v / 1000 + "k" : v) } }, y1: { beginAtZero: true, position: "right", grid: { display: false }, ticks: { precision: 0 } }, x: { grid: { display: false } } },
        onClick: (e, el) => { if (el.length) { const m = months[el[0].index]; setDrill(`Month: ${DateUtil.monthLabel(m)}`, (b) => b.pickupDate.slice(0, 7) === m); } },
      },
    });

    // brand
    const brands = ["Perodua", "Proton"].filter((b) => !d.brand || b === d.brand);
    const bRev = brands.map((br) => d.valid.filter((b) => d.vMap[b.vehicleId].brand === br).reduce((a, b) => a + b.total, 0));
    const bCnt = brands.map((br) => d.valid.filter((b) => d.vMap[b.vehicleId].brand === br).length);
    charts.brand = new Chart($("brandChart"), {
      type: "bar",
      data: { labels: brands, datasets: [
        { label: "Revenue (RM)", data: bRev, backgroundColor: p.primary, borderRadius: 4, yAxisID: "y", maxBarThickness: 44 },
        { label: "Bookings", data: bCnt, backgroundColor: p.series[1], borderRadius: 4, yAxisID: "y1", maxBarThickness: 44 },
      ]},
      options: {
        plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (c) => c.datasetIndex === 0 ? ` Revenue: ${UI.money(c.raw)}` : ` Bookings: ${c.raw}` } } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => (v >= 1000 ? v / 1000 + "k" : v) } }, y1: { beginAtZero: true, position: "right", grid: { display: false }, ticks: { precision: 0 } }, x: { grid: { display: false } } },
        onClick: (e, el) => { if (el.length) { const br = brands[el[0].index]; setDrill(`Brand: ${br}`, (b) => d.vMap[b.vehicleId].brand === br); } },
      },
    });

    // category
    const cRev = CATEGORIES.map((c) => d.valid.filter((b) => d.vMap[b.vehicleId].category === c).reduce((a, b) => a + b.total, 0));
    charts.category = new Chart($("categoryChart"), {
      type: "doughnut",
      data: { labels: CATEGORIES, datasets: [{ data: cRev, backgroundColor: p.series, borderColor: surface, borderWidth: 3 }] },
      options: {
        cutout: "60%",
        plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (c) => { const t = cRev.reduce((a, b) => a + b, 0); return ` ${c.label}: ${UI.money0(c.raw)} (${t ? ((c.raw / t) * 100).toFixed(1) : 0}%)`; } } } },
        onClick: (e, el) => { if (el.length) { const c = CATEGORIES[el[0].index]; setDrill(`Category: ${c}`, (b) => d.vMap[b.vehicleId].category === c); } },
      },
    });

    // weekday
    const wd = Array(7).fill(0);
    d.valid.forEach((b) => wd[(DateUtil.parse(b.pickupDate).getDay() + 6) % 7]++);
    const maxW = Math.max(...wd);
    charts.weekday = new Chart($("weekdayChart"), {
      type: "bar",
      data: { labels: DOW, datasets: [{ label: "Pickups", data: wd, backgroundColor: wd.map((v) => (v === maxW && v > 0 ? p.primary : p.primarySoft)), borderColor: p.primary, borderWidth: 1, borderRadius: 4 }] },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } },
        onClick: (e, el) => { if (el.length) { const i = el[0].index; setDrill(`Pickups on ${DOW[i]}`, (b) => (DateUtil.parse(b.pickupDate).getDay() + 6) % 7 === i && b.status !== "Cancelled"); } },
      },
    });

    // utilisation
    const u = d.util.slice(0, 16);
    charts.util = new Chart($("utilChart"), {
      type: "bar",
      data: { labels: u.map((x) => `${x.v.model} ${x.v.plate}`), datasets: [{ label: "Utilisation %", data: u.map((x) => +x.pct.toFixed(1)), backgroundColor: u.map((x) => (x.pct >= 40 ? p.primary : x.pct >= 15 ? p.series[1] : p.series[2])), borderRadius: 3, maxBarThickness: 16 }] },
      options: {
        indexAxis: "y",
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.raw}% · ${u[c.dataIndex].days} day(s) on rent`, afterLabel: (c) => ` ${u[c.dataIndex].v.category} · RM ${u[c.dataIndex].v.dailyRate}/day` } } },
        scales: { x: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + "%" } }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } },
        onClick: (e, el) => { if (el.length) { const v = u[el[0].index].v; setDrill(`Vehicle: ${v.model} ${v.plate}`, (b) => b.vehicleId === v.id); } },
      },
    });

    // customer type
    const types = ["New", "Regular", "VIP"];
    const tRev = types.map((t) => d.valid.filter((b) => d.types[b.customerId] === t).reduce((a, b) => a + b.total, 0));
    charts.cust = new Chart($("custChart"), {
      type: "pie",
      data: { labels: types, datasets: [{ data: tRev, backgroundColor: [p.series[0], p.series[1], p.dark ? "#e5ece8" : "#15211b"], borderColor: surface, borderWidth: 2 }] },
      options: {
        plugins: { legend: { position: "bottom" }, title: { display: true, text: "Revenue by customer type", font: { weight: 600 } }, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${UI.money0(c.raw)}` } } },
        onClick: (e, el) => { if (el.length) { const t = types[el[0].index]; setDrill(`${t} customers`, (b) => d.types[b.customerId] === t); } },
      },
    });

    // status
    const sts = BOOKING_STATUSES;
    const sCnt = sts.map((s) => d.range.filter((b) => b.status === s).length);
    const sCol = { Pending: p.series[2], Confirmed: p.series[1], Ongoing: p.primary, Completed: p.muted, Cancelled: p.series[4] };
    charts.status = new Chart($("statusChart"), {
      type: "doughnut",
      data: { labels: sts, datasets: [{ data: sCnt, backgroundColor: sts.map((s) => sCol[s]), borderColor: surface, borderWidth: 2 }] },
      options: {
        cutout: "55%",
        plugins: { legend: { position: "bottom" }, title: { display: true, text: "Bookings by status", font: { weight: 600 } } },
        onClick: (e, el) => { if (el.length) { const s = sts[el[0].index]; setDrill(`Status: ${s}`, (b) => b.status === s); } },
      },
    });

    // pointer cursor on clickable charts
    Object.values(charts).forEach((c) => { c.options.onHover = (e, el) => { e.native.target.style.cursor = el.length ? "pointer" : "default"; }; c.update("none"); });
  }

  /* ---------- filters ---------- */
  UI.$$("#presets button").forEach((b) => b.addEventListener("click", () => {
    UI.$$("#presets button").forEach((x) => x.classList.toggle("active", x === b));
    $("dTo").value = T;
    $("dFrom").value = DateUtil.add(T, -(Number(b.dataset.days) - 1));
    drill = null;
    render();
  }));
  ["dFrom", "dTo", "fBrand"].forEach((id) => $(id).addEventListener("change", () => {
    if (id !== "fBrand") UI.$$("#presets button").forEach((x) => x.classList.remove("active"));
    drill = null;
    render();
  }));

  /* ---------- export & print ---------- */
  $("exportBtn").addEventListener("click", () => {
    if (!current) return;
    const d = current;
    const rows = [
      ["Veltrix Business Report"], ["Period", d.from, d.to], ["Brand", d.brand || "All"], ["Revenue (RM)", d.revenue.toFixed(2)], ["Bookings", d.valid.length], ["Fleet utilisation (%)", d.fleetUtil.toFixed(1)], [],
      ["Booking ID", "Customer", "Vehicle", "Plate", "Brand", "Category", "Pickup", "Return", "Days", "Status", "Total (RM)"],
    ];
    const list = drill ? d.range.filter(drill.fn) : d.range;
    list.forEach((b) => { const v = d.vMap[b.vehicleId]; rows.push([b.id, d.cMap[b.customerId]?.name, `${v.brand} ${v.model}`, v.plate, v.brand, v.category, b.pickupDate, b.returnDate, b.days, b.status, b.total.toFixed(2)]); });
    rows.push([], ["Vehicle utilisation"], ["Vehicle", "Plate", "Days on rent", "Utilisation (%)"]);
    d.util.forEach((u) => rows.push([`${u.v.brand} ${u.v.model}`, u.v.plate, u.days, u.pct.toFixed(1)]));
    downloadCSV(rows, `veltrix-insights-${d.from}-to-${d.to}.csv`);
    UI.toast("Business report exported.");
  });
  $("printBtn").addEventListener("click", () => window.print());

  render();
  document.addEventListener("themechange", drawCharts);
})();
