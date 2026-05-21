import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import Simulator from './pages/Simulator';
import Chat from './pages/Chat';
import Budget from './pages/Budget';
import Loans from './pages/Loans';
import Learn from './pages/Learn';
import Profile from './pages/Profile';
import { useStore } from './store/useStore';
import './App.css';

const pageTransition = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
};

function App() {
  const { activeSection } = useStore();

  const renderPage = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'market': return <Market />;
      case 'simulator': return <Simulator />;
      case 'chat': return <Chat />;
      case 'budget': return <Budget />;
      case 'loans': return <Loans />;
      case 'learn': return <Learn />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-surface-900 relative">
      {/* ── Animated Mesh Background ── */}
      <div className="mesh-bg" />

      {/* ── Toast Notifications ── */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            color: '#0f172a',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            padding: '12px 16px',
          },
          duration: 3000,
        }}
      />

      {/* ── Top Navigation ── */}
      <TopNav />

      {/* ── Main Content ── */}
      <main
        className="min-h-screen pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{ paddingTop: '5.5rem' }}
      >
        <div className="max-w-[1200px] mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
