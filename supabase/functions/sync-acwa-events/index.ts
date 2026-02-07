import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ACWA Tour dates extracted from americancatchwrestling.com
// These are the 2026 Catch Wrestling Tour events
const ACWA_EVENTS = [
  {
    name: "Pennsylvania Open",
    event_date: "2026-03-14",
    location: "Pennsylvania",
    state_abbr: "PA",
    registration_url: "https://usag.smoothcomp.com/en/event/29735",
    style: "catch_wrestling" as const,
    source: "acwa",
  },
  {
    name: "California Open",
    event_date: "2026-04-11",
    location: "Riverside, California",
    state_abbr: "CA",
    registration_url: "https://usag.smoothcomp.com/en/event/29959",
    style: "catch_wrestling" as const,
    source: "acwa",
  },
  {
    name: "Texas Open",
    event_date: "2026-06-11",
    location: "Fort Worth, Texas",
    state_abbr: "TX",
    registration_url: "https://usag.smoothcomp.com/en/event/29960",
    style: "catch_wrestling" as const,
    source: "acwa",
  },
  {
    name: "Florida Open",
    event_date: "2026-06-26",
    location: "Sarasota, Florida",
    state_abbr: "FL",
    registration_url: "https://usag.smoothcomp.com/en/event/29961",
    style: "catch_wrestling" as const,
    source: "acwa",
  },
];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const event of ACWA_EVENTS) {
      // Check if event already exists by name and date
      const { data: existing, error: fetchError } = await supabase
        .from("events")
        .select("id, name, event_date, registration_url")
        .eq("name", event.name)
        .eq("event_date", event.event_date)
        .eq("style", "catch_wrestling")
        .maybeSingle();

      if (fetchError) {
        results.errors.push(`Error checking ${event.name}: ${fetchError.message}`);
        continue;
      }

      if (existing) {
        // Update if registration URL changed
        if (existing.registration_url !== event.registration_url) {
          const { error: updateError } = await supabase
            .from("events")
            .update({ 
              registration_url: event.registration_url,
              notes: "ACWA Tour Event (auto-synced)",
            })
            .eq("id", existing.id);

          if (updateError) {
            results.errors.push(`Error updating ${event.name}: ${updateError.message}`);
          } else {
            results.updated++;
          }
        } else {
          results.skipped++;
        }
      } else {
        // Insert new event
        const { error: insertError } = await supabase
          .from("events")
          .insert({
            name: event.name,
            event_date: event.event_date,
            location: event.location,
            state_abbr: event.state_abbr,
            registration_url: event.registration_url,
            style: event.style,
            notes: "ACWA Tour Event (auto-synced)",
            is_archived: false,
          });

        if (insertError) {
          results.errors.push(`Error inserting ${event.name}: ${insertError.message}`);
        } else {
          results.inserted++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sync complete: ${results.inserted} inserted, ${results.updated} updated, ${results.skipped} unchanged`,
        results,
        totalEvents: ACWA_EVENTS.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("ACWA sync error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
