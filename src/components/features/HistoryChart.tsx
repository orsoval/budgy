import { useMemo } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export function HistoryChart() {
    const transactions = useBudgetStore((state) => state.transactions);
    const currency = useBudgetStore((state) => state.currency);

    const chartData = useMemo(() => {
        const monthsData: Record<string, { income: number; expense: number; monthName: string }> = {};
        const today = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthName = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
            monthsData[key] = { income: 0, expense: 0, monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1) };
        }

        transactions.forEach(tx => {
            const d = new Date(tx.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (monthsData[key]) {
                if (tx.type === 'INCOME') {
                    monthsData[key].income += tx.amount;
                } else {
                    monthsData[key].expense += tx.amount;
                }
            }
        });

        return Object.values(monthsData);
    }, [transactions]);

    const maxAmount = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Évolution sur 6 mois</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-48 mt-4 flex items-end gap-2 sm:gap-4">
                    {chartData.map((data, i) => {
                        const incomeHeight = (data.income / maxAmount) * 100;
                        const expenseHeight = (data.expense / maxAmount) * 100;

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex justify-center items-end gap-1 h-36">
                                    <div
                                        className="w-full max-w-4 bg-valex-success rounded-t-sm relative group"
                                        style={{ height: `${incomeHeight}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs bg-zinc-800 text-white px-2 py-1 rounded whitespace-nowrap z-10 transition-opacity">
                                            Revenus: {data.income.toFixed(0)} {currency}
                                        </div>
                                    </div>
                                    <div
                                        className="w-full max-w-4 bg-valex-danger rounded-t-sm relative group"
                                        style={{ height: `${expenseHeight}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs bg-zinc-800 text-white px-2 py-1 rounded whitespace-nowrap z-10 transition-opacity">
                                            Dépenses: {data.expense.toFixed(0)} {currency}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-zinc-500 font-medium">{data.monthName}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-valex-success"></div>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Revenus</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-valex-danger"></div>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Dépenses</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
