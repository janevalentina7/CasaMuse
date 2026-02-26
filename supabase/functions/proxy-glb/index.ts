import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let url: string | null = null;

    if (req.method === 'GET') {
      const params = new URL(req.url).searchParams;
      url = params.get('url');
    } else {
      const body = await req.json();
      url = body.url;
    }

    if (!url) {
      return new Response(JSON.stringify({ error: 'url is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Proxying GLB from:', url.substring(0, 80) + '...');
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Upstream fetch failed: ${response.status}`);
    }

    // Stream the response body directly instead of buffering into memory
    const headers: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': 'model/gltf-binary',
    };

    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    return new Response(response.body, { headers });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
