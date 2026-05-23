import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Calculator, CheckCircle, AlertTriangle, XCircle, Info, Shield, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d },
});

/* ── Animated Radial Gauge ── */
function ApprovalGauge({ value, size = 140 }: { value: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = Math.PI * radius; // half circle
  const normalizedValue = Math.min(value, 100);
  const offset = circumference - (normalizedValue / 100) * circumference;
  const color = normalizedValue > 70 ? '#10b981' : normalizedValue > 50 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        <path
          d={`M 6 ${size / 2 + 6} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2 + 6}`}
          fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round"
        />
        <motion.path
          d={`M 6 ${size / 2 + 6} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2 + 6}`}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
        />
      </svg>
      <div className="-mt-12 text-center">
        <motion.p
          className="text-3xl font-extrabold tracking-tight"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {normalizedValue}%
        </motion.p>
        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-0.5">Approval Probability</p>
      </div>
    </div>
  );
}

export default function Loans() {
  const { addXp } = useStore();
  const [form, setForm] = useState({
    age: 28, experience: 5, income: 60, family_size: 3, ccavg: 2,
    education: 1, mortgage: 0, securities_account: 0, cd_account: 0,
    online: 1, credit_card: 1,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const educationLabels = ['Undergrad', 'Graduate', 'Advanced'];

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
      const score = Math.min(100, Math.round(
        (form.income / 200) * 30 + (form.age >= 25 && form.age <= 45 ? 20 : 10) +
        (form.experience / 30) * 15 + (form.education * 8) +
        (form.securities_account ? 10 : 0) + (form.cd_account ? 10 : 0) + (form.credit_card ? 5 : 0)
      ));
      setResult({
        probability: score, eligible: score > 50,
        eligibility: score > 70 ? 'High' : score > 50 ? 'Moderate' : 'Low',
        confidence: score > 70 ? 'high' : 'moderate',
        message: score > 70 ? 'Strong candidate for loan approval.' : score > 50 ? 'Moderate chances — consider strengthening weak areas.' : 'May need improvement in key financial areas.',
        model: 'offline_estimate',
        tips: ['This is an educational estimate, not a guarantee.', 'Compare offers from multiple lenders.', 'Maintain a credit score above 750 for best rates.'],
      });
    }
    addXp(15);
    setLoading(false);
  };

  const getStatusIcon = (elig: string) => {
    if (elig === 'High') return <CheckCircle size={28} className="text-emerald-500" />;
    if (elig === 'Moderate') return <AlertTriangle size={28} className="text-amber-500" />;
    return <XCircle size={28} className="text-rose-500" />;
  };

  const getStatusColor = (elig: string) =>
    elig === 'High' ? 'text-emerald-600' : elig === 'Moderate' ? 'text-amber-600' : 'text-rose-600';

  const getStatusBg = (elig: string) =>
    elig === 'High' ? 'bg-emerald-50 border-emerald-100' : elig === 'Moderate' ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100';

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div {...fadeUp()}>
        <div className="flex items-center gap-2 mb-2">
          <div className="ai-orb-sm"><Building2 size={14} className="text-white" /></div>
          <span className="text-xs font-bold text-finity-600 uppercase tracking-widest">AI Credit Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
          Loan <span className="gradient-text">Genie</span>
        </h1>
        <p className="text-surface-500 mt-2 text-base font-medium">AI-powered credit assessment using probabilistic models</p>
      </motion.div>

      {/* Form */}
      <motion.div {...fadeUp(0.1)} className="glass-card p-6 md:p-10">
        <div className="flex items-center gap-2 mb-6">
          <Calculator size={16} className="text-finity-600" />
          <h3 className="text-sm font-extrabold text-surface-900 uppercase tracking-wider">Assessment Criteria</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { key: 'age', label: 'Current Age', min: 18, max: 80, suffix: 'yrs' },
            { key: 'experience', label: 'Work Experience', min: 0, max: 60, suffix: 'yrs' },
            { key: 'income', label: 'Annual Income (₹K)', min: 10, max: 1000, suffix: 'K' },
            { key: 'family_size', label: 'Family Size', min: 1, max: 10, suffix: '' },
            { key: 'ccavg', label: 'Monthly Card Spend (₹K)', min: 0, max: 100, suffix: 'K' },
            { key: 'mortgage', label: 'Existing Mortgage (₹K)', min: 0, max: 1000, suffix: 'K' },
          ].map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-[11px] font-bold text-surface-400 uppercase tracking-wider px-0.5">{f.label}</label>
              <div className="relative">
                <input type="number" min={f.min} max={f.max}
                  value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: +e.target.value })}
                  className="input-premium w-full pr-10" />
                {f.suffix && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-surface-400 uppercase">{f.suffix}</span>}
              </div>
            </div>
          ))}

          {/* Education */}
          <div className="lg:col-span-3 space-y-1.5">
            <label className="text-[11px] font-bold text-surface-400 uppercase tracking-wider px-0.5">Education Level</label>
            <div className="flex bg-surface-50 p-1 rounded-xl border border-surface-100">
              {educationLabels.map((l, i) => (
                <button key={i} onClick={() => setForm({ ...form, education: i + 1 })}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    form.education === i + 1
                      ? 'bg-white text-finity-600 shadow-sm ring-1 ring-surface-200'
                      : 'text-surface-400 hover:text-surface-600'
                  }`}>{l}</button>
              ))}
            </div>
          </div>

          {/* Toggle Fields */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'securities_account', label: 'Securities Acc' },
              { key: 'cd_account', label: 'CD Account' },
              { key: 'online', label: 'Online Banking' },
              { key: 'credit_card', label: 'Credit Card' },
            ].map((f) => (
              <button key={f.key} onClick={() => setForm({ ...form, [f.key]: (form as any)[f.key] ? 0 : 1 })}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  (form as any)[f.key]
                    ? 'bg-finity-50 border-finity-200 text-finity-700'
                    : 'bg-white border-surface-100 text-surface-400 hover:border-surface-200'
                }`}>
                <span className="text-xs font-bold">{f.label}</span>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${(form as any)[f.key] ? 'bg-finity-500' : 'bg-surface-200'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-transform ${(form as any)[f.key] ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-10 flex justify-center">
          <motion.button onClick={checkEligibility} disabled={loading}
            className="px-14 py-4 btn-primary text-base flex items-center justify-center gap-3 rounded-2xl disabled:opacity-50"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'Analyzing Profile...' : 'Evaluate Eligibility'}
          </motion.button>
        </div>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="glass-card p-8 md:p-12 space-y-8"
          >
            {/* Gauge + Status */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <ApprovalGauge
                value={typeof result.probability === 'number' && result.probability <= 1 ? result.probability * 100 : result.probability}
              />
              <div className="text-center md:text-left flex-1 space-y-2">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <div className={`p-2 rounded-xl ${getStatusBg(result.eligibility)}`}>
                    {getStatusIcon(result.eligibility)}
                  </div>
                  <h2 className="text-2xl font-extrabold text-surface-900 tracking-tight">
                    <span className={getStatusColor(result.eligibility)}>{result.eligibility}</span> Eligibility
                  </h2>
                </div>
                <p className="text-surface-500 font-medium">{result.message}</p>
              </div>
            </div>

            {/* Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-surface p-4 rounded-xl text-center space-y-1">
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Confidence</p>
                <p className="text-base font-extrabold text-surface-900 capitalize flex items-center justify-center gap-1.5">
                  <Shield size={14} className="text-finity-500" /> {result.confidence}
                </p>
              </div>
              <div className="glass-surface p-4 rounded-xl text-center space-y-1">
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">ML Model</p>
                <p className="text-sm font-bold text-finity-600">
                  {result.model === 'ml_random_forest' ? '🤖 Random Forest' : '📊 Heuristic Engine'}
                </p>
              </div>
              <div className="glass-surface p-4 rounded-xl text-center space-y-1">
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Status</p>
                <p className={`text-sm font-extrabold ${result.eligible ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {result.eligible ? '✓ Likely Eligible' : '✗ Needs Improvement'}
                </p>
              </div>
            </div>

            {/* Tips */}
            {result.tips && (
              <div className="space-y-2 pt-4 border-t border-surface-100">
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-3">AI Recommendations</p>
                {result.tips.map((tip: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm font-medium text-surface-600 bg-surface-50 px-4 py-3 rounded-xl border border-surface-100">
                    <Info size={14} className="text-finity-500 mt-0.5 flex-shrink-0" />
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
