import { Module, Lesson } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const moduleService = {
  async getAllModules(): Promise<Module[]> {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('id, title, description, order_number, course_id')
        .order('title', { ascending: true });

      if (error) throw error;
      if (!data) throw new Error('Nenhum módulo encontrado');

      return data.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description || '',
        order: module.order_number,
        courseId: module.course_id,
        lessons: []
      }));
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
      throw new Error('Falha ao buscar módulos');
    }
  },

  async getModulesByCourseId(courseId: string): Promise<Module[]> {
    if (!courseId) throw new Error('ID do curso é obrigatório');

    try {
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('id, title, description, order_number, course_id')
        .eq('course_id', courseId)
        .order('order_number', { ascending: true });

      if (modulesError) throw modulesError;
      if (!modules) throw new Error('Nenhum módulo encontrado para este curso');

      const modulePromises = modules.map(async (module) => {
        try {
          const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('id, module_id, title, description, duration, video_url, content, order_number')
            .eq('module_id', module.id)
            .order('order_number', { ascending: true });

          if (lessonsError) throw lessonsError;

          return {
            id: module.id,
            title: module.title,
            description: module.description || '',
            order: module.order_number,
            courseId: module.course_id,
            lessons: lessons?.map(lesson => ({
              id: lesson.id,
              moduleId: lesson.module_id,
              title: lesson.title,
              description: lesson.description || '',
              duration: lesson.duration || '',
              videoUrl: lesson.video_url || '',
              content: lesson.content || '',
              order: lesson.order_number,
              isCompleted: false
            })) || []
          };
        } catch (error) {
          console.error(`Erro ao processar módulo ${module.id}:`, error);
          throw error;
        }
      });

      const modulesWithLessons = await Promise.all(modulePromises);
      return modulesWithLessons;
    } catch (error) {
      console.error('Erro ao buscar módulos do curso:', error);
      throw new Error('Falha ao buscar módulos do curso');
    }
  },

  async createModule(courseId: string, moduleData: { 
    title: string; 
    description?: string; 
    order: number 
  }): Promise<Module> {
    if (!courseId) throw new Error('ID do curso é obrigatório');
    if (!moduleData?.title?.trim()) throw new Error('Título do módulo é obrigatório');

    try {
      const { data, error } = await supabase
        .from('modules')
        .insert({
          course_id: courseId,
          title: moduleData.title.trim(),
          description: moduleData.description?.trim() || '',
          order_number: moduleData.order
        })
        .select('id, title, description, order_number, course_id')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Nenhum dado retornado após criar o módulo');

      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        order: data.order_number,
        courseId: data.course_id,
        lessons: []
      };
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      throw new Error('Falha ao criar módulo');
    }
  },

  async updateModule(moduleId: string, moduleData: { 
    title?: string; 
    description?: string; 
    order?: number 
  }): Promise<void> {
    if (!moduleId) throw new Error('ID do módulo é obrigatório');

    const updates: Record<string, any> = {};
    
    if (moduleData.title !== undefined) {
      if (!moduleData.title.trim()) {
        throw new Error('Título do módulo não pode ficar vazio');
      }
      updates.title = moduleData.title.trim();
    }
    
    if (moduleData.description !== undefined) {
      updates.description = moduleData.description.trim();
    }
    
    if (moduleData.order !== undefined) {
      updates.order_number = moduleData.order;
    }

    try {
      const { error } = await supabase
        .from('modules')
        .update(updates)
        .eq('id', moduleId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);
      throw new Error('Falha ao atualizar módulo');
    }
  },

  async deleteModule(moduleId: string): Promise<void> {
    if (!moduleId) throw new Error('ID do módulo é obrigatório');

    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao excluir módulo:', error);
      throw new Error('Falha ao excluir módulo');
    }
  }
};
