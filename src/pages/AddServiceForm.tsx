import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Wrench, DollarSign, Calendar, Navigation, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useAuth } from '../hooks/useAuth';

export default function AddServiceForm() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { vehicleId: urlVehicleId, recordId } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    vehicle_id: urlVehicleId || '',
    date: new Date().toISOString().split('T')[0],
    mileage: '',
    category: 'Maintenance',
    description: '',
    parts_cost: '0',
    labor_cost: '0',
    payment_status: 'pending',
    payment_method: 'cash'
  });

  useEffect(() => {
    async function fetchVehicles() {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, plate_number');
      if (data) setVehicles(data);
    }
    fetchVehicles();

    if (recordId) {
      fetchExistingRecord();
    }
  }, [recordId]);

  async function fetchExistingRecord() {
    const { data, error } = await supabase
      .from('service_records')
      .select('*')
      .eq('id', recordId)
      .single();
    
    if (data) {
      setFormData({
        vehicle_id: data.vehicle_id,
        date: data.date,
        mileage: data.mileage.toString(),
        category: data.category,
        description: data.description || '',
        parts_cost: data.parts_cost.toString(),
        labor_cost: data.labor_cost.toString(),
        payment_status: data.payment_status,
        payment_method: data.payment_method
      });
    }
  }

  const categories = [
    'ტექ. დათვალიერება',
    'შეკეთება',
    'ინსპექტირება',
    'ზეთის შეცვლა',
    'საბურავები',
    'მუხრუჭები',
    'ძრავი',
    'სხვა'
  ];

  const totalCost = (parseFloat(formData.parts_cost || '0') + parseFloat(formData.labor_cost || '0')).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || '00000000-0000-0000-0000-000000000000';

      const payload: any = {
        vehicle_id: formData.vehicle_id,
        mechanic_id: userId, // Current editor
        date: formData.date,
        mileage: parseInt(formData.mileage),
        category: formData.category,
        description: formData.description,
        parts_cost: parseFloat(formData.parts_cost),
        labor_cost: parseFloat(formData.labor_cost),
        total_cost: parseFloat(totalCost),
        payment_status: formData.payment_status,
        payment_method: formData.payment_method,
        status: isAdmin ? 'approved' : 'pending'
      };

      if (recordId && !isAdmin) {
        // Fetch current snapshot only if editing an existing record as mechanic
        try {
          const { data: current } = await supabase
            .from('service_records')
            .select('date, mileage, category, description, parts_cost, labor_cost, total_cost, payment_method, status, previous_data')
            .eq('id', recordId)
            .single();
          
          if (current) {
            // If the record was already approved, this edit becomes the first "diff"
            if (current.status === 'approved') {
              const { previous_data, status, ...historyData } = current;
              payload.previous_data = historyData;
            } else {
              // If it's already pending, we keep the original history instead of overwriting it with intermediate edits
              payload.previous_data = current.previous_data;
            }
          }
        } catch (e) {
          console.error("Failed to capture history:", e);
        }
      }

      if (formData.payment_status === 'paid') {
        payload.payment_date = new Date().toISOString();
      }

      let res;
      if (recordId) {
        res = await supabase
          .from('service_records')
          .update(payload)
          .eq('id', recordId);
      } else {
        res = await supabase
          .from('service_records')
          .insert([payload]);
      }

      if (res.error) throw res.error;

      setSuccess(true);
      setTimeout(() => {
        navigate(`/fleet/${formData.vehicle_id}`);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'ჩანაწერის შენახვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6 -ml-2 text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        უკან
      </Button>

      <Card className="border-slate-200 shadow-xl overflow-hidden">
        <CardHeader className="bg-slate-900 border-b border-slate-800 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">ახალი სერვისის ჩანაწერი</CardTitle>
              <CardDescription className="text-slate-400">შეიყვანეთ ავტომობილის მომსახურების დეტალები</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-3">
                <Navigation className="w-5 h-5" />
                ჩანაწერი წარმატებით შეინახა! გადამისამართება...
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {/* Vehicle Selection */}
              {!urlVehicleId && (
                <div className="space-y-2">
                  <Label htmlFor="vehicle_id" className="text-sm font-semibold text-slate-700">ავტომობილი</Label>
                  <Select 
                    value={formData.vehicle_id} 
                    onValueChange={(val) => setFormData(p => ({...p, vehicle_id: val}))}
                  >
                    <SelectTrigger className="h-12 text-base border-slate-200 bg-slate-50/50">
                      <SelectValue placeholder="აირჩიეთ ავტომობილი" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.make} {v.model} - {v.plate_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold text-slate-700">თარიღი</Label>
                  <div className="relative">
                    <Input 
                      id="date" 
                      name="date" 
                      type="date" 
                      value={formData.date} 
                      onChange={handleChange}
                      className="h-12 pl-10 text-base"
                      required
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage" className="text-sm font-semibold text-slate-700">გარბენი (კმ)</Label>
                  <Input 
                    id="mileage" 
                    name="mileage" 
                    type="number" 
                    value={formData.mileage} 
                    onChange={handleChange}
                    placeholder="მაგ: 45000"
                    className="h-12 text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-slate-700">კატეგორია</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData(p => ({...p, category: val}))}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-700">შესრულებული სამუშაო</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange}
                  placeholder="აღწერეთ დეტალურად შესრულებული სამუშაო..."
                  className="min-h-[120px] text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-2">
                  <Label htmlFor="parts_cost" className="text-sm font-semibold text-slate-700">ნაწილების ფასი (₾)</Label>
                  <div className="relative">
                    <Input 
                      id="parts_cost" 
                      name="parts_cost" 
                      type="number" 
                      step="0.01" 
                      value={formData.parts_cost} 
                      onChange={handleChange}
                      className="h-12 pl-10 font-mono text-base"
                    />
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labor_cost" className="text-sm font-semibold text-slate-700">ხელობის ფასი (₾)</Label>
                  <div className="relative">
                    <Input 
                      id="labor_cost" 
                      name="labor_cost" 
                      type="number" 
                      step="0.01" 
                      value={formData.labor_cost} 
                      onChange={handleChange}
                      className="h-12 pl-10 font-mono text-base"
                    />
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
                  </div>
                </div>

                <div className="sm:col-span-2 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="w-full sm:flex-1">
                    <Label className="text-xs font-bold text-slate-400 uppercase mb-2 block">გადახდის სტატუსი</Label>
                    <Select 
                      value={formData.payment_status} 
                      onValueChange={(val) => setFormData(p => ({...p, payment_status: val}))}
                      disabled={!isAdmin || formData.payment_method === 'consignment'}
                    >
                      <SelectTrigger className={cn(
                        "h-12 font-bold rounded-xl",
                        formData.payment_status === 'paid' ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-amber-600 bg-amber-50 border-amber-100",
                        (!isAdmin || formData.payment_method === 'consignment') && "opacity-100 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-500"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">⏳ გადასახდელი</SelectItem>
                        <SelectItem value="paid">✅ გადახდილი</SelectItem>
                      </SelectContent>
                    </Select>
                    {!isAdmin ? (
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">* სტატუსის შეცვლა შეუძლია მხოლოდ ადმინს</p>
                    ) : formData.payment_method === 'consignment' && (
                      <p className="text-[10px] text-rose-500 mt-1.5 font-bold uppercase tracking-tight">⚠️ კონსიგნაცია ავტომატურად გადასახდელია</p>
                    )}
                  </div>
                  <div className="w-full sm:flex-1">
                    <Label className="text-xs font-bold text-slate-400 uppercase mb-2 block">გადახდის მეთოდი</Label>
                    <Select 
                      value={formData.payment_method} 
                      onValueChange={(val) => {
                        setFormData(p => ({
                          ...p, 
                          payment_method: val,
                          // If consignment is selected, force status to pending
                          payment_status: val === 'consignment' ? 'pending' : p.payment_status
                        }));
                      }}
                    >
                      <SelectTrigger className="h-12 font-bold rounded-xl bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">💵 ნაღდი</SelectItem>
                        <SelectItem value="card">💳 ბარათით</SelectItem>
                        <SelectItem value="transfer">🏦 გადარიცხვა</SelectItem>
                        <SelectItem value="consignment">🤝 კონსიგნაცია</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold text-slate-900 block mb-1">სულ ჯამში</span>
                    <span className="text-3xl font-black text-indigo-600 font-mono">₾{totalCost}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ინახება...
                </>
              ) : (
                'ჩანაწერის დამატება'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
