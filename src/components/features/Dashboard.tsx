import { useMemo } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { HistoryChart } from './HistoryChart';
import { SavingGoals } from './SavingGoals';
import { DonutChart } from '../ui/DonutChart';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';

export function Dashboard() {
    const transactions = useBudgetStore((state) => state.transactions);
    const categories = useBudgetStore((state) => state.categories);
    const currency = useBudgetStore((state) => state.currency);

    const data = useMemo(() => {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        const currentMonthTx = transactions.filter((tx) => {
            const d = new Date(tx.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });

        let totalIncome = 0;
        let totalExpense = 0;
        const categoryTotals: Record<string, number> = {};

        currentMonthTx.forEach((tx) => {
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

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            expensesByCategory,
        };
    }, [transactions, categories]);

    return (
        <div className="space-y-6">
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
                    <Card className="bg-gradient-to-br from-primary to-[#8B7CF6] text-white shadow-xl shadow-primary/20 border-0 overflow-hidden relative h-full">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                            <Wallet className="w-32 h-32" />
                        </div>
                        <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-white/80">
                                Solde Actuel
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl md:text-[40px] leading-none font-bold flex flex-wrap items-baseline gap-1 mt-2">
                                <span className="whitespace-nowrap">
                                    <span>{data.balance >= 0 ? '+' : ''}</span>
                                    <CountUp end={Math.abs(data.balance)} duration={0.8} decimals={2} separator=" " />
                                </span>
                                <span className="text-xl md:text-2xl font-semibold opacity-80">{currency}</span>
                            </div>
                            <p className="text-sm text-white/70 mt-3 font-medium">Ce mois</p>
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
                            <div className="text-3xl font-bold text-success flex items-baseline gap-1 mt-2">
                                <span>+</span>
                                <CountUp end={data.totalIncome} duration={0.8} decimals={2} separator=" " />
                                <span className="text-lg">{currency}</span>
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
                            <div className="text-3xl font-bold text-danger flex items-baseline gap-1 mt-2">
                                <span>-</span>
                                <CountUp end={data.totalExpense} duration={0.8} decimals={2} separator=" " />
                                <span className="text-lg">{currency}</span>
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
                                    className={`space-y-3 p-4 rounded-2xl border ${isOverBudget ? 'border-danger/20 bg-danger/5' : isWarning ? 'border-warning/20 bg-warning/5' : 'border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.1 }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
                                        <div className="font-medium flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                                                 {isOverBudget ? <AlertTriangle className="w-4 h-4 text-danger" /> : <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-zinc-900 dark:text-zinc-100">{cat.name}</span>
                                                <div className="flex gap-2 items-center">
                                                    {isOverBudget && <span className="text-[10px] uppercase tracking-wider font-bold text-danger">Dépassé</span>}
                                                    {isWarning && <span className="text-[10px] uppercase tracking-wider font-bold text-warning">Attention</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{expenseForCat.toFixed(2)} {currency}</span>
                                            <span className="text-zinc-500 text-xs ml-1">/ {cat.monthlyThreshold} {currency}</span>
                                        </div>
                                    </div>
                                    <Progress
                                        value={Math.min(thresholdPercent, 100)}
                                        indicatorColor={isOverBudget ? "bg-danger" : isWarning ? "bg-warning" : `bg-[${cat.color}]`}
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
