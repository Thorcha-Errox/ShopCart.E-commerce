import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = 'https://dfqlmkluxkhsecthlodg.supabase.co';  // Paste from dashboard
// const supabaseUrl = 'https://dfqlmkluxkhsecthlodg.supabase.co';  // Paste from dashboard
const supabaseUrl = 'https://dfqlmkluxkhsecthlodg.supabase.co';  // Paste from dashboard
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmcWxta2x1eGtoc2VjdGhsb2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTI0NjIsImV4cCI6MjA3NDIyODQ2Mn0.gXDcgryxVWbwJ1KsIXb7iYR9ZQ7CerHSmY8m7e02_Uc';
// console.log("Supabase client initialized:", supabase);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);