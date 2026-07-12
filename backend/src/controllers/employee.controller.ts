import type { NextFunction, Request, Response } from 'express';
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
} from '../services/employee.service.js';

type EmployeeBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  role?: unknown;
  departmentId?: unknown;
  xp?: unknown;
  points?: unknown;
};

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function parseEmployeeId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError('Employee id must be a positive integer.', 400);
  }

  return id;
}

function getRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError(`${fieldName} is required.`, 400);
  }

  return value.trim();
}

function getOptionalString(value: unknown, fieldName: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError(`${fieldName} must be a non-empty string.`, 400);
  }

  return value.trim();
}

function getOptionalInteger(value: unknown, fieldName: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw createError(`${fieldName} must be an integer.`, 400);
  }

  return value;
}

function getOptionalNumber(value: unknown, fieldName: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw createError(`${fieldName} must be a number.`, 400);
  }

  return value;
}

function getErrorResponse(error: unknown) {
  if (error instanceof Error) {
    const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
    return {
      statusCode,
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    message: 'Unexpected server error.',
  };
}

export async function handleGetEmployees(_req: Request, res: Response, next: NextFunction) {
  try {
    const employees = await getAllEmployees();

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetEmployeeById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseEmployeeId(req.params.id as string);
    const employee = await getEmployeeById(id);

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as EmployeeBody;

    const name = getRequiredString(body.name, 'name');
    const email = getRequiredString(body.email, 'email');
    const password = getRequiredString(body.password, 'password');
    const role = getRequiredString(body.role, 'role');
    const departmentId = getOptionalInteger(body.departmentId, 'departmentId');

    if (departmentId === undefined) {
      throw createError('departmentId is required.', 400);
    }

    const xp = getOptionalNumber(body.xp, 'xp');
    const points = getOptionalNumber(body.points, 'points');

    const employee = await createEmployee({
      name,
      email,
      password,
      role,
      departmentId,
      ...(xp !== undefined ? { xp } : {}),
      ...(points !== undefined ? { points } : {}),
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseEmployeeId(req.params.id as string);
    const body = req.body as EmployeeBody;

    const data: Record<string, string | number> = {};

    const name = getOptionalString(body.name, 'name');
    const email = getOptionalString(body.email, 'email');
    const password = getOptionalString(body.password, 'password');
    const role = getOptionalString(body.role, 'role');
    const departmentId = getOptionalInteger(body.departmentId, 'departmentId');
    const xp = getOptionalNumber(body.xp, 'xp');
    const points = getOptionalNumber(body.points, 'points');

    if (name !== undefined) {
      data.name = name;
    }

    if (email !== undefined) {
      data.email = email;
    }

    if (password !== undefined) {
      data.password = password;
    }

    if (role !== undefined) {
      data.role = role;
    }

    if (departmentId !== undefined) {
      data.departmentId = departmentId;
    }

    if (xp !== undefined) {
      data.xp = xp;
    }

    if (points !== undefined) {
      data.points = points;
    }

    if (Object.keys(data).length === 0) {
      throw createError('At least one field must be provided for update.', 400);
    }

    const employee = await updateEmployee(id, data);

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully.',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseEmployeeId(req.params.id as string);
    const employee = await deleteEmployee(id);

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully.',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

export function handleError(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const { statusCode, message } = getErrorResponse(error);

  res.status(statusCode).json({
    success: false,
    message,
  });
}
