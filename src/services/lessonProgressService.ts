import { LessonProgress } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const lessonProgressService = {
  /**
   * Obter o progresso de todas as aulas para um usuário
   */
  async getLessonProgress(userId: string): Promise<LessonProgress[]> {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      if (!data) return [];

      return data.map(progress => ({
        id: progress.id,
        userId: progress.user_id,
        lessonId: progress.lesson_id,
        completed: progress.completed,
        completedAt: progress.completed_at
      }));
    } catch (error) {
      console.error('Erro ao buscar progresso das aulas:', error);
      throw new Error('Falha ao buscar progresso das aulas');
    }
  },

  /**
   * Obter o progresso de uma aula específica para um usuário
   */
  async getLessonProgressByLessonId(userId: string, lessonId: string): Promise<LessonProgress | null> {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        lessonId: data.lesson_id,
        completed: data.completed,
        completedAt: data.completed_at
      };
    } catch (error) {
      console.error('Erro ao buscar progresso da aula:', error);
      throw new Error('Falha ao buscar progresso da aula');
    }
  },

  /**
   * Marcar uma aula como concluída
   */
  async markLessonAsCompleted(userId: string, lessonId: string): Promise<LessonProgress> {
    try {
      // Verificar se já existe um registro de progresso
      const { data: existingProgress } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      const now = new Date().toISOString();
      
      if (existingProgress) {
        // Atualizar o registro existente
        const { data, error } = await supabase
          .from('lesson_progress')
          .update({
            completed: true,
            completed_at: now
          })
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) throw error;
        
        return {
          id: data.id,
          userId: data.user_id,
          lessonId: data.lesson_id,
          completed: data.completed,
          completedAt: data.completed_at
        };
      } else {
        // Criar um novo registro
        const { data, error } = await supabase
          .from('lesson_progress')
          .insert({
            user_id: userId,
            lesson_id: lessonId,
            completed: true,
            completed_at: now
          })
          .select()
          .single();

        if (error) throw error;
        
        return {
          id: data.id,
          userId: data.user_id,
          lessonId: data.lesson_id,
          completed: data.completed,
          completedAt: data.completed_at
        };
      }
    } catch (error) {
      console.error('Erro ao marcar aula como concluída:', error);
      throw new Error('Falha ao marcar aula como concluída');
    }
  },

  /**
   * Marcar uma aula como não concluída
   */
  async markLessonAsIncomplete(userId: string, lessonId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('lesson_progress')
        .update({
          completed: false,
          completed_at: null
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao marcar aula como não concluída:', error);
      throw new Error('Falha ao marcar aula como não concluída');
    }
  },

  /**
   * Calcular o progresso geral do curso com base nas aulas concluídas
   */
  async calculateCourseProgress(userId: string, courseId: string): Promise<number> {
    try {
      // Buscar todos os IDs de aulas do curso
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId);

      if (modulesError) throw modulesError;
      if (!modules || modules.length === 0) return 0;

      const moduleIds = modules.map(m => m.id);
      
      // Buscar todas as aulas dos módulos do curso
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .in('module_id', moduleIds);

      if (lessonsError) throw lessonsError;
      if (!lessons || lessons.length === 0) return 0;

      const totalLessons = lessons.length;
      const lessonIds = lessons.map(l => l.id);

      // Buscar aulas concluídas pelo usuário
      const { data: completedLessons, error: progressError } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('completed', true)
        .in('lesson_id', lessonIds);

      if (progressError) throw progressError;
      
      const completedCount = completedLessons?.length || 0;
      
      // Calcular porcentagem de progresso
      const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      
      // Atualizar o progresso na tabela de matrículas
      await supabase
        .from('enrollments')
        .update({ progress })
        .eq('user_id', userId)
        .eq('course_id', courseId);

      return progress;
    } catch (error) {
      console.error('Erro ao calcular progresso do curso:', error);
      throw new Error('Falha ao calcular progresso do curso');
    }
  }
};
