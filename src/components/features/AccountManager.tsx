import { useState, type FormEvent } from 'react';
import { useBudgetStore, type Account, type AccountType } from '../../store/budgetStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Dialog, DialogHeader, DialogTitle } from '../ui/Dialog';
import { useAuth } from '../providers/AuthProvider';
import { Wallet, Landmark, Banknote, LineChart, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';

const ACCOUNT_ICONS: Record<AccountType, any> = {
    CHECKING: Wallet,
    SAVINGS: Landmark,
    CASH: Banknote,
    INVESTMENT: LineChart,
    OTHER: MoreHorizontal
};

const ACCOUNT_LABELS: Record<AccountType, string> = {
    CHECKING: 'Compte Courant',
    SAVINGS: 'Épargne',
    CASH: 'Espèces',
    INVESTMENT: 'Investissement',
    OTHER: 'Autre'
};

export function AccountManager() {
    const accounts = useBudgetStore((state) => state.accounts);
    const deleteAccount = useBudgetStore((state) => state.deleteAccount);
    const currency = useBudgetStore((state) => state.currency);
    const { user } = useAuth();

    const [editingAcc, setEditingAcc] = useState<Account | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleClose = () => {
        setEditingAcc(null);
        setIsAdding(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestion des Comptes</CardTitle>
                <Button size="sm" onClick={() => setIsAdding(true)}>+ Ajouter</Button>
            </CardHeader>
            <CardContent>
                {accounts.length === 0 ? (
                    <p className="text-sm text-zinc-500">Aucun compte existant.</p>
                ) : (
                    <div className="space-y-3">
                        {accounts.map((acc) => {
                            const Icon = ACCOUNT_ICONS[acc.type] || Wallet;
                            return (
                                <div key={acc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `${acc.color}25`, color: acc.color }}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                                                {acc.name} <span className="text-[10px] text-zinc-400 ml-2 uppercase tracking-wide">({ACCOUNT_LABELS[acc.type]})</span>
                                            </p>
                                            <p className="text-xs text-zinc-500 tabular-nums">
                                                Solde initial: {acc.initialBalance} {currency}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity mt-2 sm:mt-0 gap-1">
                                        <button 
                                            onClick={() => setEditingAcc(acc)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                                            title="Éditer"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (window.confirm(`Supprimer le compte "${acc.name}" ? Cela supprimera également toutes les transactions associées.`)) {
                                                    deleteAccount(acc.id);
                                                }
                                            }}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-danger hover:bg-danger/10 transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            <Dialog open={isAdding || !!editingAcc} onOpenChange={handleClose}>
                <DialogHeader>
                    <DialogTitle>{isAdding ? 'Nouveau Compte' : 'Modifier le compte'}</DialogTitle>
                </DialogHeader>
                {(isAdding || editingAcc) && (
                    <AccountForm
                        initialData={editingAcc || undefined}
                        onSuccess={handleClose}
                        userId={user!.id}
                    />
                )}
            </Dialog>
        </Card>
    );
}

function AccountForm({ initialData, onSuccess, userId }: { initialData?: Account, onSuccess: () => void, userId: string }) {
    const addAccount = useBudgetStore((state) => state.addAccount);
    const editAccount = useBudgetStore((state) => state.editAccount);
    const currency = useBudgetStore((state) => state.currency);

    const [name, setName] = useState(initialData?.name || '');
    const [color, setColor] = useState(initialData?.color || '#3b82f6');
    const [type, setType] = useState<AccountType>(initialData?.type || 'CHECKING');
    const [initialBalance, setInitialBalance] = useState(initialData?.initialBalance.toString() || '0');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name || !color) return;

        const accData = {
            name,
            color,
            type,
            icon: initialData?.icon || 'Wallet',
            initialBalance: parseFloat(initialBalance) || 0,
        };

        if (initialData) {
            editAccount(initialData.id, accData, userId);
        } else {
            addAccount(accData, userId);
        }
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nom du compte</label>
                <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Compte Courant"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type de compte</label>
                <Select value={type} onChange={(e) => setType(e.target.value as AccountType)}>
                    {Object.entries(ACCOUNT_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Solde Initial ({currency})</label>
                <Input
                    type="number"
                    step="0.01"
                    required
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Couleur</label>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                    />
                    <Input
                        type="text"
                        required
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    />
                </div>
            </div>

            <Button type="submit" className="w-full mt-4">
                {initialData ? 'Enregistrer' : 'Créer le compte'}
            </Button>
        </form>
    );
}
