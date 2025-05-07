
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Certificate, User, Course } from "@/types";
import { certificateService } from "@/services";
import { userService } from "@/services";
import { courseService } from "@/services";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Edit, Trash, Eye, Award, Search, RefreshCw, Download } from "lucide-react";
import { CreateCertificateData } from "@/services/certificateService";

interface CertificateFormData {
  userId: string;
  courseId: string;
  userName: string;
  courseName: string;
}

const defaultFormData: CertificateFormData = {
  userId: "",
  courseId: "",
  userName: "",
  courseName: "",
};

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CertificateFormData>(defaultFormData);
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrar certificados com base nos criu00e9rios de busca
  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = searchTerm === '' || 
      cert.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cert.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = filterCourse === '' || cert.courseId === filterCourse;
    
    return matchesSearch && matchesCourse;
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [certificatesData, usersData, coursesData] = await Promise.all([
        certificateService.getCertificates(),
        userService.getAllUsers(), // Corrigido para usar getAllUsers em vez de getUsers
        courseService.getCourses(),
      ]);
      setCertificates(certificatesData);
      setUsers(usersData);
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserChange = (userId: string) => {
    const selectedUser = users.find(user => user.id === userId);
    setFormData(prev => ({
      ...prev,
      userId,
      userName: selectedUser ? selectedUser.name : "",
    }));
    
    // Se o usuário já tiver certificados, verificar se já existe para o curso selecionado
    if (formData.courseId && userId) {
      const existingCert = certificates.find(
        cert => cert.userId === userId && cert.courseId === formData.courseId
      );
      
      if (existingCert) {
        toast.warning(`Este aluno já possui um certificado para o curso selecionado`);
      }
    }
  };

  const handleCourseChange = (courseId: string) => {
    const selectedCourse = courses.find(course => course.id === courseId);
    setFormData(prev => ({
      ...prev,
      courseId,
      courseName: selectedCourse ? selectedCourse.title : "",
    }));
    
    // Se o usuário já estiver selecionado, verificar se já existe certificado
    if (formData.userId && courseId) {
      const existingCert = certificates.find(
        cert => cert.userId === formData.userId && cert.courseId === courseId
      );
      
      if (existingCert) {
        toast.warning(`Este aluno já possui um certificado para o curso selecionado`);
      }
    }
  };

  const handleEditCertificate = (certificate: Certificate) => {
    setFormData({
      userId: certificate.userId,
      courseId: certificate.courseId,
      userName: certificate.userName,
      courseName: certificate.courseName,
    });
    setEditingCertificateId(certificate.id);
    setIsDialogOpen(true);
  };

  const handleDeleteCertificate = async (certificateId: string) => {
    if (confirm("Tem certeza de que deseja excluir este certificado?")) {
      try {
        setIsLoading(true);
        await certificateService.deleteCertificate(certificateId);
        toast.success("Certificado excluído com sucesso");
        await fetchData();
      } catch (error) {
        console.error("Error deleting certificate:", error);
        // O toast de erro já é exibido pelo serviço
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    if (!formData.userId || !formData.courseId) {
      toast.error("Selecione um aluno e um curso");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const certificateData: CreateCertificateData = {
        ...formData,
        issueDate: new Date().toISOString()
      };
      
      if (editingCertificateId) {
        await certificateService.updateCertificate(editingCertificateId, certificateData);
        toast.success("Certificado atualizado com sucesso");
      } else {
        await certificateService.createCertificate(certificateData);
        toast.success("Certificado criado com sucesso");
      }
      
      setIsDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (error) {
      // O toast de erro já é exibido pelo serviço
      console.error("Error submitting certificate:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingCertificateId(null);
  };

  const handleDownloadCertificate = (certificateId: string) => {
    // Em uma aplicau00e7u00e3o real, isso geraria um PDF para download
    window.open(`/certificates/${certificateId}`, '_blank');
    toast.success('Certificado aberto em nova aba');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Certificados</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Emitir Certificado
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">
                {editingCertificateId ? "Editar Certificado" : "Emitir Novo Certificado"}
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                {editingCertificateId
                  ? "Atualize as informações do certificado abaixo."
                  : "Preencha as informações para emitir um novo certificado."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userId" className="text-sm font-medium flex items-center">
                    Aluno <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.userId}
                    onValueChange={handleUserChange}
                    required
                  >
                    <SelectTrigger id="userId">
                      <SelectValue placeholder="Selecione um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {users && users.length > 0 ? users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || 'Usuário sem nome'}
                        </SelectItem>
                      )) : (
                        <SelectItem key="no-users" value="" disabled>
                          Nenhum usuário disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseId" className="text-sm font-medium flex items-center">
                    Curso <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={handleCourseChange}
                    required
                  >
                    <SelectTrigger id="courseId">
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses && courses.length > 0 ? courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title || 'Curso sem título'}
                        </SelectItem>
                      )) : (
                        <SelectItem key="no-courses" value="" disabled>
                          Nenhum curso disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.userId || !formData.courseId}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting 
                    ? "Salvando..." 
                    : editingCertificateId 
                      ? "Atualizar" 
                      : "Emitir Certificado"
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="searchTerm" className="text-sm font-medium">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="searchTerm"
                placeholder="Buscar por aluno ou curso..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="filterCourse" className="text-sm font-medium">Filtrar por Curso</Label>
            <Select
              value={filterCourse}
              onValueChange={setFilterCourse}
            >
              <SelectTrigger id="filterCourse">
                <SelectValue placeholder="Todos os cursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all" value="">Todos os cursos</SelectItem>
                {courses && courses.length > 0 ? courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title || 'Curso sem título'}
                  </SelectItem>
                )) : null}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setSearchTerm('');
                setFilterCourse('');
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabela de Certificados */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <p>Carregando certificados...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Data de Emissão</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      {certificates.length === 0 
                        ? "Nenhum certificado encontrado" 
                        : "Nenhum certificado corresponde aos filtros aplicados"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCertificates.map((certificate) => (
                    <TableRow key={certificate.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          {certificate.userName}
                        </div>
                      </TableCell>
                      <TableCell>{certificate.courseName}</TableCell>
                      <TableCell>
                        {new Date(certificate.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadCertificate(certificate.id)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCertificate(certificate)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCertificate(certificate.id)}
                            title="Excluir"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminCertificates;
