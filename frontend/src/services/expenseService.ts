import api from "../api/axios";

export interface Expense {
    _id: string;
    title: string;
    amount: number;
    category: 'Equipment' | 'Utilities' | 'Salary' | 'Maintenance' | 'Supplies' | 'Marketing' | 'Other';
    date: string;
    notes?: string;
    createdBy: { _id: string; name: string };
    createdAt: string;
}

export interface ExpensePayload {
    title: string;
    amount: number;
    category: string;
    date: string;
    notes?: string;
}

export const expenseService = {
    getExpenses: async (params: {
        page?: number; limit?: number; category?: string;
        search?: string; month?: string; year?: string;
    } = {}) => {
        const { data } = await api.get('/expenses', { params });
        return data;
    },

    createExpense: async (payload: ExpensePayload) => {
        const { data } = await api.post('/expenses', payload);
        return data;
    },

    updateExpense: async (id: string, payload: Partial<ExpensePayload>) => {
        const { data } = await api.patch(`/expenses/${id}`, payload);
        return data;
    },

    deleteExpense: async (id: string) => {
        await api.delete(`/expenses/${id}`);
    },

    getSummary: async () => {
        const { data } = await api.get('/expenses/summary');
        return data;
    },
};