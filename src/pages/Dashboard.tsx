import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  Car, 
  Wrench, 
  TrendingUp, 
  DollarSign, 
  UserCheck,
  Search,
  Plus,
  Clock,
  Filter,
  CreditCard,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [timeFilter, setTimeFilter] = useState('this-month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeMaintenance: 0,
    totalIncome: 0,
    totalReceivable: 0,
    activeClients: 0,
    pendingApprovals: 0
  });
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [fleetStatus, setFleetStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter, customRange]);

  async function fetchDashboardData() {
    setLoading(true);
    
    // Get time filter range
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    if (timeFilter === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === 'this-week') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === 'this-month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeFilter === 'custom' && customRange.start && customRange.end) {
      startDate = new Date(customRange.start);
      endDate = new Date(customRange.end);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeFilter === 'all-time') {
      startDate = new Date(2000, 0, 1);
    }

    const isoStartDate = startDate.toISOString();
    const isoEndDate = endDate.toISOString();

    const [vCount, cCount, incomeRes, debtRes, pendingRes, rRecords, fStatus] = await Promise.all([
      supabase.from('vehicles').select('*', { count: 'exact', head: true }),
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      // Sum of paid services in period
      supabase.from('service_records')
        .select('total_cost')
        .eq('payment_status', 'paid')
        .gte('date', isoStartDate)
        .lte('date', timeFilter === 'custom' ? isoEndDate : now.toISOString()),
      // Sum of pending services (receivables) - always all time for debt
      supabase.from('service_records')
        .select('total_cost')
        .eq('payment_status', 'pending'),
      // Count of pending approvals (new field we'll handle)
      supabase.from('service_records')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from('service_records').select('*, vehicles(plate_number, make, model)').order('created_at', { ascending: false }).limit(5),
      supabase.from('vehicles').select('*, clients(name)').order('created_at', { ascending: false }).limit(5)
    ]);

    const income = incomeRes.data?.reduce((sum, r) => sum + Number(r.total_cost), 0) || 0;
    const debt = debtRes.data?.reduce((sum, r) => sum + Number(r.total_cost), 0) || 0;

    setStats({
      totalVehicles: vCount.count || 0,
      activeClients: cCount.count || 0,
      totalIncome: income,
      totalReceivable: debt,
      activeMaintenance: rRecords.data?.length || 0,
      pendingApprovals: pendingRes.count || 0
    });

    setRecentRecords(rRecords.data || []);
    setFleetStatus(fStatus.data || []);
    setLoading(false);
  }

  return (
    <div className="p-4 sm:p-8 flex flex-col flex-1 overflow-auto animate-in fade-in duration-500">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">მიმოხილვა</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">სწრაფი სტატისტიკა და ანალიტიკა</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {isAdmin && (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {timeFilter === 'custom' && (
                <div className="flex items-center gap-2 w-full sm:w-auto animate-in fade-in slide-in-from-right-2 duration-300">
                  <Input 
                    type="date" 
                    className="h-10 text-[10px] font-bold rounded-xl border-slate-200 flex-1 sm:w-32" 
                    value={customRange.start}
                    onChange={(e) => setCustomRange(p => ({...p, start: e.target.value}))}
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <Input 
                    type="date" 
                    className="h-10 text-[10px] font-bold rounded-xl border-slate-200 flex-1 sm:w-32"
                    value={customRange.end}
                    onChange={(e) => setCustomRange(p => ({...p, end: e.target.value}))}
                  />
                </div>
              )}
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm w-full sm:w-auto">
                <Clock className="w-4 h-4 text-slate-400" />
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="border-none shadow-none bg-transparent h-auto p-0 focus:ring-0 text-sm font-bold text-slate-700 w-full sm:w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                    <SelectItem value="today">დღეს</SelectItem>
                    <SelectItem value="this-week">ამ კვირაში</SelectItem>
                    <SelectItem value="this-month">ამ თვეში</SelectItem>
                    <SelectItem value="custom">პერიოდი...</SelectItem>
                    <SelectItem value="all-time">სულ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <Link to="/service/new" className="w-full sm:w-auto">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 px-6 h-11 w-full">
              <Plus className="w-4 h-4 mr-2" />
              ახალი სერვისი
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6 mb-8 text-left">
        <StatCard 
          title="ავტომობილები" 
          value={stats.totalVehicles.toString()} 
          change="სრული ბაზა" 
          trend="neutral" 
          icon={Car}
          link="/fleet"
        />
        {isAdmin ? (
          <>
            <StatCard 
              title="შემოსავალი" 
              value={`₾${stats.totalIncome.toLocaleString()}`} 
              change={timeFilter === 'all-time' ? 'ჯამური' : 'არჩეული პერიოდი'} 
              trend="up" 
              isMono 
              icon={TrendingUp}
              color="indigo"
              link="/payments?filter=paid"
            />
            <StatCard 
              title="ასაღები თანხა" 
              value={`₾${stats.totalReceivable.toLocaleString()}`} 
              change="გადაუხდელი" 
              trend={stats.totalReceivable > 0 ? "warn" : "neutral"} 
              isMono 
              icon={CreditCard}
              color="amber"
              link="/payments?filter=pending"
            />
            <StatCard 
              title="დასადასტურებელი" 
              value={stats.pendingApprovals.toString()} 
              change="ადმინის კონტროლი" 
              trend={stats.pendingApprovals > 0 ? "warn" : "neutral"} 
              icon={AlertCircle}
              color="rose"
              link="/maintenance?status=pending"
            />
          </>
        ) : (
          <StatCard 
            title="დავალიანება" 
            value={`₾${stats.totalReceivable.toLocaleString()}`} 
            change="ჯამური გადაუხდელი" 
            trend={stats.totalReceivable > 0 ? "warn" : "neutral"} 
            isMono 
            icon={AlertCircle}
            color="amber"
            link="/maintenance?filter=pending"
          />
        )}
        <StatCard 
          title="აქტიური სერვისი" 
          value={stats.activeMaintenance.toString()} 
          change="ბოლო პერიოდი" 
          trend="neutral" 
          icon={Wrench}
          link="/maintenance"
        />
        <StatCard 
          title="კლიენტები" 
          value={stats.activeClients.toString()} 
          change="ჯამური" 
          trend="neutral" 
          icon={UserCheck}
          link="/clients"
        />
      </div>

      {/* Quick Actions - The "Simple for use" part */}
      <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-4">სწრაფი მოქმედებები</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <QuickActionLink 
          to="/service/new" 
          title="ახალი სერვისი" 
          subtitle="სერვისის გაფორმება" 
          icon={Wrench} 
          color="bg-indigo-600" 
        />
        <QuickActionLink 
          to="/fleet/new" 
          title="ავტომობილი" 
          subtitle="ბაზაში დამატება" 
          icon={Car} 
          color="bg-emerald-600" 
        />
        <QuickActionLink 
          to="/clients/new" 
          title="კლიენტი" 
          subtitle="რეგისტრაცია" 
          icon={UserCheck} 
          color="bg-blue-600" 
        />
        <QuickActionLink 
          to="/maintenance" 
          title="რეპორტები" 
          subtitle="ისტორიის ნახვა" 
          icon={LayoutDashboard} 
          color="bg-slate-800" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs">ავტოპარკის სტატუსი</h4>
            <Link to="/fleet">
              <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl">ყველას ნახვა</Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">ავტომობილი</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">კლიენტი</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">სტატუსი</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fleetStatus.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-slate-900">{vehicle.make} {vehicle.model}</div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">{vehicle.plate_number}</div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600">{vehicle.clients?.name}</td>
                    <td className="px-6 py-5">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">მუშა მდგომარეობა</Badge>
                    </td>
                  </tr>
                ))}
                {fleetStatus.length === 0 && !loading && (
                   <tr><td colSpan={3} className="text-center py-12 text-slate-400 font-medium italic">მონაცემები არ არის</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs">ბოლო სერვისები</h4>
            {stats.totalReceivable > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] uppercase px-2 py-0.5">აქტიური დავალიანება</Badge>
            )}
          </div>
          <div className="p-6 space-y-7 flex-1 overflow-auto">
            {recentRecords.map((record) => (
              <ActivityItem 
                key={record.id}
                title={record.category} 
                detail={record.vehicles?.plate_number} 
                status={record.payment_status}
                time={new Date(record.date).toLocaleDateString('ka-GE')}
                color={record.payment_status === 'paid' ? "bg-emerald-500" : "bg-amber-500"} 
              />
            ))}
            {recentRecords.length === 0 && !loading && (
              <p className="text-center py-12 text-slate-400 font-medium italic">ჩანაწერები ჯერ არ არის</p>
            )}
          </div>
          <div className="p-6 border-t border-slate-100">
            <Link to="/maintenance">
              <Button variant="outline" className="w-full h-11 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">სრული ისტორია</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, change, trend, isMono, icon: Icon, color, link }: any) => {
  const CardWrapper = link ? Link : 'div';
  
  return (
    <CardWrapper to={link} className={cn(
      "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group transition-all duration-300",
      link && "hover:border-indigo-200 hover:shadow-md hover:scale-[1.02] cursor-pointer"
    )}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{title}</p>
        <div className={cn(
          "p-2.5 rounded-xl transition-colors",
          color === 'indigo' ? "bg-indigo-50 text-indigo-600" : 
          color === 'amber' ? "bg-amber-50 text-amber-600" : 
          "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
        )}>
          <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
        </div>
      </div>
      <h3 className={cn("text-3xl font-black text-slate-900 tracking-tight", isMono && "font-mono")}>{value}</h3>
      <p className={cn("text-[11px] font-bold mt-2.5 flex items-center gap-1.5", 
        trend === 'up' && "text-emerald-500",
        trend === 'down' && "text-rose-500",
        trend === 'warn' && "text-amber-500",
        trend === 'neutral' && "text-slate-400"
      )}>
        {trend === 'warn' && <AlertCircle className="w-3.5 h-3.5" />}
        {change}
      </p>
    </CardWrapper>
  );
};

const ActivityItem = ({ title, detail, time, color, status }: any) => (
  <div className="flex gap-4 group">
    <div className={cn("mt-1.5 w-3 h-3 rounded-full shrink-0 shadow-sm transition-transform group-hover:scale-110", color)}></div>
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <p className="text-sm font-black text-slate-800 tracking-tight">{title}</p>
        {status === 'pending' && (
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">{detail}</p>
        <p className="text-[10px] text-slate-400 font-medium">{time}</p>
      </div>
    </div>
  </div>
);

const QuickActionLink = ({ to, title, subtitle, icon: Icon, color }: any) => (
  <Link to={to} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group overflow-hidden relative">
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform", color)}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="overflow-hidden">
      <p className="text-sm font-black text-slate-800 tracking-tight">{title}</p>
      <p className="text-[11px] font-bold text-slate-400 truncate uppercase mt-0.5">{subtitle}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
    
    <div className={cn("absolute -right-4 -bottom-4 w-16 h-16 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity", color)}>
       <Icon className="w-full h-full" />
    </div>
  </Link>
);
