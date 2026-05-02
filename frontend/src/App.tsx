import { Toaster } from 'react-hot-toast';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import Chat from './pages/Chat';
import Budget from './pages/Budget';
import Loans from './pages/Loans';
import Learn from './pages/Learn';
import Profile from './pages/Profile';
import { useStore } from './store/useStore';

function App() {
  const { activeSection } = useStore();

  const renderPage = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
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
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
        }}
      />

      {/* Top Navigation */}
      <TopNav />

      {/* Main Content */}
      <main className="min-h-screen pb-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden" style={{ paddingTop: '8rem' }}>
        {/* Background Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-indigo-50/30 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-[1100px] mx-auto relative z-10">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
