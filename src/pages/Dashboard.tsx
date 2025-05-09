import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course, Certificate } from "@/types";
import { courseService } from "@/services/api";
import { BookOpen, Award, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const enrolledCourses = await courseService.getEnrolledCourses(user.id);
          setEnrolledCourses(enrolledCourses);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo(a), {user?.name || 'Aluno'}!</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos em Andamento</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              Cursos que você está matriculado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Concluídos</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
            <p className="text-xs text-muted-foreground">
              Cursos que você completou
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
            <p className="text-xs text-muted-foreground">
              Certificados disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Courses Section */}
      <div className="space-y-4" id="my-courses">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Meus Cursos</h2>
          <Link to="/courses">
            <Button variant="outline">Ver todos os cursos</Button>
          </Link>
        </div>
        
        {enrolledCourses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="mb-4 text-muted-foreground">Você ainda não está matriculado em nenhum curso.</p>
              <Link to="/courses">
                <Button>Explorar Cursos</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((course) => (
              <Link to={`/courses/${course.id}`} key={course.id}>
                <Card className="h-full course-card">
                  <div className="aspect-video relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 right-2">
                      {course.progress}% Concluído
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>
                      {course.instructor} • {course.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="progress-bar">
                      <div className="progress-value" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Certificates Section */}
      <div className="space-y-4" id="certificates">
        <h2 className="text-2xl font-bold tracking-tight">Meus Certificados</h2>
        
        {certificates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">Complete cursos para obter certificados.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="course-card">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{certificate.courseName}</CardTitle>
                    <Award className="h-5 w-5 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data de emissão:</p>
                    <p>{new Date(certificate.issueDate).toLocaleDateString()}</p>
                  </div>
                  <Link to={`/certificates/${certificate.id}`}>
                    <Button variant="outline" className="w-full">Ver Certificado</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
