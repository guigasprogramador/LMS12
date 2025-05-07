import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }

      return users.map(user => ({
        id: user.id,
        name: user.name || '',
        email: '', // Email não é armazenado no perfil por segurança
        role: 'student', // Ajustar role para 'student' ao invés de 'user' no retorno do array
        avatarUrl: user.avatar_url || '',
        bio: user.bio || '',
        jobTitle: user.job_title || '',
        company: user.company || '',
        location: user.location || '',
        website: user.website || '',
        createdAt: user.created_at // Adicionado para corresponder ao tipo User
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }
};
