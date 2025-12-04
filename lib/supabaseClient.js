import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bafeyvcdebtgbnrmbpjz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZmV5dmNkZWJ0Z2Jucm1icGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODE1NjMsImV4cCI6MjA4MDI1NzU2M30.erKzYUSR0C8Gy0QJGF87X2_6wvscBRp6eJ0RVilbPnk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
