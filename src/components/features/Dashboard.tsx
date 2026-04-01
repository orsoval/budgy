import { useMemo } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { HistoryChart } from './HistoryChart';
import { SavingGoals } from './SavingGoals';
import { DonutChart } from '../ui/DonutChart';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Layers, CreditCard } from 'lucide-react';
/** Formatte un montant de façon compacte : 1 500 → "1.5k", 1 200 000 → "1.2M" */
function formatAmount(value: number): string {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 10_000) return `${(value / 1_000).toFixed(0)}k`;
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    return value.toFixed(2);
}

export function Dashboard() {
    const transactions = useBudgetStore((state) => state.transactions);
    const categories = useBudgetStore((state) => state.categories);
    const accounts = useBudgetStore((state) => state.accounts);
    const currency = useBudgetStore((state) => state.currency);
    const activeAccountId = useBudgetStore((state) => state.activeAccountId);
    const setActiveAccountId = useBudgetStore((state) => state.setActiveAccountId);

    const activeAccount = useMemo(() => 
        activeAccountId ? accounts.find(a => a.id === activeAccountId) : null
    , [accounts, activeAccountId]);

    const data = useMemo(() => {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        // Filter transactions for specific month
        let filteredTx = transactions.filter((tx) => {
            const d = new Date(tx.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });

        // Filter by account if specified
        if (activeAccountId) {
            filteredTx = filteredTx.filter(tx => tx.accountId === activeAccountId);
        }

        let totalIncome = 0;
        let totalExpense = 0;
        const categoryTotals: Record<string, number> = {};

        filteredTx.forEach((tx) => {
            if (tx.type === 'INCOME') {
                totalIncome += tx.amount;
            } else {
                totalExpense += tx.amount;
                categoryTotals[tx.categoryId] = (categoryTotals[tx.categoryId] || 0) + tx.amount;
            }
        });

        const expensesByCategory = Object.entries(categoryTotals).map(([catId, amount]) => {
            const category = categories.find((c) => c.id === catId);
            return {
                categoryId: catId,
                amount,
                name: category?.name || 'Inconnu',
                color: category?.color || '#cbd5e1',
            };
        });

        // Calculate absolute balance for all accounts or specific one
        let totalBalance = 0;
        if (activeAccountId && activeAccount) {
            // Balance = initial + all historical transactions for this account
            const accountHistory = transactions.filter(tx => tx.accountId === activeAccountId);
            const historySum = accountHistory.reduce((acc, tx) => 
                tx.type === 'INCOME' ? acc + tx.amount : acc - tx.amount
            , 0);
            totalBalance = activeAccount.initialBalance + historySum;
        } else {
            // Global Balance = sum of initial balances + sum of all transactions
            const initialSum = accounts.reduce((acc, a) => acc + a.initialBalance, 0);
            const historySum = transactions.reduce((acc, tx) => 
                tx.type === 'INCOME' ? acc + tx.amount : acc - tx.amount
            , 0);
            totalBalance = initialSum + historySum;
        }

        return {
            totalIncome,
            totalExpense,
            monthFlow: totalIncome - totalExpense,
            totalBalance,
            expensesByCategory,
        };
    }, [transactions, categories, accounts, activeAccountId, activeAccount]);

    return (
        <div className="space-y-6">
            {/* Account Selector Horizontal Scroll */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                <button
                    onClick={() => setActiveAccountId(null)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all shrink-0 ${
                        !activeAccountId 
                            ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100' 
                            : 'bg-white text-zinc-600 border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-400 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    <span className="text-sm font-semibold">Tous les comptes</span>
                </button>
                {accounts.map(acc => (
                    <button
                        key={acc.id}
                        onClick={() => setActiveAccountId(acc.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all shrink-0 ${
                            activeAccountId === acc.id 
                                ? 'text-white border-transparent' 
                                : 'bg-white text-zinc-600 border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-400 dark:border-zinc-800 hover:border-zinc-300'
                        }`}
                        style={activeAccountId === acc.id ? { backgroundColor: acc.color } : {}}
                    >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm font-semibold">{acc.name}</span>
                    </button>
                ))}
            </div>

            <motion.div 
                className="grid gap-4 md:grid-cols-3"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                    }
                }}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}>
                    <Card 
                        className="text-zinc-50 border-0 overflow-hidden relative h-full transition-all duration-500" 
                        style={{ 
                            background: activeAccount 
                                ? `linear-gradient(135deg, ${activeAccount.color} 0%, ${activeAccount.color}dd 100%)`
                                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)', 
                            boxShadow: activeAccount 
                                ? `0 8px 32px ${activeAccount.color}40`
                                : '0 8px 32px rgba(99,102,241,0.35)' 
                        }}
                    >
                        <div className="absolute right-0 top-0 opacity-[0.12] transform translate-x-4 -translate-y-4">
                            <Wallet className="w-32 h-32" />
                        </div>
                        <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium opacity-80 text-white">
                                {activeAccount ? `Solde ${activeAccount.name}` : 'Patrimoine Total'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={activeAccountId || 'global'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-baseline gap-2 mt-2 flex-wrap"
                                >
                                    <span className="text-3xl md:text-4xl font-black leading-none whitespace-nowrap">
                                        {formatAmount(data.totalBalance)}
                                    </span>
                                    <span className="text-lg font-semibold opacity-80">{currency}</span>
                                </motion.div>
                            </AnimatePresence>
                            <div className="flex items-center gap-1.5 mt-3">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${data.monthFlow >= 0 ? 'bg-white/20' : 'bg-rose-500/20'}`}>
                                    {data.monthFlow >= 0 ? '+' : ''}{formatAmount(data.monthFlow)} {currency} ce mois
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}>
                    <Card className="h-full bg-white dark:bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Revenus</CardTitle>
                            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-success" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                                <span className="text-3xl md:text-4xl font-black leading-none text-success whitespace-nowrap">+{formatAmount(data.totalIncome)}</span>
                                <span className="text-lg font-semibold text-success opacity-80">{currency}</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}>
                    <Card className="h-full bg-white dark:bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Dépenses</CardTitle>
                            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-danger" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                                <span className="text-3xl md:text-4xl font-black leading-none text-danger whitespace-nowrap">-{formatAmount(data.totalExpense)}</span>
                                <span className="text-lg font-semibold text-danger opacity-80">{currency}</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Répartition par Catégorie</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DonutChart 
                            data={data.expensesByCategory.map(e => ({
                                id: e.categoryId,
                                label: e.name,
                                value: e.amount,
                                color: e.color
                            }))} 
                            currency={currency} 
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Alertes & Budgets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {categories.map((cat, i) => {
                            if (!cat.monthlyThreshold) return null;
                            const expenseForCat = data.expensesByCategory.find(e => e.categoryId === cat.id)?.amount || 0;
                            const thresholdPercent = (expenseForCat / cat.monthlyThreshold) * 100;
                            const isOverBudget = thresholdPercent >= 100;
                            const isWarning = thresholdPercent >= 80 && !isOverBudget;

                            return (
                                <motion.div 
                                    key={cat.id} 
                                    className={`space-y-3 p-4 rounded-2xl border transition-colors ${
                                        isOverBudget 
                                            ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-900/10' 
                                            : isWarning 
                                                ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-900/10' 
                                                : 'border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]'
                                    }`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.1 }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
                                        <div className="font-medium flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                                                 {isOverBudget ? <AlertTriangle className="w-4 h-4 text-rose-500" /> : <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-zinc-900 dark:text-zinc-100">{cat.name}</span>
                                                <div className="flex gap-2 items-center">
                                                    {isOverBudget && <span className="text-[10px] uppercase tracking-wider font-bold text-rose-500">Dépassé</span>}
                                                    {isWarning && <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-500">Attention</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right flex items-baseline gap-1">
                                            <span className={`font-bold ${ isOverBudget ? 'text-rose-600 dark:text-rose-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-zinc-100' }`}>{formatAmount(expenseForCat)}</span>
                                            <span className="text-zinc-400 text-xs">/ {formatAmount(cat.monthlyThreshold)} {currency}</span>
                                        </div>
                                    </div>
                                    <Progress
                                        value={Math.min(thresholdPercent, 100)}
                                        indicatorColor={isOverBudget ? "bg-rose-500" : isWarning ? "bg-amber-400" : `bg-[${cat.color}]`}
                                        className="h-1.5"
                                    />
                                </motion.div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6">
                <SavingGoals />
            </div>

            <div className="mt-6">
                <HistoryChart />
            </div>
        </div>
    );
}
