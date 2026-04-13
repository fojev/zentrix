import { useState, useRef } from 'react';
import { Upload, FileDown, Sparkles, HeartPulse, AlertTriangle } from 'lucide-react';
import Papa from 'papaparse';
import { exportDiseaseReport } from '@/lib/pdfExport';

export const symptomsList = [
  'Fever', 'Cough', 'Headache', 'Fatigue', 'Sore Throat',
  'Runny Nose', 'Body Ache', 'Nausea', 'Dizziness', 'Chest Pain',
  'Shortness of Breath', 'Sneezing', 'Chills', 'Vomiting', 'Diarrhea',
  'Loss of Appetite', 'Joint Pain', 'Rash', 'Blurred Vision', 'Frequent Urination',
];

import { BASE_URL, getUserId } from '../config/api';

export default function DiseaseModule() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [result, setResult] = useState<{ disease: string; dos: string[]; donts: string[]; } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setResult(null);
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: (r) => {
        const row = r.data[0] as any;
        if (row?.symptoms) {
          const syms = (row.symptoms as string).split(',').map((s: string) => s.trim());
          setSelectedSymptoms(syms.filter(s => symptomsList.includes(s)));
        }
      },
    });
  };

  const predict = async () => {
    if (selectedSymptoms.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/disease`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': getUserId()
        },
        body: JSON.stringify({ symptoms: selectedSymptoms })
      });
      if (!res.ok) throw new Error("Server not responding");
      const data = await res.json();
      console.log("Disease API Response:", data);
      setResult(data);
    } catch (err) {
      console.error("Failed to predict disease", err);
      setError("Server not responding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
          <HeartPulse className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Disease Prediction System</h1>
          <p className="text-sm text-muted-foreground">Symptom analysis and health recommendations</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
        <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-200/80">
          <strong>Disclaimer:</strong> This tool is for educational and informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
        </p>
      </div>

      {/* Symptom Selection */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Select Your Symptoms</h2>
        <div className="flex flex-wrap gap-2">
          {symptomsList.map(s => (
            <button key={s} onClick={() => toggleSymptom(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedSymptoms.includes(s)
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-muted text-muted-foreground border border-border hover:border-rose-500/30'
              }`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
          <button onClick={predict} disabled={selectedSymptoms.length === 0 || loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 text-primary-foreground text-sm font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50">
            <Sparkles className="w-4 h-4" /> {loading ? 'Analyzing...' : `Predict Disease (${selectedSymptoms.length} symptoms)`}
          </button>
        </div>
        {loading && <div className="text-sm font-medium text-orange-400 mt-2">Analyzing symptoms...</div>}
        {error && <div className="text-sm font-medium text-rose-500 mt-2">{error}</div>}
        {selectedSymptoms.length > 0 && (
          <div className="text-sm text-muted-foreground mt-2">
            Selected: {selectedSymptoms.join(', ')}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Predicted Condition</div>
            <div className="text-3xl font-bold text-rose-400 mb-1">{result.disease}</div>
            <div className="text-sm text-muted-foreground mb-4">Based on your symptoms</div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">✓ What to Do</h3>
              <ul className="space-y-2">
                {result.dos.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-emerald-400 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold text-rose-400 mb-3 flex items-center gap-2">✗ What to Avoid</h3>
              <ul className="space-y-2">
                {result.donts.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-rose-400 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-center">
            <button onClick={() => exportDiseaseReport({ symptoms: selectedSymptoms, predictedDisease: result.disease, dos: result.dos, donts: result.donts })}
              className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition flex items-center gap-2">
              <FileDown className="w-4 h-4" /> Download PDF Report
            </button>
          </div>
        </>
      )}
    </div>
  );
}
