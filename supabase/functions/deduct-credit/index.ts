
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Deducting credit for user:', user_id)

    // التحقق من الرصيد الحالي أولاً
    const { data: currentProfile, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('credits')
      .eq('id', user_id)
      .single()

    if (fetchError) {
      console.error('Error fetching current credits:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch current credits' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!currentProfile || currentProfile.credits < 1) {
      console.error('Insufficient credits. Current balance:', currentProfile?.credits || 0)
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // خصم كريديت واحد من المستخدم
    const newCredits = currentProfile.credits - 1
    const { data, error } = await supabaseClient
      .from('profiles')
      .update({ 
        credits: newCredits
      })
      .eq('id', user_id)
      .select('credits')
      .single()

    if (error) {
      console.error('Error deducting credit:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to deduct credit' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Credit deducted successfully. New balance:', data.credits)

    return new Response(
      JSON.stringify({ 
        success: true, 
        new_credits: data.credits 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in deduct-credit function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
