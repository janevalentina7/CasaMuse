import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildRoomTable(rooms: any[]): { table: string; totalCount: number; checklist: string; totalArea: number; labelGuide: string } {
  const lines: string[] = [];
  const checkLines: string[] = [];
  const labelLines: string[] = [];
  let totalArea = 0;
  let totalCount = 0;

  rooms.forEach((room: any) => {
    const count = room.count || 1;
    const area = room.width * room.height;
    totalArea += area * count + (room.attachedBathroom ? 40 * count : 0);
    totalCount += count + (room.attachedBathroom ? count : 0);

    for (let i = 0; i < count; i++) {
      const label = count > 1 ? `${room.roomName} ${i + 1}` : room.roomName;
      const upperLabel = label.toUpperCase();
      lines.push(`- ${label}: exactly ${room.width} feet wide × ${room.height} feet tall = ${area} sq.ft${room.attachedBathroom ? ' (+ Attached Bathroom 5ft × 8ft = 40 sq.ft)' : ''}`);
      checkLines.push(label);
      // Exact label text the AI must write inside each room
      labelLines.push(`Inside "${upperLabel}" write exactly:\n  "${upperLabel}"\n  "${room.width}' × ${room.height}'"\n  "${area} sq.ft"`);
      if (room.attachedBathroom) {
        checkLines.push(`${label} Bath`);
        labelLines.push(`Inside "${upperLabel} BATH" write exactly:\n  "BATHROOM"\n  "5' × 8'"\n  "40 sq.ft"`);
      }
    }
  });

  return {
    table: lines.join("\n"),
    totalCount,
    checklist: checkLines.join(", "),
    totalArea,
    labelGuide: labelLines.join("\n"),
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

    const { table: roomTable, totalCount, checklist, totalArea, labelGuide } = buildRoomTable(rooms);

    const plotDims = plotLength && plotBreadth
      ? `${plotLength}' × ${plotBreadth}'`
      : `${Math.round(Math.sqrt(parsedLandArea))}' × ${Math.round(parsedLandArea / Math.sqrt(parsedLandArea))}'`;

    const prompt = `Generate a professional 2D architectural floor plan image. It must look like a real architect's CAD blueprint printed on white paper — clean black lines, colored room fills, and perfectly readable text labels.

PLOT: ${plotDims} (${landArea} sq.ft) | ${preferences.style} | ${preferences.floors} floor(s) | North: ${northDirection || "Up"}
${preferences.vastuCompliant ? "VASTU: Living→NE, Master Bed→SW, Kitchen→SE, Pooja→NE, Bath→NW, Entry→N/E" : ""}

ROOMS TO DRAW (ONLY these — no extras):
${roomTable}

${hasGarage ? `PARKING: ${garagePlacement} side` : "NO parking/garage/driveway."}
${hasGarden ? `GARDEN: ${gardenPlacement}` : "NO garden/lawn/landscape."}

STYLE:
- Top-down 2D view, white background
- Thick black outer walls (9"), thinner inner walls (4.5")
- Plot boundary: thick black rectangle with dimension lines on all 4 sides
- Room fills: Living=#D4E8FC, Master Bed=#FDDCBA, Bedroom=#E8D4F0, Kitchen=#FFF3CD, Dining=#D4F1F4, Bath=#C8F0F0${hasGarage ? ", Parking=#E9ECEF" : ""}${hasGarden ? ", Garden=#D4EDDA" : ""}
- Doors: quarter-circle swing arcs; main door labeled "ENTRANCE"
- Windows: parallel lines on outer walls
- Light grey furniture outlines (sofa, beds, counters, WC)
- North arrow top-left, title block bottom-right

EXACT TEXT LABELS (copy these exactly into each room — large black sans-serif font, centered):
${labelGuide}

DIMENSION ACCURACY IS CRITICAL:
- The proportions of each room rectangle MUST visually match its stated width × height ratio
- A 12' × 16' room must look taller than wide; a 10' × 12' room must look slightly taller than wide
- Write dimension lines with tick marks on all exterior and interior walls showing feet measurements
- Every dimension number in the labels must EXACTLY match the numbers listed above — do not round, change, or invent dimensions

RULES:
- Draw EXACTLY ${totalCount} labeled spaces — no more, no fewer: ${checklist}
- Do NOT add unlisted rooms (no storage, closet, lobby, foyer, passage, utility, wash area)
- Corridors connect rooms but are NOT labeled
- All text must be correctly spelled and fully legible`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
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
