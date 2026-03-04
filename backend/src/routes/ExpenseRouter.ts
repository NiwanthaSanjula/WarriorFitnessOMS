import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { getExpenses,
        createExpense,
        updateExpense,
        deleteExpense,
        getExpenseSummary, } from '../controllers/ExpenseController.js';


const expenseRouter = express.Router();

// All expense routes require admin
expenseRouter.use(protect, restrictTo('admin'));

expenseRouter.get('/summary', getExpenseSummary);
expenseRouter.get('/',        getExpenses);
expenseRouter.post('/',       createExpense);
expenseRouter.patch('/:id',   updateExpense);
expenseRouter.delete('/:id',  deleteExpense);

export default expenseRouter;