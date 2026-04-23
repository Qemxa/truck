import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Car, User, Hash, Wrench, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export default function Fleet() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*, clients(name)')
      .order('created_at', { ascending: false });
    if (data) setVehicles(data);
    setLoading(false);
  }

  const filteredVehicles = vehicles.filter(v => 
    v.plate_number.toLowerCase().includes(search.toLowerCase()) || 
    v.vin_code.toLowerCase().includes(search.toLowerCase()) ||
    v.make.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">ავტოპარკი</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">თქვენს ბაზაში არსებული ავტომობილები</p>
        </div>
        <Button 
          render={<Link to="/fleet/new" />}
          className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto h-11 rounded-xl font-bold shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          ახალი ავტომობილი
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="ძიება ნომრით, VIN კოდით ან მოდელით..." 
          className="pl-12 h-11 rounded-xl bg-white border-slate-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Mobile Fleet Cards */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400">იტვირთება...</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12 text-slate-400 italic">ავტომობილები ვერ მოიძებნა</div>
        ) : filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-500">
                <Car className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-slate-900 truncate">{vehicle.make} {vehicle.model}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">{vehicle.year} წელი • {vehicle.vin_code}</div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-y border-slate-50">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">სახელმწიფო ნომერი</p>
                <Badge variant="outline" className="bg-slate-900 text-white font-mono text-sm border-none rounded-md px-2 py-0.5">
                  {vehicle.plate_number}
                </Badge>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">მფლობელი</p>
                <p className="text-xs font-bold text-slate-700">{vehicle.clients?.name || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                render={<Link to={`/fleet/${vehicle.id}/service/new`} />}
                variant="outline" 
                className="flex-1 h-10 border-emerald-100 text-emerald-600 font-bold text-xs rounded-xl hover:bg-emerald-50"
              >
                <Wrench className="w-3.5 h-3.5 mr-2" />
                სერვისი
              </Button>
              <Button 
                render={<Link to={`/fleet/${vehicle.id}`} />}
                className="flex-1 h-10 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                <Eye className="w-3.5 h-3.5 mr-2" />
                პროფილი
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>ავტომობილი / გამოშვების წელი</TableHead>
              <TableHead>სახელმწიფო ნომერი</TableHead>
              <TableHead>VIN კოდი</TableHead>
              <TableHead>მფლობელი</TableHead>
              <TableHead className="text-right">მოქმედება</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">იტვირთება...</TableCell></TableRow>
            ) : filteredVehicles.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">ავტომობილები ვერ მოიძებნა</TableCell></TableRow>
            ) : filteredVehicles.map((vehicle) => (
              <TableRow key={vehicle.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="font-medium text-slate-900">{vehicle.make} {vehicle.model}</div>
                  <div className="text-xs text-slate-500">{vehicle.year} წელი</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-slate-50 font-mono text-sm border-slate-300">
                    {vehicle.plate_number}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 font-mono text-xs uppercase tracking-tighter">
                  {vehicle.vin_code}
                </TableCell>
                <TableCell className="text-slate-700">
                  {vehicle.clients?.name}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      render={<Link to={`/fleet/${vehicle.id}/service/new`} />}
                      variant="ghost" 
                      size="sm" 
                      className="h-9 px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-bold gap-1.5 transition-all"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">ახალი სერვისი</span>
                    </Button>
                    <Button 
                      render={<Link to={`/fleet/${vehicle.id}`} />}
                      variant="ghost" 
                      size="sm" 
                      className="h-9 px-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-bold gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">პროფილი</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
