import { useState, useMemo } from 'react';
import { useBudgetStore, type Transaction, type TransactionType } from '../../store/budgetStore';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Dialog, DialogHeader, DialogTitle } from '../ui/Dialog';
import { TransactionForm } from './TransactionForm';
import { exportTransactionsToCSV } from '../../lib/exportCsv';
import { X, TrendingUp, TrendingDown, Edit2, Trash2, Search, Download, Landmark } from 'lucide-react';

export function TransactionsPage() {
    const transactions = useBudgetStore((state) => state.transactions);
    const deleteTransaction = useBudgetStore((state) => state.deleteTransaction);
    const categories = useBudgetStore((state) => state.categories);
    const accounts = useBudgetStore((state) => state.accounts);
    const currency = useBudgetStore((state) => state.currency);

    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const hasActiveFilters = searchQuery || filterType !== 'ALL' || filterCategory !== 'ALL' || startDate || endDate || selectedAccountId;

    const resetFilters = () => {
        setSearchQuery('');
        setFilterType('ALL');
        setFilterCategory('ALL');
        setStartDate('');
        setEndDate('');
        setSelectedAccountId(null);
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const matchesAccount = !selectedAccountId || tx.accountId === selectedAccountId;
            const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'ALL' || tx.type === filterType;
            const matchesCategory = filterCategory === 'ALL' || tx.categoryId === filterCategory;
            const txDate = tx.date.slice(0, 10);
            const matchesStart = !startDate || txDate >= startDate;
            const matchesEnd = !endDate || txDate <= endDate;
            return matchesAccount && matchesSearch && matchesType && matchesCategory && matchesStart && matchesEnd;
        });
    }, [transactions, selectedAccountId, searchQuery, filterType, filterCategory, startDate, endDate]);

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

    const renderTransaction = (tx: Transaction, isIncome: boolean) => {
        const category = categories.find(c => c.id === tx.categoryId);
        const account = accounts.find(a => a.id === tx.accountId);
        
        const borderClass = isIncome 
            ? "border-l-success dark:border-l-success"
            : "border-l-danger dark:border-l-danger";

        return (
            <div
                key={tx.id}
                className={`flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 border-l-[3px] transition-colors group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${borderClass}`}
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
                            {account && <><span className="mx-1.5 opacity-40">•</span> {account.name}</>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-5 shrink-0 pl-4">
                    <span className={`font-bold tabular-nums whitespace-nowrap text-sm sm:text-base ${isIncome ? 'text-success' : 'text-danger'}`}>
                        {isIncome ? '+' : '-'}{tx.amount.toFixed(2)} {currency}
                    </span>
                    <div className="flex items-center opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => setEditingTx(tx)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Transactions
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} trouvée{filteredTransactions.length > 1 ? 's' : ''}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportTransactionsToCSV(transactions, categories, currency)}
                    disabled={transactions.length === 0}
                    className="flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Exporter (CSV)
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row gap-3">
                        {/* Search and Account */}
                        <div className="flex flex-col sm:flex-row gap-3 flex-1">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9 text-sm"
                                />
                            </div>
                            <div className="flex items-center bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 h-9 shrink-0">
                                <Landmark className="w-4 h-4 text-zinc-400 ml-2.5" />
                                <select
                                    value={selectedAccountId || ''}
                                    onChange={(e) => setSelectedAccountId(e.target.value || null)}
                                    className="bg-transparent text-sm font-medium border-none focus:ring-0 text-zinc-900 dark:text-zinc-100 cursor-pointer pl-2 pr-8 h-full"
                                >
                                    <option value="">Tous comptes</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Other filters */}
                        <div className="flex flex-wrap lg:flex-nowrap gap-3 shrink-0 items-center">
                            <Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as TransactionType | 'ALL')}
                                className="w-full sm:w-[130px] h-9 text-sm"
                            >
                                <option value="ALL">Tous types</option>
                                <option value="EXPENSE">Dépenses</option>
                                <option value="INCOME">Revenus</option>
                            </Select>
                            <Select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full sm:w-[150px] h-9 text-sm"
                            >
                                <option value="ALL">Catégories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </Select>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-9 text-sm flex-1 sm:w-[130px]"
                                    title="Date début"
                                />
                                <span className="text-zinc-400 text-xs">à</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-9 text-sm flex-1 sm:w-[130px]"
                                    title="Date fin"
                                />
                            </div>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={resetFilters} className="flex items-center justify-center gap-1 h-9 px-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 w-full lg:w-auto mt-2 lg:mt-0">
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transaction List */}
            {filteredTransactions.length === 0 ? (
                <div className="text-center py-16">
                    <Search className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">Aucune transaction trouvée</p>
                    <p className="text-sm text-zinc-400 mt-1">Essayez de modifier vos filtres</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Revenus */}
                    {incomeTransactions.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider px-2 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-success" />
                                Revenus ({incomeTransactions.length})
                            </h3>
                            <div className="space-y-2">
                                {incomeTransactions.map(tx => renderTransaction(tx, true))}
                            </div>
                            <div className="flex justify-between items-center py-3 px-3 mt-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm ml-2">Sous-total Revenus</span>
                                <div className="flex items-center gap-3 sm:gap-5 shrink-0 pl-4">
                                    <span className="font-bold text-success tabular-nums text-sm sm:text-base">+{tIncome.toFixed(2)} {currency}</span>
                                    <div className="w-[64px] hidden sm:block" />
                                    <div className="w-[64px] sm:hidden" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dépenses */}
                    {expenseTransactions.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider px-2 flex items-center gap-2">
                                <TrendingDown className="w-4 h-4 text-danger" />
                                Dépenses ({expenseTransactions.length})
                            </h3>
                            <div className="space-y-2">
                                {expenseTransactions.map(tx => renderTransaction(tx, false))}
                            </div>
                            <div className="flex justify-between items-center py-3 px-3 mt-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm ml-2">Sous-total Dépenses</span>
                                <div className="flex items-center gap-3 sm:gap-5 shrink-0 pl-4">
                                    <span className="font-bold text-danger tabular-nums text-sm sm:text-base">-{tExpense.toFixed(2)} {currency}</span>
                                    <div className="w-[64px] hidden sm:block" />
                                    <div className="w-[64px] sm:hidden" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grand Total */}
                    <div className={`flex justify-between items-center py-5 px-3 mt-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border-l-[4px] ${grandTotal >= 0 ? 'border-l-success' : 'border-l-danger'}`}>
                        <span className="font-black text-lg tracking-tight text-zinc-900 dark:text-zinc-50 ml-3">BILAN GÉNÉRAL</span>
                        <div className="flex items-center gap-3 sm:gap-5 shrink-0 pl-4">
                            <span className={`font-black text-xl sm:text-2xl tabular-nums ${grandTotal >= 0 ? 'text-success' : 'text-danger'}`}>
                                {grandTotal > 0 ? '+' : ''}{grandTotal.toFixed(2)} {currency}
                            </span>
                            <div className="w-[64px] hidden sm:block" />
                            <div className="w-[64px] sm:hidden" />
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
}
