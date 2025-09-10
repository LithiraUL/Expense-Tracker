import mongoose from 'mongoose';


const expenseSchema = new mongoose.Schema(
{
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
title: { type: String, required: true },
amount: { type: Number, required: true, min: 0 },
category: { type: String, required: true },
date: { type: Date, required: true },
note: { type: String, default: '' }
},
{ timestamps: true }
);


expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });


export default mongoose.model('Expense', expenseSchema);