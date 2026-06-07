import { useMemo } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface RecentTransactionsProps {
    onViewAll?: () => void;
}

export function RecentTransactions({ onViewAll }: RecentTransactionsProps) {
    const transactions = useBudgetStore((state) => state.transactions);
    const categories = useBudgetStore((state) => state.categories);
    const currency = useBudgetStore((state) => state.currency);
    const activeAccountId = useBudgetStore((state) => state.activeAccountId);

    const recentTransactions = useMemo(() => {
        let filtered = transactions;
        if (activeAccountId) {
            filtered = filtered.filter(tx => tx.accountId === activeAccountId);
        }
        return [...filtered]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [transactions, activeAccountId]);

    if (recentTransactions.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Dernières transactions</h3>
                <p className="text-sm text-zinc-500 text-center py-6">Aucune transaction pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Dernières transactions</h3>
                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                    >
                        Voir tout
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="space-y-2">
                {recentTransactions.map(tx => {
                    const category = categories.find(c => c.id === tx.categoryId);
                    const isIncome = tx.type === 'INCOME';
                    const bgClass = isIncome 
                        ? "border-success/10 bg-success/5 dark:border-success/20 dark:bg-success/[0.03]"
                        : "border-danger/10 bg-danger/5 dark:border-danger/20 dark:bg-danger/[0.03]";

                    return (
                        <div
                            key={tx.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${bgClass}`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${category?.color || '#94a3b8'}25`, color: category?.color || '#94a3b8' }}
                                >
                                    {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm truncate text-zinc-900 dark:text-zinc-50">{tx.description}</p>
                                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                                        {category?.name || 'Inconnue'} <span className="mx-1.5 opacity-40">•</span> {new Date(tx.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <span className={`font-bold font-mono-num whitespace-nowrap text-sm shrink-0 pl-4 ${isIncome ? 'text-success' : 'text-danger'}`}>
                                {isIncome ? '+' : '-'}{tx.amount.toFixed(2)} {currency}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
