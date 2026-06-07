import { useState, type FormEvent } from 'react';
import { useBudgetStore, type Category, type TransactionType } from '../../store/budgetStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Dialog, DialogHeader, DialogTitle } from '../ui/Dialog';
import { useAuth } from '../providers/AuthProvider';
import { FolderOpen, Edit2, Trash2 } from 'lucide-react';

export function CategoryManager() {
    const categories = useBudgetStore((state) => state.categories);
    const deleteCategory = useBudgetStore((state) => state.deleteCategory);
    const currency = useBudgetStore((state) => state.currency);
    const { user } = useAuth();

    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleClose = () => {
        setEditingCat(null);
        setIsAdding(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestion des Catégories</CardTitle>
                <Button size="sm" onClick={() => setIsAdding(true)}>+ Ajouter</Button>
            </CardHeader>
            <CardContent>
                {categories.length === 0 ? (
                    <p className="text-sm text-zinc-500">Aucune catégorie existante.</p>
                ) : (
                    <div className="space-y-3">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                                    >
                                        <FolderOpen className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                                            {cat.name} <span className="text-[10px] text-zinc-400 ml-2 uppercase tracking-wide">({cat.type === 'INCOME' ? 'Revenu' : 'Dépense'})</span>
                                        </p>
                                        <p className="text-xs text-zinc-500 tabular-nums">
                                            {cat.monthlyThreshold ? `Plafond: ${cat.monthlyThreshold} ${currency}` : 'Aucun plafond'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity mt-2 sm:mt-0 gap-1">
                                    <button 
                                        onClick={() => setEditingCat(cat)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                                        title="Éditer"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (window.confirm(`Supprimer la catégorie "${cat.name}" ?`)) {
                                                deleteCategory(cat.id);
                                            }
                                        }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-danger hover:bg-danger/10 transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <Dialog open={isAdding || !!editingCat} onOpenChange={handleClose}>
                <DialogHeader>
                    <DialogTitle>{isAdding ? 'Nouvelle Catégorie' : 'Modifier la catégorie'}</DialogTitle>
                </DialogHeader>
                {(isAdding || editingCat) && (
                    <CategoryForm
                        initialData={editingCat || undefined}
                        onSuccess={handleClose}
                        userId={user!.id}
                    />
                )}
            </Dialog>
        </Card>
    );
}

function CategoryForm({ initialData, onSuccess, userId }: { initialData?: Category, onSuccess: () => void, userId: string }) {
    const addCategory = useBudgetStore((state) => state.addCategory);
    const editCategory = useBudgetStore((state) => state.editCategory);
    const currency = useBudgetStore((state) => state.currency);

    const [name, setName] = useState(initialData?.name || '');
    const [color, setColor] = useState(initialData?.color || '#3b82f6');
    const [type, setType] = useState<TransactionType>(initialData?.type || 'EXPENSE');
    const [threshold, setThreshold] = useState(initialData?.monthlyThreshold?.toString() || '');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name || !color) return;

        const catData = {
            name,
            color,
            type,
            icon: initialData?.icon || 'circle',
            monthlyThreshold: threshold ? parseFloat(threshold) : null,
        };

        if (initialData) {
            editCategory(initialData.id, catData, userId);
        } else {
            addCategory(catData, userId);
        }
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nom</label>
                <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Transports"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type de catégorie</label>
                <Select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
                    <option value="EXPENSE">Dépense (Sortie d'argent)</option>
                    <option value="INCOME">Revenu (Entrée d'argent)</option>
                </Select>
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

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Plafond Mensuel ({currency}) - Optionnel</label>
                <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    placeholder="Laissez vide pour désactiver"
                />
            </div>

            <Button type="submit" className="w-full mt-4">
                {initialData ? 'Enregistrer' : 'Créer la catégorie'}
            </Button>
        </form>
    );
}
