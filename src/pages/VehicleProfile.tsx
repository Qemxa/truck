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
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/fleet')} className="-ml-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          უკან ავტოპარკში
        </Button>
        <Link to={`/fleet/${vehicleId}/service/new`}>
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
            <Plus className="w-4 h-4 mr-2" />
            ახალი სერვისი
          </Button>
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
          <Car className="w-10 h-10" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{vehicle.make} {vehicle.model}</h1>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1">აქტიური</Badge>
          </div>
          <p className="text-slate-500 flex items-center gap-2">
            <User className="w-4 h-4" />
            მფლობელი: <span className="font-semibold text-slate-700">{vehicle.clients?.name}</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 shrink-0">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ნომერი</p>
            <p className="text-xl font-mono font-bold text-slate-800">{vehicle.plate_number}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">წელი</p>
            <p className="text-xl font-bold text-slate-800">{vehicle.year}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-6">
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2">სერვისის ისტორია</TabsTrigger>
          <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2">დეტალური ინფორმაცია</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
               სერვისის ისტორია არ მოიძებნა
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <Card key={record.id} className="border-slate-200 overflow-hidden hover:border-indigo-200 transition-colors">
                  <CardHeader className="bg-slate-50/50 py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-white">{record.category}</Badge>
                        <span className="text-sm font-medium text-slate-500">{new Date(record.date).toLocaleDateString('ka-GE')}</span>
                        
                        {record.payment_status === 'paid' ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-none px-2 py-0.5 text-[9px] font-black uppercase">გადახდილი</Badge>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Badge className="bg-amber-50 text-amber-700 border-none px-2 py-0.5 text-[9px] font-black uppercase">გადასახდელი</Badge>
                            {record.payment_method === 'consignment' && (
                              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" title="დავალიანება (კონსიგნაცია)" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                          {record.payment_method === 'cash' ? '💵 ნაღდი' : 
                           record.payment_method === 'card' ? '💳 ბარათით' : 
                           record.payment_method === 'transfer' ? '🏦 გადარიცხვა' : 
                           record.payment_method === 'consignment' ? '🤝 კონსიგნაცია' : record.payment_method}
                        </span>
                        <span className="text-lg font-bold text-slate-900 border-l border-slate-200 pl-3">₾{record.total_cost}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-6 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-slate-700 leading-relaxed font-medium">{record.description}</p>
                        <Link to={`/maintenance/${record.id}/edit`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-slate-100">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                      <div className="flex items-center gap-4 py-2 border-t border-slate-100 mt-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Navigation className="w-3 h-3" />
                          გარბენი: {record.mileage.toLocaleString()} კმ
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <User className="w-3 h-3" />
                          სისტემური ჩანაწერი
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4 shrink-0 min-w-[180px] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">ნაწილები:</span>
                        <span className="font-mono font-medium">₾{record.parts_cost}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">ხელობა:</span>
                        <span className="font-mono font-medium">₾{record.labor_cost}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-sm font-bold">ჯამი:</span>
                        <div className="flex flex-col items-end">
                          <span className="text-indigo-600 font-mono font-black text-lg">₾{record.total_cost}</span>
                          {isAdmin && record.payment_status === 'pending' && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-emerald-600 font-black h-auto p-0 text-[10px] uppercase mt-1 h-5"
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
                      </div>
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
