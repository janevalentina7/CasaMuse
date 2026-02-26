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
    
    console.log("Generating rendered view:", { view, specificRoom });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const roomsDescription = rooms.map((room: any) => 
      `${room.count}x ${room.roomName} (${room.width}'×${room.height}')`
    ).join(', ');

    // Concise, focused prompts for speed
    const prompt = view === 'interior' && specificRoom
      ? `Generate a photorealistic interior render of a ${specificRoom} in a ${preferences.style} style Indian home. Show realistic furniture, lighting, flooring, and décor appropriate for this room. ${preferences.style} design aesthetic. Well-lit, inviting atmosphere. High quality architectural visualization.`
      : view === 'top'
      ? `Generate a photorealistic aerial/bird's eye view of a ${preferences.style} style Indian house. ${landArea} sq ft, ${preferences.floors} floors. Show roof, garden, parking, property boundary. Architectural visualization quality.`
      : view === 'back'
      ? `Generate a photorealistic rear elevation render of a ${preferences.style} style Indian house. Show back façade, windows, service areas, backyard. ${preferences.floors} floors. Architectural visualization.`
      : view === 'side'
      ? `Generate a photorealistic side elevation of a ${preferences.style} style Indian house. Show full building height, side windows, balconies. ${preferences.floors} floors. Architectural visualization.`
      : `Generate a photorealistic front perspective render of a ${preferences.style} style Indian house. ${landArea} sq ft, ${preferences.floors} floors. Rooms: ${roomsDescription}. Show front elevation with architectural details, landscaping, driveway, warm lighting. High quality architectural visualization.`;

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
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: floorPlanImageUrl } }
            ]
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
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = data.choices?.[0]?.message?.content || '';

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    return new Response(
      JSON.stringify({ imageUrl, description, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
