import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, DollarSign, Clock, CheckCircle2, AlertCircle, Calendar, Download, Wallet, CreditCard as CardIcon, Building2, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as XLSX from 'xlsx';

import { useAuth } from '../hooks/useAuth';

export default function Payments() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') as 'all' | 'pending' | 'paid';
  
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>(initialFilter || 'all');

  const [confirmPaymentRecord, setConfirmPaymentRecord] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isAdmin) fetchPayments();
  }, [isAdmin]);

  if (authLoading) return <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">ამოწმებს უფლებებს...</div>;
  
  if (!isAdmin) return (
    <div className="h-full flex items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="max-w-md space-y-4">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">წვდომა შეზღუდულია</h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          გადახდებისა და ფინანსური რეპორტების გვერდი ხელმისაწვდომია მხოლოდ ადმინისტრატორისთვის.
        </p>
      </div>
    </div>
  );

  async function fetchPayments() {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_records')
      .select('*, vehicles(plate_number, make, model, clients(name))')
      .order('date', { ascending: false });
    if (data) setRecords(data);
    setLoading(false);
  }

  const exportToExcel = () => {
    const exportData = filteredRecords.map(r => ({
      'თარიღი': new Date(r.date).toLocaleDateString('ka-GE'),
      'ავტომობილი': `${r.vehicles?.make} ${r.vehicles?.model} (${r.vehicles?.plate_number})`,
      'კლიენტი': r.vehicles?.clients?.name || '-',
      'კატეგორია': r.category,
      'ნაწილები': r.parts_cost,
      'ხელობა': r.labor_cost,
      'ჯამი': r.total_cost,
      'სტატუსი': r.payment_status === 'paid' ? 'გადახდილი' : 'გადასახდელი',
      'მეთოდი': getPaymentMethodLabel(r.payment_method),
      'გადახდის თარიღი': r.payment_date ? new Date(r.payment_date).toLocaleDateString('ka-GE') : '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, `Financial_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'cash': 'ნაღდი',
      'card': 'ბარათით',
      'transfer': 'გადარიცხვა',
      'consignment': 'კონსიგნაცია'
    };
    return labels[method] || method;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="w-3.5 h-3.5" />;
      case 'card': return <CardIcon className="w-3.5 h-3.5" />;
      case 'transfer': return <Building2 className="w-3.5 h-3.5" />;
      case 'consignment': return <Wallet className="w-3.5 h-3.5" />;
      default: return <DollarSign className="w-3.5 h-3.5" />;
    }
  };

  const handleConfirmPayment = async (id: string) => {
    const { error } = await supabase
      .from('service_records')
      .update({ payment_status: 'paid', payment_date: new Date().toISOString() })
      .eq('id', id);
    if (!error) fetchPayments();
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      r.vehicles?.plate_number.toLowerCase().includes(search.toLowerCase()) || 
      r.vehicles?.clients?.name?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && r.payment_status === filter;
  });

  const totalPending = records
    .filter(r => r.payment_status === 'pending')
    .reduce((sum, r) => sum + Number(r.total_cost), 0);

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">გადახდების მართვა</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">ფინანსური ისტორია და ანგარიშსწორება</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm w-full sm:w-auto">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">დავალიანება</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono">₾{totalPending.toLocaleString()}</p>
            </div>
          </div>

          <Button 
            onClick={exportToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold h-12 px-6 shadow-lg shadow-emerald-600/20 w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            ექსპორტი
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="ძებნა ნომრით ან კლიენტით..." 
            className="pl-12 h-12 rounded-xl bg-white border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
          <Button 
            variant="ghost" 
            size="sm"
            className={cn("rounded-lg px-4 font-bold text-[10px] uppercase tracking-wider flex-1 sm:flex-none", filter === 'all' ? "bg-white shadow-sm" : "text-slate-500")}
            onClick={() => setFilter('all')}
          >
            ყველა
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn("rounded-lg px-4 font-bold text-[10px] uppercase tracking-wider flex-1 sm:flex-none whitespace-nowrap", filter === 'pending' ? "bg-white shadow-sm text-amber-600" : "text-slate-500")}
            onClick={() => setFilter('pending')}
          >
            გადასახდელი
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn("rounded-lg px-4 font-bold text-[10px] uppercase tracking-wider flex-1 sm:flex-none whitespace-nowrap", filter === 'paid' ? "bg-white shadow-sm text-emerald-600" : "text-slate-500")}
            onClick={() => setFilter('paid')}
          >
            გადახდილი
          </Button>
        </div>
      </div>

      {/* Mobile Payment Cards */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400">იტვირთება...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-400">ჩანაწერები ვერ მოიძებნა</div>
        ) : filteredRecords.map((record) => (
          <div key={record.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">{new Date(record.date).toLocaleDateString('ka-GE')}</span>
              </div>
              <div className="text-right">
                {record.payment_status === 'paid' ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none rounded-lg px-2 py-0.5 text-[8px] font-black uppercase">
                    გადახდილი
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-none rounded-lg px-2 py-0.5 text-[8px] font-black uppercase">
                    გადასახდელი
                  </Badge>
                )}
              </div>
            </div>

            <div className="py-2 border-y border-slate-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-black text-slate-900">{record.vehicles?.plate_number}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">{record.vehicles?.make} {record.vehicles?.model}</div>
                  <div className="text-[10px] text-indigo-500 font-bold mt-1 uppercase">{record.vehicles?.clients?.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900 font-mono italic">₾{record.total_cost}</div>
                  <div className="flex items-center justify-end gap-1 text-[9px] font-black text-slate-400 uppercase mt-1 italic">
                    {getPaymentMethodIcon(record.payment_method)}
                    {getPaymentMethodLabel(record.payment_method)}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-1">
              {record.payment_status === 'pending' ? (
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 rounded-xl"
                  onClick={() => setConfirmPaymentRecord(record)}
                >
                  გადახდის დადასტურება
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 py-2 rounded-lg italic">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  გადახდილია: {record.payment_date ? new Date(record.payment_date).toLocaleDateString('ka-GE') : '-'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">თარიღი</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ავტომობილი</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">კლიენტი</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">მეთოდი</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">სტატუსი</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">თანხა</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">მოქმედება</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400">იტვირთება მონაცემები...</TableCell></TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400">ჩანაწერები ვერ მოიძებნა</TableCell></TableRow>
            ) : filteredRecords.map((record) => (
              <TableRow key={record.id} className="hover:bg-slate-50/30 transition-colors">
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{new Date(record.date).toLocaleDateString('ka-GE')}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="text-sm font-black text-slate-900">{record.vehicles?.plate_number}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">{record.vehicles?.make} {record.vehicles?.model}</div>
                </TableCell>
                <TableCell className="px-6 py-5 text-sm font-bold text-slate-600">
                  {record.vehicles?.clients?.name}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase italic">
                    {getPaymentMethodIcon(record.payment_method)}
                    {getPaymentMethodLabel(record.payment_method)}
                    {record.payment_method === 'consignment' && record.payment_status === 'pending' && (
                      <span className="ml-2 w-2 h-2 bg-rose-500 rounded-full animate-ping" title="დავალიანება (კონსიგნაცია)" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5">
                  {record.payment_status === 'paid' ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase">
                      <CheckCircle2 className="w-3 h-3" />
                      გადახდილი
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black uppercase">
                      <Clock className="w-3 h-3" />
                      გადასახდელი
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-6 py-5 text-right font-black text-lg text-slate-900 font-mono">
                  ₾{record.total_cost}
                </TableCell>
                  <TableCell className="px-6 py-5 text-right">
                    {record.payment_status === 'pending' ? (
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/10"
                        onClick={() => setConfirmPaymentRecord(record)}
                      >
                        გადახდის დადასტურება
                      </Button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {record.payment_date ? new Date(record.payment_date).toLocaleDateString('ka-GE') : '-'}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Confirm Payment Modal */}
        <Dialog open={!!confirmPaymentRecord} onOpenChange={() => setConfirmPaymentRecord(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader className="items-center text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-2">
                <AlertCircle className="w-6 h-6" />
              </div>
              <DialogTitle>გადახდის დადასტურება</DialogTitle>
              <DialogDescription>
                დარწმუნებული ხართ, რომ გსურთ მონიშნოთ ეს ჩანაწერი როგორც გადახდილი?
              </DialogDescription>
            </DialogHeader>
            
            {confirmPaymentRecord && (
              <div className="bg-slate-50 p-4 rounded-xl text-center space-y-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{confirmPaymentRecord.vehicles?.plate_number}</p>
                <p className="text-2xl font-black text-slate-900 font-mono">₾{confirmPaymentRecord.total_cost}</p>
                <p className="text-[11px] text-slate-500 font-medium">{confirmPaymentRecord.category}</p>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setConfirmPaymentRecord(null)}>გაუქმება</Button>
              <Button 
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                onClick={async () => {
                  setIsProcessing(true);
                  const { error } = await supabase
                    .from('service_records')
                    .update({ payment_status: 'paid', payment_date: new Date().toISOString() })
                    .eq('id', confirmPaymentRecord.id);
                  if (!error) {
                    fetchPayments();
                    setConfirmPaymentRecord(null);
                  }
                  setIsProcessing(false);
                }}
                disabled={isProcessing}
              >
                {isProcessing ? 'მუშავდება...' : 'დიახ, დავადასტურო'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
}
