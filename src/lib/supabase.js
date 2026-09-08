import { createClient } from '@supabase/supabase-js'

// Anon key is public by design — safe to include in frontend code
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  || 'https://bogdnblwcdiydybnsqni.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  || 'sb_publishable_J1CE-n4ACpcziRylkTjCFw_EV0bASD_'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
