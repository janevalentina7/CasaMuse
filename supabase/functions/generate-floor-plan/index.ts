import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Types ──────────────────────────────────────────────
type RoomType = "living" | "bedroom" | "kitchen" | "bathroom" | "dining" | "other";
type Rect = { x: number; y: number; width: number; height: number };
type PlannedRoom = { id: string; label: string; type: RoomType; width: number; height: number; area: number };
type PlacedRoom = PlannedRoom & { rect: Rect };

// ── Constants ──────────────────────────────────────────
const FLOOR_COLORS: Record<RoomType, string> = {
  living: "#F5E6D3", bedroom: "#F0E0D0", kitchen: "#FFF3CD",
  bathroom: "#E0F0F0", dining: "#F5E6D3", other: "#F1EDE8",
};

// ── Helpers ────────────────────────────────────────────
function safeNumber(v: unknown, fb = 0) { const n = Number.parseFloat(String(v)); return Number.isFinite(n) ? n : fb; }
function cleanLabel(v: string) { return v.replace(/_/g, " ").replace(/\s+/g, " ").trim(); }
function formatFt(v: number) { return Number.isInteger(v) ? `${v}` : v.toFixed(1); }
function esc(v: string) { return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"); }

function classifyRoom(id: string, name: string): RoomType {
  const k = `${id} ${name}`.toLowerCase();
  if (k.includes("living") || k.includes("hall")) return "living";
  if (k.includes("bed") || k.includes("master")) return "bedroom";
  if (k.includes("kitchen") || k.includes("pantry")) return "kitchen";
  if (k.includes("bath") || k.includes("toilet") || k.includes("wc") || k.includes("powder")) return "bathroom";
  if (k.includes("dining")) return "dining";
  return "other";
}

// ── Room expansion ─────────────────────────────────────
function expandRooms(raw: any[]): PlannedRoom[] {
  const expanded: { baseLabel: string; type: RoomType; width: number; height: number }[] = [];
  raw.forEach((r, i) => {
    const count = Math.max(1, Math.floor(safeNumber(r?.count, 1)));
    const w = Math.max(3, safeNumber(r?.width, 10));
    const h = Math.max(3, safeNumber(r?.height, 10));
    const label = cleanLabel(String(r?.roomName || r?.roomId || `Room ${i + 1}`));
    const type = classifyRoom(String(r?.roomId || ""), label);
    for (let j = 0; j < count; j++) {
      expanded.push({ baseLabel: label, type, width: w, height: h });
      if (r?.attachedBathroom) expanded.push({ baseLabel: "Attached Bathroom", type: "bathroom", width: 5, height: 8 });
    }
  });
  const totals = new Map<string, number>();
  expanded.forEach(r => totals.set(r.baseLabel, (totals.get(r.baseLabel) || 0) + 1));
  const running = new Map<string, number>();
  return expanded.map((r, i) => {
    const total = totals.get(r.baseLabel) || 1;
    const cur = (running.get(r.baseLabel) || 0) + 1;
    running.set(r.baseLabel, cur);
    return { id: `r-${i}`, label: total > 1 ? `${r.baseLabel} ${cur}` : r.baseLabel, type: r.type, width: r.width, height: r.height, area: r.width * r.height };
  });
}

// ── Plot dimensions ────────────────────────────────────
function plotDims(area: number, pL: unknown, pB: unknown) {
  const l = safeNumber(pL), b = safeNumber(pB);
  if (l > 0 && b > 0) return { width: l, height: b };
  const w = Math.sqrt(area * 1.25); return { width: Math.max(20, w), height: Math.max(20, area / w) };
}

// ── Outdoor reservations ───────────────────────────────
function sideOf(v: string | null, fb: string) {
  const n = (v || "").toLowerCase();
  if (n.includes("front")) return "bottom"; if (n.includes("back")) return "top";
  if (n.includes("left")) return "left"; if (n.includes("right") || n.includes("side")) return "right";
  return fb;
}

type OutdoorItem = { rect: Rect; kind: "garden" | "parking"; label: string };

function reserveOutdoor(plot: { width: number; height: number }, hasGarage: boolean, gP: string | null, hasGarden: boolean, gnP: string | null) {
  let t = 0, b = 0, l = 0, r = 0;
  const items: OutdoorItem[] = [];
  if (hasGarage) { const s = sideOf(gP, "right"); if (s === "top") t += 10; if (s === "bottom") b += 10; if (s === "left") l += 10; if (s === "right") r += 10; }
  if (hasGarden) {
    const p = (gnP || "").toLowerCase();
    if (p.includes("all") || p.includes("surround")) { t += 6; b += 6; l += 6; r += 6; }
    else { const s = sideOf(gnP, "bottom"); if (s === "top") t += 8; if (s === "bottom") b += 8; if (s === "left") l += 8; if (s === "right") r += 8; }
  }
  const indoor: Rect = { x: 2 + l, y: 2 + t, width: Math.max(12, plot.width - 4 - l - r), height: Math.max(12, plot.height - 4 - t - b) };
  // Tag outdoor areas
  if (hasGarage) {
    const s = sideOf(gP, "right");
    if (s === "bottom") items.push({ rect: { x: 2, y: plot.height - 2 - 10, width: plot.width - 4, height: 10 }, kind: "parking", label: "CAR PARKING" });
    else if (s === "top") items.push({ rect: { x: 2, y: 2, width: plot.width - 4, height: 10 }, kind: "parking", label: "CAR PARKING" });
    else if (s === "left") items.push({ rect: { x: 2, y: 2, width: 10, height: plot.height - 4 }, kind: "parking", label: "CAR PARKING" });
    else items.push({ rect: { x: plot.width - 12, y: 2, width: 10, height: plot.height - 4 }, kind: "parking", label: "CAR PARKING" });
  }
  if (hasGarden) {
    const p = (gnP || "").toLowerCase();
    if (p.includes("all") || p.includes("surround")) {
      items.push({ rect: { x: 2, y: 2, width: plot.width - 4, height: 6 }, kind: "garden", label: "GARDEN" });
      items.push({ rect: { x: 2, y: plot.height - 8, width: plot.width - 4, height: 6 }, kind: "garden", label: "GARDEN" });
    } else {
      const s = sideOf(gnP, "bottom");
      if (s === "bottom") items.push({ rect: { x: 2, y: plot.height - 10, width: plot.width - 4, height: 8 }, kind: "garden", label: "GARDEN" });
      else if (s === "top") items.push({ rect: { x: 2, y: 2, width: plot.width - 4, height: 8 }, kind: "garden", label: "GARDEN" });
      else if (s === "left") items.push({ rect: { x: 2, y: 2, width: 8, height: plot.height - 4 }, kind: "garden", label: "GARDEN" });
      else items.push({ rect: { x: plot.width - 10, y: 2, width: 8, height: plot.height - 4 }, kind: "garden", label: "GARDEN" });
    }
  }
  return { indoor, items };
}

// ── Packing ────────────────────────────────────────────
function pack(rooms: PlannedRoom[], zone: Rect, gap = 1.2, minS = 0.5, gs = 1): { placed: PlacedRoom[]; overflow: PlannedRoom[] } {
  const placed: PlacedRoom[] = [], overflow: PlannedRoom[] = [];
  let cx = zone.x + gap, cy = zone.y + gap, rh = 0;
  rooms.forEach(room => {
    const bw = room.width * gs, bh = room.height * gs;
    const mw = Math.max(1, zone.width - gap * 2), mh = Math.max(1, zone.height - gap * 2);
    const sf = Math.min(mw / bw, mh / bh, 1);
    if (sf < minS) { overflow.push(room); return; }
    const dw = bw * sf, dh = bh * sf;
    if (cx + dw > zone.x + zone.width - gap) { cx = zone.x + gap; cy += rh + gap; rh = 0; }
    if (cy + dh > zone.y + zone.height - gap) { overflow.push(room); return; }
    placed.push({ ...room, rect: { x: cx, y: cy, width: dw, height: dh } });
    cx += dw + gap; rh = Math.max(rh, dh);
  });
  return { placed, overflow };
}

// ── SVG furniture generators ───────────────────────────
function furnitureSvg(type: RoomType, x: number, y: number, w: number, h: number): string {
  const cx = x + w / 2, cy = y + h / 2;
  switch (type) {
    case "living": {
      // L-shaped sofa + coffee table + rug
      const sofaW = w * 0.6, sofaH = h * 0.15;
      const sofaX = x + w * 0.1, sofaY = y + h * 0.7;
      const armW = w * 0.12, armH = h * 0.3;
      const tableW = w * 0.25, tableH = h * 0.12;
      const rugW = w * 0.5, rugH = h * 0.35;
      return `
        <rect x="${x + (w - rugW) / 2}" y="${cy - rugH / 2}" width="${rugW}" height="${rugH}" rx="3" fill="#E8DCC8" opacity="0.5" />
        <rect x="${sofaX}" y="${sofaY}" width="${sofaW}" height="${sofaH}" rx="4" fill="#C4A882" stroke="#8B7355" stroke-width="1.5" />
        <rect x="${sofaX}" y="${sofaY - armH}" width="${armW}" height="${armH}" rx="3" fill="#C4A882" stroke="#8B7355" stroke-width="1.5" />
        <rect x="${cx - tableW / 2}" y="${cy - tableH / 2}" width="${tableW}" height="${tableH}" rx="2" fill="#A0522D" stroke="#6B3A2A" stroke-width="1" />
        <rect x="${x + w * 0.7}" y="${y + h * 0.5}" width="${w * 0.12}" height="${w * 0.12}" rx="2" fill="#B8956A" stroke="#8B7355" stroke-width="1" />
      `;
    }
    case "bedroom": {
      // Bed + pillows + rug + side table
      const bedW = w * 0.55, bedH = h * 0.65;
      const bedX = cx - bedW / 2, bedY = y + h * 0.15;
      const pillowW = bedW * 0.4, pillowH = bedH * 0.12;
      return `
        <rect x="${x + (w - w * 0.6) / 2}" y="${bedY + bedH * 0.2}" width="${w * 0.6}" height="${h * 0.5}" rx="3" fill="#E8D8C8" opacity="0.4" />
        <rect x="${bedX}" y="${bedY}" width="${bedW}" height="${bedH}" rx="3" fill="#A0785A" stroke="#6B4E35" stroke-width="1.5" />
        <rect x="${bedX + 4}" y="${bedY + 4}" width="${pillowW}" height="${pillowH}" rx="3" fill="#F5F0E8" stroke="#D0C0A8" stroke-width="1" />
        <rect x="${bedX + bedW - pillowW - 4}" y="${bedY + 4}" width="${pillowW}" height="${pillowH}" rx="3" fill="#F5F0E8" stroke="#D0C0A8" stroke-width="1" />
        <rect x="${bedX - w * 0.1}" y="${bedY}" width="${w * 0.08}" height="${h * 0.1}" rx="1" fill="#8B6D50" stroke="#5A4030" stroke-width="1" />
        <circle cx="${bedX - w * 0.06}" cy="${bedY + 4}" r="3" fill="#FFD700" opacity="0.6" />
      `;
    }
    case "kitchen": {
      // L-counter + sink + stove
      const cW = w * 0.15, cH = h * 0.7;
      const topW = w * 0.5, topH = h * 0.12;
      return `
        <rect x="${x + 4}" y="${y + h * 0.15}" width="${cW}" height="${cH}" rx="2" fill="#D2B48C" stroke="#8B7355" stroke-width="1.5" />
        <rect x="${x + 4}" y="${y + h * 0.15}" width="${topW}" height="${topH}" rx="2" fill="#D2B48C" stroke="#8B7355" stroke-width="1.5" />
        <circle cx="${x + 4 + cW / 2}" cy="${y + h * 0.4}" r="${Math.min(w, h) * 0.06}" fill="none" stroke="#4682B4" stroke-width="1.5" />
        <rect x="${x + 4 + 2}" y="${y + h * 0.55}" width="${cW * 0.4}" height="${cW * 0.4}" rx="1" fill="none" stroke="#333" stroke-width="1" />
        <rect x="${x + 4 + cW * 0.5}" y="${y + h * 0.55}" width="${cW * 0.4}" height="${cW * 0.4}" rx="1" fill="none" stroke="#333" stroke-width="1" />
        <rect x="${x + w * 0.7}" y="${y + h * 0.2}" width="${w * 0.2}" height="${h * 0.25}" rx="2" fill="#E0E0E0" stroke="#999" stroke-width="1" />
      `;
    }
    case "bathroom": {
      // WC + basin + shower
      const wcW = Math.min(w * 0.25, 20), wcH = Math.min(h * 0.2, 18);
      return `
        <rect x="${x + w * 0.1}" y="${y + h * 0.6}" width="${wcW}" height="${wcH}" rx="3" fill="#F0F0F0" stroke="#999" stroke-width="1.5" />
        <circle cx="${x + w * 0.7}" cy="${y + h * 0.3}" r="${Math.min(w, h) * 0.08}" fill="#F0F8FF" stroke="#4682B4" stroke-width="1.5" />
        <rect x="${x + w * 0.55}" y="${y + h * 0.6}" width="${w * 0.3}" height="${h * 0.3}" rx="2" fill="none" stroke="#4682B4" stroke-width="1" stroke-dasharray="4 3" />
      `;
    }
    case "dining": {
      // Table + chairs
      const tW = w * 0.4, tH = h * 0.3;
      const chairR = Math.min(w, h) * 0.05;
      return `
        <rect x="${cx - tW / 2}" y="${cy - tH / 2}" width="${tW}" height="${tH}" rx="3" fill="#B8860B" stroke="#8B6914" stroke-width="1.5" />
        <circle cx="${cx - tW / 2 - chairR * 2}" cy="${cy - tH * 0.3}" r="${chairR}" fill="#A0522D" />
        <circle cx="${cx - tW / 2 - chairR * 2}" cy="${cy + tH * 0.3}" r="${chairR}" fill="#A0522D" />
        <circle cx="${cx + tW / 2 + chairR * 2}" cy="${cy - tH * 0.3}" r="${chairR}" fill="#A0522D" />
        <circle cx="${cx + tW / 2 + chairR * 2}" cy="${cy + tH * 0.3}" r="${chairR}" fill="#A0522D" />
      `;
    }
    default: return "";
  }
}

// ── SVG outdoor renderers ──────────────────────────────
function gardenSvg(x: number, y: number, w: number, h: number): string {
  let svg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#4CAF50" />`;
  // Grass texture lines
  for (let i = 0; i < 12; i++) {
    const gx = x + Math.random() * w;
    const gy = y + Math.random() * h;
    svg += `<line x1="${gx}" y1="${gy}" x2="${gx + 2}" y2="${gy - 6}" stroke="#2E7D32" stroke-width="1.5" opacity="0.6" />`;
  }
  // Shrubs
  const shrubCount = Math.max(3, Math.floor(w / 40));
  for (let i = 0; i < shrubCount; i++) {
    const sx = x + (w / (shrubCount + 1)) * (i + 1);
    const sy = y + h * 0.5 + (i % 2 === 0 ? -h * 0.15 : h * 0.15);
    const sr = Math.min(w, h) * 0.12 + Math.random() * 4;
    const shade = i % 3 === 0 ? "#388E3C" : i % 3 === 1 ? "#66BB6A" : "#2E7D32";
    svg += `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="${shade}" opacity="0.8" />`;
    svg += `<circle cx="${sx - sr * 0.4}" cy="${sy - sr * 0.3}" r="${sr * 0.6}" fill="#43A047" opacity="0.7" />`;
  }
  // Border flowers
  for (let i = 0; i < Math.floor(w / 30); i++) {
    const fx = x + 10 + i * 30;
    const fy = y + h - 8;
    svg += `<circle cx="${fx}" cy="${fy}" r="3" fill="#FF6B6B" opacity="0.7" />`;
    svg += `<circle cx="${fx + 4}" cy="${fy - 3}" r="2.5" fill="#FFD93D" opacity="0.7" />`;
  }
  return svg;
}

function parkingSvg(x: number, y: number, w: number, h: number): string {
  // Grey stone floor + red car icon
  let svg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#D0D0D0" />`;
  // Tile grid pattern
  for (let tx = x; tx < x + w; tx += 20) {
    svg += `<line x1="${tx}" y1="${y}" x2="${tx}" y2="${y + h}" stroke="#BBB" stroke-width="0.5" />`;
  }
  for (let ty = y; ty < y + h; ty += 20) {
    svg += `<line x1="${x}" y1="${ty}" x2="${x + w}" y2="${ty}" stroke="#BBB" stroke-width="0.5" />`;
  }
  // Red car (top-view)
  const carW = Math.min(w * 0.35, 50), carH = Math.min(h * 0.7, 90);
  const carX = x + (w - carW) / 2, carY = y + (h - carH) / 2;
  svg += `
    <rect x="${carX}" y="${carY}" width="${carW}" height="${carH}" rx="8" fill="#D32F2F" stroke="#B71C1C" stroke-width="1.5" />
    <rect x="${carX + carW * 0.1}" y="${carY + carH * 0.15}" width="${carW * 0.8}" height="${carH * 0.25}" rx="4" fill="#5C9DCC" opacity="0.7" />
    <rect x="${carX + carW * 0.1}" y="${carY + carH * 0.6}" width="${carW * 0.8}" height="${carH * 0.2}" rx="4" fill="#5C9DCC" opacity="0.7" />
    <rect x="${carX - 3}" y="${carY + carH * 0.1}" width="6" height="${carH * 0.15}" rx="2" fill="#333" />
    <rect x="${carX + carW - 3}" y="${carY + carH * 0.1}" width="6" height="${carH * 0.15}" rx="2" fill="#333" />
    <rect x="${carX - 3}" y="${carY + carH * 0.75}" width="6" height="${carH * 0.15}" rx="2" fill="#333" />
    <rect x="${carX + carW - 3}" y="${carY + carH * 0.75}" width="6" height="${carH * 0.15}" rx="2" fill="#333" />
    <ellipse cx="${carX + carW / 2}" cy="${carY + carH * 0.08}" rx="${carW * 0.15}" ry="3" fill="#FF8A80" opacity="0.6" />
  `;
  return svg;
}

// ── Door arc SVG ───────────────────────────────────────
function doorArc(x: number, y: number, w: number, side: "bottom" | "right"): string {
  const doorW = Math.min(w * 0.35, 28);
  if (side === "bottom") {
    return `<path d="M ${x + w / 2 - doorW / 2} ${y} A ${doorW} ${doorW} 0 0 1 ${x + w / 2 + doorW / 2} ${y}" fill="none" stroke="#555" stroke-width="1.5" />`;
  }
  return `<path d="M ${x + w} ${y + 10} A ${doorW} ${doorW} 0 0 0 ${x + w} ${y + 10 + doorW}" fill="none" stroke="#555" stroke-width="1.5" />`;
}

// ── Window SVG ─────────────────────────────────────────
function windowSvg(x: number, y: number, w: number, h: number): string {
  let svg = "";
  // Top wall windows
  const winW = Math.min(w * 0.2, 30);
  svg += `<rect x="${x + w * 0.3}" y="${y - 2}" width="${winW}" height="4" rx="1" fill="#90CAF9" opacity="0.7" />`;
  svg += `<rect x="${x + w * 0.6}" y="${y - 2}" width="${winW}" height="4" rx="1" fill="#90CAF9" opacity="0.7" />`;
  return svg;
}

// ── Tile texture pattern ───────────────────────────────
function tilePattern(id: string, color: string): string {
  return `
    <pattern id="${id}" patternUnits="userSpaceOnUse" width="16" height="16">
      <rect width="16" height="16" fill="${color}" />
      <line x1="0" y1="16" x2="16" y2="16" stroke="#00000010" stroke-width="0.5" />
      <line x1="16" y1="0" x2="16" y2="16" stroke="#00000010" stroke-width="0.5" />
      <line x1="0" y1="8" x2="8" y2="8" stroke="#00000008" stroke-width="0.3" />
    </pattern>
  `;
}

// ── Main server ────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { landArea, plotLength, plotBreadth, northDirection, rooms, preferences } = await req.json();
    const area = safeNumber(landArea);
    if (area <= 0) throw new Error("Invalid land area.");
    if (!Array.isArray(rooms) || rooms.length === 0) throw new Error("No rooms selected.");

    const planned = expandRooms(rooms);
    const plot = plotDims(area, plotLength, plotBreadth);

    const outdoorIds: string[] = Array.isArray(preferences?.outdoorFeatures)
      ? preferences.outdoorFeatures.map((f: unknown) => String(f).trim().toLowerCase()).filter(Boolean) : [];
    const hasGarage = outdoorIds.some(f => ["car_parking", "parking", "garage"].includes(f));
    const hasGarden = outdoorIds.some(f => ["garden", "front garden", "back garden", "landscape"].includes(f));
    const gP = hasGarage ? String(preferences?.garagePlacement || "Front") : null;
    const gnP = hasGarden ? String(preferences?.gardenPlacement || "Front Garden") : null;

    const { indoor, items: outdoorItems } = reserveOutdoor(plot, hasGarage, gP, hasGarden, gnP);

    // Zone-based packing
    const bedrooms = planned.filter(r => r.type === "bedroom");
    const bathrooms = planned.filter(r => r.type === "bathroom");
    const front = planned.filter(r => ["living", "dining", "kitchen"].includes(r.type));
    const others = planned.filter(r => r.type === "other");

    const backZone: Rect = { x: indoor.x, y: indoor.y, width: indoor.width, height: indoor.height * 0.4 };
    const midZone: Rect = { x: indoor.x, y: backZone.y + backZone.height, width: indoor.width, height: indoor.height * 0.22 };
    const frontZone: Rect = { x: indoor.x, y: midZone.y + midZone.height, width: indoor.width, height: indoor.height - backZone.height - midZone.height };

    let bp = pack(bedrooms, backZone, 0.8, 0.4);
    let mp = pack([...bathrooms, ...others], midZone, 0.8, 0.4);
    let fp = pack(front, frontZone, 0.8, 0.4);
    let placed = [...bp.placed, ...mp.placed, ...fp.placed];
    let overflow = [...bp.overflow, ...mp.overflow, ...fp.overflow];

    if (overflow.length > 0) {
      const all = [...bedrooms, ...bathrooms, ...others, ...front].sort((a, b) => b.area - a.area);
      let fallback: PlacedRoom[] | null = null;
      for (let s = 1; s >= 0.3; s -= 0.05) {
        const r = pack(all, indoor, 0.6, 0.2, Number(s.toFixed(2)));
        if (r.overflow.length === 0) { fallback = r.placed; break; }
      }
      if (!fallback) throw new Error("Unable to fit all rooms. Reduce count or increase area.");
      placed = fallback;
    }

    // ── Canvas setup ───────────────────────────────────
    const CW = 1400, CH = 1100, headerH = 60, margin = 70;
    const drawArea = { w: CW - margin * 2, h: CH - headerH - margin * 2 };
    const scale = Math.min(drawArea.w / plot.width, drawArea.h / plot.height);
    const offsetX = margin + (drawArea.w - plot.width * scale) / 2;
    const offsetY = headerH + margin + (drawArea.h - plot.height * scale) / 2;
    const px = (v: number) => offsetX + v * scale;
    const py = (v: number) => offsetY + v * scale;
    const pw = (v: number) => v * scale;

    const plotX = px(0), plotY = py(0), plotW = pw(plot.width), plotH = pw(plot.height);

    // ── Build SVG ──────────────────────────────────────
    let patterns = "";
    const patternIds: Record<string, string> = {};
    planned.forEach(r => {
      const pid = `tile-${r.type}`;
      if (!patternIds[r.type]) {
        patternIds[r.type] = pid;
        patterns += tilePattern(pid, FLOOR_COLORS[r.type] || FLOOR_COLORS.other);
      }
    });

    // Outdoor elements
    let outdoorSvgStr = "";
    outdoorItems.forEach(item => {
      const ox = px(item.rect.x), oy = py(item.rect.y), ow = pw(item.rect.width), oh = pw(item.rect.height);
      if (item.kind === "garden") outdoorSvgStr += gardenSvg(ox, oy, ow, oh);
      else outdoorSvgStr += parkingSvg(ox, oy, ow, oh);
      outdoorSvgStr += `<text x="${ox + ow / 2}" y="${oy + oh - 8}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Arial, sans-serif" stroke="#000" stroke-width="0.3">${esc(item.label)}</text>`;
    });

    // Room elements
    let roomSvgStr = "";
    placed.forEach(room => {
      const rx = px(room.rect.x), ry = py(room.rect.y), rw = pw(room.rect.width), rh = pw(room.rect.height);
      const pid = patternIds[room.type] || patternIds.other;
      const label = esc(room.label.toUpperCase());
      const dimText = `${formatFt(room.width)}' x ${formatFt(room.height)}'`;
      const areaText = `${Math.round(room.area)} sq.ft`;

      // Room fill with tile pattern
      roomSvgStr += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="url(#${pid})" />`;
      // Thick walls
      roomSvgStr += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="none" stroke="#1a1a1a" stroke-width="3.5" />`;
      // Furniture
      roomSvgStr += furnitureSvg(room.type, rx, ry, rw, rh);
      // Door arc
      roomSvgStr += doorArc(rx, ry + rh, rw, "bottom");
      // Windows
      roomSvgStr += windowSvg(rx, ry, rw, rh);
      // Labels
      roomSvgStr += `<text x="${rx + rw / 2}" y="${ry + rh / 2 - 10}" text-anchor="middle" font-size="14" font-weight="700" fill="#111" font-family="Arial, sans-serif">${label}</text>`;
      roomSvgStr += `<text x="${rx + rw / 2}" y="${ry + rh / 2 + 8}" text-anchor="middle" font-size="12" fill="#333" font-family="Arial, sans-serif">${esc(dimText)}</text>`;
      roomSvgStr += `<text x="${rx + rw / 2}" y="${ry + rh / 2 + 24}" text-anchor="middle" font-size="11" fill="#555" font-family="Arial, sans-serif">${esc(areaText)}</text>`;
      // Dimension lines
      roomSvgStr += `
        <line x1="${rx}" y1="${ry - 10}" x2="${rx + rw}" y2="${ry - 10}" stroke="#666" stroke-width="0.8" />
        <line x1="${rx}" y1="${ry - 14}" x2="${rx}" y2="${ry - 6}" stroke="#666" stroke-width="0.8" />
        <line x1="${rx + rw}" y1="${ry - 14}" x2="${rx + rw}" y2="${ry - 6}" stroke="#666" stroke-width="0.8" />
        <text x="${rx + rw / 2}" y="${ry - 14}" text-anchor="middle" font-size="9" fill="#666" font-family="Arial">${formatFt(room.width)} ft</text>
        <line x1="${rx - 10}" y1="${ry}" x2="${rx - 10}" y2="${ry + rh}" stroke="#666" stroke-width="0.8" />
        <line x1="${rx - 14}" y1="${ry}" x2="${rx - 6}" y2="${ry}" stroke="#666" stroke-width="0.8" />
        <line x1="${rx - 14}" y1="${ry + rh}" x2="${rx - 6}" y2="${ry + rh}" stroke="#666" stroke-width="0.8" />
        <text x="${rx - 16}" y="${ry + rh / 2}" text-anchor="end" dominant-baseline="middle" font-size="9" fill="#666" font-family="Arial">${formatFt(room.height)} ft</text>
      `;
    });

    // Entrance marker
    const entranceX = px(indoor.x + indoor.width / 2);
    const entranceY = py(indoor.y + indoor.height);
    const entranceSvg = `
      <line x1="${entranceX - 20}" y1="${entranceY}" x2="${entranceX + 20}" y2="${entranceY}" stroke="#1a1a1a" stroke-width="0" />
      <path d="M ${entranceX - 15} ${entranceY + 4} A 15 15 0 0 1 ${entranceX + 15} ${entranceY + 4}" fill="none" stroke="#D32F2F" stroke-width="2.5" />
      <text x="${entranceX}" y="${entranceY + 22}" text-anchor="middle" font-size="12" font-weight="700" fill="#D32F2F" font-family="Arial">ENTRANCE</text>
    `;

    // Plot boundary dimension lines
    const plotDimSvg = `
      <line x1="${plotX}" y1="${plotY - 22}" x2="${plotX + plotW}" y2="${plotY - 22}" stroke="#333" stroke-width="1.2" />
      <line x1="${plotX}" y1="${plotY - 28}" x2="${plotX}" y2="${plotY - 16}" stroke="#333" stroke-width="1.2" />
      <line x1="${plotX + plotW}" y1="${plotY - 28}" x2="${plotX + plotW}" y2="${plotY - 16}" stroke="#333" stroke-width="1.2" />
      <text x="${plotX + plotW / 2}" y="${plotY - 30}" text-anchor="middle" font-size="13" font-weight="600" fill="#222" font-family="Arial">${formatFt(plot.width)} ft</text>
      <line x1="${plotX - 22}" y1="${plotY}" x2="${plotX - 22}" y2="${plotY + plotH}" stroke="#333" stroke-width="1.2" />
      <line x1="${plotX - 28}" y1="${plotY}" x2="${plotX - 16}" y2="${plotY}" stroke="#333" stroke-width="1.2" />
      <line x1="${plotX - 28}" y1="${plotY + plotH}" x2="${plotX - 16}" y2="${plotY + plotH}" stroke="#333" stroke-width="1.2" />
      <text x="${plotX - 32}" y="${plotY + plotH / 2}" text-anchor="end" dominant-baseline="middle" font-size="13" font-weight="600" fill="#222" font-family="Arial">${formatFt(plot.height)} ft</text>
    `;

    const style = esc(String(preferences?.style || "Modern"));

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}">
      <defs>${patterns}</defs>
      <rect width="100%" height="100%" fill="#FAFAFA" />
      <!-- Blue Header Banner -->
      <rect x="0" y="0" width="${CW}" height="${headerH}" rx="0" fill="#1565C0" />
      <text x="${CW / 2}" y="${headerH / 2 + 2}" text-anchor="middle" dominant-baseline="middle" font-size="26" font-weight="700" fill="#FFFFFF" font-family="Arial, sans-serif">${Math.round(area)} SQ.FT HOUSE PLAN</text>
      <text x="${CW - 20}" y="${headerH / 2 + 2}" text-anchor="end" dominant-baseline="middle" font-size="14" fill="#E3F2FD" font-family="Arial">${style}</text>
      <!-- Plot boundary -->
      <rect x="${plotX}" y="${plotY}" width="${plotW}" height="${plotH}" fill="#F5F0E6" stroke="#1a1a1a" stroke-width="4" />
      ${plotDimSvg}
      <!-- Indoor area -->
      <rect x="${px(indoor.x)}" y="${py(indoor.y)}" width="${pw(indoor.width)}" height="${pw(indoor.height)}" fill="none" stroke="#333" stroke-width="1.5" stroke-dasharray="6 4" />
      <!-- Outdoor zones -->
      ${outdoorSvgStr}
      <!-- Rooms -->
      ${roomSvgStr}
      <!-- Entrance -->
      ${entranceSvg}
      <!-- North Arrow -->
      <g transform="translate(${plotX + 16}, ${plotY + 20})">
        <polygon points="0,-18 5,-6 -5,-6" fill="#333" />
        <text x="0" y="-20" text-anchor="middle" font-size="14" font-weight="700" fill="#333" font-family="Arial">N</text>
        <text x="0" y="6" text-anchor="middle" font-size="9" fill="#666" font-family="Arial">${esc(String(northDirection || "North"))}</text>
      </g>
      <!-- Scale + Title block -->
      <text x="${plotX + plotW}" y="${plotY + plotH + 30}" text-anchor="end" font-size="11" fill="#555" font-family="Arial">Scale: 1:50</text>
      <text x="${plotX + plotW}" y="${plotY + plotH + 46}" text-anchor="end" font-size="11" fill="#555" font-family="Arial">CasaMuse | ${style} Residence | ${Math.round(area)} sq.ft</text>
    </svg>`;

    const imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

    return new Response(
      JSON.stringify({ imageUrl, description: `${style} house plan - ${Math.round(area)} sq.ft with ${planned.length} rooms.`, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
