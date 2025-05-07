import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { moduleService, lessonService, lessonProgressService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Lesson, Module } from "@/types";
import VideoPlayer from "@/components/VideoPlayer";

const CoursePlayer = () => {
  const { id: courseId } = useParams();
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchModulesAndLessons = async () => {
      setLoading(true);
      try {
        const mods = await moduleService.getModulesByCourseId(courseId);
        for (const mod of mods) {
          mod.lessons = await lessonService.getLessonsByModuleId(mod.id);
        }
        setModules(mods);
        if (mods.length > 0 && mods[0].lessons.length > 0) {
          setSelectedModule(mods[0]);
          setSelectedLesson(mods[0].lessons[0]);
        }
        // Carregar o progresso do curso
        fetchProgress();
      } catch (error) {
        console.error('Erro ao carregar módulos e aulas:', error);
        toast.error('Erro ao carregar o conteúdo do curso');
      } finally {
        setLoading(false);
      }
    };
    fetchModulesAndLessons();
    // eslint-disable-next-line
  }, [courseId]);

  const fetchProgress = async () => {
    try {
      // Obter o ID do usuário atual
      const userId = localStorage.getItem('userId') || 'current-user';
      
      const prog = await lessonProgressService.calculateCourseProgress(userId, courseId);
      setProgress(prog || 0);
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      setProgress(0);
    }
  };

  const handleSelectLesson = (mod, lesson) => {
    setSelectedModule(mod);
    setSelectedLesson(lesson);
  };

  const handleMarkAsCompleted = async () => {
    try {
      if (!selectedLesson) return;
      
      // Obter o ID do usuário atual (você pode precisar ajustar isso com base na sua lógica de autenticação)
      const userId = localStorage.getItem('userId') || 'current-user';
      
      await lessonProgressService.markLessonAsCompleted(userId, selectedLesson.id);
      toast.success("Aula marcada como concluída!");
      fetchProgress();
    } catch (error) {
      console.error('Erro ao marcar aula como concluída:', error);
      toast.error("Erro ao marcar aula como concluída");
    }
  };

  const handleNextLesson = () => {
    if (!selectedModule || !selectedLesson) return;
    const currentLessonIdx = selectedModule.lessons.findIndex(l => l.id === selectedLesson.id);
    if (currentLessonIdx < selectedModule.lessons.length - 1) {
      setSelectedLesson(selectedModule.lessons[currentLessonIdx + 1]);
    } else {
      const currentModuleIdx = modules.findIndex(m => m.id === selectedModule.id);
      if (currentModuleIdx < modules.length - 1 && modules[currentModuleIdx + 1].lessons.length > 0) {
        setSelectedModule(modules[currentModuleIdx + 1]);
        setSelectedLesson(modules[currentModuleIdx + 1].lessons[0]);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-2">Player de Aulas</h1>
      <Progress value={progress} className="mb-4" />
      <div className="flex gap-6">
        <div className="w-1/3 space-y-4">
          {modules.map((mod) => (
            <Card key={mod.id} className="p-2">
              <h2 className="font-semibold mb-2">{mod.title}</h2>
              <ul>
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Button
                      variant={selectedLesson?.id === lesson.id ? "default" : "ghost"}
                      className="w-full justify-start mb-1"
                      onClick={() => handleSelectLesson(mod, lesson)}
                    >
                      {lesson.title}
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <div className="flex-1">
          {loading || !selectedLesson ? (
            <p>Selecione uma aula para começar</p>
          ) : (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-2">{selectedLesson.title}</h2>
              <p className="mb-2 text-muted-foreground">{selectedLesson.description}</p>
              {selectedLesson.videoUrl && (
                <div className="mb-4">
                  <VideoPlayer
                    url={selectedLesson.videoUrl}
                    title={selectedLesson.title}
                    height={360}
                  />
                </div>
              )}
              {selectedLesson.content && (
                <div className="mb-4">
                  <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                </div>
              )}
              <Button onClick={handleMarkAsCompleted} className="mr-2">Marcar como concluída</Button>
              <Button variant="outline" onClick={handleNextLesson}>Próxima aula</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
