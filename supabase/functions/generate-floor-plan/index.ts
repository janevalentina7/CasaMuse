import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RoomType = "living" | "bedroom" | "kitchen" | "bathroom" | "dining" | "other";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PlannedRoom = {
  id: string;
  label: string;
  type: RoomType;
  width: number;
  height: number;
  area: number;
};

const ROOM_COLORS: Record<RoomType, string> = {
  living: "#D4E8FC",
  bedroom: "#E8D4F0",
  kitchen: "#FFF3CD",
  bathroom: "#C8F0F0",
  dining: "#D4F1F4",
  other: "#F1F3F5",
};

const ROOM_AREA_RANGES: Partial<Record<RoomType, { min: number; max: number }>> = {
  living: { min: 150, max: 250 },
  bedroom: { min: 120, max: 200 },
  kitchen: { min: 80, max: 150 },
  bathroom: { min: 40, max: 70 },
  dining: { min: 100, max: 180 },
};

function safeNumber(value: unknown, fallback = 0): number {
  const n = Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : fallback;
}

function cleanLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyRoomType(roomId: string, roomName: string): RoomType {
  const key = `${roomId} ${roomName}`.toLowerCase();

  if (key.includes("living") || key.includes("hall")) return "living";
  if (key.includes("bedroom") || key.includes("bed room") || key.includes("master")) return "bedroom";
  if (key.includes("kitchen") || key.includes("pantry")) return "kitchen";
  if (key.includes("bath") || key.includes("toilet") || key.includes("wc") || key.includes("powder")) return "bathroom";
  if (key.includes("dining")) return "dining";

  return "other";
}

function formatFeet(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function expandRooms(rawRooms: any[]): PlannedRoom[] {
  const expanded: Array<{ baseLabel: string; type: RoomType; width: number; height: number }> = [];

  rawRooms.forEach((room, roomIndex) => {
    const count = Math.max(1, Math.floor(safeNumber(room?.count, 1)));
    const width = Math.max(3, safeNumber(room?.width, 10));
    const height = Math.max(3, safeNumber(room?.height, 10));
    const baseLabel = cleanLabel(String(room?.roomName || room?.roomId || `Room ${roomIndex + 1}`));
    const type = classifyRoomType(String(room?.roomId || ""), baseLabel);

    for (let i = 0; i < count; i++) {
      expanded.push({ baseLabel, type, width, height });

      if (Boolean(room?.attachedBathroom)) {
        expanded.push({
          baseLabel: "Attached Bathroom",
          type: "bathroom",
          width: 5,
          height: 8,
        });
      }
    }
  });

  const totals = new Map<string, number>();
  expanded.forEach((room) => {
    totals.set(room.baseLabel, (totals.get(room.baseLabel) || 0) + 1);
  });

  const running = new Map<string, number>();

  return expanded.map((room, index) => {
    const total = totals.get(room.baseLabel) || 1;
    const current = (running.get(room.baseLabel) || 0) + 1;
    running.set(room.baseLabel, current);

    const label = total > 1 ? `${room.baseLabel} ${current}` : room.baseLabel;

    return {
      id: `r-${index + 1}`,
      label,
      type: room.type,
      width: room.width,
      height: room.height,
      area: room.width * room.height,
    };
  });
}

function derivePlotDimensions(landArea: number, plotLength: unknown, plotBreadth: unknown): { width: number; height: number } {
  const length = safeNumber(plotLength);
  const breadth = safeNumber(plotBreadth);

  if (length > 0 && breadth > 0) {
    return { width: length, height: breadth };
  }

  const width = Math.sqrt(landArea * 1.25);
  const height = landArea / width;
  return { width: Math.max(20, width), height: Math.max(20, height) };
}

function validateRoomSizeRanges(rooms: PlannedRoom[]): string[] {
  const warnings: string[] = [];

  rooms.forEach((room) => {
    const range = ROOM_AREA_RANGES[room.type];
    if (!range) return;

    if (room.area < range.min || room.area > range.max) {
      warnings.push(
        `${room.label} (${Math.round(room.area)} sq.ft) is outside recommended ${range.min}-${range.max} sq.ft for ${room.type} rooms.`
      );
    }
  });

  return warnings;
}

function getSideFromPlacement(value: string | null | undefined, fallback: "top" | "bottom" | "left" | "right") {
  const normalized = (value || "").toLowerCase();

  if (normalized.includes("front")) return "bottom";
  if (normalized.includes("back")) return "top";
  if (normalized.includes("left")) return "left";
  if (normalized.includes("right") || normalized.includes("side")) return "right";

  return fallback;
}

function reserveOutdoorAreas(
  plot: { width: number; height: number },
  hasGarage: boolean,
  garagePlacement: string | null,
  hasGarden: boolean,
  gardenPlacement: string | null
): { indoorRect: Rect; outdoorRects: Array<{ rect: Rect; label: string; color: string }> } {
  let topReserve = 0;
  let bottomReserve = 0;
  let leftReserve = 0;
  let rightReserve = 0;

  const outdoorRects: Array<{ rect: Rect; label: string; color: string }> = [];

  if (hasGarage) {
    const side = getSideFromPlacement(garagePlacement, "right");
    if (side === "top") topReserve += 10;
    if (side === "bottom") bottomReserve += 10;
    if (side === "left") leftReserve += 10;
    if (side === "right") rightReserve += 10;
  }

  if (hasGarden) {
    const placement = (gardenPlacement || "").toLowerCase();
    if (placement.includes("all around") || placement.includes("surround")) {
      topReserve += 6;
      bottomReserve += 6;
      leftReserve += 6;
      rightReserve += 6;
    } else {
      const side = getSideFromPlacement(gardenPlacement, "bottom");
      if (side === "top") topReserve += 8;
      if (side === "bottom") bottomReserve += 8;
      if (side === "left") leftReserve += 8;
      if (side === "right") rightReserve += 8;
    }
  }

  const indoorRect: Rect = {
    x: 2 + leftReserve,
    y: 2 + topReserve,
    width: Math.max(12, plot.width - 4 - leftReserve - rightReserve),
    height: Math.max(12, plot.height - 4 - topReserve - bottomReserve),
  };

  if (topReserve > 0) {
    outdoorRects.push({ rect: { x: 2, y: 2, width: plot.width - 4, height: topReserve }, label: "OUTDOOR ZONE", color: "#E8F5E9" });
  }
  if (bottomReserve > 0) {
    outdoorRects.push({
      rect: { x: 2, y: plot.height - 2 - bottomReserve, width: plot.width - 4, height: bottomReserve },
      label: "OUTDOOR ZONE",
      color: "#E8F5E9",
    });
  }
  if (leftReserve > 0) {
    outdoorRects.push({ rect: { x: 2, y: 2, width: leftReserve, height: plot.height - 4 }, label: "OUTDOOR ZONE", color: "#E8F5E9" });
  }
  if (rightReserve > 0) {
    outdoorRects.push({
      rect: { x: plot.width - 2 - rightReserve, y: 2, width: rightReserve, height: plot.height - 4 },
      label: "OUTDOOR ZONE",
      color: "#E8F5E9",
    });
  }

  return { indoorRect, outdoorRects };
}

function packInZone(
  rooms: PlannedRoom[],
  zone: Rect,
  gap = 1.2,
  minScale = 0.5
): { placed: Array<PlannedRoom & { rect: Rect }>; overflow: PlannedRoom[] } {
  const placed: Array<PlannedRoom & { rect: Rect }> = [];
  const overflow: PlannedRoom[] = [];

  let cursorX = zone.x + gap;
  let cursorY = zone.y + gap;
  let rowHeight = 0;

  rooms.forEach((room) => {
    const maxWidth = Math.max(1, zone.width - gap * 2);
    const maxHeight = Math.max(1, zone.height - gap * 2);

    const scaleToFit = Math.min(maxWidth / room.width, maxHeight / room.height, 1);
    if (scaleToFit < minScale) {
      overflow.push(room);
      return;
    }

    const drawWidth = room.width * scaleToFit;
    const drawHeight = room.height * scaleToFit;

    if (cursorX + drawWidth > zone.x + zone.width - gap) {
      cursorX = zone.x + gap;
      cursorY += rowHeight + gap;
      rowHeight = 0;
    }

    if (cursorY + drawHeight > zone.y + zone.height - gap) {
      overflow.push(room);
      return;
    }

    placed.push({
      ...room,
      rect: {
        x: cursorX,
        y: cursorY,
        width: drawWidth,
        height: drawHeight,
      },
    });

    cursorX += drawWidth + gap;
    rowHeight = Math.max(rowHeight, drawHeight);
  });

  return { placed, overflow };
}

function rectanglesOverlap(a: Rect, b: Rect): boolean {
  return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { landArea, plotLength, plotBreadth, northDirection, rooms, preferences } = await req.json();
    const parsedLandArea = safeNumber(landArea);

    if (parsedLandArea <= 0) {
      throw new Error("Invalid land area. Please enter a valid value.");
    }

    if (!Array.isArray(rooms) || rooms.length === 0) {
      throw new Error("No rooms selected. Please select at least one room.");
    }

    const plannedRooms = expandRooms(rooms);
    const duplicateCheck = new Set(plannedRooms.map((room) => room.label.toLowerCase()));
    if (duplicateCheck.size !== plannedRooms.length) {
      throw new Error("Duplicate room labels detected. Please review room selections.");
    }

    const rangeWarnings = validateRoomSizeRanges(plannedRooms);

    const outdoorIds: string[] = Array.isArray(preferences?.outdoorFeatures)
      ? preferences.outdoorFeatures.map((f: unknown) => String(f).trim().toLowerCase()).filter(Boolean)
      : [];

    const hasGarage = outdoorIds.some((f) => ["car_parking", "car parking", "parking", "garage"].includes(f));
    const hasGarden = outdoorIds.some((f) => ["garden", "front garden", "back garden", "landscape", "landscaping"].includes(f));

    const garagePlacement = hasGarage ? String(preferences?.garagePlacement || "Front") : null;
    const gardenPlacement = hasGarden ? String(preferences?.gardenPlacement || "Front Garden") : null;

    const circulationArea = parsedLandArea * 0.12;
    const wallArea = parsedLandArea * 0.08;
    const outdoorArea = (hasGarage ? 180 : 0) + (hasGarden ? 150 : 0);
    const roomArea = plannedRooms.reduce((sum, room) => sum + room.area, 0);
    const maximumBuildableArea = parsedLandArea - circulationArea - wallArea - outdoorArea;

    if (roomArea > maximumBuildableArea) {
      throw new Error(
        `Total room area (${Math.round(roomArea)} sq.ft) exceeds allowed buildable area (${Math.round(maximumBuildableArea)} sq.ft). Reduce room sizes or room count.`
      );
    }

    const plot = derivePlotDimensions(parsedLandArea, plotLength, plotBreadth);
    const { indoorRect, outdoorRects } = reserveOutdoorAreas(plot, hasGarage, garagePlacement, hasGarden, gardenPlacement);

    const backZone: Rect = {
      x: indoorRect.x,
      y: indoorRect.y,
      width: indoorRect.width,
      height: indoorRect.height * 0.38,
    };
    const midZone: Rect = {
      x: indoorRect.x,
      y: backZone.y + backZone.height,
      width: indoorRect.width,
      height: indoorRect.height * 0.24,
    };
    const frontZone: Rect = {
      x: indoorRect.x,
      y: midZone.y + midZone.height,
      width: indoorRect.width,
      height: indoorRect.height - backZone.height - midZone.height,
    };

    const bedrooms = plannedRooms.filter((room) => room.type === "bedroom");
    const bathrooms = plannedRooms.filter((room) => room.type === "bathroom");
    const frontPrimary = plannedRooms.filter((room) => ["living", "dining", "kitchen"].includes(room.type));
    const others = plannedRooms.filter((room) => room.type === "other");

    const backPack = packInZone(bedrooms, backZone);
    const midPack = packInZone([...bathrooms, ...others], midZone);
    const frontPack = packInZone(frontPrimary, frontZone);

    let placedRooms = [...backPack.placed, ...midPack.placed, ...frontPack.placed];
    const overflowRooms = [...backPack.overflow, ...midPack.overflow, ...frontPack.overflow];

    if (overflowRooms.length > 0) {
      const fallbackPack = packInZone(overflowRooms, indoorRect, 1);
      placedRooms = [...placedRooms, ...fallbackPack.placed];

      if (fallbackPack.overflow.length > 0) {
        throw new Error("Unable to place all rooms without overlap. Please reduce room count or increase land area.");
      }
    }

    for (let i = 0; i < placedRooms.length; i++) {
      for (let j = i + 1; j < placedRooms.length; j++) {
        if (rectanglesOverlap(placedRooms[i].rect, placedRooms[j].rect)) {
          throw new Error("Invalid layout produced overlapping rooms. Please regenerate with adjusted sizes.");
        }
      }
    }

    const canvasWidth = 1400;
    const canvasHeight = 1000;
    const margin = 60;
    const scale = Math.min((canvasWidth - margin * 2) / plot.width, (canvasHeight - margin * 2) / plot.height);

    const px = (value: number) => margin + value * scale;
    const pw = (value: number) => value * scale;

    const plotX = px(0);
    const plotY = px(0);
    const plotW = pw(plot.width);
    const plotH = pw(plot.height);

    const northLabel = escapeXml(String(northDirection || "North"));

    const outdoorSvg = outdoorRects
      .map((item) => {
        const x = px(item.rect.x);
        const y = px(item.rect.y);
        const w = pw(item.rect.width);
        const h = pw(item.rect.height);
        return `
          <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${item.color}" stroke="#7CB342" stroke-width="1.5" />
          <text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#2E7D32" font-family="Arial">${escapeXml(item.label)}</text>
        `;
      })
      .join("\n");

    const roomsSvg = placedRooms
      .map((room) => {
        const x = px(room.rect.x);
        const y = px(room.rect.y);
        const w = pw(room.rect.width);
        const h = pw(room.rect.height);

        const roomName = escapeXml(room.label.toUpperCase());
        const dimLine = `${formatFeet(room.width)}' x ${formatFeet(room.height)}'`;
        const areaLine = `${Math.round(room.area)} sq.ft`;
        const color = roomName.includes("MASTER") ? "#FDDCBA" : ROOM_COLORS[room.type] || ROOM_COLORS.other;

        return `
          <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" stroke="#111111" stroke-width="2" />
          <text x="${x + w / 2}" y="${y + h / 2 - 14}" text-anchor="middle" font-size="13" font-weight="700" fill="#111111" font-family="Arial">${roomName}</text>
          <text x="${x + w / 2}" y="${y + h / 2 + 2}" text-anchor="middle" font-size="12" fill="#111111" font-family="Arial">${escapeXml(dimLine)}</text>
          <text x="${x + w / 2}" y="${y + h / 2 + 18}" text-anchor="middle" font-size="12" fill="#111111" font-family="Arial">${escapeXml(areaLine)}</text>

          <line x1="${x}" y1="${y - 8}" x2="${x + w}" y2="${y - 8}" stroke="#333" stroke-width="1" />
          <line x1="${x}" y1="${y - 12}" x2="${x}" y2="${y - 4}" stroke="#333" stroke-width="1" />
          <line x1="${x + w}" y1="${y - 12}" x2="${x + w}" y2="${y - 4}" stroke="#333" stroke-width="1" />
          <text x="${x + w / 2}" y="${y - 12}" text-anchor="middle" font-size="10" fill="#333" font-family="Arial">${escapeXml(`${formatFeet(room.width)} ft`)}</text>

          <line x1="${x - 8}" y1="${y}" x2="${x - 8}" y2="${y + h}" stroke="#333" stroke-width="1" />
          <line x1="${x - 12}" y1="${y}" x2="${x - 4}" y2="${y}" stroke="#333" stroke-width="1" />
          <line x1="${x - 12}" y1="${y + h}" x2="${x - 4}" y2="${y + h}" stroke="#333" stroke-width="1" />
          <text x="${x - 14}" y="${y + h / 2}" text-anchor="end" dominant-baseline="middle" font-size="10" fill="#333" font-family="Arial">${escapeXml(`${formatFeet(room.height)} ft`)}</text>
        `;
      })
      .join("\n");

    const indoorPathX = px(indoorRect.x + indoorRect.width / 2);
    const indoorPathTop = px(indoorRect.y);
    const indoorPathBottom = px(indoorRect.y + indoorRect.height);

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}">
        <rect width="100%" height="100%" fill="#ffffff" />

        <text x="${canvasWidth / 2}" y="30" text-anchor="middle" font-size="20" font-weight="700" fill="#111111" font-family="Arial">
          CASA MUSE FLOOR PLAN
        </text>

        <rect x="${plotX}" y="${plotY}" width="${plotW}" height="${plotH}" fill="none" stroke="#000000" stroke-width="4" />

        ${outdoorSvg}

        <rect x="${px(indoorRect.x)}" y="${px(indoorRect.y)}" width="${pw(indoorRect.width)}" height="${pw(indoorRect.height)}" fill="none" stroke="#000" stroke-width="2" />

        <line x1="${indoorPathX}" y1="${indoorPathBottom}" x2="${indoorPathX}" y2="${indoorPathTop}" stroke="#6c757d" stroke-dasharray="8 6" stroke-width="1.5" />
        <text x="${indoorPathX + 8}" y="${(indoorPathBottom + indoorPathTop) / 2}" font-size="11" fill="#6c757d" font-family="Arial">CIRCULATION</text>

        <text x="${indoorPathX}" y="${indoorPathBottom + 16}" text-anchor="middle" font-size="12" font-weight="700" fill="#111111" font-family="Arial">ENTRANCE</text>

        ${roomsSvg}

        <line x1="${plotX}" y1="${plotY - 24}" x2="${plotX + plotW}" y2="${plotY - 24}" stroke="#000" stroke-width="1.5" />
        <line x1="${plotX}" y1="${plotY - 30}" x2="${plotX}" y2="${plotY - 18}" stroke="#000" stroke-width="1.5" />
        <line x1="${plotX + plotW}" y1="${plotY - 30}" x2="${plotX + plotW}" y2="${plotY - 18}" stroke="#000" stroke-width="1.5" />
        <text x="${plotX + plotW / 2}" y="${plotY - 28}" text-anchor="middle" font-size="12" fill="#111" font-family="Arial">${escapeXml(`${formatFeet(plot.width)} ft`)}</text>

        <line x1="${plotX - 24}" y1="${plotY}" x2="${plotX - 24}" y2="${plotY + plotH}" stroke="#000" stroke-width="1.5" />
        <line x1="${plotX - 30}" y1="${plotY}" x2="${plotX - 18}" y2="${plotY}" stroke="#000" stroke-width="1.5" />
        <line x1="${plotX - 30}" y1="${plotY + plotH}" x2="${plotX - 18}" y2="${plotY + plotH}" stroke="#000" stroke-width="1.5" />
        <text x="${plotX - 32}" y="${plotY + plotH / 2}" text-anchor="end" dominant-baseline="middle" font-size="12" fill="#111" font-family="Arial">${escapeXml(`${formatFeet(plot.height)} ft`)}</text>

        <text x="${plotX + 10}" y="${plotY + 20}" font-size="14" font-weight="700" fill="#111" font-family="Arial">N ↑ ${northLabel}</text>
        <text x="${plotX + plotW - 10}" y="${plotY + plotH + 26}" text-anchor="end" font-size="11" fill="#111" font-family="Arial">Scale: 1:50</text>

        <text x="${plotX + plotW - 10}" y="${plotY + plotH + 44}" text-anchor="end" font-size="11" fill="#111" font-family="Arial">
          CasaMuse | ${escapeXml(String(preferences?.style || "Modern"))} | ${escapeXml(`${Math.round(parsedLandArea)} sq.ft`)}
        </text>
      </svg>
    `;

    const imageUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

    const validationSummary = [
      "No duplicate rooms",
      "Only selected rooms generated",
      "Room labels uniquely numbered",
      "Area within land limit",
      "Rectangular non-overlapping layout",
      "Logical zoning applied (front: living/kitchen, back: bedrooms)",
      `Circulation reserved: ${Math.round(circulationArea)} sq.ft`,
      ...rangeWarnings,
    ];

    return new Response(
      JSON.stringify({
        imageUrl,
        description: "Validated architectural floor plan generated with strict room allocation and dimensions.",
        success: true,
        validation: validationSummary,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-floor-plan function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
