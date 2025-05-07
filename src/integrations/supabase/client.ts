
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
        // Adicionar timeout para evitar esperas infinitas
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout
        
        const fetchOptions = {
          ...options,
          signal: controller.signal
        };
        
        try {
          const response = await fetch(url, fetchOptions);
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorText = await response.text();
            const errorMessage = `HTTP error! status: ${response.status}, body: ${errorText}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
          }
          
          return response;
        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            console.error('Requisiu00e7u00e3o abortada por timeout');
            throw new Error('A conexu00e3o expirou. Verifique sua internet e tente novamente.');
          }
          
          throw fetchError;
        }
      } catch (error) {
        // Melhorar mensagens de erro de rede
        console.error('Erro de rede:', error);
        
        // Criar mensagens de erro mais amigáveis
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Falha na conexu00e3o com o servidor. Verifique sua conexu00e3o com a internet.');
        }
        
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          throw new Error('O servidor estu00e1 demorando para responder. Tente novamente mais tarde.');
        }
        
        // Tratar limite de taxa de requisiu00e7u00f5es (rate limit)
        if (error.message.includes('429') || 
            error.message.includes('rate limit') || 
            error.message.includes('over_request_rate_limit')) {
          console.warn('Limite de requisiu00e7u00f5es atingido, implementando backoff exponencial...');
          
          // Implementar retry com backoff mais curto para melhorar a responsividade
          // Esperar entre 1 e 3 segundos aleatoriamente para evitar sincronizau00e7u00e3o de requisiu00e7u00f5es
          const minDelay = 1000; // 1 segundo
          const maxDelay = 3000; // 3 segundos
          const retryAfter = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
          
          console.log(`Aguardando ${retryAfter/1000} segundos antes de tentar novamente...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter));
          
          // Tentar novamente a requisiu00e7u00e3o com os mesmos paru00e2metros
          try {
            console.log('Tentando requisiu00e7u00e3o novamente apu00f3s backoff...');
            return await fetch(url, options);
          } catch (retryError) {
            console.error('Erro ao tentar novamente apu00f3s rate limit:', retryError);
            // Mostrar uma mensagem mais amigável para o usuário
            throw new Error('O servidor estu00e1 temporariamente sobrecarregado. Por favor, aguarde alguns instantes e tente novamente.');
          }
        }
        
        throw error;
      }
    }
  }
});
