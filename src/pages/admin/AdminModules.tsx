import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Module, Course } from "@/types";
import { moduleService, courseService } from "@/services/api";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Edit, Trash, BookOpen } from "lucide-react";

interface ModuleFormData {
  title: string;
  description: string;
  courseId: string;
  order: number;
}

const defaultFormData: ModuleFormData = {
  title: "",
  description: "",
  courseId: "",
  order: 1,
};

const AdminModules = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const coursePrefillId = queryParams.get("courseId");
  
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(coursePrefillId || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ModuleFormData>({
    ...defaultFormData,
    courseId: coursePrefillId || "",
  });
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const coursesData = await courseService.getCourses();
      setCourses(coursesData);
      
      if (selectedCourseId) {
        fetchModulesByCourse(selectedCourseId);
      } else {
        // If no course is selected, show all modules
        const allModules = await Promise.all(
          coursesData.map((course) => moduleService.getModulesByCourseId(course.id))
        );
        setModules(allModules.flat());
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
      setIsLoading(false);
    }
  };

  const fetchModulesByCourse = async (courseId: string) => {
    try {
      const modulesData = await moduleService.getModulesByCourseId(courseId);
      setModules(modulesData);
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast.error("Erro ao carregar módulos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    fetchModulesByCourse(courseId);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditModule = (module: Module) => {
    setFormData({
      title: module.title,
      description: module.description,
      courseId: module.courseId,
      order: module.order,
    });
    setEditingModuleId(module.id);
    setIsDialogOpen(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm("Tem certeza de que deseja excluir este módulo?")) {
      try {
        await moduleService.deleteModule(moduleId);
        toast.success("Módulo excluído com sucesso");
        if (selectedCourseId) {
          fetchModulesByCourse(selectedCourseId);
        } else {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting module:", error);
        toast.error("Erro ao excluir o módulo");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Título do módulo é obrigatório");
      return;
    }
    if (!formData.courseId) {
      toast.error("Selecione um curso para o módulo");
      return;
    }
    setIsLoading(true);
    try {
      if (editingModuleId) {
        await moduleService.updateModule(editingModuleId, {
          title: formData.title.trim(),
          description: formData.description?.trim() || '',
          order: Number(formData.order) || 1,
        });
        toast.success("Módulo atualizado com sucesso");
      } else {
        await moduleService.createModule(formData.courseId, {
          title: formData.title.trim(),
          description: formData.description?.trim() || '',
          order: Number(formData.order) || 1,
        });
        toast.success("Módulo criado com sucesso");
      }
      setIsDialogOpen(false);
      setFormData({ ...defaultFormData, courseId: selectedCourseId });
      setEditingModuleId(null);
      if (selectedCourseId) {
        fetchModulesByCourse(selectedCourseId);
      } else {
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar o módulo");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ...defaultFormData,
      courseId: selectedCourseId,
    });
    setEditingModuleId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Módulos</h1>
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
              Novo Módulo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingModuleId ? "Editar Módulo" : "Criar Novo Módulo"}
              </DialogTitle>
              <DialogDescription>
                Preencha os detalhes do módulo abaixo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="courseId">Curso</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => 
                    setFormData((prev) => ({ ...prev, courseId: value }))
                  }
                  required
                >
                  <SelectTrigger id="courseId">
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Título do módulo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva o módulo"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Ordem</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="Ordem de exibição"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingModuleId ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filterCourse">Filtrar por Curso</Label>
        <Select value={selectedCourseId} onValueChange={handleCourseSelect}>
          <SelectTrigger id="filterCourse" className="w-[300px]">
            <SelectValue placeholder="Todos os cursos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cursos</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <p>Carregando módulos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Aulas</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      {selectedCourseId
                        ? "Este curso ainda não possui módulos"
                        : "Nenhum módulo encontrado"}
                    </TableCell>
                  </TableRow>
                ) : (
                  modules.map((module) => {
                    const course = courses.find(c => c.id === module.courseId);
                    return (
                      <TableRow key={module.id}>
                        <TableCell>{module.order}</TableCell>
                        <TableCell className="font-medium">{module.title}</TableCell>
                        <TableCell>{course ? course.title : "Curso não encontrado"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{module.lessons.length}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditModule(module)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteModule(module.id)}>
                                <Trash className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => window.location.href = `/admin/lessons?moduleId=${module.id}`}
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Gerenciar Aulas
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminModules;
