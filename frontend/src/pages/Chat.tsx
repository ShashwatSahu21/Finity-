import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Trash2, Bot, User, Zap, ChevronRight, BrainCircuit } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d },
});

export default function Chat() {
  const { chatHistory, addChatMessage, clearChat, addXp, riskProfile } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'How should I start investing as a beginner?',
    "What's the 50/30/20 budgeting rule?",
    'Explain SIP in simple terms',
    'How can I optimize my taxes?'
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
      setTimeout(() => {
        addChatMessage({ role: 'assistant', content: key ? fallbacks[key] : "I'm here to help with personal finance! Ask about budgeting, savings, investments, loans, or taxes." });
        setLoading(false);
      }, 1500); // Simulate network latency
      return;
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto pb-4">
      {/* Header */}
      <motion.div {...fadeUp()} className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="ai-orb-sm"><BrainCircuit size={14} className="text-white" /></div>
            <span className="text-xs font-bold text-finity-600 uppercase tracking-widest">Finity Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">
            AI Financial <span className="gradient-text">Coach</span>
          </h1>
        </div>
        {chatHistory.length > 0 && (
          <button onClick={clearChat} className="p-3 text-surface-400 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50 cursor-pointer bg-white border border-surface-100 shadow-sm">
            <Trash2 size={18} />
          </button>
        )}
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pr-2 pb-4 scrollbar-none scroll-smooth">
        {chatHistory.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-finity-500/20 rounded-full blur-2xl animate-pulse-glow" />
              <div className="w-24 h-24 rounded-[2rem] primary-gradient flex items-center justify-center shadow-2xl shadow-finity-500/30 ring-8 ring-white relative z-10">
                <Bot size={40} className="text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-surface-900 mb-3 tracking-tight">Hi! I'm Finity AI</h2>
            <p className="text-surface-500 mb-12 font-medium text-lg leading-relaxed max-w-lg">
              Your personalized wealth operating system. I can analyze markets, explain complex topics, and guide your financial strategy.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {suggestions.map((s, i) => (
                <motion.button key={s} onClick={() => sendMessage(s)}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                  className="glass-card px-5 py-4 text-left group hover:border-finity-300 transition-all cursor-pointer flex items-center justify-between">
                  <span className="text-sm font-bold text-surface-700 group-hover:text-finity-700 transition-colors">{s}</span>
                  <ChevronRight size={16} className="text-surface-300 group-hover:text-finity-500 transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6 pt-4">
            <AnimatePresence initial={false}>
              {chatHistory.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center shrink-0 shadow-lg shadow-finity-500/20 mt-1">
                      <Sparkles size={18} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-6 py-4 text-[15px] leading-relaxed whitespace-pre-wrap font-medium shadow-sm ${
                    msg.role === 'user'
                      ? 'primary-gradient text-white rounded-tr-sm shadow-finity-500/20'
                      : 'bg-white border border-surface-100 text-surface-800 rounded-tl-sm glass-card'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-10 h-10 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center shrink-0 mt-1">
                      <User size={18} className="text-surface-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center shrink-0 shadow-lg shadow-finity-500/20">
                  <Sparkles size={18} className="text-white animate-pulse" />
                </div>
                <div className="glass-card rounded-2xl rounded-tl-sm px-6 py-5 flex items-center gap-1.5 h-[56px]">
                  <span className="w-2 h-2 bg-finity-400 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-finity-400 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-finity-400 rounded-full typing-dot" />
                </div>
              </motion.div>
            )}
            <div ref={endRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <motion.div {...fadeUp(0.2)} className="shrink-0 pt-4">
        {/* Suggestion Chips */}
        {chatHistory.length > 0 && suggestions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none -mx-2 px-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => sendMessage(s)}
                className="shrink-0 px-4 py-2 bg-white border border-surface-200 rounded-xl text-[11px] font-extrabold text-surface-600 hover:text-finity-600 hover:border-finity-300 hover:bg-finity-50 transition-all cursor-pointer shadow-sm uppercase tracking-wider">
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="relative group flex items-end gap-2 bg-white rounded-2xl border-2 border-surface-100 focus-within:border-finity-400 focus-within:ring-4 focus-within:ring-finity-50 transition-all shadow-sm">
          <textarea
            ref={inputRef as any}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask Finity AI anything..."
            className="w-full bg-transparent px-6 py-4 text-surface-900 placeholder-surface-400 font-semibold outline-none resize-none max-h-32 custom-scrollbar min-h-[56px]"
            rows={1}
            style={{ height: 'auto', overflowY: 'hidden' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <div className="p-2 shrink-0">
            <motion.button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 btn-primary rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              <Send size={16} className={input.trim() ? 'translate-x-[1px] -translate-y-[1px]' : ''} />
            </motion.button>
          </div>
        </div>
        <p className="text-center text-[10px] font-bold text-surface-400 mt-3 uppercase tracking-widest flex items-center justify-center gap-1">
          <Zap size={10} /> Finity AI can make mistakes. Consider verifying important information.
        </p>
      </motion.div>
    </div>
  );
}
