import { useState, useRef } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Upload, FileDown, Sparkles, Wallet } from 'lucide-react';
import Papa from 'papaparse';
import { exportFinanceReport } from '@/lib/pdfExport';

const API_BASE = "http://127.0.0.1:8000";

const COLORS = ['#8b5cf6','#10b981','#f59e0b','#ef4444','#3b82f6','#ec4899','#06b6d4','#84cc16','#a855f7'];
const defaultCategories = ['Housing','Food','Transportation','Utilities','Entertainment','Healthcare','Education','Savings','Other'];

export default function FinanceModule() {
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<Record<string, number>>({});
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const performAnalysis = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/finance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income, expenses })
      });
      const data = await res.json();
      console.log("Finance API Response:", data);
      setAnalysis(data);
    } catch (err) {
      console.error("Failed to analyze finances", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: (r) => {
        const row = r.data[0] as any;
        if (row?.income) setIncome(+row.income);
        const newExp: Record<string, number> = {};
        defaultCategories.forEach(c => { if (row?.[c.toLowerCase()]) newExp[c] = +row[c.toLowerCase()]; });
        if (Object.keys(newExp).length) setExpenses(prev => ({ ...prev, ...newExp }));
      },
    });
  };

  const pieData = Object.entries(expenses).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  const trendData = analysis ? Array.from({ length: 6 }, (_, i) => {
    const month = new Date(2024, i).toLocaleString('default', { month: 'short' });
    const variation = 0.9 + Math.random() * 0.2;
    return { 
        month, 
        Income: Math.round(income * variation), 
        Expenses: Math.round(analysis.total_expense * variation), 
        Savings: Math.round(analysis.savings * variation) 
    };
  }) : [];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance Analysis System</h1>
          <p className="text-sm text-muted-foreground">Track, predict, and optimize your finances</p>
        </div>
      </div>

      {/* Input */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Financial Data</h2>
        <div>
          <label className="text-sm text-muted-foreground">Monthly Income ($)</label>
          <input type="number" value={income || ''} onChange={e => setIncome(+e.target.value)}
            className="w-full px-3 py-2 mt-1 rounded-lg bg-muted text-foreground text-sm border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">Expenses by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {defaultCategories.map(cat => (
            <div key={cat}>
              <label className="text-xs text-muted-foreground">{cat}</label>
              <input type="number" value={expenses[cat] || ''}
                onChange={e => setExpenses(prev => ({ ...prev, [cat]: +e.target.value }))}
                className="w-full px-3 py-2 mt-1 rounded-lg bg-muted text-foreground text-sm border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
          <button onClick={performAnalysis} disabled={loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-primary-foreground text-sm font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50">
            <Sparkles className="w-4 h-4" /> {loading ? 'Analyzing...' : 'Analyze Finances'}
          </button>
        </div>
      </div>

      {/* Summary */}
      {analysis && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Income', value: `$${analysis.income.toLocaleString()}`, color: 'text-emerald-400' },
              { label: 'Expenses', value: `$${analysis.total_expense.toLocaleString()}`, color: 'text-rose-400' },
              { label: 'Savings', value: `$${analysis.savings.toLocaleString()}`, color: analysis.savings >= 0 ? 'text-blue-400' : 'text-rose-400' },
              { label: 'Savings Rate', value: `${analysis.savings_rate.toFixed(1)}%`, color: analysis.savings_rate >= 20 ? 'text-emerald-400' : 'text-amber-400' },
            ].map(m => (
              <div key={m.label} className="glass-card rounded-xl p-4 text-center">
                <div className="text-sm text-muted-foreground">{m.label}</div>
                <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-foreground mb-4">Expense Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-foreground mb-4">6-Month Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="Savings" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Suggestions */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" /> AI Suggestions
              </h2>
              <button onClick={() => exportFinanceReport({ income: analysis.income, expenses, totalExpenses: analysis.total_expense, savings: analysis.savings, savingsRate: analysis.savings_rate, suggestions: analysis.suggestions })}
                className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition flex items-center gap-2">
                <FileDown className="w-4 h-4" /> Download PDF
              </button>
            </div>
            <ul className="space-y-2 mb-6">
              {analysis.suggestions.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-emerald-400 mt-0.5">•</span> {s}
                </li>
              ))}
            </ul>

            {analysis.ai_suggestion && (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" /> Personalized Advice
                </h3>
                <p className="text-sm text-foreground leading-relaxed relative z-10">
                  {analysis?.ai_suggestion}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
