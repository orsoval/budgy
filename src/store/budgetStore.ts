import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
    type: TransactionType;
    monthlyThreshold?: number | null;
}

export interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    categoryId: string;
    accountId: string;
    date: string; // ISO string
    description: string;
}

export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
    id: string;
    categoryId: string;
    accountId: string;
    amount: number;
    type: TransactionType;
    description: string;
    frequency: RecurringFrequency;
    nextDate: string;
    isActive: boolean;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CASH' | 'INVESTMENT' | 'OTHER';

export interface Account {
    id: string;
    name: string;
    type: AccountType;
    initialBalance: number;
    color: string;
    icon: string;
}

export interface SavingGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    color: string;
    deadline?: string | null;
}

interface BudgetStore {
    transactions: Transaction[];
    categories: Category[];
    accounts: Account[];
    recurringTransactions: RecurringTransaction[];
    savingGoals: SavingGoal[];
    globalMonthlyThreshold: number;
    displayName: string;
    currency: string;
    locale: string;
    initialized: boolean;
    activeAccountId: string | null;
    initialize: (userId: string) => Promise<void>;
    updateProfile: (data: { displayName: string; currency: string; locale: string; globalMonthlyThreshold: number }) => void;
    setActiveAccountId: (id: string | null) => void;
    
    // Account Actions
    addAccount: (acc: Omit<Account, 'id'>, userId: string) => Promise<void>;
    editAccount: (id: string, acc: Omit<Account, 'id'>, userId: string) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;

    // Transaction Actions
    addTransaction: (tx: Omit<Transaction, 'id'>, userId: string) => Promise<void>;
    editTransaction: (id: string, tx: Omit<Transaction, 'id'>, userId: string) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    
    // Other Actions
    addCategory: (cat: Omit<Category, 'id'>, userId: string) => Promise<void>;
    editCategory: (id: string, cat: Omit<Category, 'id'>, userId: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    updateCategoryThreshold: (categoryId: string, threshold: number | null, userId: string) => Promise<void>;
    addRecurring: (r: Omit<RecurringTransaction, 'id'>, userId: string) => Promise<void>;
    editRecurring: (id: string, r: Omit<RecurringTransaction, 'id'>, userId: string) => Promise<void>;
    deleteRecurring: (id: string) => Promise<void>;
    applyRecurringTransactions: (userId: string) => Promise<void>;
    addSavingGoal: (goal: Omit<SavingGoal, 'id'>, userId: string) => Promise<void>;
    editSavingGoal: (id: string, goal: Omit<SavingGoal, 'id'>, userId: string) => Promise<void>;
    deleteSavingGoal: (id: string) => Promise<void>;
    getDashboardData: (monthDate: Date, accountId?: string) => {
        totalIncome: number;
        totalExpense: number;
        balance: number;
        expensesByCategory: { categoryId: string; amount: number; name: string; color: string }[];
    };
}

let isApplyingRecurring = false;

export const useBudgetStore = create<BudgetStore>((set, get) => ({
    transactions: [],
    categories: [],
    accounts: [],
    recurringTransactions: [],
    savingGoals: [],
    globalMonthlyThreshold: 2000,
    displayName: '',
    currency: '€',
    locale: 'fr-FR',
    initialized: false,
    activeAccountId: null,

    initialize: async (userId) => {
        // Fetch Profiles
        const { data: profile } = await supabase
            .from('profiles')
            .select('global_monthly_threshold, display_name, currency, locale')
            .eq('id', userId)
            .single();

        // Fetch Accounts
        const { data: accountsData } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        // Fetch Categories
        const { data: categoriesData } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', userId);

        // Fetch Transactions
        const { data: transactionsData } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        // Fetch Recurring
        const { data: recurringData } = await supabase
            .from('recurring_transactions')
            .select('*')
            .eq('user_id', userId);

        // Fetch Saving Goals
        const { data: savingGoalsData } = await supabase
            .from('saving_goals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        set({
            globalMonthlyThreshold: profile?.global_monthly_threshold || 2000,
            displayName: profile?.display_name || '',
            currency: profile?.currency || '€',
            locale: profile?.locale || 'fr-FR',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            accounts: (accountsData || []).map((a: Record<string, any>) => ({
                id: a.id,
                name: a.name,
                type: a.type,
                initialBalance: a.initial_balance,
                color: a.color,
                icon: a.icon
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            categories: (categoriesData || []).map((c: Record<string, any>) => ({
                id: c.id,
                name: c.name,
                color: c.color,
                icon: c.icon,
                type: c.type,
                monthlyThreshold: c.monthly_threshold
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transactions: (transactionsData || []).map((t: Record<string, any>) => ({
                id: t.id,
                amount: t.amount,
                type: t.type,
                categoryId: t.category_id,
                accountId: t.account_id,
                date: t.date,
                description: t.description
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recurringTransactions: (recurringData || []).map((r: Record<string, any>) => ({
                id: r.id,
                categoryId: r.category_id,
                accountId: r.account_id,
                amount: r.amount,
                type: r.type,
                description: r.description,
                frequency: r.frequency,
                nextDate: r.next_date,
                isActive: r.is_active
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            savingGoals: (savingGoalsData || []).map((g: Record<string, any>) => ({
                id: g.id,
                name: g.name,
                targetAmount: g.target_amount,
                currentAmount: g.current_amount,
                color: g.color,
                deadline: g.deadline,
            })),
            initialized: true
        });
    },

    updateProfile: (data) => {
        set({
            displayName: data.displayName,
            currency: data.currency,
            locale: data.locale,
            globalMonthlyThreshold: data.globalMonthlyThreshold,
        });
    },

    setActiveAccountId: (id) => set({ activeAccountId: id }),

    addAccount: async (acc, userId) => {
        const { data, error } = await supabase.from('accounts').insert({
            user_id: userId,
            name: acc.name,
            type: acc.type,
            initial_balance: acc.initialBalance,
            color: acc.color,
            icon: acc.icon
        }).select().single();

        if (error) {
            console.error(error);
            return;
        }

        const newAcc: Account = {
            id: data.id,
            name: data.name,
            type: data.type,
            initialBalance: data.initial_balance,
            color: data.color,
            icon: data.icon
        };

        set((state) => ({ accounts: [...state.accounts, newAcc] }));
    },

    editAccount: async (id, acc, userId) => {
        const { error } = await supabase.from('accounts').update({
            name: acc.name,
            type: acc.type,
            initial_balance: acc.initialBalance,
            color: acc.color,
            icon: acc.icon
        }).eq('id', id).eq('user_id', userId);

        if (error) {
            console.error(error);
            return;
        }

        set((state) => ({
            accounts: state.accounts.map((a) => (a.id === id ? { ...acc, id } : a)),
        }));
    },

    deleteAccount: async (id) => {
        const { error } = await supabase.from('accounts').delete().eq('id', id);
        if (!error) {
            set((state) => ({ 
                accounts: state.accounts.filter((a) => a.id !== id),
                transactions: state.transactions.filter((tx) => tx.accountId !== id),
                recurringTransactions: state.recurringTransactions.filter((rt) => rt.accountId !== id)
            }));
        }
    },

    addTransaction: async (tx, userId) => {
        const { data, error } = await supabase.from('transactions').insert({
            user_id: userId,
            category_id: tx.categoryId,
            account_id: tx.accountId,
            amount: tx.amount,
            type: tx.type,
            date: tx.date,
            description: tx.description
        }).select().single();

        if (error) {
            console.error(error);
            return;
        }

        const newTx: Transaction = {
            id: data.id,
            amount: data.amount,
            type: data.type,
            categoryId: data.category_id,
            accountId: data.account_id,
            date: data.date,
            description: data.description
        };

        set((state) => ({ transactions: [newTx, ...state.transactions] }));
    },

    editTransaction: async (id, tx, userId) => {
        const { error } = await supabase.from('transactions').update({
            category_id: tx.categoryId,
            account_id: tx.accountId,
            amount: tx.amount,
            type: tx.type,
            date: tx.date,
            description: tx.description
        }).eq('id', id).eq('user_id', userId);

        if (error) {
            console.error(error);
            return;
        }

        set((state) => ({
            transactions: state.transactions.map((t) => (t.id === id ? { ...tx, id } : t)),
        }));
    },

    deleteTransaction: async (id) => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (!error) {
            set((state) => ({ transactions: state.transactions.filter((tx) => tx.id !== id) }));
        }
    },

    addCategory: async (cat, userId) => {
        const { data, error } = await supabase.from('categories').insert({
            user_id: userId,
            name: cat.name,
            color: cat.color,
            icon: cat.icon,
            type: cat.type,
            monthly_threshold: cat.monthlyThreshold
        }).select().single();

        if (error) {
            console.error(error);
            return;
        }

        const newCat: Category = {
            id: data.id,
            name: data.name,
            color: data.color,
            icon: data.icon,
            type: data.type,
            monthlyThreshold: data.monthly_threshold
        };

        set((state) => ({ categories: [...state.categories, newCat] }));
    },

    editCategory: async (id, cat, userId) => {
        const { error } = await supabase.from('categories').update({
            name: cat.name,
            color: cat.color,
            icon: cat.icon,
            type: cat.type,
            monthly_threshold: cat.monthlyThreshold
        }).eq('id', id).eq('user_id', userId);

        if (error) {
            console.error(error);
            return;
        }

        set((state) => ({
            categories: state.categories.map((c) => (c.id === id ? { ...cat, id } : c)),
        }));
    },

    deleteCategory: async (id) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) {
            set((state) => ({
                categories: state.categories.filter((c) => c.id !== id),
            }));
        }
    },

    updateCategoryThreshold: async (categoryId, threshold, userId) => {
        const { error } = await supabase.from('categories').update({
            monthly_threshold: threshold
        }).eq('id', categoryId).eq('user_id', userId);

        if (!error) {
            set((state) => ({
                categories: state.categories.map((c) =>
                    c.id === categoryId ? { ...c, monthlyThreshold: threshold } : c
                ),
            }));
        }
    },

    addRecurring: async (r, userId) => {
        const { data, error } = await supabase.from('recurring_transactions').insert({
            user_id: userId,
            category_id: r.categoryId,
            account_id: r.accountId,
            amount: r.amount,
            type: r.type,
            description: r.description,
            frequency: r.frequency,
            next_date: r.nextDate,
            is_active: r.isActive
        }).select().single();

        if (!error && data) {
            const newR: RecurringTransaction = {
                id: data.id,
                categoryId: data.category_id,
                accountId: data.account_id,
                amount: data.amount,
                type: data.type,
                description: data.description,
                frequency: data.frequency,
                nextDate: data.next_date,
                isActive: data.is_active
            };
            set((state) => ({ recurringTransactions: [...state.recurringTransactions, newR] }));

            // Automatically apply if it's due today or in the past
            if (newR.nextDate <= new Date().toISOString().split('T')[0]) {
                get().applyRecurringTransactions(userId);
            }
        }
    },

    editRecurring: async (id, r, userId) => {
        const { error } = await supabase.from('recurring_transactions').update({
            category_id: r.categoryId,
            account_id: r.accountId,
            amount: r.amount,
            type: r.type,
            description: r.description,
            frequency: r.frequency,
            next_date: r.nextDate,
            is_active: r.isActive
        }).eq('id', id).eq('user_id', userId);

        if (!error) {
            set((state) => ({
                recurringTransactions: state.recurringTransactions.map((x) =>
                    x.id === id ? { ...r, id } : x
                ),
            }));
        }
    },

    deleteRecurring: async (id) => {
        const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
        if (!error) {
            set((state) => ({
                recurringTransactions: state.recurringTransactions.filter((x) => x.id !== id),
            }));
        }
    },

    applyRecurringTransactions: async (userId) => {
        if (isApplyingRecurring) return;
        isApplyingRecurring = true;

        try {
            const { recurringTransactions } = get();
            const today = new Date().toISOString().split('T')[0];

            for (const r of recurringTransactions) {
                if (!r.isActive || r.nextDate > today) continue;

                let currentDateStr = r.nextDate;

                while (currentDateStr <= today) {
                    // Create actual transaction
                    const { data, error } = await supabase.from('transactions').insert({
                        user_id: userId,
                        category_id: r.categoryId,
                        account_id: r.accountId,
                        amount: r.amount,
                        type: r.type,
                        date: currentDateStr,
                        description: `${r.description} (récurrent)`
                    }).select().single();

                    if (error || !data) break;

                    const newTx: Transaction = {
                        id: data.id,
                        amount: data.amount,
                        type: data.type,
                        categoryId: data.category_id,
                        accountId: data.account_id,
                        date: data.date,
                        description: data.description
                    };

                    set((state) => ({ transactions: [newTx, ...state.transactions] }));

                    // Advance next_date
                    const d = new Date(currentDateStr);
                    if (r.frequency === 'weekly') d.setDate(d.getDate() + 7);
                    else if (r.frequency === 'monthly') d.setMonth(d.getMonth() + 1);
                    else if (r.frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);

                    const nextDateStr = d.toISOString().split('T')[0];
                    if (currentDateStr === nextDateStr) break;
                    currentDateStr = nextDateStr;
                }

                if (currentDateStr !== r.nextDate) {
                    await supabase.from('recurring_transactions').update({
                        next_date: currentDateStr
                    }).eq('id', r.id);

                    set((state) => ({
                        recurringTransactions: state.recurringTransactions.map((x) =>
                            x.id === r.id ? { ...x, nextDate: currentDateStr } : x
                        ),
                    }));
                }
            }
        } finally {
            isApplyingRecurring = false;
        }
    },

    addSavingGoal: async (goal, userId) => {
        const { data, error } = await supabase.from('saving_goals').insert({
            user_id: userId,
            name: goal.name,
            target_amount: goal.targetAmount,
            current_amount: goal.currentAmount,
            color: goal.color,
            deadline: goal.deadline,
        }).select().single();

        if (!error && data) {
            const newGoal: SavingGoal = {
                id: data.id,
                name: data.name,
                targetAmount: data.target_amount,
                currentAmount: data.current_amount,
                color: data.color,
                deadline: data.deadline,
            };
            set((state) => ({ savingGoals: [...state.savingGoals, newGoal] }));
        }
    },

    editSavingGoal: async (id, goal, userId) => {
        const { error } = await supabase.from('saving_goals').update({
            name: goal.name,
            target_amount: goal.targetAmount,
            current_amount: goal.currentAmount,
            color: goal.color,
            deadline: goal.deadline,
        }).eq('id', id).eq('user_id', userId);

        if (!error) {
            set((state) => ({
                savingGoals: state.savingGoals.map((g) =>
                    g.id === id ? { ...goal, id } : g
                ),
            }));
        }
    },

    deleteSavingGoal: async (id) => {
        const { error } = await supabase.from('saving_goals').delete().eq('id', id);
        if (!error) {
            set((state) => ({
                savingGoals: state.savingGoals.filter((g) => g.id !== id),
            }));
        }
    },

    getDashboardData: (monthDate, accountId) => {
        const { transactions, categories } = get();
        const month = monthDate.getMonth();
        const year = monthDate.getFullYear();

        // Filter transactions for specific month
        let filteredTx = transactions.filter((tx) => {
            const d = new Date(tx.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });

        // Filter by account if specified
        if (accountId) {
            filteredTx = filteredTx.filter(tx => tx.accountId === accountId);
        }

        let totalIncome = 0;
        let totalExpense = 0;
        const categoryTotals: Record<string, number> = {};

        filteredTx.forEach((tx) => {
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

        // Calculate balance: 
        // If accountId is provided, balance = initialBalance + monthTotal
        // If not, balance = sum of all accounts
        let balance = 0;
        if (accountId) {
            balance = totalIncome - totalExpense;
        } else {
            balance = totalIncome - totalExpense;
        }

        return {
            totalIncome,
            totalExpense,
            balance,
            expensesByCategory,
        };
    },
}));
