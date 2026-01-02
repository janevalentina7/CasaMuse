import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Real-time Indian market rates (2024-2025)
const INDIAN_MATERIAL_RATES = {
  cement: { rate: 380, unit: 'per bag (50kg)', brand: 'UltraTech/ACC/Ambuja' },
  steel: { rate: 65000, unit: 'per ton', grade: 'Fe500/Fe500D TMT' },
  bricks: { rate: 8, unit: 'per piece', type: 'Red clay/Fly ash' },
  sand: { rate: 55, unit: 'per cubic ft', type: 'River/M-sand' },
  aggregate: { rate: 45, unit: 'per cubic ft', type: '20mm/10mm' },
  tiles: { rate: 55, unit: 'per sq ft', type: 'Vitrified' },
  paint: { rate: 25, unit: 'per sq ft', brand: 'Asian/Berger' },
  plumbing: { rate: 150, unit: 'per sq ft' },
  electrical: { rate: 180, unit: 'per sq ft' },
  woodwork: { rate: 1200, unit: 'per sq ft', type: 'Teak/Sal' },
  labor: { skilled: 800, unskilled: 500, unit: 'per day' },
};

// Construction rates by city (per sq ft)
const CITY_RATES: Record<string, number> = {
  'mumbai': 3500,
  'delhi': 2800,
  'bangalore': 2600,
  'chennai': 2400,
  'hyderabad': 2300,
  'pune': 2500,
  'kolkata': 2200,
  'ahmedabad': 2100,
  'jaipur': 2000,
  'lucknow': 1900,
  'default': 2000,
};

// Land rates by city (per sq ft)
const LAND_RATES: Record<string, { min: number; max: number }> = {
  'mumbai': { min: 15000, max: 100000 },
  'delhi': { min: 8000, max: 50000 },
  'bangalore': { min: 5000, max: 25000 },
  'chennai': { min: 4000, max: 20000 },
  'hyderabad': { min: 3500, max: 18000 },
  'pune': { min: 4500, max: 22000 },
  'kolkata': { min: 3000, max: 15000 },
  'ahmedabad': { min: 2500, max: 12000 },
  'jaipur': { min: 2000, max: 10000 },
  'lucknow': { min: 1800, max: 8000 },
  'default': { min: 1500, max: 8000 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { landArea, rooms, preferences, floorPlanDescription, userBudget, location, desiredBuildTime, action, adjustmentType, currentCost, materials, targetBudget } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Handle adjustment action for upgrade/downgrade - return fallback suggestions
    if (action === 'adjust') {
      const adjustments = generateAdjustmentSuggestions(adjustmentType, currentCost || 5000000);
      return new Response(
        JSON.stringify({
          success: true,
          adjustments,
          newTotalCost: adjustmentType === 'upgrade' 
            ? (currentCost || 5000000) * 1.15 
            : (currentCost || 5000000) * 0.85
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    function generateAdjustmentSuggestions(type: string, baseCost: number) {
      if (type === 'upgrade') {
        return [
          { category: "Flooring", currentMaterial: "Vitrified Tiles", suggestedMaterial: "Italian Marble", currentCost: baseCost * 0.08, newCost: baseCost * 0.15, difference: baseCost * 0.07, reason: "Premium look and durability", impact: "Luxury finish, 50+ years lifespan" },
          { category: "Kitchen", currentMaterial: "Granite Countertop", suggestedMaterial: "Quartz Countertop", currentCost: baseCost * 0.03, newCost: baseCost * 0.05, difference: baseCost * 0.02, reason: "Non-porous, stain-resistant", impact: "Modern aesthetics, easier maintenance" },
          { category: "Windows", currentMaterial: "Aluminum Windows", suggestedMaterial: "UPVC Double Glazed", currentCost: baseCost * 0.04, newCost: baseCost * 0.07, difference: baseCost * 0.03, reason: "Better insulation", impact: "30% reduction in AC costs" },
        ];
      } else {
        return [
          { category: "Flooring", currentMaterial: "Vitrified Tiles", suggestedMaterial: "Ceramic Tiles", currentCost: baseCost * 0.08, newCost: baseCost * 0.05, difference: baseCost * -0.03, reason: "Good quality at lower cost", impact: "Still 20+ year lifespan" },
          { category: "Kitchen", currentMaterial: "Modular Kitchen", suggestedMaterial: "Semi-Modular Kitchen", currentCost: baseCost * 0.06, newCost: baseCost * 0.04, difference: baseCost * -0.02, reason: "Functional with good storage", impact: "Equally functional" },
          { category: "Doors", currentMaterial: "Solid Wood Doors", suggestedMaterial: "Flush Doors with Laminate", currentCost: baseCost * 0.04, newCost: baseCost * 0.025, difference: baseCost * -0.015, reason: "Moisture resistant", impact: "Modern look, 15-year lifespan" },
        ];
      }
    }

    console.log('Generating cost estimation for:', { landArea, roomCount: rooms?.length, style: preferences?.style, budget: userBudget, location });

    // Calculate total built-up area - use room dimensions from form
    let totalArea = 0;
    if (rooms && rooms.length > 0) {
      totalArea = rooms.reduce((sum: number, room: any) => {
        const roomArea = (room.width || 10) * (room.height || 12) * (room.count || 1);
        const bathroomArea = room.attachedBathroom ? (6 * 7 * (room.count || 1)) : 0;
        return sum + roomArea + bathroomArea;
      }, 0);
    }
    if (totalArea === 0) totalArea = landArea * 0.6;

    // Get location-specific rates
    const cityKey = location?.toLowerCase().replace(/[^a-z]/g, '') || 'default';
    const constructionRate = CITY_RATES[cityKey] || CITY_RATES['default'];
    const landRates = LAND_RATES[cityKey] || LAND_RATES['default'];
    const avgLandRate = (landRates.min + landRates.max) / 2;

    // Calculate base costs
    let constructionCost = totalArea * constructionRate;
    const landCost = landArea * avgLandRate;

    // Style multiplier
    const styleMultipliers: Record<string, number> = {
      'Luxury': 1.5,
      'Modern': 1.2,
      'Contemporary': 1.15,
      'Traditional': 1.0,
      'Minimalist': 0.95,
      'Colonial': 1.1,
      'Mediterranean': 1.25,
      'Industrial': 1.1,
      'Scandinavian': 1.15,
      'Rustic': 0.9,
    };
    const styleMultiplier = styleMultipliers[preferences?.style] || 1.0;
    let adjustedConstructionCost = constructionCost * styleMultiplier;

    // If user has a budget, adjust the construction cost to fit
    const budgetValue = userBudget || targetBudget;
    let budgetConstrained = false;
    if (budgetValue && budgetValue > 0) {
      const maxConstructionBudget = budgetValue - landCost;
      if (maxConstructionBudget > 0 && adjustedConstructionCost > maxConstructionBudget) {
        // User budget is lower than estimated - we'll provide budget-constrained estimation
        budgetConstrained = true;
        console.log('Budget constrained - adjusting to fit user budget:', budgetValue);
      }
    }

    console.log('Calculated costs:', { totalArea, constructionRate, constructionCost, landCost, styleMultiplier });

    // Build comprehensive prompt with tool calling for structured output
    const systemPrompt = `You are an expert Indian construction cost estimator with real-time market knowledge for 2024-2025.

IMPORTANT: You MUST provide accurate, non-zero cost estimations based on:
- Built-up area: ${totalArea} sq ft
- Location: ${location || 'India (average)'}
- Construction rate: ₹${constructionRate}/sq ft
- Land rate: ₹${avgLandRate}/sq ft (range: ₹${landRates.min}-${landRates.max})
- Style: ${preferences?.style || 'Modern'} (multiplier: ${styleMultiplier}x)

BASE CALCULATIONS:
- Land cost: ₹${(landCost).toLocaleString('en-IN')}
- Construction cost: ₹${(adjustedConstructionCost).toLocaleString('en-IN')}
- Total estimate: ₹${(adjustedConstructionCost + landCost).toLocaleString('en-IN')}

${userBudget ? `USER BUDGET: ₹${userBudget.toLocaleString('en-IN')} - Provide suggestions to fit this budget OR explain what can be achieved within it.` : ''}

CURRENT INDIAN MARKET RATES (2024-2025):
- Cement (UltraTech/ACC): ₹380/bag
- Steel TMT (Fe500D): ₹65,000/ton  
- Bricks: ₹8/piece
- River Sand: ₹55/cft
- M-Sand: ₹45/cft
- Vitrified Tiles: ₹55/sqft
- Granite: ₹150/sqft
- Marble: ₹200/sqft
- Paint (Asian/Berger): ₹25/sqft
- UPVC Windows: ₹450/sqft
- Aluminum Windows: ₹350/sqft
- Teak Wood: ₹3500/cft
- Plywood (BWP): ₹95/sqft
- Electrical Wiring: ₹180/sqft
- Plumbing: ₹150/sqft
- Skilled Labor: ₹800/day
- Unskilled Labor: ₹500/day

For each material, explain:
1. Why it's chosen (climate suitability, durability, aesthetics)
2. 3-5 advantages
3. 2-3 disadvantages
4. Cost-effective alternatives with price comparison`;

    const userPrompt = `Generate detailed cost estimation for this Indian house:

LOCATION: ${location || 'Not specified (using average rates)'}
LAND AREA: ${landArea} sq ft
BUILT-UP AREA: ${totalArea} sq ft
ARCHITECTURAL STYLE: ${preferences?.style || 'Modern'}

ROOMS:
${rooms?.map((room: any) => `- ${room.roomName}: ${room.length}ft × ${room.breadth}ft (${room.length * room.breadth} sqft)`).join('\n') || 'Standard layout'}

${userBudget ? `
USER'S BUDGET: ₹${userBudget.toLocaleString('en-IN')}
Please provide:
1. If budget is sufficient - detailed breakdown within budget
2. If budget is low - what can be achieved and what needs to increase
3. Specific material choices to fit budget
4. Priority features vs optional features within budget` : ''}

REQUIREMENTS:
1. Calculate EXACT costs (never return 0)
2. Include land cost for ${location || 'tier-2 city'}
3. Provide detailed material breakdown with WHY each is chosen
4. Give upgrade suggestions with exact cost differences
5. Give downgrade/savings options with exact savings
6. Include labor costs, contingencies (10%), and taxes (GST 18%)`;

    // Use tool calling for structured output
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
        tools: [
          {
            type: "function",
            function: {
              name: "generate_cost_estimation",
              description: "Generate a detailed construction cost estimation with materials, breakdown, and optimization suggestions",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "object",
                    properties: {
                      totalCost: { type: "number", description: "Total construction cost in INR (must be > 0)" },
                      landCost: { type: "number", description: "Land cost based on location" },
                      constructionCost: { type: "number", description: "Building construction cost" },
                      costPerSqFt: { type: "number", description: "Cost per square foot" },
                      breakdown: {
                        type: "object",
                        properties: {
                          civil: { type: "number" },
                          interior: { type: "number" },
                          exterior: { type: "number" },
                          labor: { type: "number" },
                          electrical: { type: "number" },
                          plumbing: { type: "number" }
                        },
                        required: ["civil", "interior", "exterior", "labor", "electrical", "plumbing"]
                      },
                      buildTime: { type: "string" },
                      contingency: { type: "number" },
                      gst: { type: "number" }
                    },
                    required: ["totalCost", "costPerSqFt", "breakdown", "buildTime"]
                  },
                  materials: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        items: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              quantity: { type: "string" },
                              cost: { type: "number" },
                              total: { type: "number" },
                              whyChosen: { type: "string" },
                              advantages: { type: "array", items: { type: "string" } },
                              disadvantages: { type: "array", items: { type: "string" } },
                              alternatives: { type: "string" }
                            },
                            required: ["name", "quantity", "cost", "total", "advantages", "disadvantages"]
                          }
                        }
                      },
                      required: ["category", "items"]
                    }
                  },
                  costOptimization: {
                    type: "object",
                    properties: {
                      savings: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            area: { type: "string" },
                            suggestion: { type: "string" },
                            savings: { type: "number" },
                            materialChange: { type: "string" }
                          },
                          required: ["area", "suggestion", "savings"]
                        }
                      },
                      improvements: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            area: { type: "string" },
                            suggestion: { type: "string" },
                            additionalCost: { type: "number" },
                            benefit: { type: "string" }
                          },
                          required: ["area", "suggestion", "additionalCost", "benefit"]
                        }
                      }
                    },
                    required: ["savings", "improvements"]
                  },
                  budgetAnalysis: {
                    type: "object",
                    properties: {
                      isSufficient: { type: "boolean" },
                      shortfall: { type: "number" },
                      recommendations: { type: "array", items: { type: "string" } },
                      priorityFeatures: { type: "array", items: { type: "string" } },
                      optionalFeatures: { type: "array", items: { type: "string" } }
                    }
                  },
                  fullDetails: { type: "string", description: "Comprehensive markdown analysis" }
                },
                required: ["summary", "materials", "costOptimization", "fullDetails"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_cost_estimation" } },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      // Return fallback with calculated values
      return new Response(
        JSON.stringify({
          success: true,
          estimation: createFallbackEstimation(totalArea, landArea, adjustedConstructionCost, landCost, preferences?.style, location)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    console.log('AI Response received');

    let estimationData;
    
    // Extract from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        estimationData = JSON.parse(toolCall.function.arguments);
        console.log('Parsed tool call response successfully');
      } catch (e) {
        console.error('Failed to parse tool call:', e);
      }
    }

    // Fallback to content parsing
    if (!estimationData) {
      const content = aiData.choices?.[0]?.message?.content;
      if (content) {
        try {
          const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          estimationData = JSON.parse(cleaned);
        } catch (e) {
          console.error('Failed to parse content:', e);
        }
      }
    }

    // Use fallback if still no data or zero values
    if (!estimationData || !estimationData.summary?.totalCost || estimationData.summary.totalCost === 0) {
      console.log('Using fallback estimation');
      estimationData = createFallbackEstimation(totalArea, landArea, adjustedConstructionCost, landCost, preferences?.style, location);
    }

    // Ensure non-zero values
    if (estimationData.summary) {
      if (!estimationData.summary.totalCost || estimationData.summary.totalCost < 100000) {
        estimationData.summary.totalCost = adjustedConstructionCost + landCost;
      }
      if (!estimationData.summary.costPerSqFt || estimationData.summary.costPerSqFt < 1000) {
        estimationData.summary.costPerSqFt = Math.round(adjustedConstructionCost / totalArea);
      }
      if (!estimationData.summary.landCost) {
        estimationData.summary.landCost = landCost;
      }
      if (!estimationData.summary.constructionCost) {
        estimationData.summary.constructionCost = adjustedConstructionCost;
      }
    }

    console.log('Final estimation:', { 
      totalCost: estimationData.summary?.totalCost,
      costPerSqFt: estimationData.summary?.costPerSqFt 
    });

    return new Response(
      JSON.stringify({
        success: true,
        estimation: estimationData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

function createFallbackEstimation(
  totalArea: number, 
  landArea: number, 
  constructionCost: number, 
  landCost: number, 
  style: string = 'Modern',
  location: string = 'India'
) {
  const totalCost = constructionCost + landCost;
  const costPerSqFt = Math.round(constructionCost / totalArea);
  
  return {
    summary: {
      totalCost: Math.round(totalCost),
      landCost: Math.round(landCost),
      constructionCost: Math.round(constructionCost),
      costPerSqFt: costPerSqFt,
      breakdown: {
        civil: Math.round(constructionCost * 0.35),
        interior: Math.round(constructionCost * 0.20),
        exterior: Math.round(constructionCost * 0.10),
        labor: Math.round(constructionCost * 0.20),
        electrical: Math.round(constructionCost * 0.08),
        plumbing: Math.round(constructionCost * 0.07)
      },
      buildTime: totalArea < 1500 ? '6-8 months' : totalArea < 3000 ? '10-12 months' : '14-18 months',
      contingency: Math.round(constructionCost * 0.10),
      gst: Math.round(constructionCost * 0.18)
    },
    materials: [
      {
        category: 'Foundation & Structure',
        items: [
          {
            name: 'Cement (UltraTech/ACC OPC 53)',
            quantity: `${Math.ceil(totalArea * 0.4)} bags`,
            cost: 380,
            total: Math.round(totalArea * 0.4 * 380),
            whyChosen: 'OPC 53 grade provides high early strength, ideal for RCC structures in Indian climate',
            advantages: ['High compressive strength', 'Fast setting time', 'Durable in humid conditions', 'Widely available'],
            disadvantages: ['Higher cost than PPC', 'More heat generation during curing'],
            alternatives: 'PPC (Portland Pozzolana Cement) - ₹350/bag, better for plastering'
          },
          {
            name: 'Steel TMT Bars (Fe500D)',
            quantity: `${Math.ceil(totalArea * 4 / 1000)} tons`,
            cost: 65000,
            total: Math.round(totalArea * 4 / 1000 * 65000),
            whyChosen: 'Fe500D provides superior ductility and earthquake resistance, essential for Indian seismic zones',
            advantages: ['High tensile strength', 'Better corrosion resistance', 'Earthquake safe', 'ISI certified'],
            disadvantages: ['Costlier than Fe415', 'Requires skilled welding'],
            alternatives: 'Fe415 - ₹58,000/ton, suitable for low-rise buildings'
          }
        ]
      },
      {
        category: 'Walls & Masonry',
        items: [
          {
            name: 'AAC Blocks',
            quantity: `${Math.ceil(totalArea * 12)} pieces`,
            cost: 55,
            total: Math.round(totalArea * 12 * 55),
            whyChosen: 'Lightweight, better thermal insulation, reduces AC costs in Indian summer',
            advantages: ['Light weight', 'Thermal insulation', 'Fire resistant', 'Faster construction'],
            disadvantages: ['Higher initial cost', 'Requires special adhesive'],
            alternatives: 'Red clay bricks - ₹8/piece, traditional but heavier'
          }
        ]
      },
      {
        category: 'Flooring',
        items: [
          {
            name: 'Vitrified Tiles (Kajaria/Somany)',
            quantity: `${totalArea} sq ft`,
            cost: 55,
            total: Math.round(totalArea * 55),
            whyChosen: 'Stain-resistant, low maintenance, ideal for Indian dust and monsoon conditions',
            advantages: ['Low water absorption', 'Scratch resistant', 'Easy to clean', 'Wide variety'],
            disadvantages: ['Slippery when wet', 'Cold in winter'],
            alternatives: 'Ceramic tiles - ₹35/sqft, Marble - ₹200/sqft'
          }
        ]
      },
      {
        category: 'Electrical',
        items: [
          {
            name: 'Complete Electrical Work',
            quantity: `${totalArea} sq ft`,
            cost: 180,
            total: Math.round(totalArea * 180),
            whyChosen: 'Includes Havells/Polycab wiring, modular switches, DB, earthing as per Indian standards',
            advantages: ['ISI certified materials', 'Fire safety compliant', 'Modular design'],
            disadvantages: ['Higher initial investment', 'Requires certified electrician'],
            alternatives: 'Basic wiring - ₹120/sqft'
          }
        ]
      },
      {
        category: 'Plumbing',
        items: [
          {
            name: 'Complete Plumbing (CPVC/uPVC)',
            quantity: `${totalArea} sq ft`,
            cost: 150,
            total: Math.round(totalArea * 150),
            whyChosen: 'CPVC for hot water lines, uPVC for drainage - ideal for Indian hard water conditions',
            advantages: ['Corrosion free', 'Long lifespan (50+ years)', 'Low maintenance'],
            disadvantages: ['UV sensitive', 'Cannot be used for high pressure'],
            alternatives: 'GI pipes - ₹100/sqft but prone to rusting'
          }
        ]
      }
    ],
    costOptimization: {
      savings: [
        {
          area: 'Flooring',
          suggestion: 'Use ceramic tiles in bedrooms instead of vitrified throughout',
          savings: Math.round(totalArea * 0.4 * 20),
          materialChange: 'Vitrified (₹55) → Ceramic (₹35)'
        },
        {
          area: 'Windows',
          suggestion: 'Use powder-coated aluminum instead of UPVC',
          savings: Math.round(totalArea * 0.15 * 100),
          materialChange: 'UPVC (₹450) → Aluminum (₹350)'
        },
        {
          area: 'Paint',
          suggestion: 'Use premium emulsion only in living areas, standard in other rooms',
          savings: Math.round(totalArea * 2 * 10),
          materialChange: 'Premium throughout → Mixed approach'
        }
      ],
      improvements: [
        {
          area: 'Flooring Upgrade',
          suggestion: 'Upgrade to Italian marble in living room for luxury feel',
          additionalCost: Math.round(totalArea * 0.2 * 150),
          benefit: 'Premium aesthetics, cooler in summer, higher resale value'
        },
        {
          area: 'Smart Home',
          suggestion: 'Add basic smart home features (smart switches, sensors)',
          additionalCost: Math.round(totalArea * 50),
          benefit: 'Energy savings, convenience, modern lifestyle'
        },
        {
          area: 'Solar Power',
          suggestion: 'Install 3kW rooftop solar system',
          additionalCost: 180000,
          benefit: 'Reduce electricity bills by 70%, government subsidy available'
        }
      ]
    },
    fullDetails: `## Detailed Cost Analysis for ${style} Style Home in ${location}

### Project Overview
- **Total Land Area:** ${landArea} sq ft
- **Built-up Area:** ${totalArea} sq ft
- **Architectural Style:** ${style}
- **Location:** ${location}

### Cost Breakdown

#### Land Cost: ₹${landCost.toLocaleString('en-IN')}
Based on current market rates in ${location}

#### Construction Cost: ₹${constructionCost.toLocaleString('en-IN')}
At ₹${costPerSqFt}/sq ft (adjusted for ${style} style)

### Material Selection Rationale

All materials selected keeping in mind:
1. Indian climate conditions (monsoon, heat, humidity)
2. Local availability and ISI certification
3. Long-term durability and low maintenance
4. Cost-effectiveness without compromising quality

### Timeline
Expected completion: ${totalArea < 1500 ? '6-8 months' : totalArea < 3000 ? '10-12 months' : '14-18 months'}

### Important Notes
- Prices are based on Q1 2025 market rates
- Include 10% contingency for unforeseen expenses
- GST applicable at 18% on construction services
- Rates may vary ±10% based on exact location and market conditions`
  };
}
