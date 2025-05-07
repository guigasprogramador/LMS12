
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = 'https://pyhhvxugnyywoklhqjbz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5aGh2eHVnbnl5d29rbGhxamJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NDgzODMsImV4cCI6MjA2MjEyNDM4M30.JkxVH0scEUm5TRGTNYr-x8EXOolMYAcKssetWlaYTvQ';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'lms-auth-token',
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    fetch: async (url: string, options: RequestInit) => {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        return response;
      } catch (error) {
        console.error('Network error:', error);
        throw error;
      }
    }
  }
});
