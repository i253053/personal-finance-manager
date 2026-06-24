import * as goalService from '../services/goal.service.js';

export async function list(req, res, next) {
  try {
    const goals = await goalService.listGoals(req.userId);
    res.json({ data: goals });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const goal = await goalService.createGoal(req.userId, req.validated.body);
    res.status(201).json(goal);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const goal = await goalService.updateGoal(req.userId, req.validated.params.id, req.validated.body);
    res.json(goal);
  } catch (err) {
    next(err);
  }
}

export async function contribute(req, res, next) {
  try {
    const goal = await goalService.contributeToGoal(
      req.userId,
      req.validated.params.id,
      req.validated.body.amount
    );
    res.json(goal);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await goalService.deleteGoal(req.userId, req.validated.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
