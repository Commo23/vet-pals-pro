import { HeroSection } from "@/components/HeroSection";
import { DashboardStats } from "@/components/DashboardStats";
import { ClientsOverview } from "@/components/ClientsOverview";
import { PetsOverview } from "@/components/PetsOverview";
import { ConsultationsOverview } from "@/components/ConsultationsOverview";
import { DashboardAlerts } from "@/components/DashboardAlerts";
import { SyncStatus } from "@/components/SyncStatus";
import { DataManager } from "@/components/DataManager";

const Dashboard = () => {
  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <HeroSection />
      
      <div className="grid gap-6 lg:grid-cols-3">
        <SyncStatus />
        <DataManager />
        <DashboardAlerts />
      </div>
      
      <section>
        <h2 className="text-2xl font-bold mb-6">Vue d'ensemble</h2>
        <DashboardStats />
      </section>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <ClientsOverview />
        <PetsOverview />
      </div>
      
      <section>
        <h2 className="text-2xl font-bold mb-6">Activité Récente</h2>
        <ConsultationsOverview />
      </section>
    </div>
  );
};

export default Dashboard;