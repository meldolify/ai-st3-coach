import { createClient } from '@supabase/supabase-js'
import { CONFIG } from '../config'

export const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)

// Set window global so useSession.js can access it for WebSocket auth
window.supabaseClient = supabaseClient
