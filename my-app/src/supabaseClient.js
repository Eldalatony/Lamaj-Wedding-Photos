import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvfyhbwjpjrpvhlizyuw.supabase.co';
const supabaseAnonKey = 'sb_publishable_QKjBUUSh-zVsWNzoFtEHag_dOmEwDih';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);