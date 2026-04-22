import React, { useState, useEffect, useRef } from 'react';
import { Search, Car, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ type: 'vehicle' | 'client'; id: string; title: string; subtitle: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const [vRes, cRes] = await Promise.all([
          supabase.from('vehicles')
            .select('id, plate_number, make, model')
            .or(`plate_number.ilike.%${query}%,make.ilike.%${query}%,model.ilike.%${query}%`)
            .limit(3),
          supabase.from('clients')
            .select('id, name, phone')
            .ilike('name', `%${query}%`)
            .limit(3)
        ]);

        const formattedResults: any[] = [];

        vRes.data?.forEach(v => {
          formattedResults.push({
            type: 'vehicle',
            id: v.id,
            title: `${v.make} ${v.model}`,
            subtitle: v.plate_number
          });
        });

        cRes.data?.forEach(c => {
          formattedResults.push({
            type: 'client',
            id: c.id,
            title: c.name,
            subtitle: c.phone || 'კლიენტი'
          });
        });

        setResults(formattedResults);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input 
          type="text" 
          placeholder="სწრაფი ძიება (ნომერი, სახელი, მოდელი)..." 
          className="w-96 pl-12 pr-6 py-3 bg-slate-100/50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all font-medium"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {loading ? (
          <Loader2 className="w-4 h-4 text-indigo-500 absolute left-4 top-3.5 animate-spin" />
        ) : (
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => {
                      navigate(result.type === 'vehicle' ? `/fleet/${result.id}` : `/clients`);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                        {result.type === 'vehicle' ? <Car className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" /> : <User className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{result.title}</p>
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{result.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            ) : !loading ? (
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-slate-400">რეზულტატი ვერ მოიძებნა</p>
              </div>
            ) : null}
          </div>
          <div className="bg-slate-50 p-2 border-t border-slate-100">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">გამოიყენეთ Enter გასაშვებად</p>
          </div>
        </div>
      )}
    </div>
  );
}
