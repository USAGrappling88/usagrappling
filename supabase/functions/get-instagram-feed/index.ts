import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
    const instagramAccountId = Deno.env.get("INSTAGRAM_BUSINESS_ACCOUNT_ID");

    if (!accessToken || !instagramAccountId) {
      return new Response(
        JSON.stringify({ 
          error: "Instagram API credentials not configured",
          posts: []
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse limit from request (default 12)
    let limit = 12;
    try {
      const body = await req.json();
      if (body.limit && typeof body.limit === "number") {
        limit = Math.min(body.limit, 20); // Cap at 20
      }
    } catch {
      // No body or invalid JSON, use default
    }

    console.log(`Fetching ${limit} Instagram posts...`);

    // Fetch recent media from Instagram Graph API (v21.0 is latest as of 2024)
    // The /media endpoint returns posts in reverse chronological order by default
    const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
    const apiUrl = `https://graph.facebook.com/v21.0/${instagramAccountId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`;

    console.log(`Fetching from Instagram API v21.0...`);

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Instagram API error:", data.error);
      return new Response(
        JSON.stringify({ 
          error: data.error?.message || "Failed to fetch Instagram posts",
          posts: []
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const posts: InstagramPost[] = data.data || [];

    console.log(`Successfully fetched ${posts.length} posts`);

    return new Response(
      JSON.stringify({ posts }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error fetching Instagram feed:", error);
    return new Response(
      JSON.stringify({ error: error.message, posts: [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
