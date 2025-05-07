
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
import { Certificate, User } from "@/types";
import { certificateService, userService, courseService } from "@/services/api";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Edit, Trash, Eye, Award } from "lucide-react";

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
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CertificateFormData>(defaultFormData);
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [certificatesData, usersData, coursesData] = await Promise.all([
        certificateService.getCertificates(),
        userService.getUsers(),
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
  };

  const handleCourseChange = (courseId: string) => {
    const selectedCourse = courses.find(course => course.id === courseId);
    setFormData(prev => ({
      ...prev,
      courseId,
      courseName: selectedCourse ? selectedCourse.title : "",
    }));
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
        await certificateService.deleteCertificate(certificateId);
        toast.success("Certificado excluído com sucesso");
        fetchData();
      } catch (error) {
        console.error("Error deleting certificate:", error);
        toast.error("Erro ao excluir certificado");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const certificateData = {
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
      setFormData(defaultFormData);
      setEditingCertificateId(null);
      fetchData();
    } catch (error) {
      console.error("Error saving certificate:", error);
      toast.error("Erro ao salvar certificado");
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingCertificateId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Certificados</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Certificado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingCertificateId ? "Editar Certificado" : "Criar Novo Certificado"}
              </DialogTitle>
              <DialogDescription>
                Atribua um certificado a um aluno que completou um curso.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="userId">Aluno</label>
                <Select
                  value={formData.userId}
                  onValueChange={handleUserChange}
                >
                  <SelectTrigger id="userId">
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(user => user.role === "student")
                      .map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="courseId">Curso</label>
                <Select
                  value={formData.courseId}
                  onValueChange={handleCourseChange}
                >
                  <SelectTrigger id="courseId">
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingCertificateId ? "Atualizar" : "Emitir Certificado"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Nenhum certificado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  certificates.map((certificate) => (
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCertificate(certificate)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteCertificate(certificate.id)}>
                              <Trash className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => window.open(`/certificates/${certificate.id}`, "_blank")}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
