import React, { useState, useMemo } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, CalendarDays } from 'lucide-react';
import CountUp from 'react-countup';
const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(value) + ' ' + currency;
};

export const Analytics: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    
    const activeAccountId = useBudgetStore((state) => state.activeAccountId);
    const getYearlyData = useBudgetStore((state) => state.getYearlyData);
    const currency = useBudgetStore((state) => state.currency);

    const { yearlyIncome, yearlyExpense, monthlyData } = useMemo(() => {
        return getYearlyData(selectedYear, activeAccountId || undefined);
    }, [selectedYear, activeAccountId, getYearlyData]);

    const balance = yearlyIncome - yearlyExpense;

    // Find best and worst months
    const savingsByMonth = monthlyData.map(d => ({ month: d.month, saved: d.income - d.expense }));
    const bestMonth = [...savingsByMonth].sort((a, b) => b.saved - a.saved)[0];
    const worstMonth = [...savingsByMonth].sort((a, b) => a.saved - b.saved)[0];

    // Generate year options (from 2024 to current year + 1)
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-xl">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">{label} {selectedYear}</p>
                    {payload.map((p: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                            <span className="text-zinc-600 dark:text-zinc-400">{p.name} :</span>
                            <span className="font-semibold" style={{ color: p.color }}>
                                {formatCurrency(p.value, currency)}
                            </span>
                        </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-sm">
                        <span className="text-zinc-500">Bilan</span>
                        <span className={`font-semibold ${payload[0].value - payload[1].value >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {formatCurrency(payload[0].value - payload[1].value, currency)}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Analyses Annuelles
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Votre bilan financier détaillé sur toute l'année
                    </p>
                </div>
                
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <CalendarDays className="w-4 h-4 text-zinc-400 ml-2" />
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-transparent text-sm font-medium border-none focus:ring-0 text-zinc-900 dark:text-zinc-100 cursor-pointer pr-8"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Revenus Annuels</p>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        <CountUp end={yearlyIncome} duration={1} separator=" " decimals={2} />
                        <span className="ml-1 text-lg">{currency}</span>
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Dépenses Annuelles</p>
                        <div className="p-2 bg-red-500/10 rounded-full">
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        <CountUp end={yearlyExpense} duration={1} separator=" " decimals={2} />
                        <span className="ml-1 text-lg">{currency}</span>
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Bilan Annuel</p>
                        <div className={`p-2 rounded-full ${balance >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                            <TrendingUp className={`w-4 h-4 ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                        </div>
                    </div>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        <CountUp end={balance} duration={1} separator=" " decimals={2} />
                        <span className="ml-1 text-lg">{currency}</span>
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-6">Évolution mensuelle</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={monthlyData}
                            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(161, 161, 170, 0.1)' }} />
                            <Legend 
                                verticalAlign="top" 
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span className="text-zinc-600 dark:text-zinc-400 text-sm ml-1">{value}</span>}
                            />
                            <Bar dataKey="income" name="Revenus" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="expense" name="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Best / Worst months info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bestMonth && bestMonth.saved > 0 && (
                    <div className="bg-gradient-to-br from-emerald-500/5 to-transparent p-5 rounded-2xl border border-emerald-500/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-full">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Meilleur mois d'épargne</p>
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {bestMonth.month} <span className="text-emerald-500 font-bold">+{formatCurrency(bestMonth.saved, currency)}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {worstMonth && worstMonth.saved < 0 && (
                    <div className="bg-gradient-to-br from-red-500/5 to-transparent p-5 rounded-2xl border border-red-500/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-full">
                                <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pire mois (déficit)</p>
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {worstMonth.month} <span className="text-red-500 font-bold">{formatCurrency(worstMonth.saved, currency)}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
