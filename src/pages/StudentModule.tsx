import { useState, useRef } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Upload, FileDown, TrendingUp, Sparkles } from 'lucide-react';
import Papa from 'papaparse';
import { exportStudentReport } from '@/lib/pdfExport';

import { BASE_URL, getUserId } from '../config/api';

interface Student { name: string; subject: string; marks: number; maxMarks: number; attendance: number; studyHours: number; }
interface Result extends Student { prediction: number; ai_analysis: string; ai_suggestions: string[]; confidence: number; }

export default function StudentModule() {
  const [form, setForm] = useState<Student>({ name: '', subject: '', marks: 0, maxMarks: 100, attendance: 0, studyHours: 0 });
  const [results, setResults] = useState<Result[]>([]);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const addStudent = async () => {
    if (!form.name) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/predict`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': getUserId()
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Server not responding");
      }
      const newStudent = await res.json();
      console.log("Prediction API Response (addStudent):", newStudent);
      
      setForm({ name: '', subject: '', marks: 0, maxMarks: 100, attendance: 0, studyHours: 0 });
      setResults(prev => [...prev, newStudent]);
      setSelectedResult(newStudent);
    } catch (err) {
      console.error("Failed to predict student", err);
      setError("Server not responding");
    } finally {
      setLoading(false);
    }
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: async (r) => {
        const parsed = r.data.filter((d: any) => d.marks).map((d: any) => ({
          name: d.name || 'Student', subject: d.subject || 'General',
          marks: +d.marks, maxMarks: +d.maxMarks || 100, attendance: +d.attendance, studyHours: +d.studyHours || +d.study_hours,
        }));
        
        for (const student of parsed) {
          try {
            const res = await fetch(`${BASE_URL}/predict`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'X-User-ID': getUserId()
              },
              body: JSON.stringify(student)
            });
            if (res.ok) {
                const newStudent = await res.json();
                console.log("Prediction API Response (CSV):", newStudent);
                setResults(prev => [...prev, newStudent]);
            }
          } catch (e) {
             console.error("Error pushing csv row", e);
          }
        }
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Performance Prediction</h1>
          <p className="text-sm text-muted-foreground">Analyze and predict academic performance locally without permanence</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground flex justify-between items-center">
          <span>Run Prediction Analysis</span>
          <span className="text-xs text-muted-foreground font-normal bg-muted px-2 py-1 rounded-md">Results vanish on refresh</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
          <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
          <input type="number" placeholder="Marks" value={form.marks || ''} onChange={e => setForm({...form, marks: +e.target.value})} className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
          <input type="number" placeholder="Max Marks" value={form.maxMarks || ''} onChange={e => setForm({...form, maxMarks: +e.target.value})} className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
          <input type="number" placeholder="Attendance %" value={form.attendance || ''} onChange={e => setForm({...form, attendance: +e.target.value})} className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
          <input type="number" placeholder="Study Hrs" value={form.studyHours || ''} onChange={e => setForm({...form, studyHours: +e.target.value})} className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={addStudent} disabled={loading} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
            {loading ? 'Executing AI Engine...' : 'Predict Performance'}
          </button>
          <button onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition flex items-center gap-2">
            <Upload className="w-4 h-4" /> Batch Upload CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
          {results.length > 0 && (
             <button onClick={() => setResults([])} className="px-4 py-2 ml-auto rounded-lg border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition">
               Clear All Session Results
             </button>
          )}
        </div>
        {error && <div className="text-sm font-medium text-rose-500 mt-2">{error}</div>}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          {/* Result Cards */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-semibold text-foreground mb-4 opacity-75">Recent Predictions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {results.map((r, i) => (
                <button key={i} onClick={() => setSelectedResult(r)}
                  className={`text-left p-4 rounded-xl border transition-all ${selectedResult === r ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border hover:border-primary/40'}`}>
                  <div className="font-medium text-foreground truncate">{r.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{r.subject}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-lg font-bold gradient-text">{r?.prediction?.toFixed(1) ?? '0.0'} <span className="text-sm font-normal text-muted-foreground">Pts</span></span>
                       <span className="text-xs text-muted-foreground">{r?.marks && r?.maxMarks ? ((r.marks / r.maxMarks) * 100).toFixed(1) : '0.0'}% | {r?.confidence ?? 0}% Confidence</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      (r?.prediction ?? 0) >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                      (r?.prediction ?? 0) >= 60 ? 'bg-blue-500/20 text-blue-400' :
                      (r?.prediction ?? 0) >= 40 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>{(r?.prediction ?? 0) >= 80 ? 'Excellent' : (r?.prediction ?? 0) >= 60 ? 'Good' : (r?.prediction ?? 0) >= 40 ? 'Average' : 'Poor'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Result Detailed View */}
          {selectedResult && (
            <div className="grid lg:grid-cols-2 gap-6 items-start">
              <div className="glass-card rounded-xl p-6 border-l-4 border-l-primary flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-foreground text-lg">{selectedResult.name}'s Output</h2>
                    <p className="text-sm text-muted-foreground">AI Breakdown ({selectedResult.confidence}% Confidence Analysis)</p>
                  </div>
                  <button onClick={() => exportStudentReport({ ...selectedResult, predictedScore: selectedResult?.prediction ?? 0, suggestions: selectedResult?.ai_suggestions ?? [] })}
                    className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition flex items-center gap-2">
                    <FileDown className="w-4 h-4" /> Download PDF
                  </button>
                </div>
                
                <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm leading-relaxed text-foreground">
                  <strong className="text-primary block mb-1">AI Analysis:</strong>
                  {selectedResult?.ai_analysis || "No analysis available"}
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> AI Suggestions:</h3>
                <ul className="space-y-3 mb-2 flex-grow">
                  {selectedResult?.ai_suggestions?.length ? selectedResult.ai_suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 bg-muted/40 p-3 rounded-lg border border-border/50 text-sm">
                      <span className="text-primary font-bold mt-0.5 opacity-80">{i + 1}.</span> 
                      <span className="text-foreground leading-relaxed">{s}</span>
                    </li>
                  )) : (
                    <li className="text-sm text-muted-foreground italic">No suggestions available</li>
                  )}
                </ul>
              </div>

              {results.length > 1 && (
                  <div className="glass-card rounded-xl p-6 h-full">
                    <h2 className="font-semibold text-foreground mb-4">Class Distribution</h2>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={results}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                        <Bar dataKey="prediction" fill="hsl(250, 80%, 60%)" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
