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
import { Plus, Search, Building2, User, Phone, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    if (data) setClients(data);
    setLoading(false);
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.tax_id?.includes(search)
  );

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">კლიენტების ბაზა</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">თქვენი სერვისის მომხმარებლები</p>
        </div>
        <Button 
          render={<Link to="/clients/new" />}
          className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto h-11 rounded-xl font-bold shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          ახალი კლიენტი
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="ძიება სახელით ან საიდენტიფიკაციო კოდით..." 
          className="pl-12 h-11 rounded-xl bg-white border-slate-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Mobile Client Cards */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400">იტვირთება...</div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 text-slate-400 italic">კლიენტები ვერ მოიძებნა</div>
        ) : filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-500">
                {client.type === 'company' ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-slate-900 truncate">{client.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className={cn(
                    "text-[8px] font-black uppercase rounded-md px-2 py-0.5 border-none",
                    client.type === 'company' ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-700"
                  )}>
                    {client.type === 'company' ? 'კომპანია' : 'ფიზ. პირი'}
                  </Badge>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{client.tax_id || '-'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Phone className="w-3.5 h-3.5 text-slate-300" />
                {client.phone || '-'}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-300" />
                <span className="truncate">{client.address || '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>სახელი / კომპანია</TableHead>
              <TableHead>ტიპი</TableHead>
              <TableHead>საიდენტიფიკაციო</TableHead>
              <TableHead>ტელეფონი</TableHead>
              <TableHead>მისამართი</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">იტვირთება...</TableCell></TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">კლიენტები ვერ მოიძებნა</TableCell></TableRow>
            ) : filteredClients.map((client) => (
              <TableRow key={client.id} className="hover:bg-slate-50">
                <TableCell className="font-medium text-slate-900">{client.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={client.type === 'company' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}>
                    {client.type === 'company' ? 'კომპანია' : 'ფიზ. პირი'}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 font-mono text-xs">{client.tax_id || '-'}</TableCell>
                <TableCell className="text-slate-500">{client.phone || '-'}</TableCell>
                <TableCell className="text-slate-500 max-w-xs truncate">{client.address || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
