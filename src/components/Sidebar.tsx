
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap, LayoutDashboard, Award } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/dashboard",
    },
    {
      title: "Catálogo de Cursos",
      icon: <BookOpen size={20} />,
      href: "/courses",
    },
    {
      title: "Meus Cursos",
      icon: <GraduationCap size={20} />,
      href: "/dashboard#my-courses",
    },
    {
      title: "Certificados",
      icon: <Award size={20} />,
      href: "/dashboard#certificates",
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

export default Sidebar;
