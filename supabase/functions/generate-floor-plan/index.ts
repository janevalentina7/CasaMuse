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

    // Build detailed room list
    const roomDetails = rooms.map((room: any) => {
      let info = `${room.count}x ${room.roomName} (${room.size}: ${room.width}'×${room.height}')`;
      if (room.attachedBathroom) info += " with attached bathroom (5'×8')";
      return info;
    }).join("\n   - ");

    const outdoorFeatures = preferences.outdoorFeatures?.join(", ") || "None";
    const plotDimensions = plotLength && plotBreadth ? `${plotLength}' × ${plotBreadth}'` : `${landArea} sq ft (rectangular)`;
    const garagePlacement = preferences.garagePlacement || "Front";
    const gardenPlacement = preferences.gardenPlacement || "Front Garden";

    const prompt = `You are an Advanced Architectural Planning AI. Generate a PROFESSIONAL, CONSTRUCTION-READY 2D floor plan equivalent to AutoCAD/Revit/ArchiCAD drawings, following INDIAN RESIDENTIAL CONSTRUCTION STANDARDS.

═══════════════════════════════════════════
PROPERTY SPECIFICATIONS
═══════════════════════════════════════════
• Total Land Area: ${landArea} sq ft
• Plot Dimensions: ${plotDimensions}
• Number of Floors: ${preferences.floors}
• North Direction: ${northDirection || "North"}
• Architectural Style: ${preferences.style}
• Vastu Compliant: ${preferences.vastuCompliant ? "YES — strictly follow Vastu room placement" : "No — optimize for functionality"}
• Dynamic Scaling: ${preferences.dynamicScaling ? "Enabled — adjust proportionally if rooms exceed plot" : "Disabled"}

═══════════════════════════════════════════
ROOMS REQUIRED (with Indian standard sizes)
═══════════════════════════════════════════
   - ${roomDetails}

═══════════════════════════════════════════
OUTDOOR FEATURES & PLACEMENT
═══════════════════════════════════════════
• Selected Features: ${outdoorFeatures}
• Garage/Parking Placement: ${garagePlacement}
  - Min size: 9'×18' (small car), 10'×20' (SUV)
  - Must have driveway access from road side
• Garden Placement: ${gardenPlacement}
  - Ensure sunlight exposure, walking pathways
  - Don't block ventilation windows

═══════════════════════════════════════════
MANDATORY DRAWING REQUIREMENTS
═══════════════════════════════════════════

1. WALL DRAWING:
   - Wall thickness: 4.5"–9" (shown accurately)
   - Load-bearing walls clearly marked
   - Pillar/column positions shown

2. DOORS (with swing arcs):
   - Main Door: 3.5'–4' × 7' (show swing arc)
   - Room Doors: 3' × 7' (show swing arc)
   - Bathroom Doors: 2.5' × 7' (show swing arc)
   - Label each: D1, D2, D3...

3. WINDOWS (with symbols):
   - Living: 5' × 4'
   - Bedroom: 4' × 4'
   - Bathroom: 2' × 1.5'
   - Kitchen: must have exterior ventilation window
   - Label each: W1, W2, W3...

4. ROOM LABELS (EVERY room MUST have):
   - Room name in LARGE BOLD text centered in room
   - Dimensions below: "12' × 14'" format
   - Use contrasting color for readability

5. DIMENSION LINES & ARROWS:
   - Internal dimensions for EVERY room wall
   - External dimensions for overall plot
   - Measurement arrows with feet/inches

6. FURNITURE LAYOUT (MANDATORY — no empty rooms):
   Living Room: Sofa set, coffee table, TV unit, seating circulation
   Master Bedroom: King/Queen bed, wardrobe, side tables, dressing area
   Bedrooms: Bed, study table, wardrobe
   Kitchen: L/Parallel countertops, sink, stove, refrigerator, storage cabinets
   Dining: Dining table (4-6 seating), movement clearance
   Bathroom: WC, shower, wash basin (all drawn)
   Utility: Washing machine space, sink provision
   Balcony: Railing, access door

7. STRUCTURAL ELEMENTS:
   - Staircase: 3'–4' width, riser 6"–7", tread 10"–11", show step direction
   - Minimum staircase area: 6' × 10'
   - Pillars and beams marked

8. UTILITIES LAYOUT:
   - Electrical points & switchboard locations
   - Plumbing lines (kitchen, bathroom share walls)
   - AC unit locations
   - Washing machine & geyser points
   - Drainage direction

═══════════════════════════════════════════
ROOM PLACEMENT RULES
═══════════════════════════════════════════
• Entrance → Foyer → Living Room (near entrance, natural light)
• Kitchen adjacent to dining + exterior wall for ventilation
• Bedrooms in private rear zone, NOT directly visible from entrance
• Bathrooms share plumbing walls for efficiency
• Balcony connected to living room or bedrooms
• Hallway/corridor width: 3.5'–5' (connects bedrooms privately)
• Utility area behind kitchen
${preferences.vastuCompliant ? `
VASTU PLACEMENT (MANDATORY):
• Living Room: North-East / East / North
• Master Bedroom: South-West
• Kitchen: South-East (Agni corner)
• Dining: West / East
• Bathrooms: North-West / West (avoid North-East)
• Pooja Room: North-East
• Study: North / North-East
• Entrance: North / East facing preferred
• Staircase: South / South-West
` : ''}

═══════════════════════════════════════════
VISUAL STYLE & COLOR CODING
═══════════════════════════════════════════
• Walls: Dark Grey (#333)
• Room fills: Soft distinct pastel colors (each room type different)
• Furniture: Light Grey (#AAA) with outlines
• Doors/Windows: Blue (#2563EB)
• Measurements/Labels: Black, crisp, readable
• Background: White/very light grey
• Style: Professional CAD drafting — clean lines, precise, realistic

═══════════════════════════════════════════
LEGEND BOX (bottom-right corner)
═══════════════════════════════════════════
• Scale indicator: 1:50 or 1:100
• North direction arrow (pointing to ${northDirection || "North"})
• Total built-up area calculation
• Door schedule (D1, D2... with sizes)
• Window schedule (W1, W2... with sizes)
• Room color legend
• Carpet area vs built-up area

═══════════════════════════════════════════
CIVIL ENGINEERING RULES
═══════════════════════════════════════════
• Ceiling height ≥ 10 ft
• Ventilation ≥ 10% of floor area per habitable room
• Every habitable room MUST have a window
• Kitchen MUST have exterior ventilation
• Bathroom plumbing walls shared for efficiency

═══════════════════════════════════════════
VALIDATION CHECKLIST (confirm before output)
═══════════════════════════════════════════
✔ All rooms fit inside ${plotDimensions} plot boundary
✔ All rooms labeled with name + dimensions
✔ Furniture drawn in every room (NO empty rooms)
✔ Doors with swing arcs, windows with symbols
✔ Dimension arrows on all walls
✔ Logical circulation flow
✔ Legend box with scale, north arrow, schedules
✔ Professional CAD-quality drafting
✔ Construction-ready accuracy

Generate a HIGH-RESOLUTION, fully labeled, accurately dimensioned, construction-ready 2D floor plan image. Make it look PROFESSIONAL and REALISTIC like an architect's CAD drawing with proper colors, textures, and clean drafting.`;

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
    console.log("AI Response received");

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = data.choices?.[0]?.message?.content || "Professional 2D floor plan generated based on your specifications.";

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
