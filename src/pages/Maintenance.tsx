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
import { Search, Calendar, User, Car, Download, Edit, CheckCircle, XCircle, AlertCircle, Eye, Info, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
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

const CompareChanges = ({ oldData, newData }: { oldData: any, newData: any }) => {
  const fields = [
    { key: 'date', label: 'თარიღი' },
    { key: 'mileage', label: 'გარბენი' },
    { key: 'category', label: 'კატეგორია' },
    { key: 'description', label: 'აღწერა' },
    { key: 'parts_cost', label: 'ნაწილები' },
    { key: 'labor_cost', label: 'ხელობა' },
    { key: 'total_cost', label: 'ჯამი' },
    { key: 'payment_method', label: 'მეთოდი' },
  ];

  const normalizeValue = (key: string, val: any) => {
    if (val === null || val === undefined) return '-';
    if (key === 'date') {
      try {
        return new Date(val).toISOString().split('T')[0];
      } catch (e) {
        return val;
      }
    }
    return val.toString();
  };

  return (
    <div className="space-y-3">
      {fields.map(f => {
        const oldVal = normalizeValue(f.key, oldData[f.key]);
        const newVal = normalizeValue(f.key, newData[f.key]);
        const isChanged = oldVal !== newVal;
        
        if (!isChanged) return null;
        
        return (
          <div key={f.key} className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">{f.label} (იყო)</span>
              <span className="text-xs line-through text-rose-500 font-medium">{oldVal}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">{f.label} (გახდა)</span>
              <span className="text-xs font-black text-emerald-600">{newVal}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function Maintenance() {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter');
  
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>(initialFilter || 'all');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');

  // Modal states
  const [compareRecord, setCompareRecord] = useState<any>(null);
  const [confirmPaymentRecord, setConfirmPaymentRecord] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    const { data, error } = await supabase
      .from('service_records')
      .select('*, vehicles(plate_number, make, model, clients(name))')
      .order('created_at', { ascending: false });
    if (data) setRecords(data);
    setLoading(false);
  }

  const exportToExcel = () => {
    const exportData = filteredRecords.map(r => ({
      'თარიღი': new Date(r.date).toLocaleDateString('ka-GE'),
      'ავტომობილი': `${r.vehicles?.make} ${r.vehicles?.model} (${r.vehicles?.plate_number})`,
      'კლიენტი': r.vehicles?.clients?.name || '-',
      'კატეგორია': r.category,
      'აღწერა': r.description,
      'გარბენი': r.mileage,
      'ჯამი': r.total_cost,
      'გადახდა': r.payment_status === 'paid' ? 'გადახდილი' : 'გადასახდელი',
      'დამოწმება': r.status === 'approved' ? 'დამოწმებული' : 'მოლოდინში',
      'მეთოდი': r.payment_method
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Maintenance");
    XLSX.writeFile(wb, `Maintenance_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      r.vehicles?.plate_number.toLowerCase().includes(search.toLowerCase()) || 
      r.vehicles?.clients?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    
    if (filter !== 'all' && r.payment_status !== filter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;

    return matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">მომსახურების ისტორია</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">სრული სერვისული ისტორია და სტატუსები</p>
        </div>
        {isAdmin && (
          <Button variant="outline" onClick={exportToExcel} className="w-full sm:w-auto h-11 font-bold text-xs uppercase tracking-wider rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            ექსპორტი (Excel)
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="ძიება ავტომობილით, კატეგორიით ან აღწერით..." 
          className="pl-12 h-11 rounded-xl bg-white border-slate-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Mobile Card List */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400">იტვირთება...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-400">ჩანაწერები ვერ მოიძებნა</div>
        ) : filteredRecords.map((record) => (
          <div key={record.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">{new Date(record.date).toLocaleDateString('ka-GE')}</span>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {record.status === 'approved' ? (
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-lg px-2 py-0.5 text-[8px] font-black uppercase w-fit">
                    დამოწმებული
                  </Badge>
                ) : (
                  <div className="flex flex-col gap-1 items-end">
                    <Badge className="bg-rose-50 text-rose-700 border-rose-100 rounded-lg px-2 py-0.5 text-[8px] font-black uppercase w-fit animate-pulse">
                      მოლოდინში
                    </Badge>
                    {record.previous_data && (
                      <Badge variant="outline" className="text-[7px] border-amber-200 bg-amber-50 text-amber-700 font-bold uppercase w-fit py-0">
                        ჩასწორებული
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 py-3 border-y border-slate-50">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-500">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">{record.vehicles?.plate_number}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">{record.vehicles?.make} {record.vehicles?.model}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-100 font-bold text-[9px] uppercase">
                {record.category}
              </Badge>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{record.description}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-lg font-black text-slate-900 font-mono italic">₾{record.total_cost}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase italic">{record.mileage.toLocaleString()} კმ</div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  render={<Link to={`/maintenance/${record.id}/edit`} />}
                  size="icon" 
                  variant="ghost" 
                  className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 rounded-xl"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2">
                  {isAdmin && record.status === 'pending' && (
                    <>
                      {record.previous_data && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 text-indigo-500 hover:bg-indigo-50 border border-slate-100 rounded-xl"
                          onClick={() => setCompareRecord(record)}
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                      )}
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-emerald-600 hover:bg-emerald-50 border border-slate-100 rounded-xl"
                        onClick={async () => {
                          const { error } = await supabase
                            .from('service_records')
                            .update({ status: 'approved' })
                            .eq('id', record.id);
                          if (!error) fetchRecords();
                        }}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </Button>
                    </>
                  )}
                  {isAdmin && record.payment_status === 'pending' && (
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase h-9 px-4 rounded-xl"
                      onClick={() => setConfirmPaymentRecord(record)}
                    >
                      გადახდა
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>თარიღი</TableHead>
              <TableHead>ავტომობილი</TableHead>
              <TableHead>დამოწმება</TableHead>
              <TableHead>გადახდა</TableHead>
              <TableHead>აღწერა</TableHead>
              <TableHead className="text-right">ჯამი</TableHead>
              <TableHead className="text-right">მოქმედება</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">იტვირთება...</TableCell></TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">ჩანაწერები ვერ მოიძებნა</TableCell></TableRow>
            ) : filteredRecords.map((record) => (
              <TableRow key={record.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm font-bold text-slate-700">{new Date(record.date).toLocaleDateString('ka-GE')}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">სისტემური</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-black text-slate-900">{record.vehicles?.plate_number}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[120px]">{record.vehicles?.make} {record.vehicles?.model}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    {record.status === 'approved' ? (
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-lg px-2 py-1 text-[9px] font-black uppercase flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" />
                        დამოწმებული
                      </Badge>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <Badge className="bg-rose-50 text-rose-700 border-rose-100 rounded-lg px-2 py-1 text-[9px] font-black uppercase flex items-center gap-1 w-fit animate-pulse">
                          <AlertCircle className="w-3 h-3" />
                          მოლოდინში
                        </Badge>
                        {record.previous_data && (
                          <Badge variant="outline" className="text-[8px] border-amber-200 bg-amber-50 text-amber-700 font-bold uppercase w-fit py-0">
                            ჩასწორებული
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {record.payment_status === 'paid' ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg px-2 py-1 text-[9px] font-black uppercase w-fit">გადახდილი</Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-100 rounded-lg px-2 py-1 text-[9px] font-black uppercase w-fit">გადასახდელი</Badge>
                    )}
                    <span className="text-[9px] font-bold text-slate-400 uppercase italic">
                      {record.payment_method === 'cash' ? '💵 ნაღდი' : 
                       record.payment_method === 'card' ? '💳 ბარათით' : 
                       record.payment_method === 'transfer' ? '🏦 გადარიცხვა' : 
                       record.payment_method === 'consignment' ? '🤝 კონსიგნაცია' : record.payment_method}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[150px]">
                  <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-100 font-bold text-[9px] uppercase mb-1 block w-fit">
                    {record.category}
                  </Badge>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{record.description}</p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-sm font-black text-slate-900 font-mono italic">₾{record.total_cost}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase italic mt-0.5">{record.mileage.toLocaleString()} კმ</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Button 
                        render={<Link to={`/maintenance/${record.id}/edit`} />}
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      {isAdmin && record.status === 'pending' && (
                        <div className="flex items-center gap-1">
                          {record.previous_data && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-indigo-500 hover:bg-indigo-50"
                              title="ცვლილებების ნახვა"
                              onClick={() => setCompareRecord(record)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                            title="დამოწმება"
                            onClick={async () => {
                              const { error } = await supabase
                                .from('service_records')
                                .update({ status: 'approved' })
                                .eq('id', record.id);
                              if (!error) fetchRecords();
                            }}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {isAdmin && record.payment_status === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="link" 
                        className="text-[10px] font-black h-auto p-0 text-emerald-600 uppercase"
                        onClick={() => setConfirmPaymentRecord(record)}
                      >
                        გადახდა
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Comparison Modal */}
      <Dialog open={!!compareRecord} onOpenChange={() => setCompareRecord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" />
              ცვლილებების შედარება
            </DialogTitle>
            <DialogDescription>
              ნახეთ რა შეიცვალა მექანიკოსის მიერ ჩანაწერში
            </DialogDescription>
          </DialogHeader>
          
          {compareRecord && compareRecord.previous_data && (
            <div className="py-4">
              <CompareChanges oldData={compareRecord.previous_data} newData={compareRecord} />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCompareRecord(null)}>დახურვა</Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={async () => {
                const { error } = await supabase
                  .from('service_records')
                  .update({ status: 'approved' })
                  .eq('id', compareRecord.id);
                if (!error) {
                  fetchRecords();
                  setCompareRecord(null);
                }
              }}
            >
              დამოწმება
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="bg-slate-50 p-4 rounded-xl text-center">
              <p className="text-sm text-slate-500 mb-1 font-bold uppercase tracking-tight">ჯამური თანხა</p>
              <p className="text-2xl font-black text-slate-900 font-mono">₾{confirmPaymentRecord.total_cost}</p>
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
                  fetchRecords();
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
