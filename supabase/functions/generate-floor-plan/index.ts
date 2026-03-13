import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildRoomTable(rooms: any[]): { table: string; totalCount: number; checklist: string; totalArea: number } {
  const lines: string[] = [];
  const checkLines: string[] = [];
  let totalArea = 0;
  let totalCount = 0;

  rooms.forEach((room: any) => {
    const count = room.count || 1;
    const area = room.width * room.height;
    totalArea += area * count + (room.attachedBathroom ? 40 * count : 0);
    totalCount += count + (room.attachedBathroom ? count : 0);

    for (let i = 0; i < count; i++) {
      const label = count > 1 ? `${room.roomName} ${i + 1}` : room.roomName;
      lines.push(`| ${label} | ${room.width}' × ${room.height}' | ${area} sq.ft |${room.attachedBathroom ? ' + Attached Bath 5\'×8\'' : ''}`);
      checkLines.push(label);
      if (room.attachedBathroom) {
        checkLines.push(`${label} Bath`);
      }
    }
  });

  return {
    table: lines.join("\n"),
    totalCount,
    checklist: checkLines.join(", "),
    totalArea,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { landArea, plotLength, plotBreadth, northDirection, rooms, preferences } = await req.json();
    console.log("Generating floor plan with data:", JSON.stringify({ landArea, rooms: rooms?.length, preferences: preferences?.style }));

    const parsedLandArea = Number.parseFloat(String(landArea || "0"));
    if (!Number.isFinite(parsedLandArea) || parsedLandArea <= 0) {
      throw new Error('Invalid land area input');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    // Outdoor feature detection
    const outdoorIds: string[] = Array.isArray(preferences?.outdoorFeatures)
      ? preferences.outdoorFeatures.map((f: unknown) => String(f).trim().toLowerCase()).filter(Boolean)
      : [];

    const hasGarage = outdoorIds.some(f => ["car_parking", "parking", "garage"].includes(f));
    const hasGarden = outdoorIds.some(f => ["garden", "front garden", "back garden", "landscape"].includes(f));
    const garagePlacement = hasGarage ? (preferences?.garagePlacement || "Front") : null;
    const gardenPlacement = hasGarden ? (preferences?.gardenPlacement || "Front Garden") : null;

    const { table: roomTable, totalCount, checklist, totalArea } = buildRoomTable(rooms);

    const plotDims = plotLength && plotBreadth
      ? `${plotLength}' × ${plotBreadth}'`
      : `${Math.round(Math.sqrt(parsedLandArea))}' × ${Math.round(parsedLandArea / Math.sqrt(parsedLandArea))}'`;

    // Simplified, highly focused prompt
    const prompt = `Generate a professional 2D architectural floor plan drawing. The output must look like a real architect's blueprint — clean vector-like lines on white background, NOT a 3D render, NOT a sketch, NOT a photograph.

PLOT: ${plotDims} = ${landArea} sq.ft total | ${preferences.style} style | ${preferences.floors} floor(s) | North: ${northDirection || "Up"}
${preferences.vastuCompliant ? "VASTU COMPLIANT: Living→NE, Master Bed→SW, Kitchen→SE, Pooja→NE, Bath→NW, Entry→N/E" : ""}

EXACT ROOMS (draw ONLY these ${totalCount} spaces, nothing else):
${roomTable}

${hasGarage ? `PARKING: ${garagePlacement} side` : "NO parking/garage/driveway — do not draw any."}
${hasGarden ? `GARDEN: ${gardenPlacement}` : "NO garden/lawn/landscape — do not draw any."}

DRAWING RULES:
1. TOP-DOWN 2D VIEW ONLY — like an AutoCAD floor plan printout
2. White background, black walls (outer walls thick 9", inner 4.5")
3. Thick black rectangle for plot boundary with dimension labels on all 4 sides
4. Each room is a colored rectangle:
   - Living=#D4E8FC, Master Bed=#FDDCBA, Bedroom=#E8D4F0, Kitchen=#FFF3CD
   - Dining=#D4F1F4, Bathroom=#C8F0F0, Corridor=#F5F5DC (unlabeled)
   ${hasGarage ? "- Parking=#E9ECEF" : ""}${hasGarden ? "- Garden=#D4EDDA" : ""}
5. LABELING — Every room must have CLEAR, READABLE text centered inside:
   Line 1: ROOM NAME in BOLD CAPS (e.g. "LIVING ROOM", "KITCHEN", "MASTER BEDROOM")
   Line 2: dimensions (e.g. "12' × 16'")
   Line 3: area (e.g. "192 sq.ft")
   Use large, clean sans-serif font. Text must be BLACK and fully readable.
6. Doors shown as quarter-circle arcs, main entrance labeled "ENTRANCE"
7. Windows as double parallel lines on exterior walls
8. Simple furniture outlines in light grey:
   - Living: sofa + table  - Bedroom: bed rectangle  - Kitchen: L-counter + sink circle
   - Dining: table + chairs  - Bathroom: WC + basin
9. Dimension lines with tick marks on exterior walls
10. North arrow (top-left), scale bar (bottom), title block (bottom-right): "CasaMuse ${preferences.style} | ${plotDims} | ${landArea} sq.ft"

CRITICAL RULES:
- Room count must be EXACTLY: ${checklist} — no more, no fewer
- Do NOT invent extra rooms (no storage, closet, lobby, foyer, passage, utility unless listed)
- Corridors are circulation space only — do NOT label them as rooms
- All text must be correctly spelled, legible, and properly positioned inside rooms
- The result must look like a professional architectural blueprint, not an artistic illustration`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-image-preview',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = data.choices?.[0]?.message?.content || "Professional 2D floor plan generated.";

    if (!imageUrl) throw new Error('No image generated');

    return new Response(
      JSON.stringify({ imageUrl, description, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-floor-plan function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
