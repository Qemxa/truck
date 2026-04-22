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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">კლიენტების ბაზა</h1>
        <Link to="/clients/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            ახალი კლიენტი
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="ძიება სახელით ან საიდენტიფიკაციო კოდით..." 
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
