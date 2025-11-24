import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { landArea, rooms, preferences, floorPlanDescription } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating cost estimation for:', { landArea, roomCount: rooms.length, style: preferences?.style });

    // Calculate total area
    const totalArea = rooms.reduce((sum: number, room: any) => {
      return sum + (room.length * room.breadth);
    }, 0);

    // Build comprehensive prompt
    const systemPrompt = `You are an advanced construction-estimation engine designed for real-time, accurate, India-specific building cost predictions.

CRITICAL REQUIREMENTS:

1. REAL-TIME COST ESTIMATION:
- Fetch current 2024-2025 material prices in India
- Use current labor costs per sq ft based on Indian construction norms
- Include ALL costs: foundation, structure, masonry, roofing, flooring, electrical, plumbing, painting, carpentry, smart home, furnishing, exterior, contingencies, taxes

2. MATERIAL EXPLANATION (FOR EVERY MATERIAL):
- Why this material is chosen (climate, durability, aesthetic, maintenance, lifespan, strength)
- Advantages (3-5 key pros)
- Disadvantages (2-4 realistic cons)
- Real-time price (₹) per unit with market variation range
- Alternatives with lower/higher cost options

3. OUTPUT STRUCTURE:
Return a JSON object with this EXACT structure:
{
  "summary": {
    "totalCost": number (in rupees),
    "costPerSqFt": number,
    "breakdown": {
      "civil": number,
      "interior": number,
      "exterior": number,
      "labor": number,
      "electrical": number,
      "plumbing": number
    },
    "buildTime": "string (e.g., '6-8 months')"
  },
  "materials": [
    {
      "category": "string (e.g., 'Foundation', 'Walls', 'Flooring')",
      "items": [
        {
          "name": "string",
          "quantity": "string with units",
          "cost": number (per unit),
          "total": number,
          "advantages": ["string1", "string2", "string3"],
          "disadvantages": ["string1", "string2"],
          "alternatives": "string describing alternatives"
        }
      ]
    }
  ],
  "costOptimization": {
    "savings": [
      {
        "area": "string",
        "suggestion": "string",
        "savings": number
      }
    ],
    "improvements": [
      {
        "area": "string",
        "suggestion": "string",
        "additionalCost": number,
        "benefit": "string"
      }
    ]
  },
  "fullDetails": "string - comprehensive markdown formatted analysis with all calculations and explanations"
}

4. COST OPTIMIZATION:
- Provide 3-5 cost reduction options with specific savings
- Provide 3-5 value improvement options with costs and benefits
- Compare material options (UPVC vs Aluminum, Vitrified vs Granite, etc.)

5. ACCURACY REQUIREMENTS:
- Base calculations on EXACT room sizes provided
- Adjust for architectural style requirements
- Include Indian market realities (labor costs, material availability)
- Account for regional variations
- Include contingencies (10-15%)`;

    const userPrompt = `Generate a detailed cost estimation for this Indian house:

FLOOR PLAN DETAILS:
${floorPlanDescription || 'Not provided'}

LAND AREA: ${landArea} sq ft
TOTAL BUILT-UP AREA: ${totalArea} sq ft

ROOMS:
${rooms.map((room: any) => `- ${room.roomName}: ${room.length}ft x ${room.breadth}ft (${room.length * room.breadth} sq ft)`).join('\n')}

ARCHITECTURAL STYLE: ${preferences?.style || 'Modern'}
${preferences?.vastuCompliant ? '✓ Vastu Compliant design required' : ''}

ADDITIONAL PREFERENCES:
- Floors: ${preferences?.floors || 1}
${preferences?.balcony ? '✓ Balcony included' : ''}
${preferences?.parking ? '✓ Parking area included' : ''}

REQUIREMENTS:
1. Calculate ACCURATE costs based on current 2024-2025 Indian market prices
2. Provide detailed material breakdown with advantages/disadvantages
3. Explain material choices for ${preferences?.style || 'Modern'} style
4. Include cost optimization suggestions
5. Calculate precise quantities based on exact room dimensions
6. Return response as VALID JSON matching the specified structure

Generate comprehensive estimation now.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`Failed to generate cost estimation: ${response.status}`);
    }

    const aiData = await response.json();
    let estimationText = aiData.choices[0].message.content;

    console.log('AI Response received, length:', estimationText.length);

    // Try to parse JSON response
    let estimationData;
    try {
      // Remove markdown code blocks if present
      estimationText = estimationText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      estimationData = JSON.parse(estimationText);
    } catch (parseError) {
      console.error('Failed to parse JSON, using raw text');
      // If JSON parsing fails, create a basic structure with the full text
      estimationData = {
        summary: {
          totalCost: 0,
          costPerSqFt: 0,
          breakdown: {
            civil: 0,
            interior: 0,
            exterior: 0,
            labor: 0,
            electrical: 0,
            plumbing: 0
          },
          buildTime: 'Estimate not available'
        },
        materials: [],
        costOptimization: {
          savings: [],
          improvements: []
        },
        fullDetails: estimationText
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        estimation: estimationData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-cost-estimation:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
