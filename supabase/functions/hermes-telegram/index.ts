import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const token = Deno.env.get('HERMES_TELEGRAM_BOT_TOKEN');
  if (!token) {
    return new Response(JSON.stringify({ error: 'HERMES_TELEGRAM_BOT_TOKEN not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Authenticate caller (admin only)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
    authHeader.replace('Bearer ', '')
  );
  if (claimsError || !claimsData?.claims?.sub) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: isAdmin } = await supabase.rpc('has_role', {
    _user_id: claimsData.claims.sub,
    _role: 'admin',
  });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { action, chat_id, text } = body ?? {};

    if (action === 'sendMessage') {
      if (!chat_id || !text || typeof text !== 'string' || text.length > 4000) {
        return new Response(JSON.stringify({ error: 'Invalid input' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text }),
      });
      const data = await tgRes.json();
      return new Response(JSON.stringify(data), {
        status: tgRes.ok ? 200 : 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getUpdates') {
      const tgRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=5&offset=-5`);
      const data = await tgRes.json();
      const replies = (data.result || [])
        .filter((u: any) => u.message?.from?.is_bot && u.message?.text)
        .map((u: any) => u.message.text);
      return new Response(JSON.stringify({ replies }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
