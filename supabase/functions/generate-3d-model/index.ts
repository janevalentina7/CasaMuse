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
    
    console.log("Generating 3D model with data:", { landArea, rooms, preferences, view, specificRoom });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const roomsDescription = rooms.map((room: any) => {
      const roomInfo = `${room.count}x ${room.roomName} (${room.size}: ${room.width}'×${room.height}')`;
      return room.attachedBathroom ? `${roomInfo} with attached bathroom` : roomInfo;
    }).join('\n   ');

    const outdoorDescription = preferences.outdoorFeatures?.length > 0 
      ? `\nOUTDOOR FEATURES:\n   ${preferences.outdoorFeatures.join(', ')}` 
      : '';

    // Define view-specific instructions
    const viewInstructions: { [key: string]: string } = {
      '360': 'Generate a stunning 360-degree exterior perspective view showing the entire house from a dramatic angle. Show the front elevation with architectural details, windows, doors, roof, and surrounding outdoor elements. Include depth, shadows, and realistic lighting. This should be the main hero shot of the house.',
      'top': 'Generate a professional top-down aerial view (bird\'s eye view) showing the complete roof layout, building footprint, outdoor spaces, parking area, garden, and property boundaries. Show roof details, skylights, terrace areas, and the overall site layout clearly.',
      'side': 'Generate a clear side elevation view showing the house from the lateral perspective. Display the full height of the building, side windows, balconies, architectural features, and how the house sits on the ground. Show depth and 3D volume.',
      'back': 'Generate a detailed back/rear elevation view showing the rear façade of the house. Display back windows, doors, service areas, back garden or yard, and any outdoor features at the rear. Show architectural continuity with the front design.',
      'interior': specificRoom 
        ? `Generate a beautiful, fully furnished interior view of the ${specificRoom}. Show realistic furniture appropriate for this room type, décor items, lighting fixtures (ceiling lights, lamps), flooring with rugs if applicable, ceiling details (false ceiling, cove lighting), windows with curtains letting in natural light, and the overall interior design aesthetic matching the ${preferences.style} architectural style. Display the room's specific function and character with appropriate furnishings, layout, and ambiance. Make it look inviting, lived-in, and ready for use.`
        : 'Generate a beautiful interior walkthrough view showing a fully furnished living room or main living space. Display complete furniture arrangement, décor items, lighting fixtures, flooring, ceiling details, windows with natural light, and the overall interior design aesthetic matching the architectural style. Show depth with visible adjacent rooms or hallways to give a sense of the home\'s flow.'
    };

    const viewInstruction = viewInstructions[view] || viewInstructions['360'];

    const prompt = `${viewInstruction}

ARCHITECTURAL STYLE: ${preferences.style}

Generate a PHOTOREALISTIC, VR-READY 3D model visualization of this ${preferences.style} style house.

CRITICAL FLOOR PLAN FIDELITY:
- Follow the provided floor plan image EXACTLY
- Match all wall positions, dimensions, thicknesses
- Place doors and windows at exact locations shown in floor plan
- Maintain room sizes and proportions precisely
- Preserve circulation flow and pathways
- ${preferences.floors}-story building
- Land area: ${landArea} sq ft
- Vastu compliant: ${preferences.vastuCompliant ? 'Yes' : 'No'}

ROOMS TO MODEL (with exact floor plan positions):
   ${roomsDescription}

${outdoorDescription}

DETAILED ARCHITECTURAL SPECIFICATIONS FOR ${preferences.style.toUpperCase()} STYLE:

${getDetailedStyleSpec(preferences.style)}

3D MODEL REQUIREMENTS:
1. EXTERIOR MODELING:
   - Build structure following ${preferences.style} architectural guidelines
   - Generate realistic textures (walls, roof, wood, metal, glass)
   - Add all openings (windows, balconies, doors) as per floor plan
   - Include outdoor features: parking, garden, gate, balcony/terrace
   - Add Indian practical elements: drainage pipes, shade/awnings, grills

2. INTERIOR MODELING (Every Room):
   - Place walls with appropriate textures
   - Add windows/doors from floor plan positions
   - Furnish according to ${preferences.style} style
   - Add décor, lighting fixtures, switches, fans, AC units
   - Apply proper flooring and ceiling treatments
   - Include curtains, rugs, indoor plants

3. LIGHTING SYSTEM:
   - Natural lighting through windows
   - Interior ambient + task + accent lighting
   - Exterior night lighting with warm/cool tones
   - Ray-traced shadows for realism

4. MATERIAL ACCURACY:
   - Correct material properties, reflectivity, roughness
   - Realistic PBR shaders for all surfaces

5. VR WALKTHROUGH READY:
   - Real-world scale (1 ft = 0.3048 meters)
   - Collision-enabled walls, furniture, railings
   - Pathways ≥ 3 feet wide, doors ≥ 3 ft
   - Camera height: 1.62–1.7 m

6. INDIAN HOME FEATURES (Mandatory):
   - Utility/wash area with washing machine space
   - Pooja space (room or niche)
   - Extra storage solutions
   - Ceiling fans in all rooms
   - Indian-style bathroom fixtures
   - Heavy-cooking ventilation
   - Mosquito mesh compatibility

GENERATE 360-DEGREE VIEWABLE MODEL showing:
- Complete exterior from all angles
- Fully furnished interior spaces
- Top view showing roof and layout
- Side and back elevations
- Interior walkthrough perspective

The model must be production-ready, architecturally accurate, and suitable for VR walkthroughs.`;

    try {
      console.log('Calling Lovable AI Gateway for 3D generation...');
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-pro-image-preview',
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
      console.log('AI response received');

      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      const description = data.choices?.[0]?.message?.content || 'Your 3D model has been generated';

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
  } catch (error) {
    console.error('Error parsing request:', error);
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

function getDetailedStyleSpec(style: string): string {
  const specs: { [key: string]: string } = {
    'Modern': `MODERN ARCHITECTURE - Clean lines, geometric luxury

EXTERIOR:
- Flat or low-slope roof
- Boxy or cantilevered volumes
- Large rectangular windows with black aluminum frames
- Materials: smooth white plaster, exposed concrete panels, textured stone cladding, toughened glass
- Balcony with frameless glass railings
- Indian adaptations: sunshade projections, mosquito-proof mesh, heat-resistant roof tiles
- Outdoor: LED strip lights along façade, minimal trimmed garden, sleek pergola parking

INTERIOR:
- Open-concept living-dining-kitchen
- Matte finish laminates with hidden lighting (cove + spotlights)
- Modular kitchen with breakfast counter
- Modern straight-line furniture, neutral colors with accent wall
- Glossy vitrified tiles or wooden flooring
- Sliding glass/laminate wardrobes
- Indian features: shoe rack at entrance, backlit pooja niche, utility area`,

    'Contemporary': `CONTEMPORARY ARCHITECTURE - Trendy, asymmetrical, artistic

EXTERIOR:
- Mixed roof styles (flat + sloped), asymmetrical front elevation
- Large vertical windows with tinted glass
- Wooden-texture HPL panel highlights
- Materials: stone + wood + glass mixture, ceramic tiles, dual-tone plaster
- Indian adaptations: rain protection projection, curved contemporary grills
- Outdoor: vertical garden panel, warm white façade lighting, sleek boundary

INTERIOR:
- Mix of wood + metal + stone materials
- Floating staircase with glass railing
- Statement chandelier in living area
- Open kitchen with island
- Feature walls (textured, marble, wooden slats)
- Smart lighting + home automation ready
- Indian features: spacious utility, integrated storage, ventilation for cooking`,

    'Traditional': `TRADITIONAL INDIAN ARCHITECTURE - Classic charm, cultural richness

EXTERIOR:
- Sloped red-tile roof with carved wooden pillars
- Arched entrances, symmetrical windows with wooden shutters
- Materials: red clay tiles, natural stone, polished teak wood, terracotta
- Jaali patterns on railings/balconies
- Indian features: decorative railing, small veranda, courtyard option
- Outdoor: tulasi madam, courtyard-style garden, lantern-style lamps

INTERIOR:
- Warm wooden furniture with carved detailing
- Ethnic tiles/skirting, earthy colors
- Brass or copper décor elements
- Optional courtyard with skylight
- Separate pooja room with traditional design
- Indian features: spacious storage kitchen, utility for traditional cooking, wide passageways, jhula option`,

    'Minimalist': `MINIMALIST ARCHITECTURE - Extremely clean, uncluttered, calm

EXTERIOR:
- Clean rectangle volumes with zero ornamentation
- Flat roof only, simple long windows
- Materials: smooth white/grey plaster, matte black metal frames
- Indian adaptations: deep projections for shade, subtle courtyard/water feature
- Outdoor: zen garden, hidden lighting, invisible boundary effect

INTERIOR:
- Maximum open space with minimal furniture
- Pure white/grey palette
- Hidden storage solutions
- Simple linear lighting
- No decorative elements
- Indian features: concealed utility, minimal pooja corner, dust-resistant surfaces`,

    'Luxury': `LUXURY ARCHITECTURE - Premium, grand, expensive elegance

EXTERIOR:
- Grand double-height façade with full glass walls
- Marble cladding with dramatic entrance walkway
- Ornate glass/metal balcony railings
- Materials: Italian marble façade, gold-accent trims, laminated glass, wooden slats
- Indian adaptations: heat reflective coating, spacious portico, marble courtyard
- Outdoor: water fountain, LED pillar lights, high-end landscape

INTERIOR:
- Double-height living with premium finishes
- Statement lighting (chandeliers, designer fixtures)
- Imported marble/granite flooring
- Custom luxury furniture
- High-end modular kitchen with premium appliances
- Walk-in wardrobes with luxury fittings
- Indian features: grand pooja room, servant quarters option, luxury utility`,

    'Scandinavian': `SCANDINAVIAN ARCHITECTURE - Cozy, pastel, wooden, airy

EXTERIOR:
- Light sloped roof with vertical wooden slats
- Large picture windows, cute covered porch
- Materials: pine wood panels, pastel exterior paint, grey stone base
- Indian adaptations: heat-protective roofing, wide overhang for rains
- Outdoor: soft warm lighting, minimal pebble garden, simple wooden seating

INTERIOR:
- Light wooden floors with white walls
- Beige/caramel accents, cozy fabrics (linen, cotton)
- Soft natural lighting with functional furniture
- Rounded edges, indoor plants
- Indian features: closed cabinetry for dust, matte tiles, subtle pooja corner`,

    'Industrial': `INDUSTRIAL ARCHITECTURE - Raw, rugged, factory-inspired

EXTERIOR:
- Exposed brick façade with flat metal roof
- Large steel-frame windows, visible metal beams
- Materials: red/black brick, matte grey metal, raw concrete
- Indian adaptations: clay brick with weather-protection, metal mesh ventilation
- Outdoor: factory-style lamps, concrete pathway, simple shrubs

INTERIOR:
- Exposed brick walls and concrete surfaces
- Visible ducting and pipes
- Metal and wood furniture combinations
- Edison bulb lighting, metal fixtures
- Open shelving and industrial hardware
- Indian features: practical utility space, minimal ornamentation`,

    'Colonial': `COLONIAL ARCHITECTURE - Symmetry, grandeur, heritage

EXTERIOR:
- Big pillars in front with arched windows
- Symmetrical façade, sloped tiled roof
- Materials: white plaster, wooden window frames, stone pedestals
- Indian features: large veranda, red oxide entrance flooring
- Outdoor: front garden with fountain, decorative lanterns

INTERIOR:
- High ceilings with ornate moldings
- Symmetrical room layouts
- Classic wooden furniture
- Plantation shutters on windows
- Formal living and dining spaces
- Indian features: traditional pooja room, servant quarters provision`,

    'Mediterranean': `MEDITERRANEAN ARCHITECTURE - Warm, coastal, textured

EXTERIOR:
- Clay tile roof with arched doorways/windows
- Earthy-toned façade, wrought-iron balcony railings
- Materials: terracotta tiles, stucco plaster, sandstone accents
- Indian adaptations: larger shade projections, heat-reflective under tiles
- Outdoor: olive-style plants, soft yellow lighting, stone pathway

INTERIOR:
- Arched door frames with pastel interiors
- Mosaic tiles, light wooden beams
- Sheer curtains, rustic-chic furniture
- Warm ambient lighting
- Indian features: closed kitchen option, utility room, mosquito mesh windows`,

    'Rustic': `RUSTIC ARCHITECTURE - Natural, earthy, organic

EXTERIOR:
- Exposed stone walls with wooden beams
- Sloping roof, big earthy windows
- Materials: natural stone, dark wood, clay tiles
- Indian features: stone jaali accents, mud-inspired textures
- Outdoor: lantern lights, wild plant garden, wooden sit-out

INTERIOR:
- Natural stone feature walls
- Rough-hewn wooden beams and furniture
- Earthy color palette (browns, greens, terracotta)
- Traditional handcrafted elements
- Warm ambient lighting with lanterns
- Indian features: traditional cooking space, natural ventilation`
  };

  return specs[style] || specs['Modern'];
}
