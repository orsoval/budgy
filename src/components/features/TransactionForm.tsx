import React, { useState } from 'react';
import { useBudgetStore, type TransactionType } from '../../store/budgetStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

import { AlertTriangle } from 'lucide-react';
import { type Transaction } from '../../store/budgetStore';
import { useAuth } from '../providers/AuthProvider';

interface TransactionFormProps {
    initialData?: Transaction;
    onSuccess?: () => void;
}

export function TransactionForm({ initialData, onSuccess }: TransactionFormProps) {
    const [type, setType] = useState<TransactionType>(initialData?.type || 'EXPENSE');
    const [amount, setAmount] = useState(initialData ? initialData.amount.toString() : '');
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
    const [accountId, setAccountId] = useState(initialData?.accountId || '');
    const [description, setDescription] = useState(initialData?.description || '');

    const categories = useBudgetStore((state) => state.categories);
    const accounts = useBudgetStore((state) => state.accounts);
    const addTransaction = useBudgetStore((state) => state.addTransaction);
    const editTransaction = useBudgetStore((state) => state.editTransaction);
    const currency = useBudgetStore((state) => state.currency);
    const { user } = useAuth();

    // Auto-select first account if not set
    React.useEffect(() => {
        if (!accountId && accounts.length > 0) {
            setAccountId(accounts[0].id);
        }
    }, [accounts, accountId]);

    const filteredCategories = categories.filter((c) => c.type === type);

    const handleTypeChange = (newType: TransactionType) => {
        setType(newType);
        // Clear category if the currently selected one doesn't match the new type
        const catExists = categories.find(c => c.id === categoryId && c.type === newType);
        if (!catExists) setCategoryId('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !categoryId || !accountId || !description) return;

        const txData = {
            type,
            amount: parseFloat(amount),
            categoryId,
            accountId,
            description,
            date: initialData?.date || new Date().toISOString(),
        };

        if (initialData) {
            editTransaction(initialData.id, txData, user!.id);
        } else {
            addTransaction(txData, user!.id);
        }

        if (onSuccess) onSuccess();
        setAmount('');
        setDescription('');
    };

    if (accounts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Aucun compte trouvé</h3>
                <p className="text-sm text-zinc-500 max-w-sm mb-4">
                    Vous devez d'abord créer un compte (ex: Compte Courant, Épargne) avant d'ajouter une transaction.
                </p>
                <Button onClick={() => onSuccess && onSuccess()} variant="outline">Fermer</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 mb-4">
                <Button
                    type="button"
                    variant={type === 'EXPENSE' ? 'default' : 'outline'}
                    className={type === 'EXPENSE' ? 'w-full bg-rose-500 hover:bg-rose-600 border-rose-500' : 'w-full border-rose-200 text-rose-500 hover:text-rose-600'}
                    onClick={() => handleTypeChange('EXPENSE')}
                >
                    Dépense
                </Button>
                <Button
                    type="button"
                    variant={type === 'INCOME' ? 'default' : 'outline'}
                    className={type === 'INCOME' ? 'w-full bg-emerald-500 hover:bg-emerald-600 border-emerald-500' : 'w-full border-emerald-200 text-emerald-500 hover:text-emerald-600'}
                    onClick={() => handleTypeChange('INCOME')}
                >
                    Revenu
                </Button>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Montant ({currency})</label>
                <Input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="ex: 15.50"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Compte</label>
                <Select
                    required
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                >
                    <option value="" disabled>Sélectionner un compte</option>
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Catégorie</label>
                <Select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                >
                    <option value="" disabled>Sélectionner une catégorie</option>
                    {filteredCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                <Input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Détails (ex: Café)"
                />
            </div>

            <Button type="submit" className="w-full mt-4">
                {initialData ? 'Modifier ' : 'Ajouter '}
                {type === 'EXPENSE' ? 'la dépense' : 'le revenu'}
            </Button>
        </form>
    );
}
