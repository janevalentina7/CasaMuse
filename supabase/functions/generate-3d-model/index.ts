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
    
    console.log("Generating 3D model with OpenAI:", { landArea, rooms, preferences, view, specificRoom });

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured. Please add your OpenAI API key in the settings.');
    }

    const roomsDescription = rooms.map((room: any) => {
      const roomInfo = `${room.count}x ${room.roomName} (${room.size}: ${room.width}'×${room.height}')`;
      return room.attachedBathroom ? `${roomInfo} with attached bathroom` : roomInfo;
    }).join(', ');

    const outdoorDescription = preferences.outdoorFeatures?.length > 0 
      ? `Outdoor: ${preferences.outdoorFeatures.join(', ')}` 
      : '';

    // Define view-specific prompts
    const viewPrompts: { [key: string]: string } = {
      '360': `Photorealistic exterior 3D rendering of a ${preferences.style} style Indian house.
        
${preferences.floors}-story building, ${landArea} sq ft plot.
Rooms: ${roomsDescription}
${outdoorDescription}

Show: Beautiful front elevation with ${getStyleDetails(preferences.style)}. 
Include driveway, entrance, windows with proper frames, balconies if applicable.
Professional architectural visualization, golden hour lighting, high quality render.`,

      'top': `Professional aerial/bird's eye view of a ${preferences.style} style house.
        
${landArea} sq ft plot, ${preferences.floors} floors.
Rooms: ${roomsDescription}
${outdoorDescription}

Show: Complete roof layout, property boundaries, parking area, garden spaces, outdoor features.
Clean architectural top-down view with shadows showing building height.`,

      'side': `Side elevation architectural rendering of a ${preferences.style} style house.
        
${preferences.floors}-story, ${landArea} sq ft.
Show: Full building height, side windows, balconies, architectural details.
${getStyleDetails(preferences.style)}
Professional visualization with realistic materials and lighting.`,

      'back': `Rear elevation 3D rendering of a ${preferences.style} style house.
        
${preferences.floors}-story building.
Show: Back facade, rear windows, service areas, back garden/yard.
${getStyleDetails(preferences.style)}
Professional architectural visualization.`,

      'interior': specificRoom 
        ? `Beautiful interior 3D rendering of a ${specificRoom} in ${preferences.style} style.
        
Show fully furnished room with:
- Appropriate furniture for ${specificRoom}
- ${preferences.style} style décor and finishes
- Natural light from windows with curtains
- Ceiling details, lighting fixtures
- Flooring, rugs, indoor plants
- Indian home features: ceiling fan, proper ventilation

Photorealistic interior design visualization, warm inviting atmosphere.`
        : `Beautiful living room interior in ${preferences.style} style Indian home.
        
Show fully furnished space with:
- Comfortable sofa set, coffee table, TV unit
- ${preferences.style} style décor and color scheme
- Natural light, ceiling fan, modern lighting
- Flooring, curtains, indoor plants
- View of connected dining/kitchen area

Photorealistic interior visualization, warm and inviting.`
    };

    const prompt = viewPrompts[view] || viewPrompts['360'];

    console.log('Calling OpenAI gpt-image-1 for 3D visualization...');

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
        size: '1536x1024', // Wider for exterior views
        quality: 'high',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid OpenAI API key. Please check your API key.',
            errorType: 'auth_error',
            success: false 
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'OpenAI rate limit exceeded. Please wait and try again.',
            errorType: 'rate_limited',
            success: false 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI 3D response received');

    const imageData = data.data?.[0];
    let imageUrl = imageData?.url;
    
    if (imageData?.b64_json) {
      imageUrl = `data:image/png;base64,${imageData.b64_json}`;
    }

    if (!imageUrl) {
      throw new Error('No 3D visualization generated');
    }

    const viewLabels: { [key: string]: string } = {
      '360': 'Exterior 360° view',
      'top': 'Aerial top view',
      'side': 'Side elevation',
      'back': 'Rear elevation',
      'interior': specificRoom ? `${specificRoom} interior` : 'Living room interior'
    };

    const description = `${viewLabels[view]} of your ${preferences.style} style ${landArea} sq ft home. Generated with OpenAI.`;

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
    'Modern': 'Clean lines, flat roof, large glass windows, white/grey exterior, minimalist design',
    'Contemporary': 'Mixed materials (wood, glass, stone), asymmetric design, trendy finishes',
    'Traditional': 'Sloped tile roof, wooden accents, symmetrical facade, warm colors',
    'Minimalist': 'Ultra-clean design, simple geometry, neutral colors, no ornamentation',
    'Luxury': 'Grand entrance, marble/stone cladding, premium finishes, double-height spaces',
    'Scandinavian': 'Light wood panels, large windows, pastel colors, cozy design',
    'Industrial': 'Exposed brick, metal frames, raw concrete, factory-inspired elements',
    'Colonial': 'Large pillars, arched windows, symmetrical design, heritage look',
    'Mediterranean': 'Clay tile roof, arched doorways, terracotta colors, coastal feel',
    'Rustic': 'Natural stone, exposed wood beams, earthy tones, organic materials',
  };
  return details[style] || details['Modern'];
}
