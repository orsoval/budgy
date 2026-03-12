import { useState, type FormEvent } from 'react';
import { useBudgetStore, type RecurringTransaction, type RecurringFrequency, type TransactionType } from '../../store/budgetStore';
import { useAuth } from '../providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Dialog, DialogHeader, DialogTitle } from '../ui/Dialog';

const FREQ_LABELS: Record<RecurringFrequency, string> = {
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
    yearly: 'Annuel',
};

export function RecurringManager() {
    const recurring = useBudgetStore((s) => s.recurringTransactions);
    const categories = useBudgetStore((s) => s.categories);
    const deleteRecurring = useBudgetStore((s) => s.deleteRecurring);
    const currency = useBudgetStore((s) => s.currency);
    const { user } = useAuth();

    const [editing, setEditing] = useState<RecurringTransaction | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleClose = () => { setEditing(null); setIsAdding(false); };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Transactions Récurrentes</CardTitle>
                <Button size="sm" onClick={() => setIsAdding(true)}>+ Ajouter</Button>
            </CardHeader>
            <CardContent>
                {recurring.length === 0 ? (
                    <p className="text-sm text-zinc-500">Aucune transaction récurrente configurée.</p>
                ) : (
                    <div className="space-y-3">
                        {recurring.map((r) => {
                            const cat = categories.find((c) => c.id === r.categoryId);
                            return (
                                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                            style={{ backgroundColor: cat?.color || '#cbd5e1' }}
                                        >
                                            {r.type === 'INCOME' ? '+' : '-'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                                                {r.description}
                                                {!r.isActive && <span className="ml-2 text-xs text-zinc-400">(en pause)</span>}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {r.amount.toFixed(2)} {currency} • {FREQ_LABELS[r.frequency]} • Prochaine: {new Date(r.nextDate).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                        <Button variant="outline" size="sm" onClick={() => setEditing(r)}>Éditer</Button>
                                        <Button variant="destructive" size="sm" onClick={() => {
                                            if (window.confirm(`Supprimer "${r.description}" ?`)) deleteRecurring(r.id);
                                        }}>✕</Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            <Dialog open={isAdding || !!editing} onOpenChange={handleClose}>
                <DialogHeader>
                    <DialogTitle>{isAdding ? 'Nouvelle récurrence' : 'Modifier la récurrence'}</DialogTitle>
                </DialogHeader>
                {(isAdding || editing) && (
                    <RecurringForm
                        initialData={editing || undefined}
                        onSuccess={handleClose}
                        userId={user!.id}
                    />
                )}
            </Dialog>
        </Card>
    );
}

function RecurringForm({ initialData, onSuccess, userId }: { initialData?: RecurringTransaction; onSuccess: () => void; userId: string }) {
    const addRecurring = useBudgetStore((s) => s.addRecurring);
    const editRecurring = useBudgetStore((s) => s.editRecurring);
    const categories = useBudgetStore((s) => s.categories);

    const [type, setType] = useState<TransactionType>(initialData?.type || 'EXPENSE');
    const [description, setDescription] = useState(initialData?.description || '');
    const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
    const [frequency, setFrequency] = useState<RecurringFrequency>(initialData?.frequency || 'monthly');
    const [nextDate, setNextDate] = useState(initialData?.nextDate || new Date().toISOString().split('T')[0]);
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

    const filteredCategories = categories.filter((c) => c.type === type);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !categoryId) return;

        const data = {
            categoryId,
            amount: parseFloat(amount),
            type,
            description,
            frequency,
            nextDate,
            isActive,
        };

        if (initialData) {
            editRecurring(initialData.id, data, userId);
        } else {
            addRecurring(data, userId);
        }
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
                <button type="button" onClick={() => setType('EXPENSE')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'EXPENSE' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                    Dépense
                </button>
                <button type="button" onClick={() => setType('INCOME')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'INCOME' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                    Revenu
                </button>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ex: Loyer, Netflix..." required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Montant</label>
                    <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Fréquence</label>
                    <Select value={frequency} onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuel</option>
                        <option value="yearly">Annuel</option>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Catégorie</label>
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                    <option value="">Sélectionner...</option>
                    {filteredCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Prochaine échéance</label>
                <Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} required />
            </div>

            <div className="flex items-center gap-2">
                <input type="checkbox" id="recurring-active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
                <label htmlFor="recurring-active" className="text-sm text-zinc-700 dark:text-zinc-300">Active</label>
            </div>

            <Button type="submit" className="w-full mt-4">
                {initialData ? 'Enregistrer' : 'Créer la récurrence'}
            </Button>
        </form>
    );
}
