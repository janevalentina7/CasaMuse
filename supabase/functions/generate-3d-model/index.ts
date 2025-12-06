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
    
    console.log("Generating 3D model:", { landArea, rooms, preferences, view, specificRoom });

    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    const roomsDescription = rooms.map((room: any) => {
      const roomInfo = `${room.count}x ${room.roomName} (${room.size}: ${room.width}'×${room.height}')`;
      return room.attachedBathroom ? `${roomInfo} with attached bathroom` : roomInfo;
    }).join(', ');

    const outdoorDescription = preferences.outdoorFeatures?.length > 0 
      ? `Outdoor features: ${preferences.outdoorFeatures.join(', ')}` 
      : '';

    const styleDetails = getStyleDetails(preferences.style);
    const prompt = buildViewPrompt(view, specificRoom, landArea, rooms, preferences, roomsDescription, outdoorDescription, styleDetails);

    let imageUrl: string | null = null;
    let description: string | undefined = '';
    let usedProvider = '';

    // Try Google Gemini first
    if (GOOGLE_AI_API_KEY && !imageUrl) {
      console.log("Trying Google Gemini for 3D...");
      try {
        const geminiResult = await generateWithGemini(GOOGLE_AI_API_KEY, prompt);
        if (geminiResult.success && geminiResult.imageUrl) {
          imageUrl = geminiResult.imageUrl;
          description = geminiResult.description || '';
          usedProvider = 'Google Gemini';
        }
      } catch (geminiError: any) {
        console.log("Gemini failed:", geminiError.message);
      }
    }

    // Fallback to OpenAI if Gemini failed
    if (OPENAI_API_KEY && !imageUrl) {
      console.log("Trying OpenAI for 3D...");
      try {
        const openaiResult = await generateWithOpenAI(OPENAI_API_KEY, prompt);
        if (openaiResult.success && openaiResult.imageUrl) {
          imageUrl = openaiResult.imageUrl;
          description = openaiResult.description || '';
          usedProvider = 'OpenAI';
        }
      } catch (openaiError: any) {
        console.log("OpenAI failed:", openaiError.message);
      }
    }

    // Final fallback to Lovable AI
    if (LOVABLE_API_KEY && !imageUrl) {
      console.log("Trying Lovable AI for 3D...");
      try {
        const lovableResult = await generateWithLovableAI(LOVABLE_API_KEY, prompt);
        if (lovableResult.success && lovableResult.imageUrl) {
          imageUrl = lovableResult.imageUrl;
          description = lovableResult.description || '';
          usedProvider = 'Lovable AI';
        }
      } catch (lovableError: any) {
        console.error("Lovable AI also failed:", lovableError.message);
      }
    }

    if (!imageUrl) {
      throw new Error('All AI providers failed. Please check your API quotas or try again later.');
    }

    const viewLabels: { [key: string]: string } = {
      '360': 'Exterior 360° view',
      'top': 'Aerial top view',
      'side': 'Side elevation',
      'back': 'Rear elevation',
      'interior': specificRoom ? `${specificRoom} interior` : 'Living room interior'
    };

    const finalDescription = description || `${viewLabels[view]} of your ${preferences.style} style ${landArea} sq ft home. Generated with ${usedProvider}.`;

    return new Response(
      JSON.stringify({ 
        imageUrl, 
        description: finalDescription,
        provider: usedProvider,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in generate-3d-model function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function buildViewPrompt(view: string, specificRoom: string | undefined, landArea: string, rooms: any[], preferences: any, roomsDescription: string, outdoorDescription: string, styleDetails: string): string {
  const noWatermarkInstruction = `CRITICAL: Do NOT add any watermarks, logos, signatures, text overlays, or branding marks anywhere on the image. The output must be a completely clean image with no watermarks whatsoever.`;
  
  const viewPrompts: { [key: string]: string } = {
    '360': `Generate a photorealistic exterior 3D architectural rendering of a ${preferences.style} style Indian house.

${noWatermarkInstruction}

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
11. NO watermarks, logos, or any text overlays

Generate a high-quality, photorealistic 3D rendering suitable for presentation without any watermarks.`,

    'top': `Generate a professional aerial/bird's eye view 3D rendering of a ${preferences.style} style house.

${noWatermarkInstruction}

SPECIFICATIONS:
- Plot size: ${landArea} sq ft, Floors: ${preferences.floors}
- Rooms: ${roomsDescription}
${outdoorDescription}

Show: Top-down 45-degree aerial view, complete roof layout, property boundaries, parking, garden areas, shadows indicating building height. No watermarks.`,

    'side': `Generate a professional side elevation 3D rendering of a ${preferences.style} style house.

${noWatermarkInstruction}

SPECIFICATIONS: ${landArea} sq ft, ${preferences.floors}-story
STYLE: ${styleDetails}

Show: Perfect side view, all floor levels with windows, balconies, roof profile, foundation, realistic materials. No watermarks or logos.`,

    'back': `Generate a professional rear elevation 3D rendering of a ${preferences.style} style house.

${noWatermarkInstruction}

SPECIFICATIONS: ${landArea} sq ft, ${preferences.floors}-story
STYLE: ${styleDetails}

Show: Rear facade, back windows/doors, service areas, back garden, realistic materials. No watermarks.`,

    'interior': specificRoom 
      ? `Generate a beautiful photorealistic interior 3D rendering of a ${specificRoom} in ${preferences.style} style Indian home.

${noWatermarkInstruction}

Show fully furnished ${specificRoom} with:
- Appropriate furniture for ${specificRoom}
- ${preferences.style} style interior design and décor
- Natural light from windows with curtains
- Ceiling fan (Indian home essential), lighting fixtures
- Quality flooring, wall textures
- Decorative elements: plants, artwork, rugs
- Warm, inviting atmosphere
- NO watermarks or logos`
      : `Generate a photorealistic living room interior in ${preferences.style} style Indian home.

${noWatermarkInstruction}

Show: Comfortable sofa set, coffee table, TV unit, ${preferences.style} décor, natural light, ceiling fan, quality flooring, indoor plants, warm inviting atmosphere. No watermarks.`
  };

  return viewPrompts[view] || viewPrompts['360'];
}

async function generateWithGemini(apiKey: string, prompt: string): Promise<{ success: boolean; imageUrl?: string; description?: string }> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  let imageUrl = null;
  let textDescription = '';

  const candidates = data.candidates;
  if (candidates && candidates.length > 0) {
    const parts = candidates[0].content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
      }
      if (part.text) {
        textDescription = part.text;
      }
    }
  }

  if (!imageUrl) {
    throw new Error('No image in Gemini response');
  }

  return { success: true, imageUrl, description: textDescription };
}

async function generateWithOpenAI(apiKey: string, prompt: string): Promise<{ success: boolean; imageUrl?: string; description?: string }> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: prompt,
      n: 1,
      size: '1536x1024',
      quality: 'high',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const imageData = data.data?.[0];
  let imageUrl = imageData?.url;
  
  if (imageData?.b64_json) {
    imageUrl = `data:image/png;base64,${imageData.b64_json}`;
  }

  if (!imageUrl) {
    throw new Error('No image in OpenAI response');
  }

  return { success: true, imageUrl };
}

async function generateWithLovableAI(apiKey: string, prompt: string): Promise<{ success: boolean; imageUrl?: string; description?: string }> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-image-preview',
      messages: [
        { role: 'user', content: prompt }
      ],
      modalities: ['image', 'text']
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI error:', response.status, errorText);
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  
  // Extract image from Lovable AI response
  const message = data.choices?.[0]?.message;
  const images = message?.images;
  
  if (images && images.length > 0) {
    const imageUrl = images[0]?.image_url?.url;
    if (imageUrl) {
      return { success: true, imageUrl, description: message?.content || '' };
    }
  }

  throw new Error('No image in Lovable AI response');
}

function getStyleDetails(style: string): string {
  const details: { [key: string]: string } = {
    'Modern': 'Clean geometric lines, flat roof, large glass windows, white/grey exterior, minimalist design',
    'Contemporary': 'Mixed materials (wood, glass, stone), asymmetric design, trendy finishes',
    'Traditional': 'Sloped clay tile roof, wooden accents, symmetrical facade, warm earthy colors',
    'Minimalist': 'Ultra-clean design, simple geometry, neutral colors, no ornamentation',
    'Luxury': 'Grand entrance with pillars, marble/stone cladding, premium finishes, elegant landscaping',
    'Scandinavian': 'Light wood panels, large windows, pastel colors, cozy minimalist design',
    'Industrial': 'Exposed brick, metal frames, raw concrete, factory-inspired elements',
    'Colonial': 'Large classical pillars, arched windows, symmetrical design, heritage look',
    'Mediterranean': 'Terracotta tile roof, arched doorways, stucco walls, coastal feel',
    'Rustic': 'Natural stone walls, exposed wood beams, earthy tones, organic materials',
  };
  return details[style] || details['Modern'];
}
