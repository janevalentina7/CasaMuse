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

CRITICAL LABELING REQUIREMENTS:
- Every room MUST have a clear, readable label showing:
  * Room name (e.g., "Living Room", "Master Bedroom")
  * Dimensions in feet (e.g., "12' × 16'")
- Labels must be positioned centrally in each room
- Use large, bold, professional font for all labels
- Add dimension arrows on walls showing measurements
- Include a clear legend/key explaining symbols
- Add total built-up area calculation at bottom

FLOOR PLAN SPECIFICATIONS:

PLOT DETAILS:
- Total Land Area: ${landArea} sq ft
- Number of Floors: ${preferences.floors}
- Architectural Style: ${preferences.style}
- Vastu Compliant: ${preferences.vastuCompliant ? "Yes" : "No"}
- Dynamic Scaling: ${preferences.dynamicScaling ? "Enabled" : "Disabled"}

ROOMS REQUIRED:
${roomDetails}

OUTDOOR FEATURES:
${outdoorFeatures}

DESIGN REQUIREMENTS:
1. Create a clean, professional 2D floor plan similar to AutoCAD/Revit output
2. Show all walls with proper thickness (4-6 inches)
3. Include doors with opening arcs showing swing direction
4. Add windows with proper symbols
5. Label each room with dimensions (length × width in feet)
6. Show furniture layout for each room (beds, sofas, dining table, kitchen counters, bathroom fixtures)
7. Include a north direction arrow
8. Add scale indicator (1:50 or 1:100)
9. Use professional color coding: walls in dark grey, rooms in soft pastels, furniture in light grey
10. Show circulation paths and ensure logical room flow
11. ${preferences.vastuCompliant ? "Follow Vastu directions: Living room (North-East/East), Kitchen (South-East), Master bedroom (South-West), etc." : "Optimize for functionality and natural light"}
12. Include dimensions for all rooms
13. Add electrical points, plumbing lines if visible
14. Ensure proper ventilation with window placements

ROOM LAYOUT RULES:
- Living room near entrance with good ventilation
- Kitchen near dining area with utility access
- Bedrooms in private zones away from living areas
- Bathrooms should share plumbing walls
- Balconies attached to living room or bedrooms
- Proper hallway widths (3-4 feet minimum)

The floor plan should look professional, clean, and realistic - as if drawn by a licensed architect. Use proper architectural symbols and conventions. Make it visually clean with clear labels and measurements.`;

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
