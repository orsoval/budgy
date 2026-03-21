import { useState, useEffect } from 'react';
import { useAuth } from './components/providers/AuthProvider';
import { useBudgetStore } from './store/budgetStore';
import { Dashboard } from './components/features/Dashboard';
import { TransactionForm } from './components/features/TransactionForm';
import { Dialog, DialogHeader, DialogTitle } from './components/ui/Dialog';
import { Button } from './components/ui/Button';
import { CategoryManager } from './components/features/CategoryManager';
import { RecentTransactions } from './components/features/RecentTransactions';
import { ProfilePage } from './components/features/ProfilePage';
import { RecurringManager } from './components/features/RecurringManager';
import { useTheme } from './hooks/useTheme';
import { LayoutDashboard, FolderOpen, Repeat, PanelLeftClose, PanelLeft } from 'lucide-react';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [tooltip, setTooltip] = useState<{ text: string, y: number } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, text: string) => {
    if (!sidebarOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({ text, y: rect.top + rect.height / 2 });
    }
  };
  const handleMouseLeave = () => setTooltip(null);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };
  const themeIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '💻';

  const initialized = useBudgetStore((state) => state.initialized);
  const initialize = useBudgetStore((state) => state.initialize);
  const displayName = useBudgetStore((state) => state.displayName);
  const applyRecurring = useBudgetStore((state) => state.applyRecurringTransactions);

  useEffect(() => {
    if (user) {
      initialize(user.id).then(() => applyRecurring(user.id));
    }
  }, [user, initialize, applyRecurring]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex font-sans overflow-hidden h-screen bg-background dark:bg-background text-zinc-800 dark:text-zinc-200">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-[260px]' : 'w-20'} bg-white dark:bg-[#12122A] shadow-xl border-r border-zinc-200 dark:border-white/5 flex-col hidden md:flex z-20 transition-all duration-300 overflow-visible relative`}>
        <div className="h-20 flex items-center px-6 border-b border-zinc-100 dark:border-white/5 overflow-hidden">
          <h1 
            className={`text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent cursor-pointer transition-all ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}
            onClick={() => setIsProfileOpen(false)}
          >
            Budgy
          </h1>
          {!sidebarOpen && (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary font-bold text-xl absolute left-5 cursor-pointer" onClick={() => setIsProfileOpen(false)}>
              B
            </div>
          )}
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-x-hidden overflow-y-auto">
          <p className={`px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>Principal</p>
          <button 
            onMouseEnter={(e) => handleMouseEnter(e, "Tableau de bord")}
            onMouseLeave={handleMouseLeave}
            className={`w-full flex items-center gap-3 py-3 bg-primary/10 dark:bg-primary/20 text-primary dark:text-white rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(108,92,231,0.15)] ${sidebarOpen ? 'px-4' : 'justify-center px-0'}`}
          >
            <LayoutDashboard className="w-5 h-5 text-primary shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>Tableau de bord</span>
          </button>

          <p className={`px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 mt-8 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>Gestion</p>
          <button 
            onClick={() => setIsCategoryModalOpen(true)} 
            onMouseEnter={(e) => handleMouseEnter(e, "Catégories")}
            onMouseLeave={handleMouseLeave}
            className={`w-full flex items-center gap-3 py-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white rounded-xl font-medium transition-all ${sidebarOpen ? 'px-4' : 'justify-center px-0'}`}
          >
            <FolderOpen className="w-5 h-5 shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>Catégories</span>
          </button>
          
          <button 
            onClick={() => setIsRecurringOpen(true)} 
            onMouseEnter={(e) => handleMouseEnter(e, "Récurrences")}
            onMouseLeave={handleMouseLeave}
            className={`w-full flex items-center gap-3 py-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white rounded-xl font-medium transition-all ${sidebarOpen ? 'px-4' : 'justify-center px-0'}`}
          >
            <Repeat className="w-5 h-5 shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>Récurrences</span>
          </button>
        </nav>

        {/* User Profile in Sidebar Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-white/5 overflow-hidden relative">
          <div 
            className={`flex items-center gap-3 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer transition-all ${sidebarOpen ? 'px-4' : 'justify-center px-0'}`}
            onClick={() => setIsProfileOpen(true)}
            onMouseEnter={(e) => handleMouseEnter(e, "Profil")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-primary flex items-center justify-center text-white font-bold shadow-md">
                {(displayName?.[0] || user?.email?.[0] || 'B').toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white dark:border-[#12122A]"></div>
            </div>
            <div className={`flex flex-col flex-1 min-w-0 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {displayName || "Utilisateur"}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                Gérer le profil
              </span>
            </div>
          </div>
        </div>

        {/* Custom Tooltip */}
        {tooltip && !sidebarOpen && (
          <div 
            className="fixed left-[88px] bg-zinc-800 dark:bg-zinc-700 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl pointer-events-none z-50 whitespace-nowrap"
            style={{ 
              top: `${tooltip.y}px`, 
              transform: 'translateY(-50%)',
              animation: 'fadeIn 0.2s ease-out forwards'
            }}
          >
            {tooltip.text}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[6px] border-transparent border-r-zinc-800 dark:border-r-zinc-700" />
          </div>
        )}
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-background/80 dark:bg-background/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-6 z-10 shrink-0 shadow-sm sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex w-10 h-10 rounded-full items-center justify-center bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
              title={sidebarOpen ? 'Masquer la barre latérale' : 'Afficher la barre latérale'}
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent md:hidden">Budgy</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <button 
              onClick={cycleTheme} 
              title={`Thème: ${theme}`} 
              className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors text-lg"
            >
              {themeIcon}
            </button>
            
            <Button onClick={() => setIsModalOpen(true)} className="md:hidden">
              +
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="hidden md:flex">
              + Transaction
            </Button>

            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-primary flex items-center justify-center text-white font-bold shadow-lg hover:opacity-90 transition-opacity md:hidden"
            >
              {(displayName?.[0] || user?.email?.[0] || 'B').toUpperCase()}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="mb-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {displayName ? `Bonjour, ${displayName}` : "Vue d'ensemble"}
              </h2>
              <p className="text-zinc-500">Bienvenue sur votre tableau de bord financier.</p>
            </div>

            <div className="space-y-6">
              <Dashboard />
              <RecentTransactions />
            </div>

            <footer className="py-6 mt-12 border-t border-zinc-200 dark:border-zinc-800">
              <div className="text-center text-sm text-zinc-500">
                Budgy - Application de gestion de budget personnel
              </div>
            </footer>
          </div>
        </main>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogHeader>
          <DialogTitle>Ajouter une opération</DialogTitle>
        </DialogHeader>
        <TransactionForm onSuccess={() => setIsModalOpen(false)} />
      </Dialog>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <div className="max-h-[80vh] overflow-y-auto w-full max-w-2xl sm:max-w-xl">
          <CategoryManager />
        </div>
      </Dialog>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <div className="max-h-[80vh] overflow-y-auto w-full max-w-lg">
          <ProfilePage />
        </div>
      </Dialog>

      <Dialog open={isRecurringOpen} onOpenChange={setIsRecurringOpen}>
        <div className="max-h-[80vh] overflow-y-auto w-full max-w-2xl sm:max-w-xl">
          <RecurringManager />
        </div>
      </Dialog>
    </div>
  );
}

export default App;
