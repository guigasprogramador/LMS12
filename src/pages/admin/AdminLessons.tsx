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
import { Badge } from "@/components/ui/badge";
import { lessonService, moduleService } from "@/services/api";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Edit, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const defaultFormData = {
  title: "",
  description: "",
  duration: "",
  order: 1,
  videoUrl: "",
  content: "",
  moduleId: "",
};

const AdminLessons = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const moduleIdFromUrl = queryParams.get("moduleId") || "";

  const [lessons, setLessons] = useState([]);
  const [module, setModule] = useState(null);
  const [allModules, setAllModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ ...defaultFormData });
  const [editingLessonId, setEditingLessonId] = useState(null);

  useEffect(() => {
    moduleService.getAllModules().then(setAllModules).catch(() => setAllModules([]));
  }, []);

  useEffect(() => {
    if (moduleIdFromUrl) {
      fetchModuleAndLessons(moduleIdFromUrl);
    } else {
      setLessons([]);
      setModule(null);
    }
  }, [moduleIdFromUrl]);

  const fetchModuleAndLessons = async (moduleId) => {
    setIsLoading(true);
    try {
      const mod = allModules.find((m) => m.id === moduleId);
      setModule(mod || null);
      const lessonsData = await lessonService.getLessonsByModuleId(moduleId);
      setLessons(lessonsData);
    } catch (error) {
      toast.error("Erro ao carregar dados do módulo ou aulas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModuleSelect = (value) => {
    setFormData((prev) => ({ ...prev, moduleId: value }));
    fetchModuleAndLessons(value);
  };

  const handleEditLesson = (lesson) => {
    setFormData({
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration || "",
      order: lesson.order_number || lesson.order || 1,
      videoUrl: lesson.video_url || lesson.videoUrl || "",
      content: lesson.content || "",
      moduleId: lesson.module_id || lesson.moduleId || moduleIdFromUrl,
    });
    setEditingLessonId(lesson.id);
    setIsDialogOpen(true);
  };

  const handleDeleteLesson = async (lessonId) => {
    if (confirm("Tem certeza de que deseja excluir esta aula?")) {
      try {
        await lessonService.deleteLesson(lessonId);
        toast.success("Aula excluída com sucesso");
        const modId = formData.moduleId || moduleIdFromUrl;
        fetchModuleAndLessons(modId);
      } catch (error) {
        toast.error("Erro ao excluir a aula");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedModuleId = formData.moduleId || moduleIdFromUrl;
    if (!formData.title.trim()) {
      toast.error("Título da aula é obrigatório");
      return;
    }
    if (!selectedModuleId) {
      toast.error("Selecione o módulo da aula");
      return;
    }
    setIsLoading(true);
    try {
      if (editingLessonId) {
        await lessonService.updateLesson(editingLessonId, {
          title: formData.title.trim(),
          description: formData.description?.trim() || '',
          duration: formData.duration?.trim() || '',
          order: Number(formData.order) || 1,
          videoUrl: formData.videoUrl?.trim() || '',
          content: formData.content?.trim() || '',
          moduleId: selectedModuleId,
        });
        toast.success("Aula atualizada com sucesso");
      } else {
        await lessonService.createLesson(selectedModuleId, {
          title: formData.title.trim(),
          description: formData.description?.trim() || '',
          duration: formData.duration?.trim() || '',
          order: Number(formData.order) || 1,
          videoUrl: formData.videoUrl?.trim() || '',
          content: formData.content?.trim() || '',
        });
        toast.success("Aula criada com sucesso");
      }
      setIsDialogOpen(false);
      setFormData({ ...defaultFormData });
      setEditingLessonId(null);
      fetchModuleAndLessons(selectedModuleId);
    } catch (error) {
      toast.error(error.message || "Erro ao salvar a aula");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ ...defaultFormData });
    setEditingLessonId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Gerenciar Aulas {module ? `- ${module.title}` : ""}
        </h1>
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
              Nova Aula
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[800px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl sm:text-2xl">
                {editingLessonId ? "Editar Aula" : "Criar Nova Aula"}
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Preencha os detalhes da aula abaixo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="moduleId" className="text-sm font-medium">Módulo</Label>
                  <Select
                    value={formData.moduleId || moduleIdFromUrl}
                    onValueChange={handleModuleSelect}
                    disabled={!!moduleIdFromUrl}
                    required
                  >
                    <SelectTrigger id="moduleId">
                      <SelectValue placeholder="Selecione o módulo" />
                    </SelectTrigger>
                    <SelectContent>
                      {allModules.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Título</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Título da aula"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order" className="text-sm font-medium">Ordem</Label>
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva a aula"
                    rows={3}
                    className="min-h-[80px] resize-y"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl" className="text-sm font-medium">URL do Vídeo</Label>
                    <Input
                      id="videoUrl"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                      placeholder="Link do vídeo (opcional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium">Duração</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="Ex: 10min, 1h, etc. (opcional)"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-medium">Conteúdo</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Conteúdo adicional (opcional)"
                    rows={4}
                    className="min-h-[120px] resize-y"
                  />
                </div>
              </div>
              <DialogFooter className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => (document.querySelector('[data-dialog-close]') as HTMLButtonElement)?.click()}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="w-full sm:w-auto"
                >
                  {editingLessonId ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <p>Carregando aulas...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vídeo</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhuma aula encontrada para este módulo
                    </TableCell>
                  </TableRow>
                ) : (
                  lessons.map((lesson) => (
                    <TableRow key={lesson.id}>
                      <TableCell>{lesson.order_number || lesson.order}</TableCell>
                      <TableCell className="font-medium">{lesson.title}</TableCell>
                      <TableCell>{lesson.description}</TableCell>
                      <TableCell>
                        {lesson.video_url || lesson.videoUrl ? (
                          <a href={lesson.video_url || lesson.videoUrl} target="_blank" rel="noopener noreferrer">
                            <Badge variant="outline">Ver vídeo</Badge>
                          </a>
                        ) : (
                          <Badge variant="secondary">-</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {lesson.content ? (
                          <span title={lesson.content}>{lesson.content.slice(0, 30)}...</span>
                        ) : (
                          <Badge variant="secondary">-</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditLesson(lesson)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteLesson(lesson.id)}>
                              <Trash className="h-4 w-4 mr-2" />
                              Excluir
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

export default AdminLessons;
