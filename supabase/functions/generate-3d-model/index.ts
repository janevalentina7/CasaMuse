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
    const { floorPlanImageUrl, landArea, rooms, preferences } = await req.json();
    
    console.log("Generating 3D model with data:", { landArea, rooms, preferences });

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

    // Create comprehensive 3D modeling prompt
    const prompt = `Generate a photorealistic, VR-ready 3D model of a house EXACTLY matching the provided 2D floor plan.

CRITICAL REQUIREMENTS:
1. FLOOR PLAN FIDELITY (100% Accuracy Required):
   - Follow the exact wall positions, dimensions, and layout from the floor plan image
   - Match all door and window placements precisely
   - Preserve room sizes and proportions exactly as shown
   - Maintain the same circulation flow and connections between rooms

2. ARCHITECTURAL SPECIFICATIONS:
   - Total Land Area: ${landArea} sq ft
   - Number of Floors: ${preferences.floors}
   - Architectural Style: ${preferences.style}
   - Vastu Compliant: ${preferences.vastuCompliant ? "Yes" : "No"}

3. ROOMS INCLUDED:
   ${roomDetails}

4. OUTDOOR FEATURES:
   ${outdoorFeatures}

5. EXTERIOR 3D MODELING (${preferences.style} Style):
   ${getStyleExteriorSpec(preferences.style)}

6. INTERIOR 3D MODELING:
   - Fully furnished realistic interiors for each room
   - Proper furniture placement: beds, sofas, dining table, kitchen counters
   - Bathroom fixtures: WC, basin, shower, geyser
   - Kitchen appliances: fridge, stove, sink, counters
   - Wardrobes and storage units in bedrooms
   - Realistic lighting (natural + artificial)
   - Accurate materials and textures
   - Wall height: 10 feet standard
   - Indian-style ceiling fans in all rooms
   - Proper electrical fittings and switches

7. LIGHTING & MATERIALS:
   - Natural daylight through windows
   - Ambient lighting (ceiling lights, cove lighting)
   - Task lighting (study lamps, kitchen lighting)
   - Realistic shadows and reflections
   - PBR materials (wood, tile, marble, paint, fabric)
   - Match materials to ${preferences.style} aesthetic

8. INDIAN HOME FEATURES:
   - Utility/wash area near kitchen
   - ${preferences.vastuCompliant ? "Vastu-compliant room directions" : "Practical room placement"}
   - Mosquito mesh on windows (subtle)
   - Proper ventilation openings
   - Space for water purifier in kitchen
   - Washing machine placement in utility

9. VR-READY SPECIFICATIONS:
   - Real-world scale (accurate measurements)
   - Walkable pathways (minimum 3 ft width)
   - Collision-enabled walls and furniture
   - Smooth navigation throughout
   - Camera height at 5.5 ft (human eye level)
   - Optimized mesh for performance

10. OUTPUT REQUIREMENTS:
    - High-resolution 3D render from multiple angles:
      * Exterior front view
      * Exterior aerial/bird's eye view  
      * Interior living room view
      * Interior kitchen view
      * Interior master bedroom view
    - Create a professional architectural visualization
    - Photorealistic materials and lighting
    - Clean, polished, magazine-quality output

Generate a complete, professionally rendered 3D model that looks like it was created by an architect using Revit, SketchUp, or 3ds Max. The output should be stunning, realistic, and precisely match the floor plan dimensions and layout.`;

    // Generate 3D model using Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: floorPlanImageUrl
                }
              }
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
    console.log("3D Model AI Response received");

    // Extract the generated image
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = data.choices?.[0]?.message?.content || "Professional 3D model generated based on your floor plan.";

    if (!imageUrl) {
      throw new Error('No 3D model image generated');
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
    console.error('Error in generate-3d-model function:', error);
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

function getStyleExteriorSpec(style: string): string {
  const specs: Record<string, string> = {
    'Modern': `
   - Flat or low-slope roof
   - White/grey/beige color palette
   - Large glass sliding doors and windows
   - Clean geometric lines
   - Wooden accent cladding panels
   - LED strip lighting on façade
   - Minimalist gate and boundary
   - Modern pergola over parking`,
    
    'Contemporary': `
   - Asymmetrical roof design
   - Mixed materials: stone, texture paint, metal
   - Dark-framed tall windows
   - Vertical architectural fins
   - Ambient exterior lighting
   - Green walls or vertical garden elements
   - Bold statement elements`,
    
    'Traditional': `
   - Sloping tiled roof (clay or terracotta)
   - Carved wooden main entrance door
   - Jaali patterns on windows and railings
   - Courtyard (optional)
   - Earthy colors: ochre, terracotta, cream
   - Decorative pillars at entrance
   - Traditional lantern-style lighting`,
    
    'Scandinavian': `
   - White or light pastel exterior walls
   - Natural light wood finishes
   - Large windows for maximum natural light
   - Simple, functional design
   - Minimal ornamentation
   - Sloped or flat roof
   - Clean lines with warm touches`,
    
    'Mediterranean': `
   - White stucco walls
   - Blue or sea-green accent colors
   - Terracotta or tiled roof
   - Arched doorways and windows
   - Wrought iron railings and fixtures
   - Natural stone accents
   - Outdoor terrace/patio area`,
    
    'Industrial': `
   - Exposed brick walls
   - Metal-framed large windows
   - Concrete and steel elements
   - Raw, unfinished aesthetic
   - Minimalist approach
   - Open, loft-like feel
   - Edison bulb style lighting`,
    
    'Rustic': `
   - Natural stone exterior walls
   - Heavy timber framing
   - Wooden doors and shutters
   - Warm earth-tone colors
   - Natural landscaping integration
   - Covered porch or veranda
   - Vintage-style outdoor lighting`,
    
    'Colonial': `
   - Symmetrical façade
   - Shuttered windows
   - Columned front porch
   - Hip or gable roof
   - Neutral color palette
   - Decorative crown molding
   - Classic proportions`,
    
    'Minimalist': `
   - Extremely clean flat surfaces
   - Monochromatic color scheme (white/grey/black)
   - Hidden/recessed lighting
   - Large glass panels
   - No ornamental elements
   - Perfect geometric forms
   - Zen-like simplicity`,
    
    'Luxury': `
   - Grand double-height entrance
   - Premium materials: marble, granite, imported wood
   - Dramatic lighting fixtures
   - Water features (fountain)
   - Manicured landscaping
   - Gated entrance with intercom
   - Statement driveway and parking`
  };

  return specs[style] || specs['Modern'];
}
