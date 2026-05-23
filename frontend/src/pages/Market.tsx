import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, TrendingUp, TrendingDown, 
  Globe, Award, Calendar, ChevronRight, 
  Loader2, Sparkles, Building, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface StockItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  timestamp: string;
}

interface MutualFundItem {
  code: string;
  name: string;
  category: string;
  nav: number;
  change: number;
  change_percent: number;
  timestamp: string;
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  published: string;
  provider: string;
  category: string;
  source_ticker: string;
  timestamp: string;
}

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d },
});

export default function Market() {
  const [activeTab, setActiveTab] = useState<'stocks' | 'mutual_funds' | 'news'>('stocks');
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFundItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail views
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [selectedFund, setSelectedFund] = useState<MutualFundItem | null>(null);
  const [historyData, setHistoryData] = useState<{ date: string; value: number }[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDays, setHistoryDays] = useState(30);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [stocksData, mfData, newsData] = await Promise.all([
        api.getStocks(), api.getMutualFunds(), api.getNews()
      ]);
      
      const newStocks = stocksData || [];
      const newFunds = mfData || [];
      
      setStocks(newStocks);
      setMutualFunds(newFunds);
      setNews(newsData || []);

      // Keep selected detail views updated in real-time
      setSelectedStock((curr) => {
        if (!curr) return null;
        const updated = newStocks.find(s => s.symbol === curr.symbol);
        return updated || curr;
      });

      setSelectedFund((curr) => {
        if (!curr) return null;
        const updated = newFunds.find(f => f.code === curr.code);
        return updated || curr;
      });
    } catch (err) {
      if (!silent) {
        toast.error('Failed to load financial market data.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up silent polling every 30 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      const activeSymbol = selectedStock?.symbol || selectedFund?.code;
      if (!activeSymbol) return;

      setHistoryLoading(true);
      try {
        const data = await api.getHistory(activeSymbol, historyDays);
        setHistoryData(data || []);
      } catch (err) {
        toast.error('Failed to fetch historical rates');
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [selectedStock?.symbol, selectedFund?.code, historyDays]);

  const formatCurrency = (val: number, symbol: string) => {
    const isCrypto = symbol.includes('BTC') || symbol.includes('ETH');
    const isUS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'SPY', 'QQQ', 'VTI', 'ARKK', 'GLD'].includes(symbol);
    if (isUS) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: isCrypto ? 2 : 2 }).format(val);
  };

  const formatNav = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(val);

  const filteredStocks = stocks.filter(s => s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredFunds = mutualFunds.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.category.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredNews = news.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.summary.toLowerCase().includes(searchTerm.toLowerCase()) || n.provider.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <motion.div {...fadeUp()} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="ai-orb-sm"><Sparkles size={14} className="text-white" /></div>
            <span className="text-xs font-bold text-finity-600 uppercase tracking-widest">Live Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-surface-900 tracking-tight leading-none">
            Financial <span className="gradient-text">Markets</span>
          </h1>
          <p className="text-surface-500 mt-3 text-base font-medium max-w-xl">
            Track real-time pricing for indices, equities, cryptocurrencies, Indian mutual funds, and global financial news.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-bold shadow-sm select-none">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Live Autoupdate Active (30s)
          </div>
        </div>
      </motion.div>

      {/* Tabs and Search */}
      <motion.div {...fadeUp(0.1)} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-card p-3">
        <div className="flex flex-wrap sm:flex-nowrap bg-surface-100/60 p-1.5 rounded-xl border border-surface-200/60 w-full lg:w-auto">
          {(['stocks', 'mutual_funds', 'news'] as const).map((t) => (
            <button key={t} onClick={() => { setActiveTab(t); setSearchTerm(''); }}
              className={`relative flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === t ? 'text-finity-600' : 'text-surface-500 hover:text-surface-800'}`}>
              {activeTab === t && (
                <motion.div layoutId="market-tab" className="absolute inset-0 bg-white rounded-lg shadow-sm ring-1 ring-surface-200/80" transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />
              )}
              <span className="relative z-10">{t === 'stocks' ? 'Stocks & Crypto' : t === 'mutual_funds' ? 'Mutual Funds' : 'Live Insights'}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-sm flex-shrink-0">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder={`Search ${activeTab.replace('_', ' ')}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="input-premium w-full pl-11" />
        </div>
      </motion.div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-finity-200 border-t-finity-600 rounded-full animate-spin" />
          <p className="text-surface-400 font-bold uppercase tracking-widest text-xs">Fetching latest rates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Main List Column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <AnimatePresence mode="wait">
              {/* STOCKS AND CRYPTO TAB */}
              {activeTab === 'stocks' && (
                <motion.div key="stocks-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {filteredStocks.length === 0 ? (
                    <div className="glass-card p-12 text-center text-surface-500 font-medium">No tickers found matching your search.</div>
                  ) : (
                    filteredStocks.map((item, i) => {
                      const isPositive = (item.change ?? 0) >= 0;
                      return (
                        <motion.div key={item.symbol} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          onClick={() => { setSelectedStock(item); setSelectedFund(null); window.innerWidth < 1024 && window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`glass-card p-5 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] hover:border-finity-300 group ${selectedStock?.symbol === item.symbol ? 'border-finity-500 shadow-md ring-2 ring-finity-50' : ''}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-surface-900 leading-tight text-base sm:text-lg">{item.symbol}</h3>
                              <p className="text-[11px] text-surface-400 font-bold mt-0.5 uppercase tracking-wider truncate max-w-[120px] sm:max-w-xs">{item.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-extrabold text-surface-900 text-lg sm:text-xl tracking-tight">{formatCurrency(item.price ?? 0, item.symbol)}</div>
                            <div className={`flex items-center justify-end gap-1.5 text-[11px] font-bold mt-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                              <span>{isPositive ? '+' : ''}{(item.change ?? 0).toFixed(2)}</span>
                              <span className={`px-2 py-0.5 rounded-lg ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>({isPositive ? '+' : ''}{(item.change_percent ?? 0).toFixed(2)}%)</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {/* MUTUAL FUNDS TAB */}
              {activeTab === 'mutual_funds' && (
                <motion.div key="funds-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {filteredFunds.length === 0 ? (
                    <div className="glass-card p-12 text-center text-surface-500 font-medium">No mutual funds found matching your search.</div>
                  ) : (
                    filteredFunds.map((item, i) => {
                      const isPositive = (item.change ?? 0) >= 0;
                      return (
                        <motion.div key={item.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          onClick={() => { setSelectedFund(item); setSelectedStock(null); window.innerWidth < 1024 && window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`glass-card p-5 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] hover:border-finity-300 group ${selectedFund?.code === item.code ? 'border-finity-500 shadow-md ring-2 ring-finity-50' : ''}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl bg-finity-50 text-finity-600 transition-transform group-hover:scale-110`}><Building size={20} /></div>
                            <div>
                              <h3 className="font-extrabold text-surface-900 leading-tight text-sm sm:text-base max-w-[150px] sm:max-w-xs truncate">{item.name}</h3>
                              <span className="inline-block text-[10px] bg-surface-100 text-surface-500 font-bold px-2 py-0.5 rounded-md mt-1.5 uppercase tracking-wider">{item.category}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-extrabold text-surface-900 text-lg sm:text-xl tracking-tight">{formatNav(item.nav ?? 0)}</div>
                            <div className={`flex items-center justify-end gap-1.5 text-[11px] font-bold mt-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                              <span>{isPositive ? '+' : ''}{(item.change ?? 0).toFixed(4)}</span>
                              <span className={`px-2 py-0.5 rounded-lg ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>({isPositive ? '+' : ''}{(item.change_percent ?? 0).toFixed(2)}%)</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {/* LIVE NEWS TAB */}
              {activeTab === 'news' && (
                <motion.div key="news-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {filteredNews.length === 0 ? (
                    <div className="glass-card p-12 text-center text-surface-500 font-medium">No headlines found matching your search.</div>
                  ) : (
                    filteredNews.map((item, i) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="glass-card p-6 md:p-8 space-y-4 cursor-default group hover:border-finity-300 transition-colors">
                        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-surface-400">
                          <span className="flex items-center gap-1.5 text-finity-600 bg-finity-50 border border-finity-100 px-3 py-1 rounded-lg">
                            <Globe size={12} /> {item.provider}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {item.published ? new Date(item.published).toLocaleDateString() : 'Today'}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-surface-900 text-xl md:text-2xl leading-snug tracking-tight group-hover:text-finity-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-surface-600 text-sm font-medium leading-relaxed">
                          {item.summary || 'Summary unavailable. Click source to read details on global market updates.'}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-surface-400">
                            <span>Ref Ticker:</span>
                            <span className="bg-surface-100 text-surface-600 px-2 py-0.5 rounded-md">{item.source_ticker}</span>
                          </div>
                          <button className="flex items-center gap-1 text-[11px] font-bold text-finity-600 hover:text-finity-800 transition-colors cursor-pointer uppercase tracking-wider">
                            Read Full Story <ChevronRight size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Detailed Stats Panel */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-28">
            <AnimatePresence mode="wait">
              {selectedStock || selectedFund ? (
                <motion.div key="details-panel" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-6 md:p-8 space-y-6 flex flex-col cursor-default"
                >
                  {/* Title & Price Header */}
                  <div>
                    <h3 className="font-black text-surface-900 text-2xl tracking-tight">
                      {selectedStock ? selectedStock.symbol : selectedFund?.name}
                    </h3>
                    <p className="text-surface-400 text-[10px] font-extrabold uppercase tracking-widest mt-1">
                      {selectedStock ? selectedStock.name : selectedFund?.category}
                    </p>
                    
                    <div className="flex items-baseline gap-3 mt-5">
                      <span className="text-4xl font-extrabold text-surface-900 tracking-tighter">
                        {selectedStock ? formatCurrency(selectedStock.price ?? 0, selectedStock.symbol) : formatNav(selectedFund?.nav ?? 0)}
                      </span>
                      <span className={`text-sm font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                        (selectedStock ? (selectedStock.change ?? 0) : (selectedFund?.change ?? 0)) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {(selectedStock ? (selectedStock.change ?? 0) : (selectedFund?.change ?? 0)) >= 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                        {(selectedStock ? (selectedStock.change ?? 0) : (selectedFund?.change ?? 0)) >= 0 ? '+' : ''}
                        {selectedStock ? (selectedStock.change ?? 0).toFixed(2) : (selectedFund?.change ?? 0).toFixed(4)} ({(selectedStock ? (selectedStock.change_percent ?? 0) : (selectedFund?.change_percent ?? 0)).toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  {/* Chart Interval Selector */}
                  <div className="flex bg-surface-50 p-1 rounded-xl border border-surface-100">
                    {[{ label: '1M', val: 30 }, { label: '2M', val: 60 }, { label: '3M', val: 90 }].map((btn) => (
                      <button key={btn.val} onClick={() => setHistoryDays(btn.val)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${historyDays === btn.val ? 'bg-white text-finity-600 shadow-sm border border-surface-200/50' : 'text-surface-500 hover:text-surface-800'}`}>
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Price Graph */}
                  <div className="h-56 w-full relative chart-glow">
                    {historyLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 rounded-xl">
                        <Loader2 size={24} className="text-finity-600 animate-spin" />
                      </div>
                    ) : historyData.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center text-surface-400 text-xs font-bold bg-surface-50 rounded-xl border border-dashed border-surface-200">
                        No historical data available.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6c63ff" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} tickFormatter={(str) => { try { return new Date(str).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}); } catch { return str; } }} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                          <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '11px', fontWeight: 700, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }} />
                          <Area type="monotone" dataKey="value" stroke="#6c63ff" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 5, fill: '#6c63ff', stroke: '#fff', strokeWidth: 3 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 bg-surface-50 p-4 rounded-2xl border border-surface-100">
                    {selectedStock ? (
                      <>
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-surface-100/50">
                          <p className="text-surface-400 font-bold text-[9px] uppercase tracking-widest">Daily Open</p>
                          <p className="font-extrabold text-surface-900 text-sm mt-0.5 tracking-tight">{formatCurrency(selectedStock.open ?? 0, selectedStock.symbol)}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-surface-100/50">
                          <p className="text-surface-400 font-bold text-[9px] uppercase tracking-widest">Daily Volume</p>
                          <p className="font-extrabold text-surface-900 text-sm mt-0.5 tracking-tight">{(selectedStock.volume ?? 0).toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-surface-100/50">
                          <p className="text-surface-400 font-bold text-[9px] uppercase tracking-widest">Session High</p>
                          <p className="font-extrabold text-emerald-600 text-sm mt-0.5 tracking-tight">{formatCurrency(selectedStock.high ?? 0, selectedStock.symbol)}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-surface-100/50">
                          <p className="text-surface-400 font-bold text-[9px] uppercase tracking-widest">Session Low</p>
                          <p className="font-extrabold text-rose-600 text-sm mt-0.5 tracking-tight">{formatCurrency(selectedStock.low ?? 0, selectedStock.symbol)}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-2 p-3 bg-white rounded-xl shadow-sm border border-surface-100/50">
                          <p className="text-surface-400 font-bold text-[9px] uppercase tracking-widest">Scheme Code</p>
                          <p className="font-extrabold text-surface-900 text-sm mt-0.5 tracking-tight">AMFI - {selectedFund?.code}</p>
                        </div>
                        <div className="col-span-2 p-3 bg-white rounded-xl shadow-sm border border-surface-100/50">
                          <p className="text-surface-400 font-bold text-[9px] uppercase tracking-widest">Last Synced</p>
                          <p className="font-extrabold text-surface-900 text-sm mt-0.5 tracking-tight">{selectedFund?.timestamp ? new Date(selectedFund.timestamp).toLocaleString() : 'N/A'}</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3 items-start text-[10px] text-surface-400 bg-surface-50 p-4 rounded-xl border border-surface-100">
                    <AlertCircle size={14} className="text-surface-400 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-bold uppercase tracking-wider">
                      Pricing sourced directly from Yahoo Finance and AMFI. Past performance does not guarantee future results.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="select-placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass-panel p-12 text-center flex flex-col items-center justify-center min-h-[450px] cursor-default border border-dashed border-finity-200"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-finity-50 to-finity-100 text-finity-600 flex items-center justify-center shadow-inner mb-6">
                    <Award size={32} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-surface-900 tracking-tight">Market Analytics</h3>
                  <p className="text-surface-500 text-sm font-medium max-w-[240px] mx-auto mt-3 leading-relaxed">
                    Select any stock or mutual fund from the list to view historical projections and key financial indicators.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}
    </div>
  );
}
