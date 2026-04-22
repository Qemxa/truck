import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Loader2, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'ელ-ფოსტა ან პაროლი არასწორია' : error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AutoTracker <span className="text-indigo-400">Pro</span></h1>
          <p className="text-slate-400">ავტოპარკის მართვის სისტემა</p>
        </div>

        <Card className="border-slate-800 bg-slate-800/50 backdrop-blur-xl text-white shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">ავტორიზაცია</CardTitle>
            <CardDescription className="text-slate-400 text-center">
              შეიყვანეთ თქვენი მონაცემები სისტემაში შესასვლელად
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">ელ-ფოსტა</Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-900/50 border-slate-700 h-12 pl-10 focus:ring-indigo-500 text-white placeholder:text-slate-500"
                  />
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" title="პაროლი">პაროლი</Label>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-900/50 border-slate-700 h-12 pl-10 focus:ring-indigo-500 text-white"
                  />
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-600/20"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'შესვლა'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500">
          შიდა მოხმარების სისტემა. წვდომისთვის მიმართეთ ადმინისტრატორს.
        </p>
      </div>
    </div>
  );
}
