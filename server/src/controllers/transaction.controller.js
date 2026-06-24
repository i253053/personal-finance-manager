import * as transactionService from '../services/transaction.service.js';

export async function list(req, res, next) {
  try {
    const result = await transactionService.listTransactions(req.userId, req.validated.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const transaction = await transactionService.getTransaction(
      req.userId,
      req.validated.params.id
    );
    res.json(transaction);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const transaction = await transactionService.createTransaction(req.userId, req.validated.body);
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const transaction = await transactionService.updateTransaction(
      req.userId,
      req.validated.params.id,
      req.validated.body
    );
    res.json(transaction);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await transactionService.deleteTransaction(req.userId, req.validated.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function recent(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const transactions = await transactionService.getRecentTransactions(req.userId, limit);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
}
