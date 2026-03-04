import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
    title: string;
    amount: number;
    category: 'Equipment' | 'Utilities' | 'Salary' | 'Maintenance' | 'Supplies' | 'Marketing' | 'Other';
    date: Date;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
}

const ExpenseSchema = new Schema<IExpense>(
    {
        title:    { type: String, required: true, trim: true },
        amount:   { type: Number, required: true, min: 0 },
        category: {
            type: String,
            enum: ['Equipment', 'Utilities', 'Salary', 'Maintenance', 'Supplies', 'Marketing', 'Other'],
            required: true,
        },
        date:      { type: Date, required: true, default: Date.now },
        notes:     { type: String, trim: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);