/* =========================================================
   VELTRIX — shared UI: auth guard, layout, theme,
   notifications, modals, toasts and formatting.
   ========================================================= */

const Auth = {
  // One fixed administrator for the IMS566 front-end demonstration.
  // This is client-side validation only, not production authentication.
  session() {
    try {
      const raw = sessionStorage.getItem(KEYS.session);
      if (!raw) return null;
      const admin = JSON.parse(raw);
      return admin && admin.authenticated === true ? admin : null;
    } catch (e) { return null; }
  },
  start() { return this.session(); },
  logout() {
    try { sessionStorage.removeItem(KEYS.session); } catch (e) {}
    location.href = "login.html";
  },
};

const UI = {
  money(n) { return "RM " + Number(n || 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
  money0(n) { return "RM " + Math.round(n || 0).toLocaleString("en-MY"); },
  esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); },
  initials(name) { return String(name || "?").split(/\s+/).filter((w) => !/^(bin|binti|a\/l|a\/p)$/i.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase(); },
  $(sel, root) { return (root || document).querySelector(sel); },
  $$(sel, root) { return [...(root || document).querySelectorAll(sel)]; },

  statusBadge(status) {
    const map = {
      Pending: "b-amber", Confirmed: "b-blue", Ongoing: "b-green", Completed: "b-grey", Cancelled: "b-red",
      Available: "b-green", Rented: "b-blue", Maintenance: "b-amber",
      Active: "b-green", Inactive: "b-grey", VIP: "b-dark", Regular: "b-blue", New: "b-green",
      Pass: "b-green", "Damage reported": "b-red", "Check-in": "b-blue", "Check-out": "b-green",
      Paid: "b-green", Refunded: "b-red",
    };
    return `<span class="badge ${map[status] || "b-grey"}">${UI.esc(status)}</span>`;
  },

  toast(message, type = "success") {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; wrap.setAttribute("aria-live", "polite"); document.body.appendChild(wrap); }
    const icon = { success: "bi-check-circle-fill", error: "bi-x-circle-fill", warn: "bi-exclamation-triangle-fill", info: "bi-info-circle-fill" }[type];
    const t = document.createElement("div");
    t.className = "toast " + type;
    t.innerHTML = `<i class="bi ${icon}"></i><div>${UI.esc(message)}</div>`;
    wrap.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transition = "opacity .3s"; }, 3600);
    setTimeout(() => t.remove(), 4000);
  },

  openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add("open");
    document.body.classList.add("modal-open");
    const first = m.querySelector("input:not([type=hidden]):not([disabled]), select, textarea");
    if (first) setTimeout(() => first.focus(), 50);
  },
  closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove("open");
    if (!document.querySelector(".modal-backdrop.open")) document.body.classList.remove("modal-open");
  },

  /* promise-based confirm dialog (no native confirm()) */
  confirm({ title, message, okText = "Confirm", danger = false, input = null }) {
    return new Promise((resolve) => {
      let el = document.getElementById("confirmModal");
      if (!el) {
        el = document.createElement("div");
        el.id = "confirmModal";
        el.className = "modal-backdrop";
        document.body.appendChild(el);
      }
      el.innerHTML = `<div class="modal sm" role="dialog" aria-modal="true" aria-labelledby="cfTitle">
        <div class="modal-head"><h2 id="cfTitle">${UI.esc(title)}</h2></div>
        <div class="modal-body"><p class="muted">${message}</p>
          ${input ? `<div class="form-group mt-16"><label for="cfInput">${UI.esc(input)}</label><input id="cfInput" class="form-control" maxlength="120"><span class="field-error" id="cfErr"><i class="bi bi-exclamation-circle"></i>Please fill in this field.</span></div>` : ""}
        </div>
        <div class="modal-foot"><button class="btn" data-act="no">Go back</button><button class="btn ${danger ? "btn-danger" : "btn-primary"}" data-act="yes">${UI.esc(okText)}</button></div></div>`;
      UI.openModal("confirmModal");
      const done = (val) => { UI.closeModal("confirmModal"); resolve(val); };
      el.querySelector('[data-act="no"]').onclick = () => done(false);
      el.querySelector('[data-act="yes"]').onclick = () => {
        if (input) {
          const v = el.querySelector("#cfInput").value.trim();
          if (!v) { el.querySelector("#cfInput").classList.add("invalid"); el.querySelector("#cfErr").classList.add("show"); return; }
          return done(v);
        }
        done(true);
      };
      el.onclick = (e) => { if (e.target === el) done(false); };
    });
  },

  /* form field error helpers */
  fieldError(input, msg) {
    const group = input.closest(".form-group");
    let err = group && group.querySelector(".field-error");
    if (group && !err) { err = document.createElement("span"); err.className = "field-error"; group.appendChild(err); }
    input.classList.toggle("invalid", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) { err.innerHTML = msg ? `<i class="bi bi-exclamation-circle"></i>${UI.esc(msg)}` : ""; err.classList.toggle("show", !!msg); }
    return !msg;
  },
  clearErrors(form) {
    UI.$$(".invalid", form).forEach((i) => i.classList.remove("invalid"));
    UI.$$(".field-error", form).forEach((e) => { e.classList.remove("show"); e.innerHTML = ""; });
  },

  carSVG(color, category, label) {
    return CarArt.svg(color, category, { label });
  },

  /* Real photo first, drawn SVG as fallback.
     Order: SVG uploaded for this vehicle -> assets/img/cars/photos/<model>.svg -> drawn SVG */
  carVisual(v, cls) {
    const label = `${v.brand} ${v.model} ${v.colorName || ""}`.trim();
    const base = "assets/img/cars/photos/" + String(v.model).toLowerCase();
    const chain = [v.photo, base + ".svg"].filter(Boolean);
    return `<img class="car-photo ${cls || ""}" src="${UI.esc(chain[0])}" data-next="${UI.esc(chain.slice(1).join("|"))}"
      data-color="${UI.esc(v.color)}" data-cat="${UI.esc(v.category)}" alt="${UI.esc(label)}" loading="lazy" onerror="carImgError(this)">`;
  },
};

/* ---------------- theme ---------------- */
const Theme = {
  get() { return localStorage.getItem(KEYS.theme) || "light"; },
  apply(t) { document.documentElement.setAttribute("data-theme", t); },
  toggle() {
    const t = this.get() === "dark" ? "light" : "dark";
    localStorage.setItem(KEYS.theme, t);
    this.apply(t);
    UI.$$(".theme-toggle i").forEach((i) => (i.className = "bi " + (t === "dark" ? "bi-sun" : "bi-moon")));
    document.dispatchEvent(new CustomEvent("themechange", { detail: t }));
  },
};
Theme.apply(Theme.get());

/* ---------------- chart.js theme helper ---------------- */
const Charts = {
  palette() {
    const dark = Theme.get() === "dark";
    return {
      dark,
      text: dark ? "#c4cfc9" : "#33443b",
      muted: dark ? "#8fa097" : "#637268",
      grid: dark ? "rgba(255,255,255,.07)" : "rgba(17,32,24,.07)",
      primary: dark ? "#3aae76" : "#13744a",
      primarySoft: dark ? "rgba(58,174,118,.18)" : "rgba(19,116,74,.12)",
      series: dark
        ? ["#3aae76", "#7fb2ec", "#e0a43a", "#c58fe0", "#f0806f", "#5fd0c4"]
        : ["#13744a", "#1d5fa8", "#c98a12", "#7a4fa3", "#c0473a", "#2b9a8c"],
      status: { Available: dark ? "#3aae76" : "#13744a", Rented: dark ? "#7fb2ec" : "#1d5fa8", Maintenance: dark ? "#e0a43a" : "#c98a12" },
    };
  },
  defaults() {
    if (!window.Chart) return false;
    const p = this.palette();
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.font.size = 12;
    Chart.defaults.color = p.muted;
    Chart.defaults.borderColor = p.grid;
    Chart.defaults.plugins.legend.labels.boxWidth = 10;
    Chart.defaults.plugins.legend.labels.boxHeight = 10;
    Chart.defaults.plugins.legend.labels.useBorderRadius = true;
    Chart.defaults.plugins.legend.labels.borderRadius = 2;
    Chart.defaults.plugins.tooltip.backgroundColor = p.dark ? "#e5ece8" : "#15211b";
    Chart.defaults.plugins.tooltip.titleColor = p.dark ? "#15211b" : "#fff";
    Chart.defaults.plugins.tooltip.bodyColor = p.dark ? "#15211b" : "#fff";
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 6;
    Chart.defaults.maintainAspectRatio = false;
    return true;
  },
  missing(el) {
    el.innerHTML = '<div class="empty-note"><i class="bi bi-wifi-off"></i> Charts need an internet connection to load Chart.js.</div>';
  },
};

/* ---------------- layout ---------------- */
const NAV = [
  { label: "Overview", items: [["index.html", "Dashboard", "bi-grid-1x2"]] },
  { label: "Operations", items: [
    ["vehicles.html", "Fleet Management", "bi-car-front"],
    ["inspections.html", "Inspections", "bi-clipboard2-check"],
    ["customers.html", "Customers", "bi-people"],
  ]},
  { label: "Analysis", items: [["insights.html", "Business Insights", "bi-graph-up"]] },
  { label: "Resources", items: [["guides.html", "Guides & Regulations", "bi-journal-text"]] },
];

const Layout = {
  init() {
    const page = document.body.dataset.page;
    const session = Auth.session();
    if (!session) { location.replace("login.html"); return false; }
    this.session = session;
    this.renderSidebar(page);
    this.renderTopbar();
    this.renderFooter();
    Notifications.render();
    this.bind();
    return true;
  },

  renderSidebar(page) {
    const el = document.getElementById("sidebar");
    if (!el) return;
    el.className = "sidebar";
    el.setAttribute("aria-label", "Main navigation");
    el.innerHTML = `
      <a class="brand" href="index.html" style="text-decoration:none">
        <img src="assets/img/logo.svg" alt="Veltrix logo">
        <div><div class="brand-name">VELTRIX</div><div class="brand-sub">Car Rental Management</div></div>
      </a>
      <nav class="nav">
        ${NAV.map((g) => `<div class="nav-label">${g.label}</div>` + g.items.map(([href, label, icon]) =>
          `<a href="${href}" class="${href === page ? "active" : ""}" ${href === page ? 'aria-current="page"' : ""}>
            <i class="bi ${icon}"></i><span>${label}</span>
          </a>`).join("")).join("")}
      </nav>
      <div class="sidebar-foot">
        <div class="branch"><i class="bi bi-geo-alt"></i> Shah Alam HQ, Selangor</div>
        <div class="small muted mt-8" style="text-align:center"><i class="bi bi-shield-check"></i> Admin session active</div>
      </div>`;
  },

  renderTopbar() {
    const el = document.getElementById("topbar");
    if (!el) return;
    const s = this.session;
    const title = document.body.dataset.title || document.title.split("|")[0].trim();
    el.className = "topbar";
    el.innerHTML = `
      <button class="icon-btn menu-toggle" id="menuToggle" aria-label="Open menu"><i class="bi bi-list"></i></button>
      <div>
        <div class="page-title">${UI.esc(title)}</div>
        <div class="crumb">Veltrix / ${UI.esc(title)}</div>
      </div>
      <div class="topbar-right">
        <button class="icon-btn theme-toggle" id="themeToggle" title="Switch light / dark mode" aria-label="Switch light or dark mode"><i class="bi ${Theme.get() === "dark" ? "bi-sun" : "bi-moon"}"></i></button>
        <div class="dropdown" id="notifDropdown">
          <button class="icon-btn" id="notifBtn" aria-label="Notifications" aria-haspopup="true" aria-expanded="false"><i class="bi bi-bell"></i><span class="dot hidden" id="notifCount"></span></button>
          <div class="dropdown-panel notif-panel" role="menu">
            <div class="dd-head"><strong>Notifications</strong><button class="btn btn-xs btn-ghost" id="markAllRead">Mark all as read</button></div>
            <div class="notif-list" id="notifList"></div>
            <div class="card-foot" style="text-align:center"><a href="index.html#recentBookings">View rental records</a></div>
          </div>
        </div>
        <div class="dropdown" id="profileDropdown">
          <button class="profile-btn" id="profileBtn" aria-haspopup="true" aria-expanded="false">
            <span class="avatar">${UI.esc(UI.initials(s.fullname))}</span>
            <span class="profile-meta"><strong>${UI.esc(s.fullname)}</strong><span>@${UI.esc(s.username)}</span></span>
            <i class="bi bi-chevron-down small muted"></i>
          </button>
          <div class="dropdown-panel" role="menu">
            <div class="dd-head" style="display:block"><strong>${UI.esc(s.fullname)}</strong><div class="small muted">${UI.esc(s.email || "")}</div><div class="small muted">${UI.esc(s.role)}</div></div>
            <a class="dd-item" href="index.html"><i class="bi bi-grid-1x2"></i> Dashboard</a>
            <a class="dd-item" href="guides.html"><i class="bi bi-journal-text"></i> Guides</a>
            <button class="dd-item" id="resetData"><i class="bi bi-arrow-counterclockwise"></i> Reset sample data</button>
            <div class="dd-divider"></div>
            <button class="dd-item logout-item" id="logoutBtn" type="button"><i class="bi bi-box-arrow-right"></i> Log out</button>
          </div>
        </div>
      </div>`;
  },

  renderFooter() {
    const el = document.getElementById("footer");
    if (!el) return;
    el.className = "footer";
    el.innerHTML = `
      <div class="footer-grid">
        <div>
          <div style="display:flex;gap:10px;align-items:center"><img src="assets/img/logo.svg" alt="" width="26" height="26"><strong style="color:var(--text);letter-spacing:.08em">VELTRIX</strong></div>
          <p class="mt-8">An administrative monitoring system for vehicle fleet, rental records, inspections and customer information.</p>
        </div>
        <div><h4>Operations</h4><ul><li><a href="vehicles.html">Fleet Management</a></li><li><a href="inspections.html">Inspections</a></li><li><a href="customers.html">Customers</a></li></ul></div>
        <div><h4>Resources</h4><ul><li><a href="insights.html">Business Insights</a></li><li><a href="guides.html">Guides & Regulations</a></li><li><a href="https://www.jpj.gov.my" target="_blank" rel="noopener">JPJ Malaysia</a></li><li><a href="https://www.puspakom.com.my" target="_blank" rel="noopener">PUSPAKOM</a></li></ul></div>
        <div><h4>Contact</h4><ul><li><i class="bi bi-geo-alt"></i> Lot 12, Jalan Pelabur 23/1, Seksyen 23, 40300 Shah Alam</li><li><i class="bi bi-telephone"></i> 03-5510 2266</li><li><i class="bi bi-envelope"></i> ops@veltrix.com.my</li><li><i class="bi bi-clock"></i> Mon – Sat, 8:00 am – 8:00 pm</li></ul></div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Veltrix. All Rights Reserved.</span>
        <span>An educational project developed for IMS566 Individual Assignment. Not an official car rental website.</span>
      </div>`;
  },

  bind() {
    const dd = (id) => document.getElementById(id);
    const closeAll = (except) => UI.$$(".dropdown.open").forEach((d) => { if (d !== except) { d.classList.remove("open"); const b = d.querySelector("[aria-expanded]"); if (b) b.setAttribute("aria-expanded", "false"); } });
    ["notifDropdown", "profileDropdown"].forEach((id) => {
      const d = dd(id);
      if (!d) return;
      d.querySelector("button").addEventListener("click", (e) => {
        e.stopPropagation();
        closeAll(d);
        d.classList.toggle("open");
        d.querySelector("button").setAttribute("aria-expanded", d.classList.contains("open"));
      });
      d.querySelector(".dropdown-panel").addEventListener("click", (e) => e.stopPropagation());
    });
    document.addEventListener("click", () => closeAll());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAll();
        const open = UI.$$(".modal-backdrop.open").pop();
        if (open) UI.closeModal(open.id);
        document.body.classList.remove("nav-open");
      }
    });
    dd("themeToggle")?.addEventListener("click", () => Theme.toggle());
    dd("menuToggle")?.addEventListener("click", (e) => { e.stopPropagation(); document.body.classList.toggle("nav-open"); });
    document.body.addEventListener("click", (e) => { if (document.body.classList.contains("nav-open") && !e.target.closest(".sidebar")) document.body.classList.remove("nav-open"); });
    dd("logoutBtn")?.addEventListener("click", () => Auth.logout());
    dd("resetData")?.addEventListener("click", async () => {
      closeAll();
      const ok = await UI.confirm({ title: "Reset sample data?", message: "All vehicles, customers, bookings, inspections and notifications will be replaced with the starter dataset. User accounts are kept.", okText: "Reset data", danger: true });
      if (ok) { localStorage.removeItem(KEYS.seeded); seedData(); location.reload(); }
    });
    // close modals on backdrop click or [data-close]
    document.addEventListener("click", (e) => {
      const closer = e.target.closest("[data-close]");
      if (closer) UI.closeModal(closer.dataset.close);
      if (e.target.classList && e.target.classList.contains("modal-backdrop") && e.target.id !== "confirmModal") UI.closeModal(e.target.id);
    });
    // refresh notifications if another tab changes data
    window.addEventListener("storage", (e) => { if (e.key === KEYS.notifications) Notifications.render(); });
  },
};

/* ---------------- notifications ---------------- */
const Notifications = {
  render() {
    const list = DB.notifications().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const unread = list.filter((n) => !n.read).length;
    const badge = document.getElementById("notifCount");
    const box = document.getElementById("notifList");
    if (!badge || !box) return;
    badge.textContent = unread > 9 ? "9+" : unread;
    badge.classList.toggle("hidden", unread === 0);
    document.getElementById("notifBtn").setAttribute("aria-label", `Notifications, ${unread} unread`);
    if (!list.length) { box.innerHTML = '<div class="notif-empty"><i class="bi bi-bell-slash"></i><br>No notifications yet.</div>'; return; }
    box.innerHTML = list.map((n) => `
      <div class="notif-item ${n.read ? "" : "unread"}" data-id="${n.id}" data-booking="${UI.esc(n.bookingId || "")}" role="menuitem" tabindex="0">
        <div class="notif-icon"><i class="bi ${n.title.includes("confirmed") ? "bi-check2-circle" : "bi-calendar-plus"}"></i></div>
        <div class="notif-body"><strong>${UI.esc(n.title)}</strong><p>${UI.esc(n.message)}</p><time>${DateUtil.relative(n.createdAt)}</time></div>
        ${n.read ? "" : `<button class="notif-read-btn" data-read="${n.id}" title="Mark as read">Mark read</button>`}
      </div>`).join("");
    UI.$$(".notif-item", box).forEach((item) => {
      const go = () => {
        this.markRead(item.dataset.id);
        if (item.dataset.booking) location.href = "index.html#recentBookings";
      };
      item.addEventListener("click", (e) => { if (e.target.closest("[data-read]")) return; go(); });
      item.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
    });
    UI.$$("[data-read]", box).forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); this.markRead(b.dataset.read); }));
    const all = document.getElementById("markAllRead");
    all.disabled = unread === 0;
    all.onclick = () => { DB.save("notifications", DB.notifications().map((n) => ({ ...n, read: true }))); this.render(); UI.toast("All notifications marked as read."); };
  },
  markRead(id) {
    DB.save("notifications", DB.notifications().map((n) => (n.id === id ? { ...n, read: true } : n)));
    this.render();
  },
};

/* ---------------- CSV export ---------------- */
function downloadCSV(rows, filename) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 200);
}

/* try the next photo source; after the last one, draw the car in SVG */
function carImgError(img) {
  const next = (img.dataset.next || "").split("|").filter(Boolean);
  if (next.length) { img.dataset.next = next.slice(1).join("|"); img.src = next[0]; return; }
  const wrap = document.createElement("span");
  wrap.className = "car-drawn";
  wrap.innerHTML = UI.carSVG(img.dataset.color, img.dataset.cat, img.alt);
  img.replaceWith(wrap);
}

/* resize an uploaded image in the browser (keeps localStorage small) */
function resizeImage(file, max, quality) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("type"));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve({ data: c.toDataURL("image/jpeg", quality || 0.75), width: c.width, height: c.height });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* wrap a picture in an SVG file and return it as an SVG data URL */
function toSvgDataUrl(pic, title) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pic.width} ${pic.height}" width="${pic.width}" height="${pic.height}"><title>${String(title || "").replace(/[<&>]/g, "")}</title><image width="${pic.width}" height="${pic.height}" href="${pic.data}"/></svg>`;
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}
