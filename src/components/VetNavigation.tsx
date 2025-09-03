import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Heart,
  Calendar,
  FileText,
  BarChart3,
  Tractor,
  Home,
  Syringe,
  Bug,
  Cog
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Heart, label: "Animaux", path: "/pets" },
  { icon: Calendar, label: "Rendez-vous", path: "/appointments" },
  { icon: FileText, label: "Consultations", path: "/consultations" },
  { icon: Syringe, label: "Vaccinations", path: "/vaccinations" },
  { icon: Bug, label: "Antiparasites", path: "/antiparasites" },
  { icon: BarChart3, label: "Historiques", path: "/history" },
  { icon: Tractor, label: "Farm Mgmt", path: "/farm" },
  { icon: Cog, label: "Paramètres", path: "/settings" }
];

export function VetNavigation() {
  const location = useLocation();

  return (
    <nav className="bg-card border-b shadow-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              VetPro CRM
            </h1>
          </Link>

          <div className="flex gap-2 ml-auto">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "ghost"}
                size="sm"
                className="gap-2 transition-all hover:medical-glow"
                asChild
              >
                <Link to={item.path}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}