import { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Upload, FileDown, Sparkles, TrendingUp } from 'lucide-react';
import Papa from 'papaparse';
import { exportStudentReport } from '@/lib/pdfExport';

const API_BASE = "http://127.0.0.1:8000";

interface Student { name: string; subject: string; marks: number; attendance: number; studyHours: number; }
interface Result extends Student { lrScore: number; rfScore: number; avgScore: number; category: string; suggestions: string[]; ai_suggestion?: string; }

export default function StudentModule() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<Student>({ name: '', subject: '', marks: 0, attendance: 0, studyHours: 0 });
  const [results, setResults] = useState<Result[]>([]);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      const data = await res.json();
      setStudents(data);
      if (data.length > 0) {
        setResults(data.filter((d: any) => d.avgScore !== undefined));
      }
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const addStudent = async () => {
    if (!form.name) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/add-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const newStudent = await res.json();
      setStudents(prev => [...prev, newStudent]);
      setForm({ name: '', subject: '', marks: 0, attendance: 0, studyHours: 0 });
      fetchStudents(); // Refresh results
    } catch (err) {
      console.error("Failed to add student", err);
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
          marks: +d.marks, attendance: +d.attendance, studyHours: +d.studyHours || +d.study_hours,
        }));
        
        // Send each to backend (sequentially for simplicity in this turn)
        for (const student of parsed) {
          await fetch(`${API_BASE}/add-student`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
          });
        }
        fetchStudents();
      },
    });
  };

  const chartData = results.map(r => ({ name: r.name, 'Linear Reg': +r.lrScore.toFixed(1), 'Random Forest': +r.rfScore.toFixed(1), 'Average': +r.avgScore.toFixed(1) }));

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Performance Prediction</h1>
          <p className="text-sm text-muted-foreground">Analyze and predict academic performance using Real Backend ML</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Add Student Data</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
          <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
          <input type="number" placeholder="Marks" value={form.marks || ''} onChange={e => setForm({...form, marks: +e.target.value})} className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
          <input type="number" placeholder="Attendance %" value={form.attendance || ''} onChange={e => setForm({...form, attendance: +e.target.value})} className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
          <input type="number" placeholder="Study Hrs" value={form.studyHours || ''} onChange={e => setForm({...form, studyHours: +e.target.value})} className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={addStudent} disabled={loading} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Student & Predict'}
          </button>
          <button onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card rounded-xl p-6 overflow-x-auto">
        <h2 className="font-semibold text-foreground mb-3">Student Data ({students.length})</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 px-2">Name</th><th className="text-left py-2 px-2">Subject</th>
              <th className="text-right py-2 px-2">Marks</th><th className="text-right py-2 px-2">Attendance</th>
              <th className="text-right py-2 px-2">Study Hrs</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition">
                <td className="py-2 px-2 text-foreground">{s.name}</td><td className="py-2 px-2 text-foreground">{s.subject}</td>
                <td className="py-2 px-2 text-right text-foreground">{s.marks}</td><td className="py-2 px-2 text-right text-foreground">{s.attendance}%</td>
                <td className="py-2 px-2 text-right text-foreground">{s.studyHours}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-foreground mb-4">Prediction Comparison (Bar)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                  <Legend />
                  <Bar dataKey="Linear Reg" fill="hsl(250, 80%, 60%)" radius={[4,4,0,0]} />
                  <Bar dataKey="Random Forest" fill="hsl(280, 70%, 60%)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-foreground mb-4">Performance Trend (Line)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Linear Reg" stroke="hsl(250, 80%, 60%)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Random Forest" stroke="hsl(280, 70%, 60%)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Average" stroke="hsl(160, 70%, 50%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Result Cards */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Results</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map((r, i) => (
                <button key={i} onClick={() => setSelectedResult(r)}
                  className={`text-left p-4 rounded-xl border transition-all ${selectedResult === r ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}>
                  <div className="font-medium text-foreground">{r.name}</div>
                  <div className="text-sm text-muted-foreground">{r.subject}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold gradient-text">{r.avgScore.toFixed(1)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      r.category === 'Excellent' ? 'bg-emerald-500/20 text-emerald-400' :
                      r.category === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                      r.category === 'Average' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>{r.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          {selectedResult && (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> AI Suggestions for {selectedResult.name}
                </h2>
                <button onClick={() => exportStudentReport({ ...selectedResult, predictedScore: selectedResult.avgScore, suggestions: selectedResult.suggestions })}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition flex items-center gap-2">
                  <FileDown className="w-4 h-4" /> Download PDF
                </button>
              </div>
              <ul className="space-y-2 mb-6">
                {selectedResult.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>

              {selectedResult.ai_suggestion && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-20">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" /> Intelligent AI Insight
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed relative z-10">
                    {selectedResult.ai_suggestion}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
