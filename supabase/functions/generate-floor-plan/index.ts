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

    const prompt = `You are a professional architect. Generate a PRECISE, HIGH-QUALITY 2D architectural floor plan image following strict CAD drafting standards.

SPECIFICATIONS:
- Plot: ${plotDimensions}, Total: ${landArea} sq ft, ${preferences.floors} floor(s), ${preferences.style} style
- North: ${northDirection || "Up"}
${preferences.vastuCompliant ? "- VASTU COMPLIANT: Follow traditional Vastu Shastra directional rules strictly." : ""}

ROOMS (use EXACT dimensions provided — do NOT change sizes):
   - ${roomDetails}

OUTDOOR FEATURES: ${outdoorFeatures}
Garage Placement: ${garagePlacement} | Garden Placement: ${gardenPlacement}

═══ DRAWING STANDARDS (follow precisely) ═══

LAYOUT RULES:
• Plot boundary: thick dark border with dimensions labeled on all 4 sides (e.g., "40'-0\"")
• Outer walls: 9" thick dark lines | Inner walls: 4.5" thick
• Each room MUST use the EXACT width × height dimensions specified above
• Room positions: Living near entrance with natural light, Kitchen adjacent to dining on exterior wall, Bedrooms in private zone at rear, Bathrooms share plumbing walls
• Hallway/corridor: 3.5'–5' wide connecting rooms
${preferences.vastuCompliant ? "• VASTU: Living=NE/E/N, Master Bedroom=SW, Kitchen=SE, Pooja=NE, Bathrooms=NW/W, Entrance=N/E" : ""}

COLOR-CODED ROOM FILLS (each room type gets a DISTINCT pastel color):
• Living Room → Light Blue (#D4E8FC)
• Master Bedroom → Light Peach (#FDDCBA)
• Bedroom → Light Lavender (#E8D4F0)
• Kitchen → Light Yellow (#FFF3CD)
• Dining → Soft Cyan (#D4F1F4)
• Bathroom → Light Aqua (#C8F0F0)
• Hallway/Corridor → Dotted Light Yellow
• Utility/Laundry → Pale Yellow (#FFF8DC)
• Pooja Room → Light Gold (#FFEEBA)
• Balcony/Sit-out → White with thin border
• Garden → Green (#D4EDDA) with tree/shrub symbols
• Parking → Light Grey (#E9ECEF) with car outline

ROOM LABELS (centered inside EVERY room, ALL three lines mandatory):
1. Room name in BOLD UPPERCASE (e.g., "MASTER BEDROOM")
2. "Area: XXX sq.ft" (calculated from width × height)
3. Dimensions: "12'-0\" × 14'-0\""
Font must be clearly legible — black text on colored background.

MANDATORY ELEMENTS:
• Doors: quarter-circle swing arcs, main door labeled "ENTRANCE"
• Windows: blue rectangles on exterior walls (larger for living/bedrooms)
• Furniture in EVERY room (simple grey outlines):
  - Living: sofa, coffee table, TV unit
  - Bedroom: bed rectangle, wardrobe, side tables
  - Kitchen: L-shaped counter, sink, stove, fridge
  - Dining: table with chairs
  - Bathroom: WC, shower, basin
  - Utility: washing machine circle
• Dimension lines with arrows on EVERY wall (feet-inches: "12'-0\"")
• North arrow: large "N" with arrow in top-left
• Staircase (if multi-floor): step lines with direction arrow
• Scale bar at bottom

LEGEND BOX (bordered, bottom-right corner):
Left: Wall/Door/Window/Furniture/Circulation symbol samples
Center: Color key squares for each room type
Right: "PROJECT: CasaMuse | STYLE: ${preferences.style} | SCALE: 1:50 | UNITS: Feet"

BACKGROUND: Light grey grid paper texture

CRITICAL:
- Every room MUST have its pastel color fill, furniture, AND complete label (name + area + dimensions)
- Proportions MUST match the specified dimensions exactly
- This must look like a REAL professional architect's colored floor plan
- HIGH RESOLUTION, clean lines, professional quality`;

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
