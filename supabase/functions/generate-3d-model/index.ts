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
    const { floorPlanImageUrl, landArea, rooms, preferences, view = '360', specificRoom } = await req.json();
    
    console.log("Generating 3D model with Google Gemini:", { landArea, rooms, preferences, view, specificRoom });

    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not configured. Please add your Google AI API key in the settings.');
    }

    const roomsDescription = rooms.map((room: any) => {
      const roomInfo = `${room.count}x ${room.roomName} (${room.size}: ${room.width}'×${room.height}')`;
      return room.attachedBathroom ? `${roomInfo} with attached bathroom` : roomInfo;
    }).join(', ');

    const outdoorDescription = preferences.outdoorFeatures?.length > 0 
      ? `Outdoor features: ${preferences.outdoorFeatures.join(', ')}` 
      : '';

    const styleDetails = getStyleDetails(preferences.style);

    // Define view-specific prompts
    const viewPrompts: { [key: string]: string } = {
      '360': `Generate a photorealistic exterior 3D architectural rendering of a ${preferences.style} style Indian house.

SPECIFICATIONS:
- Plot size: ${landArea} sq ft
- Floors: ${preferences.floors}-story building
- Rooms: ${roomsDescription}
${outdoorDescription}

STYLE DETAILS: ${styleDetails}

REQUIREMENTS:
1. Beautiful front elevation view at eye level
2. Show complete building with all floors visible
3. Include realistic entrance door, windows with proper frames
4. Balconies with railings if applicable
5. Driveway and parking area at front
6. Landscaping with lawn, plants, trees
7. Professional architectural visualization quality
8. Golden hour warm lighting with soft shadows
9. Realistic textures for walls, roof, windows
10. Indian residential architecture context

Generate a high-quality, photorealistic 3D rendering suitable for presentation.`,

      'top': `Generate a professional aerial/bird's eye view 3D rendering of a ${preferences.style} style house.

SPECIFICATIONS:
- Plot size: ${landArea} sq ft
- Floors: ${preferences.floors} floors
- Rooms: ${roomsDescription}
${outdoorDescription}

REQUIREMENTS:
1. Top-down 45-degree aerial perspective
2. Show complete roof layout and design
3. Property boundaries clearly visible
4. Parking area, driveway visible
5. Garden areas, landscaping, outdoor features
6. Shadows indicating building height and depth
7. Clean architectural visualization style
8. Realistic materials and colors for roof
9. Surrounding context (lawn, pathways)

Generate a professional bird's eye architectural visualization.`,

      'side': `Generate a professional side elevation 3D rendering of a ${preferences.style} style house.

SPECIFICATIONS:
- Plot size: ${landArea} sq ft
- Floors: ${preferences.floors}-story building
- Style: ${preferences.style}

STYLE DETAILS: ${styleDetails}

REQUIREMENTS:
1. Perfect side view showing full building height
2. All floor levels visible with windows
3. Balconies from side perspective
4. Roof profile and architectural details
5. Foundation and ground level visible
6. Realistic material textures
7. Professional lighting with soft shadows
8. Landscaping visible at sides

Generate a high-quality side elevation rendering.`,

      'back': `Generate a professional rear elevation 3D rendering of a ${preferences.style} style house.

SPECIFICATIONS:
- Plot size: ${landArea} sq ft
- Floors: ${preferences.floors}-story building
- Style: ${preferences.style}

STYLE DETAILS: ${styleDetails}

REQUIREMENTS:
1. Rear facade view of the house
2. Back windows and doors visible
3. Service areas, utility spaces visible
4. Back garden or yard area
5. Balconies from rear perspective
6. Realistic materials and textures
7. Professional architectural quality
8. Natural lighting

Generate a photorealistic rear view rendering.`,

      'interior': specificRoom 
        ? `Generate a beautiful photorealistic interior 3D rendering of a ${specificRoom} in ${preferences.style} style Indian home.

ROOM: ${specificRoom}

STYLE: ${preferences.style}

REQUIREMENTS:
1. Fully furnished ${specificRoom} with appropriate furniture
2. ${preferences.style} style interior design and décor
3. Proper color scheme matching the style
4. Natural light from windows with curtains/blinds
5. Ceiling details with ceiling fan (Indian home essential)
6. Appropriate lighting fixtures (chandelier/pendant/recessed)
7. Flooring appropriate to room (tiles/wood/marble)
8. Wall textures, paint, or accent walls
9. Decorative elements: plants, artwork, rugs
10. Warm, inviting atmosphere
11. Professional interior design visualization quality

Generate a photorealistic interior rendering of this ${specificRoom}.`
        : `Generate a beautiful photorealistic interior 3D rendering of a living room in ${preferences.style} style Indian home.

STYLE: ${preferences.style}

REQUIREMENTS:
1. Spacious living room with comfortable sofa set
2. Coffee table, side tables, TV unit
3. ${preferences.style} style furniture and décor
4. Natural light from large windows with curtains
5. Ceiling fan (Indian home essential)
6. Modern lighting fixtures
7. Quality flooring (marble/tiles/wood)
8. Indoor plants, artwork, decorative items
9. View/connection to dining area
10. Warm, inviting family living space
11. Professional interior visualization quality

Generate a photorealistic living room interior rendering.`
    };

    const prompt = viewPrompts[view] || viewPrompts['360'];

    console.log('Calling Google Gemini for 3D visualization...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
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
            error: 'Invalid Google AI API key. Please check your API key.',
            errorType: 'auth_error',
            success: false 
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Google API rate limit exceeded. Please wait and try again.',
            errorType: 'rate_limited',
            success: false 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Google Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Google Gemini 3D response received');

    // Extract the generated image from Gemini response
    let imageUrl = null;
    let textDescription = '';

    const candidates = data.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
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
      throw new Error('No 3D visualization generated from Google Gemini');
    }

    const viewLabels: { [key: string]: string } = {
      '360': 'Exterior 360° view',
      'top': 'Aerial top view',
      'side': 'Side elevation',
      'back': 'Rear elevation',
      'interior': specificRoom ? `${specificRoom} interior` : 'Living room interior'
    };

    const description = textDescription || `${viewLabels[view]} of your ${preferences.style} style ${landArea} sq ft home. Generated with Google Gemini.`;

    return new Response(
      JSON.stringify({ 
        imageUrl, 
        description,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in generate-3d-model function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function getStyleDetails(style: string): string {
  const details: { [key: string]: string } = {
    'Modern': 'Clean geometric lines, flat or low-slope roof, large floor-to-ceiling glass windows, white/grey/concrete exterior, minimalist design with no ornamentation, sharp edges',
    'Contemporary': 'Mixed materials (wood panels, glass, natural stone), asymmetric design, trendy finishes, organic curves mixed with geometric shapes, innovative window designs',
    'Traditional': 'Sloped clay tile roof, wooden accents and frames, symmetrical facade, warm earthy colors (terracotta, cream, brown), classic Indian home features',
    'Minimalist': 'Ultra-clean design, simple rectangular geometry, neutral white/grey/beige colors, no ornamentation, focus on essential forms only',
    'Luxury': 'Grand double-height entrance with pillars, marble or stone cladding, premium finishes, large windows, elegant landscaping, fountain or water feature',
    'Scandinavian': 'Light-colored wood panels, large panoramic windows, soft pastel colors (white, light grey, muted blue), cozy minimalist design, connection to nature',
    'Industrial': 'Exposed brick walls, metal frame elements, raw concrete surfaces, factory-inspired large windows, urban loft aesthetic, neutral grey palette',
    'Colonial': 'Large classical pillars at entrance, arched windows and doorways, symmetrical facade design, heritage cream/white color, balustrades and verandahs',
    'Mediterranean': 'Terracotta clay tile roof, arched doorways and windows, stucco walls in warm earth tones, wrought iron details, courtyard elements, coastal villa feel',
    'Rustic': 'Natural stone walls, exposed wooden beams, earthy brown tones, organic natural materials, mountain lodge feel, timber accents',
  };
  return details[style] || details['Modern'];
}
