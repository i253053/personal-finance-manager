import * as categoryService from '../services/category.service.js';

export async function list(req, res, next) {
  try {
    const type = req.query.type;
    const categories = await categoryService.listCategories(req.userId, type);
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const category = await categoryService.getCategory(req.userId, req.validated.params.id);
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.userId, req.validated.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const category = await categoryService.updateCategory(
      req.userId,
      req.validated.params.id,
      req.validated.body
    );
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const reassignTo = req.validated.query?.reassignTo;
    await categoryService.deleteCategory(req.userId, req.validated.params.id, reassignTo);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
