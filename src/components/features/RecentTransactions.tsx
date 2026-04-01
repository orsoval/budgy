import { useState, useMemo } from 'react';
import { useBudgetStore, type Transaction, type TransactionType } from '../../store/budgetStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Dialog, DialogHeader, DialogTitle } from '../ui/Dialog';
import { TransactionForm } from './TransactionForm';
import { exportTransactionsToCSV } from '../../lib/exportCsv';
import { X, TrendingUp, TrendingDown, Edit2, Trash2 } from 'lucide-react';

export function RecentTransactions() {
    const transactions = useBudgetStore((state) => state.transactions);
    const deleteTransaction = useBudgetStore((state) => state.deleteTransaction);
    const categories = useBudgetStore((state) => state.categories);
    const currency = useBudgetStore((state) => state.currency);
    const activeAccountId = useBudgetStore((state) => state.activeAccountId);

    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const hasActiveFilters = searchQuery || filterType !== 'ALL' || filterCategory !== 'ALL' || startDate || endDate;

    const resetFilters = () => {
        setSearchQuery('');
        setFilterType('ALL');
        setFilterCategory('ALL');
        setStartDate('');
        setEndDate('');
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const matchesAccount = !activeAccountId || tx.accountId === activeAccountId;
            const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'ALL' || tx.type === filterType;
            const matchesCategory = filterCategory === 'ALL' || tx.categoryId === filterCategory;
            const txDate = tx.date.slice(0, 10);
            const matchesStart = !startDate || txDate >= startDate;
            const matchesEnd = !endDate || txDate <= endDate;
            return matchesAccount && matchesSearch && matchesType && matchesCategory && matchesStart && matchesEnd;
        });
    }, [transactions, activeAccountId, searchQuery, filterType, filterCategory, startDate, endDate]);

    const { tIncome, tExpense } = useMemo(() => {
        return filteredTransactions.reduce(
            (acc, tx) => {
                if (tx.type === 'INCOME') acc.tIncome += tx.amount;
                else acc.tExpense += tx.amount;
                return acc;
            },
            { tIncome: 0, tExpense: 0 }
        );
    }, [filteredTransactions]);

    const grandTotal = tIncome - tExpense;

    const incomeTransactions = useMemo(() => filteredTransactions.filter(tx => tx.type === 'INCOME'), [filteredTransactions]);
    const expenseTransactions = useMemo(() => filteredTransactions.filter(tx => tx.type === 'EXPENSE'), [filteredTransactions]);

    const renderTransactionOptions = (tx: Transaction, isIncome: boolean) => {
        const category = categories.find(c => c.id === tx.categoryId);
        
        // Dynamic styling for readability
        const bgClass = isIncome 
            ? "border-success/10 bg-success/5 hover:bg-success/10 dark:border-success/20 dark:bg-success/[0.03] dark:hover:bg-success/[0.08]"
            : "border-danger/10 bg-danger/5 hover:bg-danger/10 dark:border-danger/20 dark:bg-danger/[0.03] dark:hover:bg-danger/[0.08]";

        return (
            <div
                key={tx.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors group ${bgClass}`}
            >
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${category?.color || '#94a3b8'}25`, color: category?.color || '#94a3b8' }}
                    >
                        {isIncome ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate text-zinc-900 dark:text-zinc-50">{tx.description}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-500 truncate mt-0.5">
                            {category?.name || 'Inconnue'} <span className="mx-1.5 opacity-40">•</span> {new Date(tx.date).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-5 shrink-0 pl-4">
                    <span className={`font-bold font-mono-num whitespace-nowrap text-sm sm:text-base ${isIncome ? 'text-success' : 'text-danger'}`}>
                        {isIncome ? '+' : '-'}{tx.amount.toFixed(2)} {currency}
                    </span>
                    <div className="flex items-center opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => setEditingTx(tx)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                            title="Modifier"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => {
                                if (window.confirm("Voulez-vous vraiment supprimer cette transaction ?")) {
                                    deleteTransaction(tx.id);
                                }
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-danger hover:bg-danger/10 transition-colors"
                            title="Supprimer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Transactions Récentes</CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportTransactionsToCSV(transactions, categories, currency)}
                    disabled={transactions.length === 0}
                >
                    Exporter (CSV)
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <Input
                        placeholder="Rechercher une transaction..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                    />
                    <Select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as TransactionType | 'ALL')}
                        className="w-full sm:w-40"
                    >
                        <option value="ALL">Tous les types</option>
                        <option value="EXPENSE">Dépenses</option>
                        <option value="INCOME">Revenus</option>
                    </Select>
                    <Select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full sm:w-48"
                    >
                        <option value="ALL">Toutes les catégories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mb-6 items-end">
                    <div className="flex-1 flex flex-col sm:flex-row gap-3">
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Date début</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Date fin</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={resetFilters} className="flex items-center gap-1 shrink-0">
                            <X className="w-4 h-4" /> Réinitialiser
                        </Button>
                    )}
                </div>

                {filteredTransactions.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-4">Aucune transaction trouvée.</p>
                ) : (
                    <div className="space-y-8">
                        {/* Section Revenus */}
                        {incomeTransactions.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider px-2 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-success" />
                                    Revenus
                                </h3>
                                <div className="space-y-2">
                                    {incomeTransactions.map(tx => renderTransactionOptions(tx, true))}
                                </div>
                                <div className="flex justify-between items-center py-3 px-3 mt-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm ml-2">Sous-total Revenus</span>
                                    <div className="flex items-center gap-3 sm:gap-5 shrink-0 pl-4">
                                        <span className="font-bold text-success font-mono-num text-sm sm:text-base">+{tIncome.toFixed(2)} {currency}</span>
                                        <div className="w-[64px] hidden sm:block" />
                                        <div className="w-[64px] sm:hidden" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section Dépenses */}
                        {expenseTransactions.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider px-2 flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4 text-danger" />
                                    Dépenses
                                </h3>
                                <div className="space-y-2">
                                    {expenseTransactions.map(tx => renderTransactionOptions(tx, false))}
                                </div>
                                <div className="flex justify-between items-center py-3 px-3 mt-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm ml-2">Sous-total Dépenses</span>
                                    <div className="flex items-center gap-3 sm:gap-5 shrink-0 pl-4">
                                        <span className="font-bold text-danger font-mono-num text-sm sm:text-base">-{tExpense.toFixed(2)} {currency}</span>
                                        <div className="w-[64px] hidden sm:block" />
                                        <div className="w-[64px] sm:hidden" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section Grand Total */}
                        <div className={`flex justify-between items-center py-5 px-3 mt-6 rounded-xl border-2 ${grandTotal >= 0 ? 'bg-success/5 border-success/20' : 'bg-danger/5 border-danger/20'}`}>
                            <span className="font-black text-lg tracking-tight text-zinc-900 dark:text-zinc-50 ml-3">BILAN GÉNÉRAL</span>
                            <div className="flex items-center gap-3 sm:gap-5 shrink-0 pl-4">
                                <span className={`font-black text-xl sm:text-2xl font-mono-num ${grandTotal >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {grandTotal > 0 ? '+' : ''}{grandTotal.toFixed(2)} {currency}
                                </span>
                                <div className="w-[64px] hidden sm:block" />
                                <div className="w-[64px] sm:hidden" />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>

            <Dialog open={!!editingTx} onOpenChange={(open) => !open && setEditingTx(null)}>
                <DialogHeader>
                    <DialogTitle>Modifier la transaction</DialogTitle>
                </DialogHeader>
                {editingTx && (
                    <TransactionForm
                        initialData={editingTx}
                        onSuccess={() => setEditingTx(null)}
                    />
                )}
            </Dialog>
        </Card>
    );
}
