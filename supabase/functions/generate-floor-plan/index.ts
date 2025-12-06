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
    
    console.log("Generating floor plan with Google Gemini:", { landArea, rooms, preferences });

    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not configured. Please add your Google AI API key in the settings.');
    }

    // Build detailed room list for prompt
    const roomDetails = rooms.map((room: any) => {
      const roomInfo = `${room.count}x ${room.roomName} (${room.size} size: ${room.width}'×${room.height}')`;
      if (room.attachedBathroom) {
        return `${roomInfo} with attached bathroom`;
      }
      return roomInfo;
    }).join("\n- ");

    const outdoorFeatures = preferences.outdoorFeatures?.join(", ") || "None";

    // Comprehensive Floor Plan Generation Prompt based on CasaMuse requirements
    const systemPrompt = `You are the Floor Plan Generation Engine for CasaMuse — an AI-powered smart home design system.
Your role is to generate professional, architect-level 2D floor plans that strictly follow Indian construction standards, functional placement rules, and user requirements.

STANDARD INDIAN ROOM DIMENSIONS:
Bedrooms:
- Master Bedroom: 12×12 ft to 14×14 ft
- Normal Bedroom: 10×10 ft to 12×12 ft

Living/Dining/Foyer:
- Living: 12×15 ft to 14×18 ft
- Dining: 8×10 ft to 10×12 ft
- Foyer: 4×6 ft to 6×8 ft

Kitchen & Utility:
- Kitchen: 8×10 ft to 10×12 ft
- Utility: 4×6 ft to 5×7 ft

Bathrooms:
- Attached: 6×8 ft
- Common: 5×7 ft

Other:
- Balcony Depth: 4–6 ft
- Hallway width: 3.5–4.5 ft
- Staircase width: 3–4 ft
- Parking: Minimum 10×15 ft for single car

ARCHITECTURAL PLACEMENT RULES:
1. Entrance & Foyer: Entrance leads into foyer or living. Avoid main door facing bathrooms or bedrooms.
2. Living Room: Positioned at front, easily accessible from entrance, near dining, optionally attached to balcony.
3. Kitchen: Always near dining, preferably in corner, must have ventilation, should not share wall with bathrooms.
4. Dining: Between kitchen & living, accessible but not blocking circulation.
5. Bedrooms: Placed toward quieter rear or sides. Master Bedroom must include attached bathroom. Avoid bedroom doors opening directly into living room.
6. Bathrooms: Attached bathrooms inside bedrooms. Common bathroom accessible from hallway. Should not be near entrance.
7. Hallways: Connect major rooms efficiently. Avoid dead ends. Maintain minimum required width.
8. Balcony: Preferably attached to living or master bedroom. Should face open space or sunlight.
9. Staircase: Ideally near center or side. Should connect floors without blocking layout.
10. Parking: Placed at front side of house. Direct driveway access.
11. Garden: Front or side based on leftover land and aesthetics.

${preferences.vastuCompliant ? `VASTU COMPLIANCE REQUIRED:
- Main entrance should face North or East
- Kitchen in South-East corner
- Master bedroom in South-West
- Pooja room in North-East
- Avoid toilets in North-East corner` : ''}`;

    const userPrompt = `Generate a professional 2D architectural floor plan with the following specifications:

PLOT SPECIFICATIONS:
- Total Land Area: ${landArea} sq ft
- Number of Floors: ${preferences.floors}
- Architectural Style: ${preferences.style}
${preferences.vastuCompliant ? '- Vastu Compliant: YES' : '- Vastu Compliant: NO'}

REQUIRED ROOMS:
- ${roomDetails}

OUTDOOR FEATURES: ${outdoorFeatures}

DRAWING REQUIREMENTS:
1. Professional AutoCAD-style black and white technical drawing
2. Clean black lines on white/light background
3. Double parallel lines for walls (9 inch wall thickness)
4. Room names in CAPITAL LETTERS centered in each room
5. Dimensions labeled in feet (e.g., 12' × 16')
6. Door swings shown as 90° arcs opening into rooms
7. Window symbols as parallel lines with gaps in walls
8. Hatching/patterns for wet areas (bathrooms, kitchen, utility)
9. North arrow indicator in corner
10. Scale bar showing 10 ft reference
11. Title block: "FLOOR PLAN - ${landArea} SQ FT - ${preferences.style.toUpperCase()}"

LAYOUT REQUIREMENTS:
- Entrance opens to living room/foyer at front
- Living room at front with good natural light
- Dining area connected to both living and kitchen
- Kitchen with proper ventilation access and near dining
- All bedrooms in private zone (rear or sides)
- Master bedroom with attached bathroom
- Common bathroom accessible from hallway
- Minimum 3.5 ft wide hallways/corridors
- Parking area at front with driveway access
- Efficient circulation without dead ends

Generate a clean, professional, ready-for-construction 2D floor plan image.`;

    console.log("Calling Google Gemini for floor plan generation...");

    // Call Google Gemini API for image generation
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Gemini API error:', response.status, errorText);
      
      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid Google AI API key. Please check your API key in settings.',
            errorType: 'auth_error',
            success: false 
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Google API rate limit exceeded. Please wait a moment and try again.',
            errorType: 'rate_limited',
            success: false 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Google Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Google Gemini response received");

    // Extract the generated image from Gemini response
    let imageUrl = null;
    let textDescription = '';

    const candidates = data.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          // Image data found
          const mimeType = part.inlineData.mimeType || 'image/png';
          const base64Data = part.inlineData.data;
          imageUrl = `data:${mimeType};base64,${base64Data}`;
        }
        if (part.text) {
          textDescription = part.text;
        }
      }
    }

    if (!imageUrl) {
      console.error('No image in Gemini response:', JSON.stringify(data));
      throw new Error('No image generated from Google Gemini. The model may not have generated an image for this prompt.');
    }

    const description = textDescription || `Professional ${preferences.style} floor plan for ${landArea} sq ft plot with ${rooms.length} room types. Generated using Google Gemini.`;

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
