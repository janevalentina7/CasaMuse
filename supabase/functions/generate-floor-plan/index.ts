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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build strict room manifest — the ONLY rooms allowed
    const roomManifest: string[] = [];
    const roomChecklist: string[] = [];
    let totalRoomArea = 0;

    rooms.forEach((room: any) => {
      const count = room.count || 1;
      const area = room.width * room.height;
      totalRoomArea += area * count + (room.attachedBathroom ? 40 * count : 0);

      for (let i = 0; i < count; i++) {
        const label = count > 1 ? `${room.roomName} ${i + 1}` : room.roomName;
        roomManifest.push(`• ${label}: ${room.width}'-0" × ${room.height}'-0" (${area} sq.ft)${room.attachedBathroom ? ` + Attached Bathroom 5'-0" × 8'-0" (40 sq.ft)` : ''}`);
        roomChecklist.push(`☐ ${label} — drawn? labeled? colored? furnished?`);
        if (room.attachedBathroom) {
          roomChecklist.push(`☐ Bathroom (${label}) — drawn? labeled? colored? furnished?`);
        }
      }
    });

    const circulationArea = Math.max(0, Math.round(parseFloat(landArea) - totalRoomArea));
    const outdoorFeatures = preferences.outdoorFeatures?.join(", ") || "None";
    const plotDimensions = plotLength && plotBreadth 
      ? `${plotLength}'-0" × ${plotBreadth}'-0"` 
      : `Approx. ${Math.round(Math.sqrt(parseFloat(landArea)))}'-0" × ${Math.round(parseFloat(landArea) / Math.sqrt(parseFloat(landArea)))}'-0"`;
    const garagePlacement = preferences.garagePlacement || "Front";
    const gardenPlacement = preferences.gardenPlacement || "Front Garden";

    const prompt = `You are a licensed architect. Generate ONE precise, HIGH-QUALITY 2D architectural floor plan image.

═══════════════════════════════════════════
 ABSOLUTE RULE — READ FIRST
═══════════════════════════════════════════
You MUST draw EXACTLY and ONLY the ${roomManifest.length} room(s) listed below.
• Adding ANY room not listed = FAILURE.
• Omitting ANY listed room = FAILURE.
• Duplicating ANY room beyond its count = FAILURE.
• Every room MUST have correct spelling, label, color, and furniture.

═══════════════════════════════════════════
 PROJECT BRIEF
═══════════════════════════════════════════
• Plot Size: ${plotDimensions} (Total: ${landArea} sq ft)
• Floors: ${preferences.floors}
• Style: ${preferences.style}
• North Direction: ${northDirection || "Up"}
${preferences.vastuCompliant ? "• VASTU SHASTRA COMPLIANT — follow directional placement rules." : ""}

═══════════════════════════════════════════
 EXACT ROOM MANIFEST (${roomManifest.length} rooms total)
═══════════════════════════════════════════
${roomManifest.join("\n")}
• Corridors/Circulation: ~${circulationArea > 0 ? circulationArea : 30} sq.ft (connect rooms logically)

OUTDOOR: ${outdoorFeatures}
Garage: ${garagePlacement} side | Garden: ${gardenPlacement}

═══════════════════════════════════════════
 ROOM DIMENSIONS — MANDATORY SIZES
═══════════════════════════════════════════
Each room MUST match its EXACT width × height from the manifest above.
Standard reference sizes (use only if user didn't specify):
• Living Room: Small 10×12, Medium 12×16, Large 14×18 ft
• Master Bedroom: Small 10×12, Medium 12×14, Large 14×16 ft
• Bedroom: Small 9×10, Medium 10×12, Large 11×13 ft
• Kitchen: Small 7×8, Medium 8×10, Large 10×12 ft
• Dining Area: Small 8×10, Medium 10×12, Large 12×14 ft
• Bathroom: Small 5×7, Medium 6×8, Large 7×10 ft
• Toilet: Small 4×4, Medium 4×5, Large 5×6 ft

═══════════════════════════════════════════
 LAYOUT RULES
═══════════════════════════════════════════
1. PLOT BOUNDARY: Thick black rectangle. Label ALL four sides with dimension lines + arrows.
2. WALLS: Outer = 9" thick dark lines. Inner partitions = 4.5".
3. PLACEMENT:
   - Living Room → near main entrance, exterior wall for light
   - Kitchen → adjacent to Dining, exterior wall for ventilation
   - Bedrooms → private rear zone, away from entrance
   - Bathrooms → share plumbing walls; attached baths adjoin their bedroom
   - Corridors → 3.5'–5' wide
${preferences.vastuCompliant ? `4. VASTU:
   - Living Room → NE / E / N
   - Master Bedroom → SW
   - Kitchen → SE (cooking facing East)
   - Pooja Room → NE
   - Bathrooms → NW / W
   - Entrance → N or E` : ""}

═══════════════════════════════════════════
 COLOR-CODED ROOMS
═══════════════════════════════════════════
• Living Room → #D4E8FC    • Master Bedroom → #FDDCBA
• Bedroom → #E8D4F0        • Kitchen → #FFF3CD
• Dining → #D4F1F4         • Bathroom/Toilet → #C8F0F0
• Corridor → #F5F5DC       • Utility → #FFF8DC
• Pooja Room → #FFEEBA     • Study/Office → #E8EAF6
• Balcony → #FFFFFF border  • Garden → #D4EDDA
• Parking/Garage → #E9ECEF

═══════════════════════════════════════════
 ROOM LABELS (centered inside each room)
═══════════════════════════════════════════
Every room MUST show exactly 3 centered lines:
  Line 1: ROOM NAME — BOLD UPPERCASE (e.g., "MASTER BEDROOM")
  Line 2: Area: [w × h] sq.ft
  Line 3: Dimensions (e.g., 12'-0" × 14'-0")
• Black text, legible on pastel background. Correct spelling only.

═══════════════════════════════════════════
 ARCHITECTURAL SYMBOLS
═══════════════════════════════════════════
DOORS: Quarter-circle swing arcs. Main entrance = thicker arc labeled "ENTRANCE".
WINDOWS: Parallel blue lines on exterior walls. Larger for Living/Bedrooms.
FURNITURE (grey outlines):
  Living → sofa, coffee table, TV unit
  Bedroom → bed + pillow marks, wardrobe, side tables
  Master Bedroom → king bed, walk-in wardrobe, dressing table
  Kitchen → L-counter, sink ○, stove □□, fridge □
  Dining → table + chair ○/□
  Bathroom → WC □, shower, basin ○
  Study → desk, chair, bookshelf
DIMENSIONS: Lines with ticks on every wall. Format: feet-inches (12'-0").
${preferences.floors > 1 ? "STAIRCASE: Step lines with UP arrow, labeled 'UP'." : ""}

═══════════════════════════════════════════
 TITLE BLOCK & LEGEND
═══════════════════════════════════════════
• NORTH ARROW: Bold "N" + arrow, top-left corner.
• SCALE BAR: Bottom center — "Scale: 1:50" with graduated bar.
• TITLE BLOCK (bottom-right bordered box):
  "CasaMuse — ${preferences.style} Residence"
  "Plot: ${plotDimensions} | ${landArea} sq.ft | ${preferences.floors} Floor(s)"
  "Scale: 1:50 | Units: Feet-Inches | North: ${northDirection || 'Up'}"
• COLOR LEGEND: Small box with color swatches + room type names.

═══════════════════════════════════════════
 PRE-RENDER VALIDATION CHECKLIST
═══════════════════════════════════════════
Before generating the image, verify EACH item:
${roomChecklist.join("\n")}
☐ No extra rooms added beyond the ${roomManifest.length} listed?
☐ All labels spelled correctly?
☐ All dimensions match the manifest?
☐ Plot boundary with 4-side dimensions drawn?
☐ Professional quality — clean lines, no artifacts?

ONLY generate the image after ALL checks pass.`;


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
