import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Car, 
  Calendar, 
  Hash, 
  History, 
  Plus, 
  User, 
  Wrench, 
  Navigation,
  FileText,
  Edit
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AuthProvider, useAuth } from '../hooks/useAuth';

export default function VehicleProfile() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [vehicle, setVehicle] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vehicleId) fetchData();
  }, [vehicleId]);

  async function fetchData() {
    const [vRes, rRes] = await Promise.all([
      supabase.from('vehicles').select('*, clients(*)').eq('id', vehicleId).single(),
      supabase.from('service_records').select('*').eq('vehicle_id', vehicleId).order('date', { ascending: false })
    ]);

    if (vRes.data) setVehicle(vRes.data);
    if (rRes.data) setRecords(rRes.data);
    setLoading(false);
  }

  if (loading) return <div className="p-12 text-center text-slate-400">იტვირთება...</div>;
  if (!vehicle) return <div className="p-12 text-center text-rose-500">ავტომობილი ვერ მოიძებნა</div>;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => navigate('/fleet')} className="-ml-3 w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" />
          უკან ავტოპარკში
        </Button>
        <Button 
          render={<Link to={`/fleet/${vehicleId}/service/new`} />}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 rounded-xl h-11 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          ახალი სერვისი
        </Button>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0">
          <Car className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div className="flex-1 space-y-1.5 w-full">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{vehicle.make} {vehicle.model}</h1>
            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 px-3 py-1 text-[10px] uppercase font-black">აქტიური</Badge>
          </div>
          <p className="text-slate-500 flex items-center gap-2 text-sm sm:text-base">
            <User className="w-4 h-4 text-slate-400" />
            მფლობელი: <span className="font-bold text-slate-700">{vehicle.clients?.name}</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:gap-12 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-left">ნომერი</p>
            <p className="text-lg sm:text-xl font-mono font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 w-fit">{vehicle.plate_number}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-left">წელი</p>
            <p className="text-lg sm:text-xl font-black text-slate-800">{vehicle.year}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-6 w-full sm:w-auto h-auto">
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 sm:px-6 py-2.5 text-xs font-bold uppercase tracking-tight flex-1 sm:flex-none">სერვისის ისტორია</TabsTrigger>
          <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 sm:px-6 py-2.5 text-xs font-bold uppercase tracking-tight flex-1 sm:flex-none">დეტალები</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400 flex flex-col items-center gap-3">
               <History className="w-10 h-10 opacity-20" />
               <p className="font-medium italic">სერვისის ისტორია არ მოიძებნა</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <Card key={record.id} className="border-slate-200 overflow-hidden hover:border-indigo-200 transition-colors shadow-sm">
                  <CardHeader className="bg-slate-50/30 py-3 sm:py-4 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-100 font-bold text-[9px] uppercase">{record.category}</Badge>
                        <span className="text-[11px] sm:text-sm font-bold text-slate-500">{new Date(record.date).toLocaleDateString('ka-GE')}</span>
                        
                        {record.payment_status === 'paid' ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-none px-2 py-0.5 text-[8px] font-black uppercase">გადახდილი</Badge>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Badge className="bg-amber-50 text-amber-700 border-none px-2 py-0.5 text-[8px] font-black uppercase">გადასახდელი</Badge>
                            {record.payment_method === 'consignment' && (
                              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" title="დავალიანება (კონსიგნაცია)" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-l sm:border-slate-200 sm:pl-4">
                        <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase italic">
                          {record.payment_method === 'cash' ? '💵 ნაღდი' : 
                           record.payment_method === 'card' ? '💳 ბარათით' : 
                           record.payment_method === 'transfer' ? '🏦 გადარიცხვა' : 
                           record.payment_method === 'consignment' ? '🤝 კონსიგნაცია' : record.payment_method}
                        </span>
                        <span className="text-base sm:text-lg font-black text-slate-900">₾{record.total_cost}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4 sm:py-6 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">{record.description}</p>
                        <Button 
                          render={<Link to={`/maintenance/${record.id}/edit`} />}
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 border border-slate-100 rounded-xl shrink-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 py-3 border-t border-slate-50 mt-4">
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-tight">
                          <Navigation className="w-3.5 h-3.5" />
                          გარბენი: {record.mileage.toLocaleString()} კმ
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-tight">
                          <User className="w-3.5 h-3.5" />
                          სისტემური ჩანაწერი
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50/50 rounded-2xl p-4 shrink-0 md:min-w-[200px] space-y-3 border border-slate-50">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-tighter">ნაწილები</span>
                        <span className="font-mono text-slate-700">₾{record.parts_cost}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-tighter">ხელობა</span>
                        <span className="font-mono text-slate-700">₾{record.labor_cost}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-sm font-black uppercase tracking-tight">ჯამი</span>
                        <div className="flex flex-col items-end">
                          <span className="text-indigo-600 font-mono font-black text-xl">₾{record.total_cost}</span>
                        </div>
                      </div>
                      {isAdmin && record.payment_status === 'pending' && (
                        <Button 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase h-9 rounded-xl shadow-lg shadow-emerald-600/10"
                          onClick={async () => {
                            const { error } = await supabase
                              .from('service_records')
                              .update({ payment_status: 'paid', payment_date: new Date().toISOString() })
                              .eq('id', record.id);
                            if (!error) fetchData();
                          }}
                        >
                          გადახდის დადასტურება
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  ავტომობილის მონაცემები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400">მარკა/მოდელი:</span>
                  <span className="font-semibold">{vehicle.make} {vehicle.model}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400">გამოშვების წელი:</span>
                  <span className="font-semibold">{vehicle.year}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400">VIN კოდი:</span>
                  <span className="font-mono text-sm">{vehicle.vin_code}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400">სახელმწიფო ნომერი:</span>
                  <span className="font-bold">{vehicle.plate_number}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  მფლობელის მონაცემები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400">სახელი:</span>
                  <span className="font-semibold">{vehicle.clients?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400">ტიპი:</span>
                  <span>{vehicle.clients?.type === 'company' ? 'კომპანია' : 'ფიზიკური პირი'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400">ტელეფონი:</span>
                  <span className="font-medium">{vehicle.clients?.phone || '-'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
