import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PostToInstagramRequest {
  pressReleaseId: string;
  customCaption?: string;
  imageUrl: string; // Required: publicly accessible image URL
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
          details: "Please add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID to your secrets."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { pressReleaseId, customCaption, imageUrl }: PostToInstagramRequest = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL is required for Instagram posts" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the press release
    const { data: pressRelease, error: fetchError } = await supabase
      .from("press_releases")
      .select("*")
      .eq("id", pressReleaseId)
      .single();

    if (fetchError || !pressRelease) {
      return new Response(
        JSON.stringify({ error: "Press release not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use custom caption or fall back to stored instagram_caption
    const caption = customCaption || pressRelease.instagram_caption || pressRelease.title;

    console.log("Creating Instagram media container...");

    // Step 1: Create a media container
    const createMediaUrl = `https://graph.facebook.com/v19.0/${instagramAccountId}/media`;
    const createMediaResponse = await fetch(createMediaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken,
      }),
    });

    const createMediaData = await createMediaResponse.json();
    console.log("Create media response:", JSON.stringify(createMediaData));

    if (!createMediaResponse.ok || createMediaData.error) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to create Instagram media container", 
          details: createMediaData.error?.message || JSON.stringify(createMediaData),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const containerId = createMediaData.id;

    // Step 2: Publish the media container
    console.log("Publishing Instagram media...");
    const publishUrl = `https://graph.facebook.com/v19.0/${instagramAccountId}/media_publish`;
    const publishResponse = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    });

    const publishData = await publishResponse.json();
    console.log("Publish response:", JSON.stringify(publishData));

    if (!publishResponse.ok || publishData.error) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to publish Instagram post", 
          details: publishData.error?.message || JSON.stringify(publishData),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mediaId = publishData.id;

    // Update approval note with post info
    const { data: current } = await supabase
      .from("press_releases")
      .select("approval_note")
      .eq("id", pressReleaseId)
      .single();

    const newNote = current?.approval_note
      ? `${current.approval_note}\nPosted to Instagram: ${new Date().toISOString()} - Media ID: ${mediaId}`
      : `Posted to Instagram: ${new Date().toISOString()} - Media ID: ${mediaId}`;

    await supabase
      .from("press_releases")
      .update({ approval_note: newNote })
      .eq("id", pressReleaseId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        mediaId: mediaId,
        postUrl: `https://www.instagram.com/p/${mediaId}/`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error posting to Instagram:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
