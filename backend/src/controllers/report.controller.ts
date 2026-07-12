import type { NextFunction, Request, Response } from 'express';
import {
  getEnvironmentReport,
  getEsgSummary,
  getGovernanceReport,
  getSocialReport,
} from '../services/report.service.js';

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function parseOptionalPositiveInt(value: unknown, fieldName: string): number | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createError(`${fieldName} must be a positive integer.`, 400);
  }
  return parsed;
}

function extractCommonFilters(req: Request) {
  const { departmentId, employeeId, startDate, endDate } = req.query as Record<string, string | undefined>;
  return {
    departmentId: parseOptionalPositiveInt(departmentId, 'departmentId'),
    employeeId: parseOptionalPositiveInt(employeeId, 'employeeId'),
    startDate,
    endDate,
  };
}

export async function handleGetEnvironmentReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { departmentId, startDate, endDate } = extractCommonFilters(req);
    const report = await getEnvironmentReport({ departmentId, startDate, endDate });

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetSocialReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { departmentId, employeeId, startDate, endDate } = extractCommonFilters(req);
    const report = await getSocialReport({ departmentId, employeeId, startDate, endDate });

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetGovernanceReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { departmentId, startDate, endDate } = extractCommonFilters(req);
    const report = await getGovernanceReport({ departmentId, startDate, endDate });

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetEsgSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const { departmentId, employeeId, startDate, endDate } = extractCommonFilters(req);
    const summary = await getEsgSummary({ departmentId, employeeId, startDate, endDate });

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}
