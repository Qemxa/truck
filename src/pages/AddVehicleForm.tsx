import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Car, Hash, Calendar, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AddVehicleForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    client_id: '',
    vin_code: '',
    plate_number: '',
    make: '',
    model: '',
    year: new Date().getFullYear().toString()
  });

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase.from('clients').select('id, name').order('name');
      if (data) setClients(data);
    }
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('vehicles')
        .insert([formData]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => navigate('/fleet'), 1500);
    } catch (err: any) {
      setError(err.message || 'ავტომობილის დამატება ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              <Car className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">ახალი ავტომობილი</CardTitle>
              <CardDescription className="text-slate-400">დაამატეთ ახალი სატრანსპორტო საშუალება ბაზაში</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                ავტომობილი წარმატებით დაემატა! გადამისამართება...
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="client_id" className="text-sm font-semibold text-slate-700">მფლობელი (კლიენტი)</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={(val) => setFormData(p => ({...p, client_id: val}))}
                required
              >
                <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50">
                  <SelectValue placeholder="აირჩიეთ კლიენტი" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="make" className="text-sm font-semibold text-slate-700">მარკა</Label>
                <Input 
                  id="make" 
                  name="make" 
                  value={formData.make} 
                  onChange={handleChange}
                  placeholder="მაგ: Ford"
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm font-semibold text-slate-700">მოდელი</Label>
                <Input 
                  id="model" 
                  name="model" 
                  value={formData.model} 
                  onChange={handleChange}
                  placeholder="მაგ: Transit"
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="plate_number" className="text-sm font-semibold text-slate-700">სახელმწიფო ნომერი</Label>
                <div className="relative">
                  <Input 
                    id="plate_number" 
                    name="plate_number" 
                    value={formData.plate_number} 
                    onChange={handleChange}
                    placeholder="TX-992-KK"
                    className="h-12 pl-10 font-bold uppercase"
                    required
                  />
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-semibold text-slate-700">გამოშვების წელი</Label>
                <div className="relative">
                  <Input 
                    id="year" 
                    name="year" 
                    type="number"
                    value={formData.year} 
                    onChange={handleChange}
                    className="h-12 pl-10"
                    required
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vin_code" className="text-sm font-semibold text-slate-700">VIN კოდი</Label>
              <Input 
                id="vin_code" 
                name="vin_code" 
                value={formData.vin_code} 
                onChange={handleChange}
                placeholder="17-ნიშნა სიმბოლო"
                className="h-12 font-mono uppercase"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ემატება...
                </>
              ) : (
                'ავტომობილის დამატება'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
