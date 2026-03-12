import { useMemo } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { HistoryChart } from './HistoryChart';
import { SavingGoals } from './SavingGoals';

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
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-valex-lg border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">
                            Solde Actuel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {data.balance >= 0 ? '+' : ''}{data.balance.toFixed(2)} {currency}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Revenus</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-valex-success">
                            +{data.totalIncome.toFixed(2)} {currency}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Dépenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-valex-danger">
                            -{data.totalExpense.toFixed(2)} {currency}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Répartition par Catégorie</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {data.expensesByCategory.length === 0 ? (
                            <p className="text-sm text-zinc-500">Aucune dépense ce mois-ci.</p>
                        ) : (
                            data.expensesByCategory.map((exp) => {
                                const percent = data.totalExpense > 0 ? (exp.amount / data.totalExpense) * 100 : 0;
                                return (
                                    <div key={exp.categoryId} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: exp.color }}
                                                />
                                                <span className="font-medium">{exp.name}</span>
                                            </div>
                                            <span className="font-bold">{exp.amount.toFixed(2)} {currency}</span>
                                        </div>
                                        <Progress value={percent} indicatorColor={`bg-[${exp.color}]`} />
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Alertes & Budgets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {categories.map((cat) => {
                            if (!cat.monthlyThreshold) return null;
                            const expenseForCat = data.expensesByCategory.find(e => e.categoryId === cat.id)?.amount || 0;
                            const thresholdPercent = (expenseForCat / cat.monthlyThreshold) * 100;
                            const isOverBudget = thresholdPercent >= 100;
                            const isWarning = thresholdPercent >= 80 && !isOverBudget;

                            return (
                                <div key={cat.id} className="space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1">
                                        <span className="font-medium flex items-center gap-2">
                                            {cat.name} plafond
                                            {isOverBudget && <span className="text-xs bg-valex-danger/10 text-valex-danger px-2 py-0.5 rounded-full">Dépassé</span>}
                                            {isWarning && <span className="text-xs bg-valex-warning/10 text-valex-warning px-2 py-0.5 rounded-full">Attention</span>}
                                        </span>
                                        <span className="text-zinc-500">
                                            {expenseForCat.toFixed(2)} {currency} / {cat.monthlyThreshold} {currency}
                                        </span>
                                    </div>
                                    <Progress
                                        value={Math.min(thresholdPercent, 100)}
                                        indicatorColor={isOverBudget ? "bg-valex-danger" : isWarning ? "bg-valex-warning" : "bg-valex-primary"}
                                    />
                                </div>
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
