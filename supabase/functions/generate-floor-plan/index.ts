import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { landArea, plotLength, plotBreadth, northDirection, rooms, preferences } = await req.json();

    console.log("Generating floor plan with data:", { landArea, plotLength, plotBreadth, northDirection, rooms, preferences });

    const parsedLandArea = Number.parseFloat(String(landArea || "0"));
    if (!Number.isFinite(parsedLandArea) || parsedLandArea <= 0) {
      throw new Error('Invalid land area input');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const outdoorFeatureIds: string[] = Array.isArray(preferences?.outdoorFeatures)
      ? preferences.outdoorFeatures
          .map((feature: unknown) => String(feature).trim().toLowerCase())
          .filter(Boolean)
      : [];

    const garageFeatureAliases = ["car_parking", "car parking", "parking", "garage"];
    const gardenFeatureAliases = ["garden", "front garden", "back garden", "landscape", "landscaping"];

    const hasGarage = outdoorFeatureIds.some((feature) => garageFeatureAliases.includes(feature));
    const hasGarden = outdoorFeatureIds.some((feature) => gardenFeatureAliases.includes(feature));

    const selectedOutdoorFeatures = [
      ...(hasGarage ? [`Garage/Parking (${preferences?.garagePlacement || "Front"})`] : []),
      ...(hasGarden ? [`Garden (${preferences?.gardenPlacement || "Front Garden"})`] : []),
      ...outdoorFeatureIds
        .filter((feature) => !garageFeatureAliases.includes(feature) && !gardenFeatureAliases.includes(feature))
        .map((feature) => feature.replace(/_/g, " ")),
    ];

    const forbiddenOutdoorFeatures = [
      ...(!hasGarage ? ["Garage", "Car Parking", "Driveway", "Parking Bay"] : []),
      ...(!hasGarden ? ["Garden", "Lawn", "Landscape Zone", "Planter Bed"] : []),
    ];

    // Build strict room manifest — the ONLY rooms allowed
    const roomManifest: string[] = [];
    const roomChecklist: string[] = [];
    let totalRoomArea = 0;

    const prompt = `You are a professional architectural planning AI. Generate ONE clean, accurate, construction-style 2D floor plan image.

═══════════════════════════════════════════
 STEP 1 — INPUT VALIDATION (MANDATORY)
═══════════════════════════════════════════
Allowed Room List (ONLY these rooms exist — nothing else):
${roomManifest.join("\n")}

Total allowed rooms: ${roomManifest.length}
⚠️ ONLY rooms in this list may appear. Zero exceptions.

═══════════════════════════════════════════
 STEP 2 — ROOM GENERATION RULES
═══════════════════════════════════════════
• Generate EXACTLY the number of rooms specified above.
• If 3 bedrooms requested → draw exactly 3. If 1 kitchen → draw exactly 1.
❌ Do NOT add extra rooms.
❌ Do NOT create duplicate rooms beyond the specified count.
❌ Do NOT add these unless explicitly listed above:
   Storage room, Closet, Corridor label, Hallway label, Utility room, Pantry, Study room, Wash area, Lobby, Foyer, Passage
• Circulation space (corridors) connects rooms but is NOT labeled as a separate room.

═══════════════════════════════════════════
 PROJECT BRIEF
═══════════════════════════════════════════
• Plot Size: ${plotDimensions} (Total: ${landArea} sq ft)
• Floors: ${preferences.floors}
• Style: ${preferences.style}
• North Direction: ${northDirection || "Up"}
${preferences.vastuCompliant ? "• VASTU SHASTRA COMPLIANT — follow directional placement rules." : ""}
• Corridors/Circulation: ~${circulationArea > 0 ? circulationArea : 30} sq.ft (unlabeled connecting space)
${outdoorFeatures ? `• Outdoor Features: ${outdoorFeatures}` : "• Outdoor Features: NONE — do NOT draw any garden, garage, parking, or outdoor areas."}
${garagePlacement ? `• Garage Placement: ${garagePlacement} side` : "• ⚠️ NO GARAGE — do NOT draw any garage or parking area."}
${gardenPlacement ? `• Garden Placement: ${gardenPlacement}` : "• ⚠️ NO GARDEN — do NOT draw any garden area."}

═══════════════════════════════════════════
 STEP 3 — LAYOUT PLANNING
═══════════════════════════════════════════
Arrange rooms logically within the plot:
• Entrance → Living Room → Dining → Kitchen
• Bedrooms → private rear zone, away from entrance
• Bathrooms → share plumbing walls; attached baths adjoin their bedroom
• Walking corridors → 3.5'–5' wide (NOT labeled as rooms)
• All rooms → rectangular shapes, no overlapping
• PLOT BOUNDARY: Thick black rectangle with dimension lines on all 4 sides.
• WALLS: Outer = 9" thick dark lines. Inner partitions = 4.5".
${preferences.vastuCompliant ? `VASTU PLACEMENT:
   - Living Room → NE / E / N
   - Master Bedroom → SW
   - Kitchen → SE (cooking facing East)
   - Pooja Room → NE
   - Bathrooms → NW / W
   - Entrance → N or E` : ""}

═══════════════════════════════════════════
 STEP 4 — DUPLICATE ROOM PREVENTION
═══════════════════════════════════════════
Before rendering, COUNT every room drawn:
${roomChecklist.join("\n")}
If any room count exceeds the allowed list → REMOVE the extra immediately.
The final output MUST exactly match the input counts.

═══════════════════════════════════════════
 STEP 5 — CORRECT LABELING
═══════════════════════════════════════════
Every room MUST show exactly 3 centered lines:
  Line 1: ROOM NAME — BOLD UPPERCASE (e.g., "MASTER BEDROOM")
  Line 2: Area: [w × h] sq.ft
  Line 3: Dimensions (e.g., 12'-0" × 14'-0")
• Black text, legible on pastel background.
• Standard architectural names ONLY. Correct spelling required.
✔ Living Room  ✔ Master Bedroom  ✔ Bedroom  ✔ Kitchen
✔ Dining Area  ✔ Bathroom  ✔ Balcony  ✔ Toilet
❌ No spelling mistakes. ❌ No incomplete words. ❌ No made-up names.

═══════════════════════════════════════════
 STEP 6 — ARCHITECTURAL DRAWING QUALITY
═══════════════════════════════════════════
COLOR-CODED ROOMS:
• Living Room → #D4E8FC    • Master Bedroom → #FDDCBA
• Bedroom → #E8D4F0        • Kitchen → #FFF3CD
• Dining → #D4F1F4         • Bathroom/Toilet → #C8F0F0
• Corridor → #F5F5DC       • Utility → #FFF8DC
• Pooja Room → #FFEEBA     • Study/Office → #E8EAF6
• Balcony → #FFFFFF border
${hasGarden ? "• Garden → #D4EDDA" : ""}
${hasGarage ? "• Parking/Garage → #E9ECEF" : ""}

ARCHITECTURAL SYMBOLS:
DOORS: Quarter-circle swing arcs. Main entrance = thicker arc labeled "ENTRANCE".
WINDOWS: Parallel blue lines on exterior walls.
FURNITURE (grey outlines):
  Living → sofa, coffee table, TV unit
  Bedroom → bed + pillow marks, wardrobe, side tables
  Master Bedroom → king bed, walk-in wardrobe, dressing table
  Kitchen → L-counter, sink ○, stove □□, fridge □
  Dining → table + chair ○/□
  Bathroom → WC □, shower, basin ○
DIMENSIONS: Lines with ticks on every wall. Format: feet-inches (12'-0").
${preferences.floors > 1 ? "STAIRCASE: Step lines with UP arrow, labeled 'UP'." : ""}

TITLE BLOCK & LEGEND:
• NORTH ARROW: Bold "N" + arrow, top-left corner.
• SCALE BAR: Bottom center — "Scale: 1:50".
• TITLE BLOCK (bottom-right): "CasaMuse — ${preferences.style} Residence" | Plot: ${plotDimensions} | ${landArea} sq.ft
• COLOR LEGEND: Small swatches with room type names.

═══════════════════════════════════════════
 STEP 7 — FINAL VALIDATION CHECK
═══════════════════════════════════════════
Before output, verify ALL of these:
☐ Generated room count matches input: ${roomManifest.length} rooms exactly?
☐ No extra rooms added (no storage, closet, hallway, utility, etc.)?
☐ No duplicate rooms beyond specified count?
☐ All labels spelled correctly with 3-line format?
☐ All dimensions match the manifest?
☐ Plot boundary with 4-side dimensions drawn?
☐ Professional blueprint quality — clean lines, no artifacts?

ONLY generate the image after ALL 7 steps are validated.`;


    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
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

    if (!imageUrl) {
      throw new Error('No image generated');
    }

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
