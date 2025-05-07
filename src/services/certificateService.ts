
import { Certificate } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Get all certificates
const getCertificates = async (userId?: string): Promise<Certificate[]> => {
  try {
    let query = supabase.from('certificates').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;

    if (error) throw error;

    return data.map((cert: any) => ({
      id: cert.id,
      userId: cert.user_id,
      courseId: cert.course_id,
      courseName: cert.course_name,
      userName: cert.user_name,
      issueDate: cert.issue_date,
      expiryDate: cert.expiry_date,
      certificateUrl: cert.certificate_url
    }));
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return [];
  }
};

// Create a certificate
const createCertificate = async (certificate: { 
  userId: string;
  courseId: string;
  userName: string;
  courseName: string;
  issueDate: string;
  bio?: string;
  website?: string;
}): Promise<Certificate> => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .insert({
        user_id: certificate.userId,
        course_id: certificate.courseId,
        course_name: certificate.courseName,
        user_name: certificate.userName,
        issue_date: certificate.issueDate || new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      courseId: data.course_id,
      courseName: data.course_name,
      userName: data.user_name,
      issueDate: data.issue_date,
      expiryDate: data.expiry_date,
      certificateUrl: data.certificate_url
    };
  } catch (error) {
    console.error('Error creating certificate:', error);
    throw error;
  }
};

// Generate a certificate for course completion
const generateCertificate = async (courseId: string, userId: string): Promise<Certificate> => {
  try {
    // First get course and user details
    const [courseResult, userResult] = await Promise.all([
      supabase.from('courses').select('title').eq('id', courseId).single(),
      supabase.from('profiles').select('name').eq('id', userId).single()
    ]);
    
    if (courseResult.error) throw courseResult.error;
    if (userResult.error) throw userResult.error;
    
    const courseName = courseResult.data.title;
    const userName = userResult.data.name || 'Student';
    
    // Create certificate
    const { data, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        course_name: courseName,
        user_name: userName,
        issue_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      courseId: data.course_id,
      courseName: data.course_name,
      userName: data.user_name,
      issueDate: data.issue_date,
      expiryDate: data.expiry_date,
      certificateUrl: data.certificate_url
    };
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};

// Get certificate by ID
const getCertificateById = async (certificateId: string): Promise<Certificate> => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      courseId: data.course_id,
      courseName: data.course_name,
      userName: data.user_name,
      issueDate: data.issue_date,
      expiryDate: data.expiry_date,
      certificateUrl: data.certificate_url
    };
  } catch (error) {
    console.error('Error fetching certificate:', error);
    throw error;
  }
};

// Update a certificate
const updateCertificate = async (certificateId: string, certificate: any): Promise<void> => {
  try {
    const { error } = await supabase
      .from('certificates')
      .update({
        user_id: certificate.userId,
        course_id: certificate.courseId,
        course_name: certificate.courseName,
        user_name: certificate.userName,
        issue_date: certificate.issueDate,
        expiry_date: certificate.expiryDate,
        certificate_url: certificate.certificateUrl
      })
      .eq('id', certificateId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating certificate:', error);
    throw error;
  }
};

// Delete a certificate
const deleteCertificate = async (certificateId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', certificateId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
};

export const certificateService = {
  getCertificates,
  getCertificateById,
  createCertificate,
  generateCertificate,
  updateCertificate,
  deleteCertificate
};
