import { useState, type FormEvent } from 'react';
import { useBudgetStore, type SavingGoal } from '../../store/budgetStore';
import { useAuth } from '../providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Progress } from '../ui/Progress';
import { Dialog, DialogHeader, DialogTitle } from '../ui/Dialog';

export function SavingGoals() {
    const savingGoals = useBudgetStore((s) => s.savingGoals);
    const deleteSavingGoal = useBudgetStore((s) => s.deleteSavingGoal);
    const currency = useBudgetStore((s) => s.currency);
    const { user } = useAuth();

    const [editing, setEditing] = useState<SavingGoal | null>(null);
    const [funding, setFunding] = useState<SavingGoal | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleClose = () => { setEditing(null); setIsAdding(false); setFunding(null); };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Objectifs d'épargne</CardTitle>
                <Button size="sm" onClick={() => setIsAdding(true)}>+ Ajouter</Button>
            </CardHeader>
            <CardContent>
                {savingGoals.length === 0 ? (
                    <p className="text-sm text-zinc-500">Aucun objectif d'épargne pour le moment.</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {savingGoals.map((g) => {
                            const percent = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                            const remaining = Math.max(g.targetAmount - g.currentAmount, 0);

                            return (
                                <div key={g.id} className="p-4 rounded-valex shadow-sm border-0 bg-white dark:bg-valex-darkCard flex flex-col justify-between group">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                                                {g.name}
                                            </h3>
                                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditing(g)} className="text-xs text-zinc-500 hover:text-indigo-600 px-2 py-1">Éditer</button>
                                                <button onClick={() => {
                                                    if (window.confirm(`Supprimer l'objectif "${g.name}" ?`)) deleteSavingGoal(g.id);
                                                }} className="text-xs text-zinc-500 hover:text-rose-600 px-2 py-1">✕</button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-sm mb-1 mt-4">
                                            <span className="font-medium">{g.currentAmount.toFixed(2)} {currency}</span>
                                            <span className="text-zinc-500">/ {g.targetAmount.toFixed(2)} {currency}</span>
                                        </div>
                                        <Progress value={percent} indicatorColor={`bg-[${g.color}]`} className="h-2" />

                                        <div className="flex justify-between text-xs text-zinc-500 mt-2">
                                            <span>Reste : {remaining.toFixed(2)} {currency}</span>
                                            {g.deadline && <span>Échéance: {new Date(g.deadline).toLocaleDateString('fr-FR')}</span>}
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-4 bg-white dark:bg-zinc-950"
                                        onClick={() => setFunding(g)}
                                    >
                                        Ajouter des fonds
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            {/* Add/Edit Goal Dialog */}
            <Dialog open={isAdding || !!editing} onOpenChange={handleClose}>
                <DialogHeader>
                    <DialogTitle>{isAdding ? 'Nouvel Objectif' : 'Modifier l\'objectif'}</DialogTitle>
                </DialogHeader>
                {(isAdding || editing) && (
                    <SavingGoalForm
                        initialData={editing || undefined}
                        onSuccess={handleClose}
                        userId={user!.id}
                    />
                )}
            </Dialog>

            {/* Fund Goal Dialog */}
            <Dialog open={!!funding} onOpenChange={(open) => !open && setFunding(null)}>
                <DialogHeader>
                    <DialogTitle>Financer : {funding?.name}</DialogTitle>
                </DialogHeader>
                {funding && (
                    <FundGoalForm
                        goal={funding}
                        onSuccess={() => setFunding(null)}
                        userId={user!.id}
                    />
                )}
            </Dialog>
        </Card>
    );
}

function SavingGoalForm({ initialData, onSuccess, userId }: { initialData?: SavingGoal; onSuccess: () => void; userId: string }) {
    const addSavingGoal = useBudgetStore((s) => s.addSavingGoal);
    const editSavingGoal = useBudgetStore((s) => s.editSavingGoal);

    const [name, setName] = useState(initialData?.name || '');
    const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount?.toString() || '');
    const [currentAmount, setCurrentAmount] = useState(initialData?.currentAmount?.toString() || '0');
    const [color, setColor] = useState(initialData?.color || '#6366f1'); // default indigo-500
    const [deadline, setDeadline] = useState(initialData?.deadline || '');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name || !targetAmount) return;

        const data = {
            name,
            targetAmount: parseFloat(targetAmount),
            currentAmount: parseFloat(currentAmount),
            color,
            deadline: deadline || null,
        };

        if (initialData) {
            editSavingGoal(initialData.id, data, userId);
        } else {
            addSavingGoal(data, userId);
        }
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nom de l'objectif</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Vacances au Japon" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Montant Cible</label>
                    <Input type="number" step="0.01" min="0" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Épargne actuelle</label>
                    <Input type="number" step="0.01" min="0" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date limite (optionnel)</label>
                    <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Couleur</label>
                    <div className="flex gap-2">
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                        <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 uppercase font-mono" />
                    </div>
                </div>
            </div>

            <Button type="submit" className="w-full mt-4">
                {initialData ? 'Enregistrer' : 'Créer l\'objectif'}
            </Button>
        </form>
    );
}

function FundGoalForm({ goal, onSuccess, userId }: { goal: SavingGoal; onSuccess: () => void; userId: string }) {
    const editSavingGoal = useBudgetStore((s) => s.editSavingGoal);
    const currency = useBudgetStore((s) => s.currency);
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) return;

        editSavingGoal(goal.id, {
            ...goal,
            currentAmount: goal.currentAmount + value
        }, userId);

        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-zinc-500 mb-4">
                Progression actuelle : {goal.currentAmount.toFixed(2)} / {goal.targetAmount.toFixed(2)} {currency}
            </p>
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Montant à y ajouter ({currency})</label>
                <Input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus placeholder="50.00" />
            </div>
            <Button type="submit" className="w-full mt-4">
                Ajouter
            </Button>
        </form>
    );
}
