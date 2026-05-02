import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Calculator, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Loans() {
  const { addXp } = useStore();
  const [form, setForm] = useState({
    age: 28, experience: 5, income: 60, family_size: 3, ccavg: 2,
    education: 1, mortgage: 0, securities_account: 0, cd_account: 0,
    online: 1, credit_card: 1,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const educationLabels = ['Undergrad', 'Graduate', 'Advanced/Professional'];

  const checkEligibility = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/loans/eligibility?' + new URLSearchParams({
        monthly_salary: String(form.income * 1000 / 12),
        age: String(form.age), monthly_expenses: String(form.ccavg * 1000),
        credit_score: String(700), existing_emis: String(form.mortgage * 100),
        employment_type: 'salaried',
      }), { method: 'POST' });
      setResult(await res.json());
    } catch {
      // Offline fallback
      const score = Math.min(100, Math.round(
        (form.income / 200) * 30 + (form.age >= 25 && form.age <= 45 ? 20 : 10) +
        (form.experience / 30) * 15 + (form.education * 8) +
        (form.securities_account ? 10 : 0) + (form.cd_account ? 10 : 0) + (form.credit_card ? 5 : 0)
      ));
      setResult({
        probability: score, eligible: score > 50,
        eligibility: score > 70 ? 'High' : score > 50 ? 'Moderate' : 'Low',
        confidence: score > 70 ? 'high' : 'moderate',
        message: score > 70 ? 'Strong candidate for loan approval.' : score > 50 ? 'Moderate chances.' : 'May need improvement.',
        model: 'offline_estimate',
        tips: ['This is an educational estimate, not a guarantee.', 'Compare offers from multiple lenders.'],
      });
    }
    addXp(15);
    setLoading(false);
  };

  const getIcon = (elig: string) => {
    if (elig === 'High') return <CheckCircle size={48} className="text-emerald-500" />;
    if (elig === 'Moderate') return <AlertTriangle size={48} className="text-amber-500" />;
    return <XCircle size={48} className="text-rose-500" />;
  };

  const getStatusColor = (elig: string) => elig === 'High' ? 'text-emerald-600' : elig === 'Moderate' ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
          <Building2 size={40} className="text-indigo-600" /> Loan Eligibility
        </h1>
        <p className="text-slate-500 mt-2 text-lg font-medium tracking-tight">AI-powered credit assessment using probabilistic models</p>
      </div>

      <div className="glass-light p-8 md:p-12 shadow-xl shadow-slate-200/50">
        <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
          <Calculator size={20} className="text-indigo-600" /> Assessment Criteria
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { key: 'age', label: 'Current Age', min: 18, max: 80, suffix: 'yrs' },
            { key: 'experience', label: 'Work Experience', min: 0, max: 60, suffix: 'yrs' },
            { key: 'income', label: 'Annual Income (₹K)', min: 10, max: 1000, suffix: 'k' },
            { key: 'family_size', label: 'Family Size', min: 1, max: 10, suffix: '' },
            { key: 'ccavg', label: 'Monthly Card Spend (₹K)', min: 0, max: 100, suffix: 'k' },
            { key: 'mortgage', label: 'Existing Mortgage (₹K)', min: 0, max: 1000, suffix: 'k' },
          ].map((f) => (
            <div key={f.key} className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">{f.label}</label>
              <div className="relative">
                <input type="number" min={f.min} max={f.max}
                  value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: +e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-400 focus:bg-white transition-all" />
                {f.suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">{f.suffix}</span>}
              </div>
            </div>
          ))}

          <div className="lg:col-span-3 space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Education Level</label>
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {educationLabels.map((l, i) => (
                <button key={i} onClick={() => setForm({ ...form, education: i + 1 })}
                  className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    form.education === i + 1 ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
                  }`}>{l}</button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'securities_account', label: 'Securities Acc' },
              { key: 'cd_account', label: 'CD Account' },
              { key: 'online', label: 'Online Banking' },
              { key: 'credit_card', label: 'Has Credit Card' },
            ].map((f) => (
              <button key={f.key} onClick={() => setForm({ ...form, [f.key]: (form as any)[f.key] ? 0 : 1 })}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  (form as any)[f.key] ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                }`}>
                <span className="text-sm font-bold">{f.label}</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${(form as any)[f.key] ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${(form as any)[f.key] ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <motion.button onClick={checkEligibility} disabled={loading}
            className="px-12 py-4 primary-gradient text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <Calculator size={20} />}
            {loading ? 'Analyzing Profile...' : 'Evaluate Eligibility'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-light p-10 md:p-16 text-center space-y-10 border-indigo-50 bg-indigo-50/10">
            <div className="flex flex-col items-center gap-4">
              <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-100">
                {getIcon(result.eligibility)}
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Status: <span className={getStatusColor(result.eligibility)}>{result.eligibility}</span>
                </h2>
                <p className="text-slate-500 text-lg font-medium">{result.message}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Approval Prob.</p>
                <p className="text-4xl font-extrabold text-slate-900 tracking-tighter">
                  {typeof result.probability === 'number' && result.probability <= 1 ? `${(result.probability * 100).toFixed(0)}%` : `${result.probability}%`}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confidence</p>
                <p className="text-2xl font-bold text-slate-900 capitalize tracking-tight flex items-center justify-center gap-2">
                  <Shield size={20} className="text-indigo-600" /> {result.confidence}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ML Model</p>
                <p className="text-sm font-bold text-indigo-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-50">
                  {result.model === 'ml_random_forest' ? '🤖 RF Ensemble' : '📊 Heuristics'}
                </p>
              </div>
            </div>

            {result.tips && (
              <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-slate-100">
                {result.tips.map((tip: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white/60 px-4 py-2 rounded-2xl border border-slate-100">
                    <Info size={16} className="text-indigo-500" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
