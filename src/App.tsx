import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Wrench, 
  Search, 
  Plus, 
  LogOut,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';
import { GlobalSearch } from './components/GlobalSearch';

// Pages
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Fleet from './pages/Fleet';
import Maintenance from './pages/Maintenance';
import AddServiceForm from './pages/AddServiceForm';
import AddVehicleForm from './pages/AddVehicleForm';
import AddClientForm from './pages/AddClientForm';
import VehicleProfile from './pages/VehicleProfile';
import Login from './pages/Login';
import Payments from './pages/Payments';

const SidebarLink = ({ to, icon: Icon, children }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group relative",
        isActive 
          ? "bg-indigo-600/90 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]" 
          : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
      )}
    >
      <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-600 group-hover:text-indigo-400")} />
      {children}
      {isActive && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />}
    </Link>
  );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { isAdmin, role, toggleRole } = useAuth();

  return (
    <div className="flex h-screen w-full bg-[#Fcfcfd] text-slate-900 overflow-hidden select-none">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0B0E14] flex flex-col shrink-0 z-20">
        <div className="p-8 pb-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Car className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-white text-xl tracking-tighter leading-none uppercase">AutoTracker</span>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em] mt-1.5">Professional Pro</span>
          </div>
        </div>

        <div className="px-5 mb-4">
          <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] mb-6">მთავარი მენიუ</p>
          <nav className="space-y-2">
            <SidebarLink to="/" icon={LayoutDashboard}>მთავარი</SidebarLink>
            <SidebarLink to="/clients" icon={Users}>კლიენტები</SidebarLink>
            <SidebarLink to="/fleet" icon={Car}>ავტოპარკი</SidebarLink>
            <SidebarLink to="/maintenance" icon={Wrench}>მომსახურება</SidebarLink>
            <SidebarLink to="/payments" icon={CreditCard}>გადახდები</SidebarLink>
          </nav>
        </div>

        <div className="p-8 mt-auto border-t border-white/5 space-y-4">
          <button 
            onClick={toggleRole}
            className="w-full h-11 px-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
          >
            <Users className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            როლის შეცვლა
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-indigo-400 border border-white/10 shadow-inner shrink-0">
              {role === 'admin' ? 'AD' : 'MC'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{role === 'admin' ? 'ადმინისტრატორი' : 'მექანიკოსი'}</p>
              <p className="text-[10px] font-medium text-slate-500 truncate lowercase">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 bg-white/50 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">პანელი</span>
            <span className="text-slate-300 font-light text-xl opacity-50">/</span>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">
              {location.pathname === '/' ? 'მიმოხილვა' : 
               location.pathname.startsWith('/clients') ? 'კლიენტები' :
               location.pathname.startsWith('/fleet') ? 'ავტოპარკი' :
               location.pathname.startsWith('/maintenance') ? 'ისტორია' : 
               location.pathname.startsWith('/payments') ? 'გადახდები' : 'სერვისი'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden xl:block">
              <GlobalSearch />
            </div>
            <Link to="/service/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 rounded-2xl font-bold shadow-[0_10px_20px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.03] active:scale-[0.97]">
                <Plus className="w-5 h-5 mr-3" />
                ახალი სერვისი
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-[#F8FAFC]">
          {children}
        </div>
      </div>
    </div>
  );
};

function AppRoutes() {
  const { isAdmin, loading } = useAuth();
  
  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
      <Route path="/clients" element={<MainLayout><Clients /></MainLayout>} />
      <Route path="/clients/new" element={<MainLayout><AddClientForm /></MainLayout>} />
      <Route path="/fleet" element={<MainLayout><Fleet /></MainLayout>} />
      <Route path="/fleet/new" element={<MainLayout><AddVehicleForm /></MainLayout>} />
      <Route path="/fleet/:vehicleId" element={<MainLayout><VehicleProfile /></MainLayout>} />
      <Route path="/maintenance" element={<MainLayout><Maintenance /></MainLayout>} />
      <Route path="/maintenance/:recordId/edit" element={<MainLayout><AddServiceForm /></MainLayout>} />
      <Route path="/payments" element={<MainLayout><Payments /></MainLayout>} />
      <Route path="/service/new" element={<MainLayout><AddServiceForm /></MainLayout>} />
      <Route path="/fleet/:vehicleId/service/new" element={<MainLayout><AddServiceForm /></MainLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

