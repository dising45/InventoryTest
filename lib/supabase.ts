import { createClient } from '@supabase/supabase-js';

// NOTE: These would normally be in a .env file
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://xyz.supabase.co';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
