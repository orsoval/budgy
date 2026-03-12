import { useState, useMemo } from 'react';
import { useBudgetStore, type Transaction, type TransactionType } from '../../store/budgetStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Dialog, DialogHeader, DialogTitle } from '../ui/Dialog';
import { TransactionForm } from './TransactionForm';
import { exportTransactionsToCSV } from '../../lib/exportCsv';

export function RecentTransactions() {
    const transactions = useBudgetStore((state) => state.transactions);
    const deleteTransaction = useBudgetStore((state) => state.deleteTransaction);
    const categories = useBudgetStore((state) => state.categories);
    const currency = useBudgetStore((state) => state.currency);

    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'ALL' || tx.type === filterType;
            const matchesCategory = filterCategory === 'ALL' || tx.categoryId === filterCategory;
            return matchesSearch && matchesType && matchesCategory;
        });
    }, [transactions, searchQuery, filterType, filterCategory]);

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

                {filteredTransactions.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-4">Aucune transaction trouvée.</p>
                ) : (
                    <div className="space-y-4">
                        {filteredTransactions.map((tx) => {
                            const category = categories.find(c => c.id === tx.categoryId);
                            return (
                                <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <div className="flex gap-4">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                                            style={{ backgroundColor: category?.color || '#cbd5e1' }}
                                        >
                                            {tx.type === 'INCOME' ? '+' : '-'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-zinc-900 dark:text-zinc-50">{tx.description}</p>
                                            <p className="text-xs text-zinc-500">
                                                {category?.name || 'Inconnue'} • {new Date(tx.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-3 sm:mt-0">
                                        <span className={`font-bold whitespace-nowrap ${tx.type === 'INCOME' ? 'text-valex-success' : 'text-valex-danger'}`}>
                                            {tx.type === 'INCOME' ? '+' : '-'}{tx.amount.toFixed(2)} {currency}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setEditingTx(tx)}>
                                                Éditer
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => {
                                                if (window.confirm("Supprimer cette transaction ?")) {
                                                    deleteTransaction(tx.id);
                                                }
                                            }}>
                                                ✕
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
