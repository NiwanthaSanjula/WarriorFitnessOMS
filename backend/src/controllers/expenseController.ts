import { Request, Response, NextFunction } from 'express';
import { Expense } from '../models/Expense.js';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── GET /expenses ─────────────────────────────────────────────────────────────
// Query params: page, limit, category, search, month, year
export const getExpenses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page     = parseInt(req.query.page as string)     || 1;
        const limit    = parseInt(req.query.limit as string)    || 15;
        const category = req.query.category as string;
        const search   = req.query.search   as string;
        const month    = req.query.month    as string; // 1-12
        const year     = req.query.year     as string;

        const filter: any = {};
        if (category && category !== 'All') filter.category = category;
        if (search)   filter.title = { $regex: search, $options: 'i' };
        if (month && year) {
            const start = new Date(parseInt(year), parseInt(month) - 1, 1);
            const end   = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
            filter.date = { $gte: start, $lte: end };
        } else if (year) {
            const start = new Date(parseInt(year), 0, 1);
            const end   = new Date(parseInt(year), 11, 31, 23, 59, 59);
            filter.date = { $gte: start, $lte: end };
        }

        const total    = await Expense.countDocuments(filter);
        const expenses = await Expense.find(filter)
            .populate('createdBy', 'name')
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Total for current filter
        const totalAmount = await Expense.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Monthly breakdown for chart (last 12 months)
        const now = new Date();
        const chartStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const monthlyBreakdown = await Expense.aggregate([
            { $match: { date: { $gte: chartStart } } },
            { $group: {
                _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                total: { $sum: '$amount' }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Category breakdown
        const categoryBreakdown = await Expense.aggregate([
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);

        res.status(200).json({
            expenses,
            pagination: { total, page, pages: Math.ceil(total / limit), limit },
            totalAmount: totalAmount[0]?.total || 0,
            monthlyBreakdown,
            categoryBreakdown,
        });
    } catch (err) { next(err); }
};

// ── POST /expenses ────────────────────────────────────────────────────────────
export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, amount, category, date, notes } = req.body;
        const expense = await Expense.create({
            title, amount, category,
            date: date ? new Date(date) : new Date(),
            notes,
            createdBy: (req as any).user._id,
        });
        res.status(201).json({ status: 'success', data: expense });
    } catch (err) { next(err); }
};

// ── PATCH /expenses/:id ───────────────────────────────────────────────────────
export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            { ...req.body, date: req.body.date ? new Date(req.body.date) : undefined },
            { new: true, runValidators: true }
        );
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.status(200).json({ status: 'success', data: expense });
    } catch (err) { next(err); }
};

// ── DELETE /expenses/:id ──────────────────────────────────────────────────────
export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.status(204).send();
    } catch (err) { next(err); }
};

// ── GET /expenses/summary ─────────────────────────────────────────────────────
// Used by admin dashboard for net profit card
export const getExpenseSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const now      = new Date();
        const start30  = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);

        const [recent30, allTime] = await Promise.all([
            Expense.aggregate([
                { $match: { date: { $gte: start30 } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Expense.aggregate([
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        res.status(200).json({
            recent30Expenses: recent30[0]?.total || 0,
            allTimeExpenses:  allTime[0]?.total  || 0,
        });
    } catch (err) { next(err); }
};