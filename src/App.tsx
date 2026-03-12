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

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);
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
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex font-sans overflow-hidden h-screen bg-valex-background dark:bg-valex-darkBg text-zinc-800 dark:text-zinc-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-valex-darkCard shadow-valex border-r border-zinc-200 dark:border-zinc-800 flex flex-col hidden md:flex z-20">
        <div className="h-16 flex items-center px-6 border-b border-zinc-100 dark:border-zinc-800/50">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-600 cursor-pointer" onClick={() => setIsProfileOpen(false)}>Budgy</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 mt-2">Principal</p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-indigo-600/10 text-indigo-600 rounded-valex font-medium transition-colors">
            📊 Tableau de bord
          </button>

          <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 mt-6">Gestion</p>
          <button onClick={() => setIsCategoryModalOpen(true)} className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-600 hover:bg-indigo-600/5 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 rounded-valex font-medium transition-colors">
            📁 Catégories
          </button>
          <button onClick={() => setIsRecurringOpen(true)} className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-600 hover:bg-indigo-600/5 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 rounded-valex font-medium transition-colors">
            🔁 Récurrences
          </button>
        </nav>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white/80 dark:bg-valex-darkCard/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold md:hidden text-indigo-600">Budgy</h1>
            {/* Mobile menu toggle could go here */}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={cycleTheme} title={`Thème: ${theme}`} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-lg">
              {themeIcon}
            </button>
            <Button onClick={() => setIsModalOpen(true)} className="shadow-valex md:hidden">
              +
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="shadow-valex hidden md:flex">
              + Transaction
            </Button>
            <div className="w-9 h-9 ml-2 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold cursor-pointer shadow-valex hover:opacity-90 transition-opacity" onClick={() => setIsProfileOpen(true)} title="Mon Profil">
              {(displayName?.[0] || user?.email?.[0] || 'B').toUpperCase()}
            </div>
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
          <ProfilePage onClose={() => setIsProfileOpen(false)} />
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
