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

    // Create comprehensive architectural prompt - AutoCAD professional style
    const prompt = `You are the Floor Plan Generation AI of CasaMuse. Generate a professional, architect-grade 2D floor plan that looks exactly like AutoCAD output.

PLOT SPECIFICATIONS:
- Total Land Area: ${landArea} sq ft
- Number of Floors: ${preferences.floors}
- Architectural Style: ${preferences.style}
- Vastu Compliant: ${preferences.vastuCompliant ? "Yes - Follow Vastu directions strictly" : "No"}
- Dynamic Scaling: ${preferences.dynamicScaling ? "Enabled - Scale rooms proportionally if needed" : "Disabled"}

ROOMS REQUIRED (with exact dimensions):
${roomDetails}

OUTDOOR FEATURES: ${outdoorFeatures}

MANDATORY AUTOCAD-STYLE VISUAL REQUIREMENTS:
1. BLACK & WHITE technical drawing style with clean crisp lines
2. Wall thickness: 9 inches (230mm) shown as double parallel lines
3. All dimensions labeled in FEET with dimension lines and arrows
4. North arrow indicator in top-right corner
5. Scale bar showing 1:100 scale
6. Room names in CAPITAL LETTERS centered in each room
7. Door swings shown as 90° arcs with proper direction
8. Window symbols as parallel lines with gaps
9. Hatching patterns for wet areas (bathrooms, kitchen)
10. Grid reference system (A, B, C... and 1, 2, 3...)
11. Title block at bottom with: "FLOOR PLAN - ${landArea} SQ FT - ${preferences.style.toUpperCase()} STYLE"

ROOM PLACEMENT RULES (Follow strictly):
- ENTRANCE → Opens into Foyer or Living Room (never facing bathroom)
- LIVING ROOM → Front of house, connected to hallway, minimum 12×15 ft
- MASTER BEDROOM → Corner placement for privacy, 12×14 ft with attached bathroom 6×8 ft
- OTHER BEDROOMS → Near hallway, 10×12 ft each
- KITCHEN → Close to dining, outdoor ventilation, 8×10 ft minimum
- DINING → Between kitchen and living room, 8×10 ft
- BATHROOMS → Attached inside bedrooms, common bathroom from hallway (5×7 ft)
- BALCONY → Attached to living/bedroom, receives sunlight, 4-6 ft depth
- HALLWAY → 3.5-4.5 ft width connecting all rooms
- PARKING → Front portion, minimum 10×15 ft
- UTILITY → Near kitchen, 4×6 ft
- POOJA ROOM → If included, 4×6 ft, ${preferences.vastuCompliant ? "North-East corner" : "near living area"}

${preferences.vastuCompliant ? `
VASTU COMPLIANCE (Mandatory):
- Main entrance: North or East facing
- Living room: North-East or East
- Master bedroom: South-West corner
- Kitchen: South-East (Agni corner)
- Bathrooms: North-West or West
- Pooja room: North-East (Ishan corner)
- Staircase: South or West
- No toilets under staircase
` : ''}

PROFESSIONAL DRAWING STANDARDS:
- Use standard architectural symbols per Indian construction practices
- Show electrical points as circles with cross
- Show plumbing points as triangles
- Include ceiling fan locations as circles with X
- Show all door and window schedules
- Include total built-up area calculation
- All rooms must be rectangular or L-shaped (valid architectural shapes)
- No awkward dead spaces - smooth circulation flow
- Minimum corridor width: 3.5 ft
- Every room must be accessible from hallway

OUTPUT: Generate a clean, professional 2D floor plan image that could be directly used by architects and contractors. The quality should match AutoCAD/Revit professional standards with precise geometry and clear annotations.`;

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
