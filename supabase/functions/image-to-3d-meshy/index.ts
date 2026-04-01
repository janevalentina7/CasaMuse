import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MESHY_API_BASE = 'https://api.meshy.ai/openapi/v1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const MESHY_API_KEY = Deno.env.get('Meshyai');
  if (!MESHY_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'MESHY_API_KEY is not configured', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  try {
    const { action, imageUrl, taskId } = await req.json();

    // Action: create - Submit image to Meshy for 3D generation
    if (action === 'create') {
      if (!imageUrl) {
        return new Response(
          JSON.stringify({ error: 'imageUrl is required', success: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      console.log('Creating Meshy image-to-3D task...');
      const response = await fetch(`${MESHY_API_BASE}/image-to-3d`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MESHY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          enable_pbr: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Meshy create error:', response.status, errorText);
        throw new Error(`Meshy API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Meshy task created:', data.result);

      return new Response(
        JSON.stringify({ taskId: data.result, success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: poll - Check task status and get result
    if (action === 'poll') {
      if (!taskId) {
        return new Response(
          JSON.stringify({ error: 'taskId is required', success: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      console.log('Polling Meshy task:', taskId);
      const response = await fetch(`${MESHY_API_BASE}/image-to-3d/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${MESHY_API_KEY}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Meshy poll error:', response.status, errorText);
        throw new Error(`Meshy API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Meshy task status:', data.status, 'progress:', data.progress);

      return new Response(
        JSON.stringify({
          success: true,
          status: data.status, // PENDING, IN_PROGRESS, SUCCEEDED, FAILED
          progress: data.progress || 0,
          modelUrl: data.model_urls?.glb || null,
          thumbnailUrl: data.thumbnail_url || null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "create" or "poll".', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error('Error in image-to-3d-meshy:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
