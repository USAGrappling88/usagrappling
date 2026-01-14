import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateContentRequest {
  pressReleaseId: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { pressReleaseId }: GenerateContentRequest = await req.json();
    
    console.log("Generating content for press release:", pressReleaseId);
    
    // Fetch the press release
    const { data: pressRelease, error: fetchError } = await supabase
      .from("press_releases")
      .select("*")
      .eq("id", pressReleaseId)
      .single();
    
    if (fetchError || !pressRelease) {
      console.error("Error fetching press release:", fetchError);
      return new Response(
        JSON.stringify({ error: "Press release not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { title, body_html, summary } = pressRelease;
    const contentSummary = summary || (body_html ? body_html.replace(/<[^>]*>/g, '').substring(0, 500) : title);
    
    // Generate slug
    const slug = generateSlug(title);
    const canonical_url = `https://www.usa-grappling.com/news/${slug}`;
    
    // Generate meta content
    const meta_title = title.length > 60 ? title.substring(0, 57) + '...' : title;
    const meta_description = contentSummary.length > 160 ? contentSummary.substring(0, 157) + '...' : contentSummary;
    
    let generatedContent = {
      linkedin_post: `📰 ${title}\n\n${contentSummary.substring(0, 200)}...\n\nRead more: ${canonical_url}\n\n#USAGrappling #Grappling #Wrestling #MartialArts`,
      instagram_caption: `${title}\n\n${contentSummary.substring(0, 150)}...\n\n🔗 Link in bio\n\n#USAGrappling #Grappling #Wrestling #MartialArts #GrapplingCommunity`,
      pitch_email: `Subject: ${title}\n\nDear Editor,\n\nUSA Grappling is pleased to share the following press release for your consideration:\n\n${title}\n\n${contentSummary}\n\nFor more information or to schedule an interview, please contact media@usa-grappling.com.\n\nBest regards,\nUSA Grappling Media Relations`,
      wire_title: meta_title,
      wire_summary: meta_description,
      wire_keywords: "USA Grappling, grappling, wrestling, martial arts, sports, Team USA"
    };
    
    // Try to use AI for better content generation
    if (lovableApiKey) {
      try {
        console.log("Using AI to generate enhanced content...");
        
        const aiPrompt = `You are a sports PR professional for USA Grappling, the national governing body for grappling in the United States. 
        
Based on this press release title and content, generate the following:

Title: ${title}
Content: ${contentSummary}

Generate JSON with these exact fields:
1. linkedin_post: A professional LinkedIn post (max 300 chars) with relevant hashtags
2. instagram_caption: An engaging Instagram caption (max 200 chars) with hashtags
3. pitch_email: A professional pitch email to media outlets (include subject line)
4. wire_title: SEO-optimized title for press wire services (max 60 chars)
5. wire_summary: Brief summary for wire services (max 160 chars)
6. wire_keywords: Comma-separated keywords for wire distribution

Respond with valid JSON only.`;

        const aiResponse = await fetch("https://api.lovable.dev/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${lovableApiKey}`
          },
          body: JSON.stringify({
            model: "openai/gpt-5-mini",
            messages: [{ role: "user", content: aiPrompt }]
          })
        });
        
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiContent = aiData.choices?.[0]?.message?.content;
          if (aiContent) {
            try {
              const parsed = JSON.parse(aiContent);
              generatedContent = { ...generatedContent, ...parsed };
              console.log("AI content generated successfully");
            } catch (parseError) {
              console.log("Could not parse AI response, using defaults");
            }
          }
        }
      } catch (aiError) {
        console.log("AI generation failed, using defaults:", aiError);
      }
    }
    
    // Update the press release with generated content
    const { error: updateError } = await supabase
      .from("press_releases")
      .update({
        slug,
        canonical_url,
        meta_title,
        meta_description,
        linkedin_post: generatedContent.linkedin_post,
        instagram_caption: generatedContent.instagram_caption,
        pitch_email: generatedContent.pitch_email,
        wire_title: generatedContent.wire_title,
        wire_summary: generatedContent.wire_summary,
        wire_keywords: generatedContent.wire_keywords,
        distribution_status: 'prepared'
      })
      .eq("id", pressReleaseId);
    
    if (updateError) {
      console.error("Error updating press release:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update press release" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Press release content generated and updated successfully");
    
    return new Response(
      JSON.stringify({ success: true, slug }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: any) {
    console.error("Error in generate-press-content:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
