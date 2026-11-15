/* =========================================================
   VELTRIX — Fleet Management (vehicles.html)
   ========================================================= */
(function () {
  if (!Layout.init()) return;
  const $ = (id) => document.getElementById(id);
  const T = DateUtil.todayIso();
  const SEATS = { Alza: 7, Exora: 7, Aruz: 7 };
  let view = localStorage.getItem("vx_vehicle_view") || "grid";
  let editingId = null;
  let formPhoto = "";

  // filters from URL (e.g. from dashboard chart)
  const qs = new URLSearchParams(location.search);
  $("fCategory").innerHTML += CATEGORIES.map((c) => `<option>${c}</option>`).join("");
  if (qs.get("category")) $("fCategory").value = qs.get("category");
  if (qs.get("status")) $("fStatus").value = qs.get("status");
  if (qs.get("q")) $("search").value = qs.get("q");

  function dueBadge(iso) {
    const d = DateUtil.diff(T, iso);
    if (d < 0) return `<span class="badge b-red">Expired</span>`;
    if (d <= 30) return `<span class="badge b-amber">${DateUtil.fmtShort(iso)}</span>`;
    return `<span class="small">${DateUtil.fmt(iso)}</span>`;
  }

  function filtered() {
    const q = $("search").value.trim().toLowerCase();
    const c = $("fCategory").value, b = $("fBrand").value, s = $("fStatus").value;
    return DB.vehicles().filter((v) =>
      (!c || v.category === c) && (!b || v.brand === b) && (!s || v.status === s) &&
      (!q || [v.brand, v.model, v.variant, v.plate, v.colorName, v.branch].join(" ").toLowerCase().includes(q)));
  }

  function render() {
    const all = DB.vehicles();
    const count = (st) => all.filter((v) => v.status === st).length;
    const expiring = all.filter((v) => v.roadTaxExpiry <= DateUtil.add(T, 30) || v.insuranceExpiry <= DateUtil.add(T, 30)).length;
    $("summary").innerHTML = [
      ["Total vehicles", all.length, `${all.filter((v) => v.brand === "Perodua").length} Perodua · ${all.filter((v) => v.brand === "Proton").length} Proton`, "bi-car-front"],
      ["Available", count("Available"), "Ready for the next booking", "bi-check2-circle"],
      ["On rent / in workshop", `${count("Rented")} / ${count("Maintenance")}`, "Rented · Maintenance", "bi-tools"],
      ["Documents due (30 days)", expiring, "Road tax or insurance", "bi-calendar-x"],
    ].map(([l, v, s, i]) => `<div class="card kpi"><div class="kpi-top"><span>${l}</span><i class="bi ${i}"></i></div><div class="kpi-value">${v}</div><div class="kpi-sub">${s}</div></div>`).join("");

    const list = filtered();
    $("resultCount").textContent = `Showing ${list.length} of ${all.length} vehicles`;
    const empty = `<div class="empty-note" style="grid-column:1/-1"><i class="bi bi-search"></i> No vehicles match these filters. <a href="#" id="clearF">Clear filters</a></div>`;

    $("gridView").innerHTML = list.length ? list.map((v) => `
      <article class="card vcard">
        <div class="vcard-img"><span class="plate">${v.plate}</span>${UI.statusBadge(v.status)}${UI.carVisual(v)}</div>
        <div class="vcard-body">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><h3>${v.brand} ${v.model}</h3><span class="tag">${v.category}</span></div>
          <div class="small muted">${UI.esc(v.variant)} · ${v.year} · ${UI.esc(v.colorName)}</div>
          <div class="vcard-specs"><span><i class="bi bi-people"></i>${v.seats} seats</span><span><i class="bi bi-gear"></i>Auto</span><span><i class="bi bi-speedometer"></i>${v.mileage.toLocaleString()} km</span><span><i class="bi bi-geo-alt"></i>${v.branch}</span></div>
        </div>
        <div class="vcard-foot"><div class="price">RM ${v.dailyRate}<small> / day</small></div>
          <div class="row-actions"><button class="btn btn-xs" data-view="${v.id}">Details</button><button class="btn btn-xs" data-edit="${v.id}" aria-label="Edit ${v.model}"><i class="bi bi-pencil"></i></button><button class="btn btn-xs btn-danger" data-del="${v.id}" aria-label="Delete ${v.model}"><i class="bi bi-trash"></i></button></div>
        </div>
      </article>`).join("") : empty;

    $("tableBody").innerHTML = list.length ? list.map((v) => `
      <tr><td><span class="cell-main">${v.brand} ${v.model}</span><div class="cell-sub">${UI.esc(v.variant)} · ${v.year}</div></td>
      <td class="mono nowrap">${v.plate}</td><td>${v.category}</td><td>${v.branch}</td><td class="num">${v.mileage.toLocaleString()}</td>
      <td>${dueBadge(v.roadTaxExpiry)}</td><td>${dueBadge(v.insuranceExpiry)}</td><td class="num">RM ${v.dailyRate}</td><td>${UI.statusBadge(v.status)}</td>
      <td><div class="row-actions"><button class="btn btn-xs" data-view="${v.id}">Details</button><button class="btn btn-xs" data-edit="${v.id}" aria-label="Edit"><i class="bi bi-pencil"></i></button><button class="btn btn-xs btn-danger" data-del="${v.id}" aria-label="Delete"><i class="bi bi-trash"></i></button></div></td></tr>`).join("")
      : `<tr><td colspan="10" class="table-empty"><i class="bi bi-search"></i>No vehicles match these filters.</td></tr>`;

    $("rateBody").innerHTML = CATEGORIES.map((c) => {
      const vs = all.filter((v) => v.category === c);
      const rates = vs.map((v) => v.dailyRate);
      return `<tr><td class="cell-main">${c}</td><td>${CATEGORY_MODELS[c].map((m) => `${MODEL_BRAND[m]} ${m}`).join(", ")}</td><td class="num">${vs.length}</td>
        <td class="num">${rates.length ? (Math.min(...rates) === Math.max(...rates) ? "RM " + rates[0] : `RM ${Math.min(...rates)} – ${Math.max(...rates)}`) : "-"}</td>
        <td class="num">${vs.filter((v) => v.status === "Available").length}</td></tr>`;
    }).join("");

    $("gridView").classList.toggle("hidden", view !== "grid");
    $("tableView").classList.toggle("hidden", view !== "table");
    UI.$$(".segmented button").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    const clr = $("clearF");
    if (clr) clr.onclick = (e) => { e.preventDefault(); ["search", "fCategory", "fBrand", "fStatus"].forEach((id) => ($(id).value = "")); render(); };
  }

  /* ---------- view toggle & filters ---------- */
  UI.$$(".segmented button").forEach((b) => b.addEventListener("click", () => { view = b.dataset.view; localStorage.setItem("vx_vehicle_view", view); render(); }));
  ["search", "fCategory", "fBrand", "fStatus"].forEach((id) => $(id).addEventListener("input", render));

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-view],[data-edit],[data-del]");
    if (!t || t.closest(".segmented")) return;
    if (t.dataset.view) showDetail(t.dataset.view);
    if (t.dataset.edit) openForm(t.dataset.edit);
    if (t.dataset.del) remove(t.dataset.del);
  });

  /* ---------- form ---------- */
  $("vCategory").innerHTML = CATEGORIES.map((c) => `<option>${c}</option>`).join("");
  $("vBranch").innerHTML = BRANCHES.map((b) => `<option>${b}</option>`).join("");
  $("vYear").max = new Date().getFullYear() + 1;
  function fillModels(selected) {
    const models = CATEGORY_MODELS[$("vCategory").value];
    $("vModel").innerHTML = models.map((m) => `<option value="${m}">${MODEL_BRAND[m]} ${m}</option>`).join("");
    if (selected && models.includes(selected)) $("vModel").value = selected;
    syncModel();
  }
  function syncModel() {
    const m = $("vModel").value;
    $("vBrandHint").textContent = "Brand: " + MODEL_BRAND[m];
    $("vSeats").value = SEATS[m] || 5;
  }
  $("vCategory").addEventListener("change", () => fillModels());
  $("vModel").addEventListener("change", syncModel);

  function openForm(id) {
    editingId = id || null;
    const f = $("vehicleForm");
    UI.clearErrors(f);
    $("vmAlert").classList.add("hidden");
    const v = id ? DB.vehicle(id) : null;
    $("vmTitle").textContent = v ? `Edit ${v.brand} ${v.model} (${v.plate})` : "Add vehicle";
    $("vCategory").value = v ? v.category : "Economy";
    fillModels(v && v.model);
    $("vVariant").value = v ? v.variant : "";
    $("vPlate").value = v ? v.plate : "";
    $("vYear").value = v ? v.year : new Date().getFullYear();
    $("vColorName").value = v ? v.colorName : "";
    $("vColor").value = v ? v.color : "#f1f1ee";
    $("vRate").value = v ? v.dailyRate : "";
    $("vMileage").value = v ? v.mileage : 0;
    $("vBranch").value = v ? v.branch : BRANCHES[0];
    $("vStatus").value = v ? v.status : "Available";
    $("vTax").value = v ? v.roadTaxExpiry : DateUtil.add(T, 365);
    $("vIns").value = v ? v.insuranceExpiry : DateUtil.add(T, 365);
    $("vPusp").value = v ? v.puspakomDue || "" : "";
    $("vNotes").value = v ? v.notes || "" : "";
    formPhoto = v ? v.photo || "" : "";
    $("vPhotoErr").classList.remove("show");
    showPhotoPreview();
    UI.openModal("vehicleModal");
  }
  $("addBtn").addEventListener("click", () => openForm());

  function showPhotoPreview() {
    const tmp = { model: $("vModel").value, brand: MODEL_BRAND[$("vModel").value], color: $("vColor").value, colorName: $("vColorName").value, category: $("vCategory").value, photo: formPhoto };
    $("vPhotoPreview").innerHTML = UI.carVisual(tmp);
    $("vPhotoRemove").disabled = !formPhoto;
  }
  $("vPhoto").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    const err = $("vPhotoErr");
    err.classList.remove("show");
    if (!f) return;
    const fail = (m) => { err.innerHTML = `<i class="bi bi-exclamation-circle"></i>${m}`; err.classList.add("show"); };
    if (!f.type.startsWith("image/")) return fail("Please choose an image file (JPG, PNG or SVG).");
    if (f.size > 5 * 1024 * 1024) return fail("This photo is larger than 5 MB.");
    try {
      if (f.type === "image/svg+xml") {
        formPhoto = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
        if (formPhoto.length > 1500000) { formPhoto = ""; return fail("This SVG is too large to store in the browser. Use a smaller file."); }
      } else {
        formPhoto = toSvgDataUrl(await resizeImage(f, 900, 0.78), `${MODEL_BRAND[$("vModel").value]} ${$("vModel").value}`);
      }
      showPhotoPreview();
    } catch (x) { fail("The photo could not be read. Try another file."); }
  });
  $("vPhotoRemove").addEventListener("click", () => { formPhoto = ""; showPhotoPreview(); });
  ["vModel", "vColor", "vCategory"].forEach((id) => $(id).addEventListener("change", () => { if (!formPhoto) showPhotoPreview(); }));

  $("vehicleForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    UI.clearErrors(f);
    const plate = $("vPlate").value.trim().toUpperCase().replace(/\s+/g, " ");
    const year = Number($("vYear").value), rate = Number($("vRate").value), km = Number($("vMileage").value);
    const all = DB.vehicles();
    const current = editingId ? DB.vehicle(editingId) : null;
    let ok = true;
    const err = (el, msg) => { ok = false; UI.fieldError(el, msg); };
    if (!$("vVariant").value.trim()) err($("vVariant"), "Enter the variant.");
    if (!plate) err($("vPlate"), "Enter the plate number.");
    else if (!/^[A-Z]{1,3} ?\d{1,4} ?[A-Z]?$/.test(plate)) err($("vPlate"), "Use a Malaysian format, e.g. HWA 1234.");
    else if (all.some((v) => v.plate.replace(/\s/g, "") === plate.replace(/\s/g, "") && v.id !== editingId)) err($("vPlate"), "This plate is already registered in the fleet.");
    if (!year || year < 2010 || year > new Date().getFullYear() + 1) err($("vYear"), `Year must be between 2010 and ${new Date().getFullYear() + 1}.`);
    if (!$("vColorName").value.trim()) err($("vColorName"), "Enter the colour.");
    if (!rate || rate < 30 || rate > 2000) err($("vRate"), "Enter a daily rate between RM 30 and RM 2,000.");
    if ($("vMileage").value === "" || km < 0) err($("vMileage"), "Mileage cannot be negative.");
    else if (current && km < current.mileage) err($("vMileage"), `Mileage cannot be lower than the last reading (${current.mileage.toLocaleString()} km).`);
    if (!$("vTax").value) err($("vTax"), "Select the road tax expiry date.");
    if (!$("vIns").value) err($("vIns"), "Select the insurance expiry date.");
    const status = $("vStatus").value;
    const hasOngoing = editingId && DB.bookings().some((b) => b.vehicleId === editingId && b.status === "Ongoing");
    if (status === "Rented" && !hasOngoing) err($("vStatus"), "A vehicle becomes Rented automatically at check-out inspection.");
    if (hasOngoing && status !== "Rented") err($("vStatus"), "This vehicle is out on an ongoing booking. Complete the check-in inspection first.");
    if (!ok) { $("vmAlert").innerHTML = '<i class="bi bi-x-circle"></i> Please fix the highlighted fields.'; $("vmAlert").classList.remove("hidden"); return; }

    const model = $("vModel").value;
    const data = {
      category: $("vCategory").value, model, brand: MODEL_BRAND[model], variant: $("vVariant").value.trim(), plate, year,
      colorName: $("vColorName").value.trim(), color: $("vColor").value, dailyRate: rate, mileage: km, branch: $("vBranch").value,
      status, roadTaxExpiry: $("vTax").value, insuranceExpiry: $("vIns").value, puspakomDue: $("vPusp").value, notes: $("vNotes").value.trim(),
      seats: SEATS[model] || 5, transmission: "Automatic", fuel: "Petrol RON95", photo: formPhoto,
    };
    let list;
    if (editingId) list = all.map((v) => (v.id === editingId ? { ...v, ...data } : v));
    else list = [...all, { id: DB.nextId(all, "V", 1, 2), ...data }];
    if (!DB.save("vehicles", list)) return;
    UI.closeModal("vehicleModal");
    UI.toast(editingId ? `${data.brand} ${model} (${plate}) updated.` : `${data.brand} ${model} (${plate}) added to the fleet.`);
    render();
  });

  /* ---------- delete ---------- */
  async function remove(id) {
    const v = DB.vehicle(id);
    const blocking = DB.bookings().filter((b) => b.vehicleId === id && ["Pending", "Confirmed", "Ongoing"].includes(b.status));
    if (blocking.length) {
      UI.toast(`Cannot delete ${v.plate}: it has ${blocking.length} active or upcoming booking(s) (${blocking.map((b) => b.id).join(", ")}).`, "error");
      return;
    }
    const ok = await UI.confirm({ title: "Delete vehicle?", message: `<b>${v.brand} ${v.model} (${v.plate})</b> will be removed from the fleet. Past bookings keep their records.`, okText: "Delete vehicle", danger: true });
    if (!ok) return;
    DB.save("vehicles", DB.vehicles().filter((x) => x.id !== id));
    UI.toast(`${v.plate} removed from the fleet.`);
    render();
  }

  /* ---------- details ---------- */
  function showDetail(id) {
    const v = DB.vehicle(id);
    const bk = DB.bookings().filter((b) => b.vehicleId === id).sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));
    const valid = bk.filter((b) => b.status !== "Cancelled");
    const ins = DB.inspections().filter((i) => i.vehicleId === id).sort((a, b) => b.date.localeCompare(a.date));
    const cMap = Object.fromEntries(DB.customers().map((c) => [c.id, c]));
    $("dmTitle").textContent = `${v.brand} ${v.model} ${v.variant}`;
    $("dmSub").textContent = `${v.plate} · ${v.category} · ${v.branch}`;
    $("dmBody").innerHTML = `
      <div class="grid grid-2" style="align-items:center">
        <div class="card car-frame">${UI.carVisual(v, "lg")}</div>
        <div class="grid grid-2" style="gap:10px">
          <div class="card kpi"><div class="kpi-top">Bookings</div><div class="kpi-value">${valid.length}</div></div>
          <div class="card kpi"><div class="kpi-top">Revenue</div><div class="kpi-value">${UI.money0(valid.reduce((a, b) => a + b.total, 0))}</div></div>
          <div class="card kpi"><div class="kpi-top">Days rented</div><div class="kpi-value">${valid.reduce((a, b) => a + b.days, 0)}</div></div>
          <div class="card kpi"><div class="kpi-top">Status</div><div class="kpi-value" style="font-size:16px">${UI.statusBadge(v.status)}</div></div>
        </div>
      </div>
      <dl class="detail-grid mt-16">
        <div><dt>Year / colour</dt><dd>${v.year} · ${UI.esc(v.colorName)}</dd></div>
        <div><dt>Daily rate</dt><dd>RM ${v.dailyRate}</dd></div>
        <div><dt>Mileage</dt><dd>${v.mileage.toLocaleString()} km</dd></div>
        <div><dt>Seats / transmission</dt><dd>${v.seats} · ${v.transmission}</dd></div>
        <div><dt>Road tax expiry</dt><dd>${dueBadge(v.roadTaxExpiry)}</dd></div>
        <div><dt>Insurance expiry</dt><dd>${dueBadge(v.insuranceExpiry)}</dd></div>
        <div><dt>Next PUSPAKOM</dt><dd>${v.puspakomDue ? dueBadge(v.puspakomDue) : "-"}</dd></div>
        <div><dt>Last inspection</dt><dd>${ins[0] ? `${ins[0].type} · ${DateUtil.fmt(ins[0].date)}` : "-"}</dd></div>
      </dl>
      ${v.notes ? `<p class="mt-16 small"><b>Notes:</b> ${UI.esc(v.notes)}</p>` : ""}
      <h3 class="mt-24 mb-16">Booking history</h3>
      <div class="table-wrap"><table class="table"><thead><tr><th>Booking</th><th>Customer</th><th>Period</th><th>Status</th><th class="num">Total</th></tr></thead><tbody>
      ${bk.slice(0, 8).map((b) => `<tr><td class="mono"><a href="index.html#recentBookings">${b.id}</a></td><td>${UI.esc(cMap[b.customerId]?.name || "-")}</td><td class="nowrap">${DateUtil.fmtShort(b.pickupDate)} – ${DateUtil.fmtShort(b.returnDate)}</td><td>${UI.statusBadge(b.status)}</td><td class="num">${UI.money(b.total)}</td></tr>`).join("") || '<tr><td colspan="5" class="table-empty">No bookings yet.</td></tr>'}
      </tbody></table></div>`;
    $("dmFoot").innerHTML = `<div class="left"><a class="btn" href="inspections.html?vehicle=${v.id}#history"><i class="bi bi-clipboard2-check"></i> Inspection history</a></div>
      <a class="btn" href="photo-to-svg.html?vehicle=${v.id}"><i class="bi bi-image"></i> Add real photo</a>
      <button class="btn" data-close="detailModal">Close</button>
      <button class="btn btn-primary" id="dmEdit"><i class="bi bi-pencil"></i> Edit</button>`;
    $("dmEdit").onclick = () => { UI.closeModal("detailModal"); openForm(id); };
    UI.openModal("detailModal");
  }

  /* ---------- export ---------- */
  $("exportBtn").addEventListener("click", () => {
    const rows = [["ID", "Brand", "Model", "Variant", "Category", "Plate", "Year", "Colour", "Daily rate (RM)", "Mileage", "Branch", "Status", "Road tax expiry", "Insurance expiry"]];
    filtered().forEach((v) => rows.push([v.id, v.brand, v.model, v.variant, v.category, v.plate, v.year, v.colorName, v.dailyRate, v.mileage, v.branch, v.status, v.roadTaxExpiry, v.insuranceExpiry]));
    downloadCSV(rows, `veltrix-fleet-${T}.csv`);
    UI.toast("Fleet list exported.");
  });

  render();
  if (qs.get("vehicle") && DB.vehicle(qs.get("vehicle"))) showDetail(qs.get("vehicle"));
})();

