import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lizkfubzxcuxkyzcegoh.supabase.co';
const supabaseAnonKey = 'sb_publishable_jMeibu1R9hzKv6tQeHFY7g_vY6_0BOL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);