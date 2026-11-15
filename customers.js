/* =========================================================
   VELTRIX — Customers (customers.html)
   ========================================================= */
(function () {
  if (!Layout.init()) return;
  const $ = (id) => document.getElementById(id);
  const T = DateUtil.todayIso();
  let mode = localStorage.getItem("vx_customer_view") || "table";

  function rows() {
    const bookings = DB.bookings();
    const vMap = Object.fromEntries(DB.vehicles().map((v) => [v.id, v]));
    return DB.customers().map((c) => {
      const st = DB.customerStats(c.id, bookings);
      return { c, st, latestVehicle: st.latest ? vMap[st.latest.vehicleId] : null };
    });
  }

  function render() {
    const all = rows();
    const totalSpend = all.reduce((a, r) => a + r.st.spend, 0);
    $("summary").innerHTML = [
      ["Total customers", all.length, `${all.filter((r) => r.st.type === "New").length} new this period`, "bi-people"],
      ["VIP customers", all.filter((r) => r.st.type === "VIP").length, `${all.filter((r) => r.st.type === "Regular").length} regular customers`, "bi-award"],
      ["Active customers", all.filter((r) => r.st.status === "Active").length, "Rented in the last 90 days", "bi-person-check"],
      ["Average spending", UI.money0(all.length ? totalSpend / all.length : 0), "Per customer, all time", "bi-wallet2"],
    ].map(([l, v, s, i]) => `<div class="card kpi"><div class="kpi-top"><span>${l}</span><i class="bi ${i}"></i></div><div class="kpi-value">${v}</div><div class="kpi-sub">${s}</div></div>`).join("");

    const q = $("search").value.trim().toLowerCase();
    const ty = $("fType").value, stt = $("fStatus").value, sort = $("sortBy").value;
    let list = all.filter((r) => (!ty || r.st.type === ty) && (!stt || r.st.status === stt) &&
      (!q || [r.c.name, r.c.email, r.c.phone, r.c.city, ...r.st.bookings.map((b) => b.id)].join(" ").toLowerCase().includes(q)));
    const sorters = {
      spend: (a, b) => b.st.spend - a.st.spend,
      bookings: (a, b) => b.st.count - a.st.count,
      recent: (a, b) => (b.st.latest?.pickupDate || "").localeCompare(a.st.latest?.pickupDate || ""),
      name: (a, b) => a.c.name.localeCompare(b.c.name),
    };
    list.sort(sorters[sort]);
    $("resultCount").textContent = `Showing ${list.length} of ${all.length} customers`;

    $("tableBody").innerHTML = list.length ? list.map(({ c, st, latestVehicle: v }) => {
      const b = st.latest;
      return `<tr>
        <td><div style="display:flex;gap:10px;align-items:center"><span class="avatar">${UI.initials(c.name)}</span><div><span class="cell-main">${UI.esc(c.name)}</span><div class="cell-sub">${UI.esc(c.email)}</div></div></div></td>
        <td>${UI.statusBadge(st.type)}</td>
        <td>${b ? `<span class="mono">${b.id}</span><div class="cell-sub">${b.status}</div>` : "-"}</td>
        <td>${v ? `${v.brand} ${v.model}<div class="cell-sub">${v.plate}</div>` : "-"}</td>
        <td class="nowrap">${b ? `${DateUtil.fmtShort(b.pickupDate)} – ${DateUtil.fmt(b.returnDate)}<div class="cell-sub">${b.days} day${b.days > 1 ? "s" : ""}</div>` : "-"}</td>
        <td class="num nowrap">${b ? UI.money(b.total) : "-"}</td>
        <td class="num">${st.count}</td>
        <td class="num nowrap"><b>${UI.money(st.spend)}</b></td>
        <td>${UI.statusBadge(st.status)}</td>
        <td><div class="row-actions"><button class="btn btn-xs" data-history="${c.id}"><i class="bi bi-clock-history"></i> History</button></div></td>
      </tr>`;
    }).join("") : `<tr><td colspan="10" class="table-empty"><i class="bi bi-person-x"></i>No customers match your search.</td></tr>`;

    $("cardView").innerHTML = list.length ? list.map(({ c, st, latestVehicle: v }) => `
      <article class="card ccard">
        <div class="ccard-top"><span class="avatar lg">${UI.initials(c.name)}</span>
          <div style="flex:1;min-width:0"><h3 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${UI.esc(c.name)}</h3><div class="small muted">${UI.esc(c.phone)} · ${UI.esc(c.city)}</div></div>
          ${UI.statusBadge(st.type)}</div>
        <div class="ccard-stats"><div><b>${st.count}</b><span>Bookings</span></div><div><b>${UI.money0(st.spend)}</b><span>Spent</span></div><div><b>${UI.statusBadge(st.status)}</b><span>Status</span></div></div>
        <div class="small">${st.latest ? `<span class="muted">Latest:</span> <b class="mono">${st.latest.id}</b> · ${v ? v.brand + " " + v.model : ""}<br><span class="muted">${DateUtil.fmtShort(st.latest.pickupDate)} – ${DateUtil.fmt(st.latest.returnDate)} (${st.latest.days} days) · ${UI.money(st.latest.total)}</span>` : '<span class="muted">No bookings yet</span>'}</div>
        <div style="display:flex;gap:8px"><button class="btn btn-sm" style="flex:1" data-history="${c.id}"><i class="bi bi-clock-history"></i> Booking history</button></div>
      </article>`).join("") : `<div class="empty-note" style="grid-column:1/-1">No customers match your search.</div>`;

    $("tableView").classList.toggle("hidden", mode !== "table");
    $("cardView").classList.toggle("hidden", mode !== "cards");
    UI.$$(".segmented button").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
  }

  UI.$$(".segmented button").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; localStorage.setItem("vx_customer_view", mode); render(); }));
  ["search", "fType", "fStatus", "sortBy"].forEach((id) => $(id).addEventListener("input", render));
  document.addEventListener("click", (e) => { const t = e.target.closest("[data-history]"); if (t) showHistory(t.dataset.history); });

  /* ---------- history ---------- */
  function showHistory(id) {
    const c = DB.customer(id);
    if (!c) return;
    const st = DB.customerStats(id);
    const vMap = Object.fromEntries(DB.vehicles().map((v) => [v.id, v]));
    const hist = [...st.bookings].sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));
    const favourite = (() => {
      const m = {};
      hist.filter((b) => b.status !== "Cancelled").forEach((b) => { const v = vMap[b.vehicleId]; if (v) m[v.model] = (m[v.model] || 0) + 1; });
      const top = Object.entries(m).sort((a, b) => b[1] - a[1])[0];
      return top ? `${MODEL_BRAND[top[0]]} ${top[0]}` : "-";
    })();
    const licDays = DateUtil.diff(T, c.licenceExpiry);
    $("hmAvatar").textContent = UI.initials(c.name);
    $("hmTitle").textContent = c.name;
    $("hmSub").innerHTML = `${c.id} · Customer since ${DateUtil.fmt(c.joinedAt)}`;
    $("hmBody").innerHTML = `
      <div class="grid grid-4" style="gap:10px">
        <div class="card kpi"><div class="kpi-top">Type</div><div class="kpi-value" style="font-size:16px">${UI.statusBadge(st.type)}</div><div class="kpi-sub">${DB.discountFor(st.type)}% loyalty discount</div></div>
        <div class="card kpi"><div class="kpi-top">Total bookings</div><div class="kpi-value">${st.count}</div><div class="kpi-sub">${hist.length - st.count} cancelled</div></div>
        <div class="card kpi"><div class="kpi-top">Total spending</div><div class="kpi-value">${UI.money0(st.spend)}</div></div>
        <div class="card kpi"><div class="kpi-top">Favourite car</div><div class="kpi-value" style="font-size:16px">${favourite}</div></div>
      </div>
      <dl class="detail-grid mt-16">
        <div><dt>Phone</dt><dd>${UI.esc(c.phone)}</dd></div>
        <div><dt>Email</dt><dd>${UI.esc(c.email)}</dd></div>
        <div><dt>City</dt><dd>${UI.esc(c.city)}</dd></div>
        <div><dt>Driving licence expiry</dt><dd>${DateUtil.fmt(c.licenceExpiry)} ${licDays < 0 ? '<span class="badge b-red">Expired</span>' : licDays <= 45 ? '<span class="badge b-amber">Expiring soon</span>' : ""}</dd></div>
      </dl>
      ${c.notes ? `<p class="small mt-8"><b>Notes:</b> ${UI.esc(c.notes)}</p>` : ""}
      <h3 class="mt-24 mb-16">Customer booking history</h3>
      <div class="table-wrap"><table class="table"><thead><tr><th>Booking ID</th><th>Vehicle</th><th>Pickup</th><th>Return</th><th class="num">Days</th><th class="num">Price</th><th>Status</th></tr></thead><tbody>
      ${hist.map((b) => { const v = vMap[b.vehicleId]; return `<tr><td class="mono">${b.id}</td><td>${v ? `${v.brand} ${v.model}<div class="cell-sub">${v.plate}</div>` : "Removed vehicle"}</td><td class="nowrap">${DateUtil.fmt(b.pickupDate)}</td><td class="nowrap">${DateUtil.fmt(b.returnDate)}</td><td class="num">${b.days}</td><td class="num nowrap">${UI.money(b.total)}</td><td>${UI.statusBadge(b.status)}</td></tr>`; }).join("") || '<tr><td colspan="7" class="table-empty">No bookings yet.</td></tr>'}
      </tbody></table></div>`;
    $("hmFoot").innerHTML = `<button class="btn" data-close="historyModal">Close</button>`;
    UI.openModal("historyModal");
  }

  /* ---------- export ---------- */
  $("exportBtn").addEventListener("click", () => {
    const out = [["Customer ID", "Name", "Email", "Phone", "City", "Type", "Status", "Total bookings", "Total spending (RM)", "Latest booking"]];
    rows().forEach(({ c, st }) => out.push([c.id, c.name, c.email, c.phone, c.city, st.type, st.status, st.count, st.spend.toFixed(2), st.latest ? st.latest.id : ""]));
    downloadCSV(out, `veltrix-customers-${T}.csv`);
    UI.toast("Customer list exported.");
  });

  render();
  const qs = new URLSearchParams(location.search);
  if (qs.get("customer")) showHistory(qs.get("customer"));
})();
