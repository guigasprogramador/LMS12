
import { Certificate } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Interface para os dados de certificado no banco de dados
 */
interface CertificateDB {
  id: string;
  user_id: string;
  course_id: string;
  course_name: string;
  user_name: string;
  issue_date: string;
  expiry_date?: string;
  certificate_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface para os dados de criação de certificado
 */
export interface CreateCertificateData {
  userId: string;
  courseId: string;
  userName: string;
  courseName: string;
  issueDate?: string;
  expiryDate?: string;
  certificateUrl?: string;
}

/**
 * Converte um registro do banco de dados para o tipo Certificate
 */
const mapToCertificate = (cert: CertificateDB): Certificate => ({
  id: cert.id,
  userId: cert.user_id,
  courseId: cert.course_id,
  courseName: cert.course_name,
  userName: cert.user_name,
  issueDate: cert.issue_date,
  expiryDate: cert.expiry_date,
  certificateUrl: cert.certificate_url
});

/**
 * Busca todos os certificados, opcionalmente filtrados por usuário
 * @param userId ID do usuário (opcional)
 * @param courseId ID do curso (opcional)
 * @returns Lista de certificados
 */
const getCertificates = async (userId?: string, courseId?: string): Promise<Certificate[]> => {
  try {
    let query = supabase.from('certificates').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    const { data, error } = await query.order('issue_date', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map(mapToCertificate);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    toast.error('Erro ao buscar certificados');
    return [];
  }
};

/**
 * Cria um novo certificado
 * @param certificateData Dados do certificado a ser criado
 * @returns O certificado criado
 */
const createCertificate = async (certificateData: CreateCertificateData): Promise<Certificate> => {
  try {
    // Validar dados obrigatu00f3rios
    if (!certificateData.userId || !certificateData.courseId || !certificateData.userName || !certificateData.courseName) {
      throw new Error('Dados incompletos para criar certificado');
    }
    
    // Verificar se ju00e1 existe um certificado para este usu00e1rio e curso
    const existingCerts = await getCertificates(certificateData.userId, certificateData.courseId);
    if (existingCerts.length > 0) {
      throw new Error('Ju00e1 existe um certificado para este usu00e1rio neste curso');
    }

    const { data, error } = await supabase
      .from('certificates')
      .insert({
        user_id: certificateData.userId,
        course_id: certificateData.courseId,
        course_name: certificateData.courseName,
        user_name: certificateData.userName,
        issue_date: certificateData.issueDate || new Date().toISOString(),
        expiry_date: certificateData.expiryDate,
        certificate_url: certificateData.certificateUrl
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Falha ao criar certificado');

    return mapToCertificate(data);
  } catch (error) {
    console.error('Error creating certificate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao criar certificado';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Gera um certificado para conclusu00e3o de curso
 * @param courseId ID do curso
 * @param userId ID do usuário
 * @returns O certificado gerado
 */
const generateCertificate = async (courseId: string, userId: string): Promise<Certificate> => {
  try {
    if (!courseId || !userId) {
      throw new Error('ID do curso e ID do usuário su00e3o obrigatu00f3rios');
    }
    
    // Verificar se ju00e1 existe um certificado para este usuário e curso
    const existingCerts = await getCertificates(userId, courseId);
    if (existingCerts.length > 0) {
      // Se ju00e1 existir, retorna o certificado existente
      return existingCerts[0];
    }

    // Buscar detalhes do curso e do usuário
    const [courseResult, userResult] = await Promise.all([
      supabase.from('courses').select('title').eq('id', courseId).single(),
      supabase.from('profiles').select('name').eq('id', userId).single()
    ]);
    
    if (courseResult.error) throw courseResult.error;
    if (userResult.error) throw userResult.error;
    
    const courseName = courseResult.data.title;
    const userName = userResult.data.name || 'Aluno';
    
    // Gerar URL do certificado (em uma aplicau00e7u00e3o real, isso poderia ser um link para um PDF gerado)
    const certificateUrl = `/certificates/${userId}-${courseId}-${Date.now()}`;
    
    // Criar certificado
    const { data, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        course_name: courseName,
        user_name: userName,
        issue_date: new Date().toISOString(),
        certificate_url: certificateUrl
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Falha ao gerar certificado');

    return mapToCertificate(data);
  } catch (error) {
    console.error('Error generating certificate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar certificado';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Busca um certificado pelo ID
 * @param certificateId ID do certificado
 * @returns O certificado encontrado
 */
const getCertificateById = async (certificateId: string): Promise<Certificate> => {
  try {
    if (!certificateId) {
      throw new Error('ID do certificado u00e9 obrigatu00f3rio');
    }

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Certificado nu00e3o encontrado');

    return mapToCertificate(data);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar certificado';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Atualiza um certificado existente
 * @param certificateId ID do certificado a ser atualizado
 * @param certificateData Dados atualizados do certificado
 * @returns O certificado atualizado
 */
const updateCertificate = async (certificateId: string, certificateData: Partial<CreateCertificateData>): Promise<Certificate> => {
  try {
    if (!certificateId) {
      throw new Error('ID do certificado u00e9 obrigatu00f3rio');
    }

    // Verificar se o certificado existe
    await getCertificateById(certificateId);
    
    // Preparar dados para atualizau00e7u00e3o
    const updateData: Record<string, any> = {};
    
    if (certificateData.userName) updateData.user_name = certificateData.userName;
    if (certificateData.courseName) updateData.course_name = certificateData.courseName;
    if (certificateData.issueDate) updateData.issue_date = certificateData.issueDate;
    if (certificateData.expiryDate) updateData.expiry_date = certificateData.expiryDate;
    if (certificateData.certificateUrl) updateData.certificate_url = certificateData.certificateUrl;
    
    // Nu00e3o permitir alterar o usu00e1rio ou curso associado ao certificado
    // Isso evita inconsistenciu00e3cias nos dados
    
    const { data, error } = await supabase
      .from('certificates')
      .update(updateData)
      .eq('id', certificateId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Falha ao atualizar certificado');

    return mapToCertificate(data);
  } catch (error) {
    console.error('Error updating certificate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar certificado';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Exclui um certificado
 * @param certificateId ID do certificado a ser excluído
 * @returns Booleano indicando sucesso da operau00e7u00e3o
 */
const deleteCertificate = async (certificateId: string): Promise<boolean> => {
  try {
    if (!certificateId) {
      throw new Error('ID do certificado u00e9 obrigatu00f3rio');
    }

    // Verificar se o certificado existe
    await getCertificateById(certificateId);
    
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', certificateId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting certificate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir certificado';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Verifica se um aluno completou um curso e u00e9 elegível para receber um certificado
 * @param userId ID do usuário
 * @param courseId ID do curso
 * @returns Booleano indicando se o usuário u00e9 elegível para receber um certificado
 */
const isEligibleForCertificate = async (userId: string, courseId: string): Promise<boolean> => {
  try {
    if (!userId || !courseId) {
      return false;
    }
    
    // Em uma aplicau00e7u00e3o real, verificaria o progresso do aluno no curso
    // Por exemplo, se todas as aulas foram concluídas
    
    // Exemplo simples: verificar se o usuário está matriculado no curso
    const { data, error } = await supabase
      .from('enrollments')
      .select('progress')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    
    if (error) return false;
    
    // Considerar elegível se o progresso for maior que 90%
    return data && data.progress >= 90;
  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    return false;
  }
};

/**
 * Serviu00e7o de certificados
 */
export const certificateService = {
  getCertificates,
  getCertificateById,
  createCertificate,
  generateCertificate,
  updateCertificate,
  deleteCertificate,
  isEligibleForCertificate
};
