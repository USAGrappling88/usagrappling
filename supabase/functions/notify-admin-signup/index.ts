import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')

    // Get all super_admin users to notify
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data: superAdmins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin')

    if (!superAdmins || superAdmins.length === 0) {
      console.log('No super admins found to notify')
      return new Response(
        JSON.stringify({ success: true, message: 'No super admins to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get super admin emails from profiles
    const superAdminIds = superAdmins.map(sa => sa.user_id)
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('email')
      .in('id', superAdminIds)

    const adminEmails = adminProfiles?.map(p => p.email).filter(Boolean) || []

    // Log the notification (we'll use console since no email domain is set up yet)
    console.log(`New signup requesting admin access: ${email}`)
    console.log(`Super admins to notify: ${adminEmails.join(', ')}`)

    // Store notification in a simple way - the super admin will see pending users in the dashboard
    // When an email domain is configured, this can be enhanced to send actual emails

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification logged for ${adminEmails.length} super admin(s)`,
        notified: adminEmails
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in notify-admin-signup:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
