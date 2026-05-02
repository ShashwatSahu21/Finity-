import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Trash2, Bot, User } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';

export default function Chat() {
  const { chatHistory, addChatMessage, clearChat, addXp, riskProfile } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'How should I start investing as a beginner?',
    "What's the 50/30/20 budgeting rule?",
    'Explain SIP in simple terms',
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    addChatMessage({ role: 'user', content: msg });
    setLoading(true);

    try {
      const history = chatHistory.map((m) => ({ role: m.role, content: m.content }));
      const context = riskProfile ? { risk_category: riskProfile.risk_category, risk_score: riskProfile.risk_score } : undefined;
      const data = await api.chat(msg, history, context);
      addChatMessage({ role: 'assistant', content: data.reply });
      if (data.suggested_questions?.length) setSuggestions(data.suggested_questions);
      addXp(5);
    } catch {
      // Offline fallback
      const fallbacks: Record<string, string> = {
        sip: 'A SIP (Systematic Investment Plan) lets you invest a fixed amount regularly in mutual funds. Start with as little as ₹500/month! It uses rupee cost averaging to reduce risk.\n\n⚠️ This is for educational purposes only.',
        budget: 'The 50/30/20 rule: 50% needs, 30% wants, 20% savings. Track every expense for a month to understand patterns. Use automatic transfers to savings on payday.',
        invest: 'For beginners: 1) Build emergency fund (3-6 months expenses), 2) Start SIP in index fund, 3) Learn about PPF for safe returns, 4) Never invest money you may need soon.\n\n⚠️ Not financial advice.',
        loan: 'Loan tips: Compare interest rates, understand EMI = P × r × (1+r)^n / ((1+r)^n - 1). Keep total EMIs under 40% of income. Check for prepayment penalties.',
        tax: 'Key tax savings: Section 80C (₹1.5L) - PPF, ELSS, EPF. Section 80D (₹25K) - Health insurance. Compare old vs new tax regime for your situation.',
      };
      const key = Object.keys(fallbacks).find((k) => msg.toLowerCase().includes(k));
      addChatMessage({ role: 'assistant', content: key ? fallbacks[key] : "I'm here to help with personal finance! Ask about budgeting, savings, investments, loans, or taxes." });
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Sparkles size={28} className="text-indigo-600" /> AI Coach
          </h1>
          <p className="text-slate-500 font-medium">Ask anything about your personal finance</p>
        </div>
        {chatHistory.length > 0 && (
          <button onClick={clearChat} className="p-2.5 text-slate-400 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50 cursor-pointer">
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-6 custom-scrollbar">
        {chatHistory.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-3xl primary-gradient flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
              <Bot size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Hi! I'm Finity 🤖</h2>
            <p className="text-slate-500 max-w-sm mb-10 font-medium text-lg">Your AI financial companion. I can help you understand budgeting, investments, loans, and more.</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-xl">
              {suggestions.map((s) => (
                <motion.button key={s} onClick={() => sendMessage(s)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 glass-light rounded-2xl text-sm font-bold text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer">
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {chatHistory.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center shrink-0 mt-1 shadow-md shadow-indigo-100">
                  <Bot size={20} className="text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-sm ${
                msg.role === 'user' ? 'primary-gradient text-white shadow-indigo-200' : 'bg-white border border-slate-100 text-slate-800'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-1">
                  <User size={20} className="text-slate-600" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
            <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center shrink-0 shadow-md shadow-indigo-100">
              <Bot size={20} className="text-white" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex gap-2 items-center shadow-sm">
              <span className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
              <span className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
              <span className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
            </div>
          </motion.div>
        )}

        <div ref={endRef} />
      </div>

      {/* Suggestions Overlay */}
      {chatHistory.length > 0 && suggestions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
          {suggestions.map((s) => (
            <button key={s} onClick={() => sendMessage(s)}
              className="shrink-0 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer whitespace-nowrap shadow-sm">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative mt-4 group">
        <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask anything about personal finance..."
          className="w-full pl-6 pr-16 py-5 bg-white border-2 border-slate-100 rounded-3xl text-slate-900 placeholder-slate-400 font-medium focus:border-indigo-400 outline-none transition-all shadow-xl shadow-slate-100/50" />
        <motion.button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 primary-gradient text-white rounded-2xl flex items-center justify-center disabled:opacity-30 transition-all shadow-lg shadow-indigo-200 cursor-pointer"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Send size={20} />
        </motion.button>
      </div>
    </div>
  );
}
