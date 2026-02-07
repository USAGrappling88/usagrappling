import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { encode as encodeBase64 } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PostToTwitterRequest {
  pressReleaseId: string;
  customText?: string;
}

// HMAC-SHA1 using Web Crypto API
async function hmacSha1(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const dataData = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataData);
  return encodeBase64(new Uint8Array(signature));
}

// OAuth 1.0a signature generation
async function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): Promise<string> {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&");

  const signatureBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  return await hmacSha1(signingKey, signatureBase);
}

function generateNonce(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for Twitter credentials
    const consumerKey = Deno.env.get("TWITTER_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("TWITTER_CONSUMER_SECRET");
    const accessToken = Deno.env.get("TWITTER_ACCESS_TOKEN");
    const accessTokenSecret = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET");

    if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
      return new Response(
        JSON.stringify({ 
          error: "Twitter API credentials not configured",
          details: "Please add TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_ACCESS_TOKEN, and TWITTER_ACCESS_TOKEN_SECRET to your secrets."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { pressReleaseId, customText }: PostToTwitterRequest = await req.json();

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

    // Use custom text or fall back to generated twitter_post
    const tweetText = customText || pressRelease.twitter_post || 
      `${pressRelease.title}\n\n${pressRelease.canonical_url || `https://usagrappling.lovable.app/news/${pressRelease.slug}`}`;

    // Twitter API v2 endpoint
    const twitterUrl = "https://api.x.com/2/tweets";
    const method = "POST";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = generateNonce();

    // OAuth parameters (NO body params when signing for POST with JSON)
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_token: accessToken,
      oauth_version: "1.0",
    };

    // Generate signature WITHOUT body params
    const signature = await generateOAuthSignature(
      method,
      twitterUrl,
      oauthParams,
      consumerSecret,
      accessTokenSecret
    );

    // Build Authorization header
    const authHeader = `OAuth ${Object.entries({
      ...oauthParams,
      oauth_signature: signature,
    })
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")}`;

    console.log("Posting to Twitter...");

    const response = await fetch(twitterUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: tweetText }),
    });

    const responseText = await response.text();
    console.log("Twitter response:", response.status, responseText);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to post to Twitter", 
          details: responseText,
          status: response.status 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tweetData = JSON.parse(responseText);

    // Update approval note with tweet info
    const { data: current } = await supabase
      .from("press_releases")
      .select("approval_note")
      .eq("id", pressReleaseId)
      .single();

    const newNote = current?.approval_note
      ? `${current.approval_note}\nPosted to Twitter: ${new Date().toISOString()} - Tweet ID: ${tweetData.data?.id}`
      : `Posted to Twitter: ${new Date().toISOString()} - Tweet ID: ${tweetData.data?.id}`;

    await supabase
      .from("press_releases")
      .update({ approval_note: newNote })
      .eq("id", pressReleaseId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        tweetId: tweetData.data?.id,
        tweetUrl: `https://twitter.com/i/web/status/${tweetData.data?.id}`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error posting to Twitter:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
