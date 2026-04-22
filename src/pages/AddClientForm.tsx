import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Loader2, 
  UserPlus, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle2,
  Car,
  Fingerprint,
  Info
} from 'lucide-react';

export default function AddClientForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [addVehicle, setAddVehicle] = useState(true);

  const [clientData, setClientData] = useState({
    type: 'individual',
    name: '',
    tax_id: '',
    phone: '',
    address: ''
  });

  const [vehicleData, setVehicleData] = useState({
    vin_code: '',
    plate_number: '',
    make: '',
    model: '',
    year: new Date().getFullYear().toString()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Insert Client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Insert Vehicle if requested
      if (addVehicle) {
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .insert([{
            ...vehicleData,
            client_id: client.id
          }]);

        if (vehicleError) throw vehicleError;
      }

      setSuccess(true);
      setTimeout(() => navigate(addVehicle ? '/fleet' : '/clients'), 1500);
    } catch (err: any) {
      setError(err.message || 'დამატება ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientData(prev => ({ ...prev, [name]: value }));
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6 -ml-2 text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        უკან
      </Button>

      <Card className="border-slate-200 shadow-2xl overflow-hidden rounded-2xl">
        <CardHeader className="bg-slate-900 border-b border-slate-800 py-10 px-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
              <UserPlus className="w-7 h-7" />
            </div>
            <div>
              <CardTitle className="text-3xl text-white font-black">ახალი რეგისტრაცია</CardTitle>
              <CardDescription className="text-slate-400 text-base mt-1">დაამატეთ კლიენტი და სურვილის შემთხვევაში მისი ავტომობილიც</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 sm:p-10 bg-white">
          <form onSubmit={handleSubmit} className="space-y-10">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                მონაცემები წარმატებით დაემატა! გადამისამართება...
              </div>
            )}

            {/* Client Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Fingerprint className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">კლიენტის მონაცემები</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="type" className="text-[13px] font-black text-slate-500 uppercase tracking-wide">კლიენტის ტიპი</Label>
                  <Select 
                    value={clientData.type} 
                    onValueChange={(val) => setClientData(p => ({...p, type: val}))}
                  >
                    <SelectTrigger className="h-14 border-slate-100 bg-slate-50/30 rounded-2xl shadow-sm focus:ring-indigo-500/10 text-slate-700 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      <SelectItem value="individual" className="py-3 font-bold text-slate-600">🙋‍♂️ ფიზიკური პირი (მძღოლი)</SelectItem>
                      <SelectItem value="company" className="py-3 font-bold text-slate-600">🏢 იურიდიული პირი (კომპანია)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[13px] font-black text-slate-500 uppercase tracking-wide">
                    {clientData.type === 'company' ? 'კომპანიის დასახელება' : 'მძღოლის სახელი და გვარი'}
                  </Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={clientData.name} 
                    onChange={handleClientChange}
                    placeholder={clientData.type === 'company' ? 'მაგ: შპს "მშენებელი"' : 'მაგ: დავით ერისთავი'}
                    className="h-14 border-slate-100 bg-slate-50/30 rounded-2xl focus:ring-indigo-500/10 text-slate-700 font-bold px-6"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="tax_id" className="text-[13px] font-black text-slate-500 uppercase tracking-wide">
                    {clientData.type === 'company' ? 'საიდენტიფიკაციო კოდი (ს/კ)' : 'პირადი ნომერი (პ/ნ)'}
                  </Label>
                  <Input 
                    id="tax_id" 
                    name="tax_id" 
                    value={clientData.tax_id} 
                    onChange={handleClientChange}
                    placeholder="9 ან 11 ნიშნა კოდი"
                    className="h-14 border-slate-100 bg-slate-50/30 rounded-2xl font-mono focus:ring-indigo-500/10 text-slate-700 font-bold px-6"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-[13px] font-black text-slate-500 uppercase tracking-wide">საკონტაქტო ნომერი</Label>
                  <div className="relative">
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={clientData.phone} 
                      onChange={handleClientChange}
                      placeholder="599 ... ... ..."
                      className="h-14 pl-12 border-slate-100 bg-slate-50/30 rounded-2xl focus:ring-indigo-500/10 text-slate-700 font-bold"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-5" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="address" className="text-[13px] font-black text-slate-500 uppercase tracking-wide">იურიდიული / საცხოვრებელი მისამართი</Label>
                <div className="relative">
                  <Textarea 
                    id="address" 
                    name="address" 
                    value={clientData.address} 
                    onChange={handleClientChange}
                    placeholder="ქალაქი, ქუჩა, კორპუსი, ბინა"
                    className="min-h-[120px] pl-12 pt-5 border-slate-100 bg-slate-50/30 rounded-2xl focus:ring-indigo-500/10 text-slate-700 font-bold resize-none"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-6" />
                </div>
              </div>
            </section>

            {/* Add Vehicle Toggle */}
            <div className="flex items-center justify-between p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">ავტომობილის დამატება</h4>
                  <p className="text-xs text-slate-500 mt-0.5">გსურთ მონაცემების ახლავე შევსება?</p>
                </div>
              </div>
              <Switch 
                checked={addVehicle} 
                onCheckedChange={setAddVehicle}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>

            {/* Vehicle Section */}
            {addVehicle && (
              <section className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Car className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">ავტომობილის მონაცემები</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="make" className="text-sm font-bold text-slate-700">მარკა (მაგ: TOYOTA)</Label>
                    <Input 
                      id="make" 
                      name="make" 
                      value={vehicleData.make} 
                      onChange={handleVehicleChange}
                      placeholder="ბრენდის სახელი"
                      className="h-12 border-slate-200 rounded-xl uppercase focus:ring-indigo-500/20"
                      required={addVehicle}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="model" className="text-sm font-bold text-slate-700">მოდელი (მაგ: PRIUS)</Label>
                    <Input 
                      id="model" 
                      name="model" 
                      value={vehicleData.model} 
                      onChange={handleVehicleChange}
                      placeholder="მოდელის დასახელება"
                      className="h-12 border-slate-200 rounded-xl uppercase focus:ring-indigo-500/20"
                      required={addVehicle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="plate_number" className="text-sm font-bold text-slate-700">სახელმწიფო ნომერი</Label>
                    <Input 
                      id="plate_number" 
                      name="plate_number" 
                      value={vehicleData.plate_number} 
                      onChange={handleVehicleChange}
                      placeholder="XX-000-XX"
                      className="h-12 border-slate-200 rounded-xl font-bold text-lg uppercase tracking-widest focus:ring-indigo-500/20"
                      required={addVehicle}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="year" className="text-sm font-bold text-slate-700">გამოშვების წელი</Label>
                    <Input 
                      id="year" 
                      name="year" 
                      type="number"
                      value={vehicleData.year} 
                      onChange={handleVehicleChange}
                      className="h-12 border-slate-200 rounded-xl focus:ring-indigo-500/20"
                      required={addVehicle}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="vin_code" className="text-sm font-bold text-slate-700">VIN კოდი (შასი)</Label>
                  <Input 
                    id="vin_code" 
                    name="vin_code" 
                    value={vehicleData.vin_code} 
                    onChange={handleVehicleChange}
                    placeholder="17-ნიშნა კოდი"
                    className="h-12 border-slate-200 rounded-xl font-mono uppercase focus:ring-indigo-500/20"
                    required={addVehicle}
                  />
                </div>
              </section>
            )}

            <div className="pt-6">
              <Button 
                type="submit" 
                className="w-full h-16 text-xl font-black bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] group overflow-hidden relative"
                disabled={loading || success}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>მონაცემები იგზავნება...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span>რეგისტრაციის დასრულება</span>
                  </div>
                )}
              </Button>
              <p className="text-center text-[11px] text-slate-400 mt-4 flex items-center justify-center gap-2 italic">
                <Info className="w-3 h-3" />
                მონაცემები შეინახება AutoTracker Pro-ს შიდა ბაზაში
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

