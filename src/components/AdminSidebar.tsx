
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap, LayoutDashboard, Users, Award, User, List, ShieldCheck } from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();
  
  const navItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/admin/dashboard",
    },
    {
      title: "Cursos",
      icon: <BookOpen size={20} />,
      href: "/admin/courses",
    },
    {
      title: "Módulos",
      icon: <List size={20} />,
      href: "/admin/modules",
    },
    {
      title: "Aulas",
      icon: <GraduationCap size={20} />,
      href: "/admin/lessons",
    },
    {
      title: "Usuários",
      icon: <Users size={20} />,
      href: "/admin/users",
    },
    {
      title: "Definir Admin",
      icon: <ShieldCheck size={20} />,
      href: "/admin/make-admin",
    },
    {
      title: "Certificados",
      icon: <Award size={20} />,
      href: "/admin/certificates",
    },
    {
      title: "Perfis",
      icon: <User size={20} />,
      href: "/admin/profiles",
    },
  ];
  
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex flex-col gap-2 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default AdminSidebar;
