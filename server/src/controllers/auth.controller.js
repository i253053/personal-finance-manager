import * as authService from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.validated.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.validated.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const result = await authService.refresh(req.validated.body.refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logout(req.userId, req.body.refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getUserById(req.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    const user = await authService.updateUser(req.userId, req.validated.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteMe(req, res, next) {
  try {
    await authService.deleteUser(req.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
