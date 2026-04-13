const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
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
    const mailersendToken = Deno.env.get('MAILERSEND_API_TOKEN')

    if (!mailersendToken) {
      console.error('MAILERSEND_API_TOKEN is not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    if (adminEmails.length === 0) {
      console.log('No admin emails found in profiles')
      return new Response(
        JSON.stringify({ success: true, message: 'No admin emails found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email via MailerSend to each super admin
    const results = []
    for (const adminEmail of adminEmails) {
      const response = await fetch('https://api.mailersend.com/v1/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mailersendToken}`,
        },
        body: JSON.stringify({
          from: {
            email: 'noreply@usa-grappling.com',
            name: 'USA Grappling',
          },
          to: [{ email: adminEmail }],
          subject: `New Admin Access Request: ${email}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1a1a2e;">New Admin Access Request</h2>
              <p>A new user has signed up and is requesting admin access:</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
              </div>
              <p>Please log in to the <a href="https://usagrappling.lovable.app/admin" style="color: #2563eb;">Admin Dashboard</a> to approve or deny this request.</p>
              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;" />
              <p style="color: #999; font-size: 12px;">USA Grappling Admin Notifications</p>
            </div>
          `,
          text: `New admin access request from ${email}. Log in to the admin dashboard to approve or deny.`,
        }),
      })

      if (response.ok) {
        results.push({ email: adminEmail, status: 'sent' })
        console.log(`Email sent to ${adminEmail}`)
      } else {
        const errorBody = await response.text()
        results.push({ email: adminEmail, status: 'failed', error: errorBody })
        console.error(`Failed to send email to ${adminEmail}: ${response.status} ${errorBody}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent to ${results.filter(r => r.status === 'sent').length} super admin(s)`,
        results,
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
