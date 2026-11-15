/* =========================================================
   VELTRIX — vector car illustrations (SVG)
   Four body styles drawn as side profiles. The body colour
   comes from each vehicle record, so every card matches the
   real car's paint.
   ========================================================= */
const CarArt = (() => {
  const BODY = {
    // Axia, Viva, Myvi, Iriz
    hatchback: {
      body: "M30 120 L30 88 Q31 72 44 64 L82 44 Q108 36 152 35 L232 35 Q258 37 290 66 L338 74 Q366 80 370 100 L370 120 Z",
      glass: ["M60 66 L88 48 Q100 43 120 43 L148 42 L148 68 Z", "M158 42 L230 42 Q250 46 274 68 L158 68 Z"],
      pillar: 148, door: [155, 72, 114], handle: [190, 80],
      head: "M352 84 L368 88 L368 96 L350 94 Z", tail: "M30 82 L40 76 L40 94 L30 96 Z",
      wheels: [100, 300], wy: 120, wr: 27, mirror: [262, 70],
    },
    // Bezza, Saga, Persona
    sedan: {
      body: "M22 120 L22 94 Q24 82 42 80 L96 76 Q122 46 162 40 L236 38 Q262 40 292 68 L340 76 Q368 82 372 102 L372 120 Z",
      glass: ["M108 72 Q128 50 162 46 L184 46 L184 70 Z", "M192 46 L234 45 Q254 48 276 70 L192 70 Z"],
      pillar: 184, door: [188, 74, 114], handle: [222, 82],
      head: "M354 86 L370 90 L370 98 L352 96 Z", tail: "M22 86 L34 84 L34 96 L22 98 Z",
      wheels: [96, 302], wy: 120, wr: 27, mirror: [266, 72],
    },
    // Alza, Exora
    mpv: {
      body: "M24 122 L24 64 Q26 36 58 30 L246 26 Q274 28 302 60 L344 70 Q370 76 372 100 L372 122 Z",
      glass: ["M40 40 Q44 36 60 36 L104 35 L104 64 L36 66 Z", "M112 35 L178 33 L178 64 L112 64 Z", "M186 33 L244 32 Q266 36 286 62 L186 64 Z"],
      pillar: 180, door: [182, 66, 116], handle: [214, 76],
      head: "M354 84 L370 88 L370 98 L352 96 Z", tail: "M24 56 L34 56 L34 80 L24 80 Z",
      wheels: [98, 302], wy: 122, wr: 28, mirror: [272, 64],
    },
    // Ativa, Aruz, X50, X70
    suv: {
      body: "M26 116 L26 66 Q28 42 56 36 L242 32 Q272 34 300 64 L346 72 Q370 78 372 98 L372 116 Z",
      glass: ["M46 46 Q50 42 64 42 L134 40 L134 68 L42 70 Z", "M144 40 L240 38 Q262 42 284 66 L144 68 Z"],
      pillar: 138, door: [140, 72, 108], handle: [176, 82],
      head: "M354 82 L370 86 L370 96 L352 94 Z", tail: "M26 60 L36 60 L36 84 L26 84 Z",
      wheels: [100, 300], wy: 118, wr: 30, mirror: [270, 68], rails: true, cladding: true,
    },
  };

  const typeFor = (category) => ({ Economy: "hatchback", Compact: "hatchback", Sedan: "sedan", MPV: "mpv", SUV: "suv" }[category] || "hatchback");

  function shade(hex, amt) {
    const h = String(hex || "#888").replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    const f = (c) => Math.max(0, Math.min(255, Math.round(c + (amt < 0 ? c * amt : (255 - c) * amt))));
    return "#" + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }

  let seq = 0;
  function svg(color, category, opts = {}) {
    const b = BODY[typeFor(category)];
    const id = "car" + ++seq;
    const c = color || "#cfd6d2";
    const wheel = (x) => `
      <circle cx="${x}" cy="${b.wy}" r="${b.wr + 5}" fill="#1a1d1c" opacity=".9"/>
      <circle cx="${x}" cy="${b.wy}" r="${b.wr}" fill="#202322"/>
      <circle cx="${x}" cy="${b.wy}" r="${b.wr - 3}" fill="none" stroke="#2c302f" stroke-width="2"/>
      <circle cx="${x}" cy="${b.wy}" r="${b.wr * 0.58}" fill="url(#${id}r)"/>
      ${[0, 72, 144, 216, 288].map((a) => `<rect x="${x - 2}" y="${b.wy - b.wr * 0.55}" width="4" height="${b.wr * 0.42}" rx="2" fill="#8d9692" transform="rotate(${a} ${x} ${b.wy})"/>`).join("")}
      <circle cx="${x}" cy="${b.wy}" r="4.5" fill="#5d6461"/>`;
    return `<svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${opts.label || category + " car illustration"}">
      <defs>
        <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${shade(c, 0.28)}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -0.35)}"/>
        </linearGradient>
        <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#d9e9f0"/><stop offset=".55" stop-color="#9fb8c4"/><stop offset="1" stop-color="#6f8894"/>
        </linearGradient>
        <radialGradient id="${id}r" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#eef1f0"/><stop offset="1" stop-color="#9aa4a0"/></radialGradient>
        <clipPath id="${id}c"><path d="${b.body}"/></clipPath>
      </defs>
      <ellipse cx="200" cy="${b.wy + b.wr - 1}" rx="178" ry="7" fill="#000" opacity=".14"/>
      ${b.rails ? `<rect x="70" y="${b.body.includes("L242 32") ? 26 : 24}" width="160" height="5" rx="2.5" fill="#2a2e2d"/>` : ""}
      <path d="${b.body}" fill="url(#${id}b)" stroke="${shade(c, -0.5)}" stroke-width="1.2"/>
      <g clip-path="url(#${id}c)">
        <rect x="0" y="${b.wy - 18}" width="400" height="60" fill="${b.cladding ? "#2b2f2e" : shade(c, -0.25)}" opacity="${b.cladding ? 0.85 : 0.5}"/>
        <path d="M20 ${b.door[1] + 6} L380 ${b.door[1] + 2}" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>
      </g>
      ${b.glass.map((g) => `<path d="${g}" fill="url(#${id}g)" stroke="#1f2a2e" stroke-opacity=".35"/>`).join("")}
      <path d="${b.glass[b.glass.length - 1]}" fill="#fff" opacity=".12" transform="translate(4 -2) scale(.98)"/>
      <line x1="${b.door[0]}" y1="${b.door[1]}" x2="${b.door[0]}" y2="${b.door[2]}" stroke="${shade(c, -0.55)}" stroke-width="1.4" opacity=".7"/>
      <rect x="${b.handle[0]}" y="${b.handle[1]}" width="16" height="4" rx="2" fill="${shade(c, -0.45)}"/>
      <path d="M${b.mirror[0]} ${b.mirror[1]} l12 -2 l3 8 l-14 2 z" fill="${shade(c, -0.2)}" stroke="${shade(c, -0.5)}" stroke-width=".8"/>
      <path d="${b.head}" fill="#fff6d6" stroke="#b9a35a" stroke-width=".8"/>
      <path d="${b.tail}" fill="#c8322b"/>
      <rect x="356" y="${b.wy - 14}" width="16" height="6" rx="2" fill="#1f2322" opacity=".75"/>
      <path d="M34 ${b.wy - 4} H366 V${b.wy + 4} Q366 ${b.wy + 8} 360 ${b.wy + 8} H40 Q34 ${b.wy + 8} 34 ${b.wy + 4} Z" fill="${b.cladding ? "#232726" : shade(c, -0.45)}"/>
      ${b.wheels.map(wheel).join("")}
    </svg>`;
  }

  return { svg, typeFor, BODY };
})();
