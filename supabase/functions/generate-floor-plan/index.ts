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
    
    console.log("Generating floor plan:", { landArea, rooms, preferences });

    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    // Build detailed room list for prompt
    const roomDetails = rooms.map((room: any) => {
      const roomInfo = `${room.count}x ${room.roomName} (${room.size} size: ${room.width}'×${room.height}')`;
      if (room.attachedBathroom) {
        return `${roomInfo} with attached bathroom`;
      }
      return roomInfo;
    }).join("\n- ");

    const outdoorFeatures = preferences.outdoorFeatures?.join(", ") || "None";

    // Comprehensive Floor Plan Generation Prompt
    const floorPlanPrompt = `Generate a professional 2D architectural floor plan with the following specifications:

PLOT SPECIFICATIONS:
- Total Land Area: ${landArea} sq ft
- Number of Floors: ${preferences.floors}
- Architectural Style: ${preferences.style}
${preferences.vastuCompliant ? '- Vastu Compliant: YES (Main entrance North/East, Kitchen South-East, Master bedroom South-West)' : '- Vastu Compliant: NO'}

REQUIRED ROOMS:
- ${roomDetails}

OUTDOOR FEATURES: ${outdoorFeatures}

STANDARD INDIAN ROOM DIMENSIONS TO FOLLOW:
- Master Bedroom: 12×12 ft to 14×14 ft
- Normal Bedroom: 10×10 ft to 12×12 ft
- Living Room: 12×15 ft to 14×18 ft
- Dining: 8×10 ft to 10×12 ft
- Kitchen: 8×10 ft to 10×12 ft
- Attached Bathroom: 6×8 ft
- Common Bathroom: 5×7 ft
- Hallway width: 3.5–4.5 ft

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
- Efficient circulation without dead ends

Generate a clean, professional, ready-for-construction 2D floor plan image.`;

    let imageUrl: string | null = null;
    let description: string | undefined = '';
    let usedProvider = '';

    // Try Google Gemini first
    if (GOOGLE_AI_API_KEY && !imageUrl) {
      console.log("Trying Google Gemini...");
      try {
        const geminiResult = await generateWithGemini(GOOGLE_AI_API_KEY, floorPlanPrompt);
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
      console.log("Trying OpenAI...");
      try {
        const openaiResult = await generateWithOpenAI(OPENAI_API_KEY, floorPlanPrompt);
        if (openaiResult.success && openaiResult.imageUrl) {
          imageUrl = openaiResult.imageUrl;
          description = openaiResult.description || '';
          usedProvider = 'OpenAI';
        }
      } catch (openaiError: any) {
        console.log("OpenAI failed:", openaiError.message);
      }
    }

    // Final fallback to Lovable AI (always available)
    if (LOVABLE_API_KEY && !imageUrl) {
      console.log("Trying Lovable AI...");
      try {
        const lovableResult = await generateWithLovableAI(LOVABLE_API_KEY, floorPlanPrompt);
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

    const finalDescription = description || `Professional ${preferences.style} floor plan for ${landArea} sq ft plot. Generated with ${usedProvider}.`;

    return new Response(
      JSON.stringify({ 
        imageUrl, 
        description: finalDescription,
        provider: usedProvider,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-floor-plan function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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
      size: '1024x1024',
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
