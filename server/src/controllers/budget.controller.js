import * as budgetService from '../services/budget.service.js';

export async function list(req, res, next) {
  try {
    const { month, year } = req.validated.query;
    const budgets = await budgetService.listBudgets(req.userId, month, year);
    res.json({ data: budgets });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const budget = await budgetService.createBudget(req.userId, req.validated.body);
    res.status(201).json(budget);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const budget = await budgetService.updateBudget(
      req.userId,
      req.validated.params.id,
      req.validated.body
    );
    res.json(budget);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await budgetService.deleteBudget(req.userId, req.validated.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function copy(req, res, next) {
  try {
    const created = await budgetService.copyBudgets(req.userId, req.validated.body);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
}
