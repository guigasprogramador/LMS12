import { Course, Module, Lesson } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const courseService = {
  async getCourses(): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, thumbnail, duration, instructor, enrolledcount, rating, created_at, updated_at')
        .order('title', { ascending: true });

      if (error) throw error;
      if (!data) return [];

      return data.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        thumbnail: course.thumbnail || '/placeholder.svg',
        duration: course.duration || '',
        instructor: course.instructor,
        enrolledCount: course.enrolledcount || 0,
        rating: course.rating || 0,
        modules: [],
        createdAt: course.created_at,
        updatedAt: course.updated_at,
        isEnrolled: false,
        progress: 0
      }));
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
      throw new Error('Falha ao buscar cursos');
    }
  },

  async createCourse(courseData: {
    title: string;
    description?: string;
    thumbnail?: string;
    duration?: string;
    instructor: string;
  }): Promise<Course> {
    if (!courseData?.title?.trim()) throw new Error('Título do curso é obrigatório');
    if (!courseData?.instructor?.trim()) throw new Error('Nome do instrutor é obrigatório');

    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: courseData.title.trim(),
          description: courseData.description?.trim() || '',
          thumbnail: courseData.thumbnail?.trim() || '',
          duration: courseData.duration?.trim() || '',
          instructor: courseData.instructor.trim(),
          enrolledcount: 0,
          rating: 0
        })
        .select('id, title, description, thumbnail, duration, instructor, enrolledcount, rating, created_at, updated_at')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Nenhum dado retornado após criar o curso');

      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        thumbnail: data.thumbnail || '',
        duration: data.duration || '',
        instructor: data.instructor,
        enrolledCount: data.enrolledcount || 0,
        rating: data.rating || 0,
        modules: [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isEnrolled: false,
        progress: 0
      };
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      throw new Error('Falha ao criar curso');
    }
  },

  async updateCourse(courseId: string, courseData: {
    title?: string;
    description?: string;
    thumbnail?: string;
    duration?: string;
    instructor?: string;
  }): Promise<void> {
    if (!courseId) throw new Error('ID do curso é obrigatório');

    const updates: Record<string, any> = {};

    if (courseData.title !== undefined) {
      if (!courseData.title.trim()) {
        throw new Error('Título do curso não pode ficar vazio');
      }
      updates.title = courseData.title.trim();
    }

    if (courseData.description !== undefined) {
      updates.description = courseData.description.trim();
    }

    if (courseData.thumbnail !== undefined) {
      updates.thumbnail = courseData.thumbnail.trim();
    }

    if (courseData.duration !== undefined) {
      updates.duration = courseData.duration.trim();
    }

    if (courseData.instructor !== undefined) {
      if (!courseData.instructor.trim()) {
        throw new Error('Nome do instrutor não pode ficar vazio');
      }
      updates.instructor = courseData.instructor.trim();
    }

    try {
      const { error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      throw new Error('Falha ao atualizar curso');
    }
  },

  async deleteCourse(courseId: string): Promise<void> {
    if (!courseId) throw new Error('ID do curso é obrigatório');

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      throw new Error('Falha ao excluir curso');
    }
  },

  async getCourseById(courseId: string): Promise<Course | null> {
    if (!courseId) throw new Error('ID do curso é obrigatório');

    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`*, modules:modules(*, lessons:lessons(*))`)
        .eq('id', courseId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Curso não encontrado');

      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        thumbnail: data.thumbnail || '/placeholder.svg',
        duration: data.duration || '',
        instructor: data.instructor,
        enrolledCount: data.enrolledcount || 0,
        rating: data.rating || 0,
        modules: (data.modules || []).map((module: any) => ({
          id: module.id,
          courseId: module.course_id,
          title: module.title,
          description: module.description || '',
          order: module.order_number,
          lessons: (module.lessons || []).map((lesson: any) => ({
            id: lesson.id,
            moduleId: lesson.module_id,
            title: lesson.title,
            description: lesson.description || '',
            duration: lesson.duration || '',
            videoUrl: lesson.video_url || '',
            content: lesson.content || '',
            order: lesson.order_number,
            isCompleted: false
          }))
        })),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isEnrolled: false,
        progress: 0
      };
    } catch (error) {
      console.error('Erro ao buscar curso:', error);
      throw new Error('Falha ao buscar curso');
    }
  }
};
