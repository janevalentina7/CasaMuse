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

    const roomDetails = rooms.map((room: any) => {
      let info = `${room.count}x ${room.roomName} (${room.size}: ${room.width}'×${room.height}')`;
      if (room.attachedBathroom) info += " with attached bathroom (5'×8')";
      return info;
    }).join("\n   - ");

    const outdoorFeatures = preferences.outdoorFeatures?.join(", ") || "None";
    const plotDimensions = plotLength && plotBreadth ? `${plotLength}' × ${plotBreadth}'` : `${landArea} sq ft`;
    const garagePlacement = preferences.garagePlacement || "Front";
    const gardenPlacement = preferences.gardenPlacement || "Front Garden";

    const prompt = `Generate a PROFESSIONAL 2D architectural floor plan image that looks EXACTLY like a real architect's CAD drawing. Follow this EXACT visual style:

PLOT: ${plotDimensions} plot, ${landArea} sq ft total area, ${preferences.floors} floor(s), ${preferences.style} style.
North Direction: ${northDirection || "North"}
${preferences.vastuCompliant ? "VASTU COMPLIANT: Yes — place rooms per Vastu directions." : ""}

ROOMS:
   - ${roomDetails}

OUTDOOR: ${outdoorFeatures}
Garage: ${garagePlacement} | Garden: ${gardenPlacement}

═══ MANDATORY VISUAL STYLE (follow EXACTLY) ═══

1. PLOT BOUNDARY: Draw a thick dark border showing the full plot boundary. Label "PLOT BOUNDARY" at top-right and bottom-right corners. Show overall dimensions (e.g., "40'-0\"") along all four sides outside the boundary.

2. COLORED ROOM FILLS (CRITICAL — each room type gets a DISTINCT pastel color):
   - Living Room: Light Blue fill
   - Master Bedroom: Light Peach/Salmon fill
   - Bedrooms: Light Lavender/Purple fill
   - Kitchen: Light Yellow/Cream fill
   - Dining Area: Light Blue (slightly different shade from living)
   - Bathrooms: Light Cyan/Aqua fill
   - Hallway/Corridor: Light Yellow dotted pattern
   - Utility/Laundry: Light Yellow fill
   - Pooja Room: Light Yellow fill
   - Balcony/Sit-out: White fill with border
   - Garden areas: GREEN fill with small tree/shrub symbols
   - Parking: Light Grey fill with car symbol drawn inside

3. WALLS: Dark grey/black thick lines (9" outer walls, 4.5" inner walls). Clearly visible wall thickness.

4. ROOM LABELS (EVERY room MUST have centered inside):
   - Room name in BOLD CAPS (e.g., "MASTER BEDROOM")
   - "Area: XXX sq.ft" below the name
   - Dimensions: "12'-0\" x 13'-0\"" below area
   - Use clear readable font

5. DOORS: Show door swing arcs (quarter-circle arcs). Main door clearly labeled "ENTRANCE DOOR".

6. WINDOWS: Blue rectangular symbols on exterior walls. Larger for living/bedrooms, smaller for bathrooms.

7. FURNITURE (drawn inside every room — NO empty rooms):
   - Living: Sofa, coffee table, TV unit
   - Bedrooms: Bed (rectangle), wardrobe, side tables
   - Kitchen: L-shaped or parallel countertop, sink circle, stove, refrigerator rectangle
   - Dining: Dining table with chairs
   - Bathrooms: WC, shower, wash basin
   - Utility: Washing machine circle
   - Draw furniture as simple grey outlines/fills

8. DIMENSION LINES: Show dimensions for EVERY room wall with arrow lines and measurements in feet-inches format (e.g., "12'-0\"", "9'-0\""). Also show external plot dimensions.

9. STAIRCASE: If multi-floor, show staircase with step lines and direction arrow.

10. NORTH ARROW: Large "N" with arrow in top-left corner.

11. GARDEN/LANDSCAPE: Green colored areas with small circular tree symbols. Label "GARDEN".

12. PARKING: Show car outline drawn inside parking area. Label with dimensions.

13. LEGEND BOX (bottom-right corner, bordered):
    Left section:
    - Wall: solid dark line sample
    - Door: arc symbol sample  
    - Window: blue rectangle sample
    - Furniture: grey rectangle sample
    - Circulation: dotted sample
    Right section - Wall Colors:
    - Living (blue square)
    - Bedrooms (peach/purple squares)
    - Garden (green square)
    - Utility (yellow square)
    Far right - Project info:
    - "PROJECT: CasaMuse - AI Generated Floor Plan"
    - "STYLE: ${preferences.style}"
    - "SCALE: 1:50"
    - "UNITS: Feet"
    - "DATE: Auto-generated"

14. ROOM PLACEMENT:
    - Entrance → Living Room near front with natural light
    - Kitchen adjacent to dining + exterior wall for ventilation
    - Bedrooms in private rear zone
    - Bathrooms share plumbing walls
    - Hallway connects bedrooms (3.5'-5' wide)
    ${preferences.vastuCompliant ? `
    VASTU: Living=NE/E/N, Master Bedroom=SW, Kitchen=SE, Pooja=NE, Bathrooms=NW/W, Entrance=N/E` : ''}

15. BACKGROUND: Light grey/off-white grid paper look.

CRITICAL RULES:
- Every single room MUST be filled with its designated pastel color
- Every room MUST have furniture drawn inside
- Every room MUST be labeled with name + area + dimensions
- All walls must show proper thickness
- The plan must look like a REAL architect's colored CAD floor plan
- Include the full plot boundary with gardens and parking OUTSIDE the house structure
- Make it HIGH RESOLUTION and PROFESSIONAL`;

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
