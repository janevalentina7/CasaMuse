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
    
    console.log("Generating floor plan with OpenAI:", { landArea, rooms, preferences });

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured. Please add your OpenAI API key in the settings.');
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

    // Create comprehensive architectural prompt for OpenAI gpt-image-1
    const prompt = `Professional 2D architectural floor plan, AutoCAD style, black and white technical drawing.

SPECIFICATIONS:
- Land Area: ${landArea} sq ft
- Floors: ${preferences.floors}
- Style: ${preferences.style}
${preferences.vastuCompliant ? "- Vastu Compliant: Main entrance North/East, Kitchen South-East, Master bedroom South-West" : ""}

ROOMS: ${roomDetails}
OUTDOOR: ${outdoorFeatures}

DRAWING REQUIREMENTS:
1. Clean black lines on white background, professional architectural style
2. Double parallel lines for walls (9 inch thickness)
3. Room names in CAPITAL LETTERS centered in each room
4. Dimensions labeled in feet (e.g., 12' × 16')
5. Door swings shown as 90° arcs
6. Window symbols as parallel lines with gaps
7. Hatching for wet areas (bathrooms, kitchen)
8. North arrow in corner
9. Scale bar showing 10 ft
10. Title: "FLOOR PLAN - ${landArea} SQ FT"

LAYOUT:
- Entrance opens to living room/foyer
- Living room at front, connected to dining
- Kitchen near dining with ventilation access
- Bedrooms in private zone (back/corners)
- Master bedroom with attached bathroom
- Common bathroom accessible from hallway
- Minimum 3.5 ft hallway width
- Parking at front if included

Generate a professional, clean, ready-for-construction 2D floor plan.`;

    console.log("Calling OpenAI gpt-image-1...");

    // Generate image using OpenAI gpt-image-1
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid OpenAI API key. Please check your API key in settings.',
            errorType: 'auth_error',
            success: false 
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'OpenAI rate limit exceeded. Please wait a moment and try again.',
            errorType: 'rate_limited',
            success: false 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenAI response received");

    // Extract the generated image (gpt-image-1 returns base64)
    const imageData = data.data?.[0];
    let imageUrl = imageData?.url;
    
    // If base64 is returned, convert to data URL
    if (imageData?.b64_json) {
      imageUrl = `data:image/png;base64,${imageData.b64_json}`;
    }

    if (!imageUrl) {
      throw new Error('No image generated from OpenAI');
    }

    const description = `Professional ${preferences.style} floor plan for ${landArea} sq ft plot with ${rooms.length} room types. Generated using OpenAI.`;

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
