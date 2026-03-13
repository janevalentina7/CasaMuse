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

  return {
    manifest: lines.join("\n"),
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
    console.log("Generating floor plan:", JSON.stringify({ landArea, rooms: rooms?.length, style: preferences?.style }));

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

    const { manifest, totalCount, checklist, totalArea } = buildRoomManifest(rooms);

    const plotDims = plotLength && plotBreadth
      ? `${plotLength}' × ${plotBreadth}'`
      : `${Math.round(Math.sqrt(parsedLandArea))}' × ${Math.round(parsedLandArea / Math.sqrt(parsedLandArea))}'`;

    const prompt = `You are an AI architectural floor plan generator. Generate a clean, accurate, and realistic 2D house floor plan based STRICTLY on the inputs below. The plan must follow architectural standards and maintain logical room placement.

=== PLOT SPECIFICATIONS ===
- Plot Size: ${plotDims} = ${landArea} sq.ft total
- Architectural Style: ${preferences.style}
- Floors: ${preferences.floors}
- North Direction: ${northDirection || "Up"}
${preferences.vastuCompliant ? "- VASTU COMPLIANT: Living Room → NE, Master Bedroom → SW, Kitchen → SE, Pooja → NE, Bathroom → NW, Main Entry → N/E" : ""}

=== EXACT ROOM LIST (generate ONLY these ${totalCount} spaces) ===
${manifest}

Total built-up area: ~${totalArea} sq.ft (must fit within ${landArea} sq.ft plot with 10-15% for walls & circulation)

=== OUTDOOR FEATURES ===
${hasGarage ? `✅ Garage/Parking: Place on ${garagePlacement} side, connect to entrance pathway` : "❌ NO garage, parking, or driveway — do NOT draw any."}
${hasGarden ? `✅ Garden: Place as ${gardenPlacement}` : "❌ NO garden, lawn, or landscape — do NOT draw any."}

=== INPUT RULES (CRITICAL) ===
1. Use ONLY the rooms listed above. Do NOT add any extra rooms.
2. Do NOT generate storage rooms, closets, lobbies, foyers, passages, utility rooms, or any room not in the list.
3. No duplicate rooms unless explicitly listed above with numbering.
4. If total room area exceeds land size, reduce room sizes proportionally — never exceed plot boundary.

=== ROOM PLACEMENT LOGIC ===
- Living Room: Near main entrance
- Bedrooms: Private area, away from main entrance
- Kitchen: Adjacent to dining room or living room
- Bathrooms: Attached to bedrooms when specified, otherwise along hallways
- Dining Room: Between kitchen and living room
- Study Room: Quiet area, away from entrance
- Balcony: Attached to living room or bedroom exterior wall

=== LAYOUT RULES ===
- All rooms must have clear rectangular boundaries
- No rooms may overlap
- All rooms must be connected logically via hallways or doors
- Every room must be accessible
- Include walls, doors, and windows in the layout
- Outer walls: 9 inches thick (draw as thick black lines)
- Inner walls: 4.5 inches thick

=== DRAWING STYLE — 2D ARCHITECTURAL BLUEPRINT ===
- TOP-DOWN 2D VIEW ONLY — like an AutoCAD or architect's printed floor plan
- White/light background with clean black wall lines
- Draw a thick black rectangle for the plot boundary with dimension labels on all 4 sides
- Color-fill each room with distinct pastel colors:
  • Living Room = #D4E8FC (light blue)
  • Master Bedroom = #FDDCBA (light orange)
  • Bedroom = #E8D4F0 (light purple)
  • Kitchen = #FFF3CD (light yellow)
  • Dining = #D4F1F4 (light cyan)
  • Bathroom = #C8F0F0 (light teal)
  • Study = #FCE4EC (light pink)
  • Balcony = #E8F5E9 (light green)
  ${hasGarage ? "• Parking = #E9ECEF (light grey)" : ""}
  ${hasGarden ? "• Garden = #D4EDDA (green)" : ""}
  • Corridors/Hallways = #F5F5DC (beige) — do NOT label these as rooms

=== LABELING RULES (CRITICAL) ===
Every room MUST have clear, readable text CENTERED inside the room:
- Line 1: ROOM NAME in BOLD UPPERCASE (e.g., "LIVING ROOM", "KITCHEN", "MASTER BEDROOM")
- Line 2: Dimensions (e.g., "12' × 16'")
- Line 3: Area (e.g., "192 sq.ft")
- Use large, clean, sans-serif font
- Text must be BLACK and fully legible against the pastel background
- If multiple rooms of same type exist, number them: "BEDROOM 1", "BEDROOM 2", "BATHROOM 1", "BATHROOM 2"
- Avoid any spelling mistakes

=== ARCHITECTURAL SYMBOLS ===
- Doors: Quarter-circle arc swings, main door labeled "ENTRANCE"
- Windows: Double parallel lines on exterior walls
- Furniture outlines (light grey, simple):
  • Living: sofa + coffee table
  • Bedroom: bed rectangle + side table
  • Kitchen: L-shaped counter + sink circle
  • Dining: table + chairs
  • Bathroom: WC symbol + basin
- North arrow in top-left corner
- Scale bar at bottom
- Title block (bottom-right): "CasaMuse ${preferences.style} | ${plotDims} | ${landArea} sq.ft"

=== VALIDATION CHECKLIST (verify before final output) ===
☐ Room count matches EXACTLY: ${checklist}
☐ No extra rooms beyond the list above
☐ No duplicate rooms unless user requested multiples
☐ Room sizes are realistic and within standard ranges
☐ Total area fits within ${landArea} sq.ft plot boundary
☐ Rooms are logically arranged and connected
☐ All labels are correctly spelled, centered, and readable
☐ ${hasGarage ? "Parking is on " + garagePlacement + " side" : "No parking/garage drawn"}
☐ ${hasGarden ? "Garden is placed as " + gardenPlacement : "No garden/lawn drawn"}
${preferences.vastuCompliant ? "☐ Vastu directions are followed" : ""}

If any validation rule fails, regenerate the floor plan until all checks pass.

Generate the floor plan image now.`;

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
