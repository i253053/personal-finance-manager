import * as reportService from '../services/report.service.js';

export async function summary(req, res, next) {
  try {
    const { month, year } = req.validated.query;
    const data = await reportService.getSummary(req.userId, month, year);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function trends(req, res, next) {
  try {
    const data = await reportService.getTrends(req.userId, req.validated.query.months);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function categories(req, res, next) {
  try {
    const { startDate, endDate } = req.validated.query;
    const data = await reportService.getCategoryBreakdown(req.userId, startDate, endDate);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function exportCsv(req, res, next) {
  try {
    const { startDate, endDate } = req.validated.query;
    const csv = await reportService.exportCsv(req.userId, startDate, endDate);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
