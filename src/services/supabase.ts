import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found. Check .env.local file.');
}

export const supabase = createClient(
    supabaseUrl || 'https://jrrgsvgxacdgrihxlhqo.supabase.co',
    supabaseKey || 'placeholder-key'
);
