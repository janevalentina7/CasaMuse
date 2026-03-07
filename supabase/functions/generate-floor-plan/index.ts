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

    // Build unique room list — prevent duplicates unless user explicitly requested multiple
    const roomCounts: Record<string, number> = {};
    rooms.forEach((room: any) => {
      roomCounts[room.roomName] = (roomCounts[room.roomName] || 0) + room.count;
    });

    const roomDetails = rooms.map((room: any) => {
      const area = room.width * room.height;
      let info = `${room.count}x ${room.roomName} (${room.width}'-0" × ${room.height}'-0", Area: ${area} sq.ft)`;
      if (room.attachedBathroom) info += " with attached bathroom (5'-0\" × 8'-0\", Area: 40 sq.ft)";
      return info;
    }).join("\n   - ");

    const totalRoomArea = rooms.reduce((sum: number, r: any) => sum + (r.width * r.height * r.count) + (r.attachedBathroom ? 40 * r.count : 0), 0);
    const circulationArea = Math.round(parseFloat(landArea) - totalRoomArea);

    const outdoorFeatures = preferences.outdoorFeatures?.join(", ") || "None";
    const plotDimensions = plotLength && plotBreadth ? `${plotLength}'-0" × ${plotBreadth}'-0"` : `Approx. ${Math.round(Math.sqrt(parseFloat(landArea)))}'-0" × ${Math.round(parseFloat(landArea) / Math.sqrt(parseFloat(landArea)))}'-0"`;
    const garagePlacement = preferences.garagePlacement || "Front";
    const gardenPlacement = preferences.gardenPlacement || "Front Garden";

    const prompt = `Generate a single, precise, HIGH-QUALITY 2D architectural floor plan image. You are acting as a licensed architect producing construction-ready drawings.

══════════════════════════════════════════
PROJECT BRIEF
══════════════════════════════════════════
• Plot Size: ${plotDimensions} (Total: ${landArea} sq ft)
• Floors: ${preferences.floors}
• Style: ${preferences.style}
• North Direction: ${northDirection || "Up"}
${preferences.vastuCompliant ? "• VASTU SHASTRA COMPLIANT — strictly follow directional placement rules." : ""}

══════════════════════════════════════════
ROOM SCHEDULE (DO NOT ADD OR DUPLICATE ROOMS)
══════════════════════════════════════════
Only draw these rooms — no extras, no duplicates:
   - ${roomDetails}
• Remaining ~${circulationArea > 0 ? circulationArea : 30} sq.ft allocated to corridors/circulation.

OUTDOOR: ${outdoorFeatures}
Garage: ${garagePlacement} side | Garden: ${gardenPlacement}

══════════════════════════════════════════
ARCHITECTURAL LAYOUT RULES
══════════════════════════════════════════
1. PLOT BOUNDARY: Draw a thick black rectangular border. Label ALL four sides with exact dimensions using dimension lines with arrows/ticks (e.g., "30'-0\"").
2. WALL THICKNESS: Outer walls = 9" (draw as thick dark parallel lines). Inner partition walls = 4.5".
3. ROOM SIZING: Each room MUST match the EXACT width × height specified above. Do not resize or reshape.
4. PLACEMENT LOGIC:
   - Living Room: Near main entrance, receives natural light from exterior wall.
   - Kitchen: Adjacent to Dining Room, on an exterior wall for ventilation.
   - Bedrooms: In the private rear zone, away from entrance.
   - Bathrooms: Share plumbing walls where possible. Attached baths adjoin their bedroom.
   - Corridors: 3.5'–5' wide, connecting all rooms logically.
${preferences.vastuCompliant ? `5. VASTU PLACEMENT:
   - Living Room → North-East / East / North
   - Master Bedroom → South-West
   - Kitchen → South-East (cooking facing East)
   - Pooja Room → North-East
   - Bathrooms → North-West / West
   - Main Entrance → North or East` : ""}

══════════════════════════════════════════
VISUAL STANDARDS — COLOR-CODED ROOMS
══════════════════════════════════════════
Fill each room with its designated pastel color:
• Living Room      → #D4E8FC (Light Blue)
• Master Bedroom   → #FDDCBA (Light Peach)
• Bedroom          → #E8D4F0 (Light Lavender)
• Kitchen          → #FFF3CD (Light Yellow)
• Dining Room      → #D4F1F4 (Soft Cyan)
• Bathroom         → #C8F0F0 (Light Aqua)
• Corridor/Hallway → #F5F5DC (Beige, light dotted)
• Utility/Laundry  → #FFF8DC (Pale Cream)
• Pooja Room       → #FFEEBA (Light Gold)
• Study/Office     → #E8EAF6 (Soft Indigo)
• Balcony/Sit-out  → #FFFFFF with thin border
• Garden           → #D4EDDA (Soft Green) with tree symbols
• Parking/Garage   → #E9ECEF (Light Grey) with car outline

══════════════════════════════════════════
MANDATORY ROOM LABELS (centered inside each room)
══════════════════════════════════════════
Every room MUST display exactly 3 lines of text, horizontally centered:
  Line 1: ROOM NAME in BOLD UPPERCASE (e.g., "MASTER BEDROOM")
  Line 2: Area: [width × height] sq.ft (e.g., "Area: 168 sq.ft")
  Line 3: Dimensions (e.g., "12'-0\" × 14'-0\"")
• Text: Black, clearly legible on the pastel background.
• Spelling must be correct — no abbreviations, no typos.

══════════════════════════════════════════
ARCHITECTURAL SYMBOLS (mandatory in every room)
══════════════════════════════════════════
DOORS:
  • Quarter-circle swing arcs showing door direction.
  • Main entrance door labeled "ENTRANCE" with a thicker arc.
  • Interior doors between every room and corridor.

WINDOWS:
  • Drawn as parallel blue lines on exterior walls.
  • Larger windows for Living Room and Bedrooms.
  • Smaller windows for Kitchen and Bathrooms.

FURNITURE (draw simple grey outlines inside rooms):
  • Living Room: Sofa (L-shape or straight), coffee table, TV unit
  • Bedroom: Bed rectangle with pillow marks, wardrobe rectangle, side tables
  • Master Bedroom: King bed, walk-in wardrobe, dressing table, side tables
  • Kitchen: L-shaped or parallel counter, sink circle, stove squares, fridge rectangle
  • Dining Room: Rectangular table with chair circles/squares
  • Bathroom: WC rectangle, shower/tub, wash basin circle
  • Study: Desk rectangle, chair, bookshelf
  • Utility: Washing machine circle, drying rack

DIMENSIONS:
  • Dimension lines with arrows/ticks on EVERY wall segment (interior and exterior).
  • Format: feet-inches (e.g., "12'-0\"").
  • Place outside the plot boundary for exterior walls, inside for partitions.

══════════════════════════════════════════
ADDITIONAL ELEMENTS
══════════════════════════════════════════
• NORTH ARROW: Large, bold "N" with directional arrow in top-left corner.
• SCALE BAR: At bottom center — "Scale: 1:50" with graduated bar.
${preferences.floors > 1 ? "• STAIRCASE: Show step lines with UP arrow direction, labeled 'UP'." : ""}
• TITLE BLOCK (bottom-right, bordered box):
  Row 1: "CasaMuse — ${preferences.style} Residence"
  Row 2: "Plot: ${plotDimensions} | Total: ${landArea} sq.ft | ${preferences.floors} Floor(s)"
  Row 3: "Scale: 1:50 | Units: Feet-Inches | North: ${northDirection || 'Up'}"
• COLOR LEGEND: Small bordered box showing color swatches with room type names.

══════════════════════════════════════════
CRITICAL RULES — READ CAREFULLY
══════════════════════════════════════════
✗ DO NOT add rooms that are not in the Room Schedule above.
✗ DO NOT duplicate any room unless the count explicitly says 2x or more.
✗ DO NOT leave any room without its 3-line label, color fill, AND furniture.
✗ DO NOT misspell room names.
✗ DO NOT make rooms larger or smaller than specified dimensions.
✓ Every wall must have dimension markings.
✓ The plan must look like a real architect's professional colored floor plan.
✓ Clean lines, high resolution, no visual artifacts.
✓ White or very light grey background (no heavy grid).`;

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
