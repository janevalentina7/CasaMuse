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
    const { landArea, rooms, preferences } = await req.json();
    
    console.log("Generating floor plan with data:", { landArea, rooms, preferences });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build detailed room list for prompt
    const roomDetails = rooms.map((room: any) => {
      const roomInfo = `${room.count}x ${room.roomName} (${room.size} size: ${room.width}'×${room.height}')`;
      if (room.attachedBathroom) {
        return `${roomInfo} with attached bathroom`;
      }
      return roomInfo;
    }).join(", ");

    const outdoorFeatures = preferences.outdoorFeatures?.join(", ") || "None";

    // Create comprehensive architectural prompt
    const prompt = `Create a professional, architect-grade 2D floor plan image with the following specifications:

MANDATORY LABELING - EVERY ELEMENT MUST BE LABELED:
1. ROOM LABELS (Required for ALL rooms):
   - Each room MUST have its name in LARGE, BOLD text centered in the room
   - Room names: "LIVING ROOM", "MASTER BEDROOM", "BEDROOM 2", "KITCHEN", "BATHROOM 1", etc.
   - Dimensions MUST be shown below each room name: "16' × 20'" format
   - Use contrasting color for text visibility

2. DIMENSION ARROWS (Required on ALL walls):
   - Show dimension lines with arrows on EVERY wall
   - Display measurements in feet and inches
   - External dimensions for overall plot size
   - Internal dimensions for each room

3. DOOR & WINDOW LABELS:
   - Mark all doors with "D1", "D2", "D3" etc.
   - Mark all windows with "W1", "W2", "W3" etc.
   - Show door swing direction with arcs
   - Include door/window sizes in legend

4. LEGEND BOX (Required):
   - Place in corner of floor plan
   - List all room abbreviations
   - Door and window schedule
   - Scale indicator (1:50 or 1:100)
   - North direction arrow
   - Total built-up area calculation

5. ROOM-SPECIFIC LABELS:
   - Kitchen: Label counter, sink, cooking area, storage
   - Bathroom: Label WC, wash basin, shower
   - Bedroom: Label wardrobe area, bed placement
   - Living: Label seating area, TV unit placement

FLOOR PLAN SPECIFICATIONS:

PLOT DETAILS:
- Total Land Area: ${landArea} sq ft
- Number of Floors: ${preferences.floors}
- Architectural Style: ${preferences.style}
- Vastu Compliant: ${preferences.vastuCompliant ? "Yes" : "No"}
- Dynamic Scaling: ${preferences.dynamicScaling ? "Enabled" : "Disabled"}

ROOMS REQUIRED (Label each with name and dimensions):
${roomDetails}

OUTDOOR FEATURES:
${outdoorFeatures}

DESIGN REQUIREMENTS:
1. Create a clean, professional 2D floor plan similar to AutoCAD/Revit output
2. Show all walls with proper thickness (4-6 inches)
3. Include doors with opening arcs showing swing direction
4. Add windows with proper symbols
5. LABEL EVERY ROOM with name and dimensions (length × width in feet)
6. Show furniture layout for each room with labels
7. Include a north direction arrow in top-right corner
8. Add scale indicator (1:50 or 1:100) in legend
9. Use professional color coding: walls in dark grey, rooms in soft pastels, furniture in light grey
10. Show circulation paths and ensure logical room flow
11. ${preferences.vastuCompliant ? "Follow Vastu directions: Living room (North-East/East), Kitchen (South-East), Master bedroom (South-West), etc." : "Optimize for functionality and natural light"}
12. Include ALL dimensions for ALL rooms and walls
13. Add electrical points, plumbing lines if visible
14. Ensure proper ventilation with window placements

ROOM LAYOUT RULES:
- Living room near entrance with good ventilation
- Kitchen near dining area with utility access
- Bedrooms in private zones away from living areas
- Bathrooms should share plumbing walls
- Balconies attached to living room or bedrooms
- Proper hallway widths (3-4 feet minimum)

CRITICAL: The floor plan MUST have visible, readable labels for EVERY room showing the room name and dimensions. Do not generate a floor plan without labels.`;

    // Generate image using Lovable AI (image generation model)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
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

    // Extract the generated image
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = data.choices?.[0]?.message?.content || "Professional 2D floor plan generated based on your specifications.";

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    return new Response(
      JSON.stringify({ 
        imageUrl, 
        description,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-floor-plan function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
