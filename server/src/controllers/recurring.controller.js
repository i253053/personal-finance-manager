import * as recurringService from '../services/recurring.service.js';

export async function list(req, res, next) {
  try {
    const data = await recurringService.listRecurring(req.userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const item = await recurringService.createRecurring(req.userId, req.validated.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const item = await recurringService.updateRecurring(
      req.userId,
      req.validated.params.id,
      req.validated.body
    );
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await recurringService.deleteRecurring(req.userId, req.validated.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function process(req, res, next) {
  try {
    const result = await recurringService.processDueRecurring(req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
