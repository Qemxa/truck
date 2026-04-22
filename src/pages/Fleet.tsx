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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">ავტოპარკი</h1>
        <Link to="/fleet/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            ახალი ავტომობილი
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="ძიება ნომრით, VIN კოდით ან მოდელით..." 
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                    <Link to={`/fleet/${vehicle.id}/service/new`}>
                      <Button variant="ghost" size="sm" className="h-9 px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-bold gap-1.5 transition-all">
                        <Wrench className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">ახალი სერვისი</span>
                      </Button>
                    </Link>
                    <Link to={`/fleet/${vehicle.id}`}>
                      <Button variant="ghost" size="sm" className="h-9 px-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-bold gap-1.5 transition-all">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">პროფილი</span>
                      </Button>
                    </Link>
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
