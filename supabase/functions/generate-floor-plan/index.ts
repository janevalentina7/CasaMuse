import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildRoomManifest(rooms: any[]): { manifest: string; totalCount: number; checklist: string; totalArea: number } {
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
      lines.push(`- ${label}: ${room.width}' × ${room.height}' = ${area} sq.ft${room.attachedBathroom ? ' (+ Attached Bathroom 5\'×8\' = 40 sq.ft)' : ''}`);
      checkLines.push(label);
      if (room.attachedBathroom) {
        checkLines.push(`${label} - Attached Bath`);
      }
    }
  });

  return { manifest: lines.join("\n"), totalCount, checklist: checkLines.join(", "), totalArea };
}

function buildPrompt(params: {
  landArea: string;
  plotLength: string;
  plotBreadth: string;
  northDirection: string;
  preferences: any;
  manifest: string;
  totalCount: number;
  checklist: string;
  totalArea: number;
  plotDims: string;
  hasGarage: boolean;
  hasGarden: boolean;
  garagePlacement: string | null;
  gardenPlacement: string | null;
}): string {
  const {
    landArea, plotLength, plotBreadth, northDirection, preferences,
    manifest, totalCount, checklist, totalArea, plotDims,
    hasGarage, hasGarden, garagePlacement, gardenPlacement,
  } = params;

  const landShape = plotLength && plotBreadth ? 'Rectangle' : 'Rectangle';

  return `Generate a highly professional, realistic, construction-ready 2D CAD-style floor plan.

=== CRITICAL SPECIFICATIONS ===
- Plot Size: ${plotDims} (Total: ${landArea} sq.ft)
- Plot Shape: ${landShape}
- Floors: ${preferences.floors} story house
- Architectural Style: ${preferences.style}
- House Facing: ${northDirection || "North"} direction
${preferences.vastuCompliant
    ? '- Vastu Compliant: YES - strictly follow vastu principles (Living Room → NE, Master Bedroom → SW, Kitchen → SE, Pooja → NE, Bathroom → NW, Main Entry → N/E)'
    : '- Vastu Compliant: Not required'}

=== EXACT ROOM LIST (generate ONLY these ${totalCount} spaces) ===
${manifest}

Total built-up area: ~${totalArea} sq.ft (must fit within ${landArea} sq.ft plot with 10-15% for walls & circulation)

=== OUTDOOR FEATURES ===
${hasGarage ? `✅ Garage/Parking: Place on ${garagePlacement} side, connect to entrance pathway` : '❌ NO garage, parking, or driveway — do NOT draw any.'}
${hasGarden ? `✅ Garden: Place as ${gardenPlacement}` : '❌ NO garden, lawn, or landscape — do NOT draw any.'}

=== INPUT RULES (CRITICAL) ===
1. Use ONLY the rooms listed above. Do NOT add any extra rooms.
2. Do NOT generate storage rooms, closets, lobbies, foyers, passages, utility rooms, or any room not in the list.
3. No duplicate rooms unless explicitly listed above with numbering.
4. If total room area exceeds land size, reduce room sizes proportionally — never exceed plot boundary.

=== MANDATORY DRAWING STYLE ===
- Pure 2D CAD orthographic top-down view (NO 3D, NO perspective, NO isometric)
- Clean white background with black/grey linework
- Outer walls: THICK solid black lines (9-12 inches equivalent)
- Inner partition walls: Medium thickness (4.5-6 inches equivalent)
- All corners PERFECTLY aligned and orthogonal
- Sharp line edges, no blur, print-ready quality

=== COLOR CODING (soft professional architectural colors) ===
- Walls: Dark grey/black
- Doors: Brown with swing arc direction
- Windows: Light blue with pane dividers
- Living Room: #E3F2FD (light blue)
- Master Bedroom: #FDDCBA (light orange)
- Bedrooms: #F3E5F5 / #EDE7F6 (light peach/lavender)
- Kitchen & Dining: #FFF3E0 (light yellow)
- Bathrooms: #E0F7FA (light aqua)
- Utility/Store: #ECEFF1 (light grey)
- Hallway/Circulation: Light yellow dotted overlay
- Balcony/Open areas: #E8F5E9 (light green)
${hasGarage ? '- Parking: #E9ECEF (light asphalt grey) — draw a TOP-DOWN car outline (sedan shape rectangle ~6\'×15\') inside the parking space to show vehicle placement' : ''}
${hasGarden ? '- Garden: #D4EDDA (natural green) with tree symbols (circles for canopy)' : ''}
- Corridors/Hallways = #F5F5DC (beige) — do NOT label these as rooms

=== MANDATORY LABELING ===
Every room MUST have clear, readable text CENTERED inside the room:
- Line 1: ROOM NAME in BOLD UPPERCASE (e.g., "LIVING ROOM", "KITCHEN", "MASTER BEDROOM")
- Line 2: EXACT dimensions matching the room list above (e.g., "12' × 16'")
- Line 3: CALCULATED area = width × height (e.g., "192 sq.ft") — this MUST be mathematically correct
- Use large, clean, sans-serif font
- Text must be BLACK and fully legible against the pastel background
- If multiple rooms of same type exist, number them: "BEDROOM 1", "BEDROOM 2"
- CRITICAL: The dimensions shown MUST match the room sizes specified in the EXACT ROOM LIST above. Do NOT invent or approximate dimensions.

=== DIMENSION MARKINGS (ACCURACY IS CRITICAL) ===
- Show dimension lines OUTSIDE each room with exact measurements matching the room list
- Each dimension line must have tick marks/arrows at both ends
- Show total plot boundary dimensions on all 4 sides: ${plotDims}
- Room dimensions MUST be proportional to each other (a 12'×16' room must visually appear larger than a 7'×10' room)
- Area labels MUST equal width × height exactly (e.g., 12×16 = 192 sq.ft, NOT 180 or 200)
- Units in feet (Indian standard)
- Double-check: every labeled dimension must be arithmetically consistent with the labeled area

=== DOORS & WINDOWS ===
- Doors: Show opening arc direction clearly (quarter-circle arc swings)
- Main door: 3.5-4 ft width, labeled "ENTRANCE"
- Bedroom doors: 3 ft
- Bathroom doors: 2.5 ft
- Windows: Place for maximum cross-ventilation (double parallel lines on exterior walls)
- Bedrooms: At least 2 windows
- Living room: Large windows
- Kitchen: Ventilation window + exhaust space
- Bathrooms: Small frosted ventilation windows

=== HALLWAY/CIRCULATION ===
- Must connect all bedrooms, bathrooms, and living spaces
- Minimum width: 3-4 feet
- Highlight with light yellow circulation overlay
- Clear path, no obstructions

=== ROOM PLACEMENT LOGIC ===
- Living Room: Near main entrance
- Bedrooms: Private area, away from main entrance
- Kitchen: Adjacent to dining room or living room
- Bathrooms: Attached to bedrooms when specified, otherwise along hallways
- Dining Room: Between kitchen and living room
- Study Room: Quiet area, away from entrance
- Balcony: Attached to living room or bedroom exterior wall

=== FURNITURE OUTLINES (light grey, simple) ===
- Living: sofa + coffee table
- Bedroom: bed rectangle + side table
- Kitchen: L-shaped counter + sink circle
- Dining: table + chairs
- Bathroom: WC symbol + basin

=== ORIENTATION ===
- Show NORTH direction arrow prominently in top-left corner
- Indicate main entry direction
- Plot boundary: Dashed line
- Building footprint: Solid line
- Scale bar at bottom

=== TITLE BLOCK (bottom-right) ===
PROJECT: CasaMuse - AI Generated Floor Plan
STYLE: ${preferences.style}
PLOT: ${plotDims} | ${landArea} sq.ft
SCALE: 1:50
UNITS: Feet
DATE: Auto-generated

=== LEGEND BOX ===
Include color legend for: Wall, Door, Window, Furniture, Circulation, Green space

=== VALIDATION CHECKLIST ===
☐ Room count matches EXACTLY: ${checklist}
☐ No extra rooms beyond the list above
☐ No duplicate rooms unless user requested multiples
☐ Room sizes are realistic and within standard ranges
☐ Total area fits within ${landArea} sq.ft plot boundary
☐ Rooms are logically arranged and connected
☐ All labels are correctly spelled, centered, and readable
☐ ${hasGarage ? 'Parking is on ' + garagePlacement + ' side' : 'No parking/garage drawn'}
☐ ${hasGarden ? 'Garden is placed as ' + gardenPlacement : 'No garden/lawn drawn'}
${preferences.vastuCompliant ? '☐ Vastu directions are followed' : ''}

=== OUTPUT REQUIREMENTS ===
- High resolution (minimum 4K quality)
- Sharp edges, no blur
- Print-ready for architects and contractors
- Must look exactly like a professional AutoCAD drawing
- Suitable for real Indian construction approval

If any validation rule fails, regenerate until all checks pass.
Generate the floor plan image now.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { landArea, plotLength, plotBreadth, northDirection, rooms, preferences } = await req.json();
    console.log("Generating floor plan:", JSON.stringify({ landArea, rooms: rooms?.length, style: preferences?.style }));

    const parsedLandArea = Number.parseFloat(String(landArea || "0"));
    if (!Number.isFinite(parsedLandArea) || parsedLandArea <= 0) {
      throw new Error('Invalid land area input');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const outdoorIds: string[] = Array.isArray(preferences?.outdoorFeatures)
      ? preferences.outdoorFeatures.map((f: unknown) => String(f).trim().toLowerCase()).filter(Boolean)
      : [];

    const hasGarage = outdoorIds.some(f => ["car_parking", "parking", "garage"].includes(f));
    const hasGarden = outdoorIds.some(f => ["garden", "front garden", "back garden", "landscape"].includes(f));
    const garagePlacement = hasGarage ? (preferences?.garagePlacement || "Front") : null;
    const gardenPlacement = hasGarden ? (preferences?.gardenPlacement || "Front Garden") : null;

    const { manifest, totalCount, checklist, totalArea } = buildRoomManifest(rooms);

    const plotDims = plotLength && plotBreadth
      ? `${plotLength}' × ${plotBreadth}'`
      : `${Math.round(Math.sqrt(parsedLandArea))}' × ${Math.round(parsedLandArea / Math.sqrt(parsedLandArea))}'`;

    const prompt = buildPrompt({
      landArea, plotLength, plotBreadth, northDirection, preferences,
      manifest, totalCount, checklist, totalArea, plotDims,
      hasGarage, hasGarden, garagePlacement, gardenPlacement,
    });

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

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment.", success: false }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits.", success: false }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = data.choices?.[0]?.message?.content || "Professional 2D CAD-style floor plan generated.";

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
