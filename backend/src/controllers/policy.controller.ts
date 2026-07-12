import type { NextFunction, Request, Response } from 'express';
import {
  createPolicy,
  deletePolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
} from '../services/policy.service.js';

type PolicyBody = {
  title?: unknown;
  description?: unknown;
  status?: unknown;
};

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function parsePolicyId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError('ESG Policy id must be a positive integer.', 400);
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
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError(`${fieldName} must be a non-empty string.`, 400);
  }

  return value.trim();
}

export async function handleGetPolicies(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, title } = req.query as Record<string, string | undefined>;

    const policies = await getAllPolicies({
      status,
      title,
    });

    res.status(200).json({
      success: true,
      data: policies,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetPolicyById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parsePolicyId(req.params.id as string);
    const policy = await getPolicyById(id);

    res.status(200).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleCreatePolicy(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as PolicyBody;

    const title = getRequiredString(body.title, 'title');
    const description = getRequiredString(body.description, 'description');
    const status = getRequiredString(body.status, 'status');

    const policy = await createPolicy({
      title,
      description,
      status,
    });

    res.status(201).json({
      success: true,
      message: 'ESG Policy created successfully.',
      data: policy,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdatePolicy(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parsePolicyId(req.params.id as string);
    const body = req.body as PolicyBody;

    const data: Record<string, unknown> = {};

    const title = getOptionalString(body.title, 'title');
    const description = getOptionalString(body.description, 'description');
    const status = getOptionalString(body.status, 'status');

    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;

    if (Object.keys(data).length === 0) {
      throw createError('At least one field must be provided for update.', 400);
    }

    const policy = await updatePolicy(id, data);

    res.status(200).json({
      success: true,
      message: 'ESG Policy updated successfully.',
      data: policy,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeletePolicy(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parsePolicyId(req.params.id as string);
    const policy = await handleDeletePolicyHelper(id);

    res.status(200).json({
      success: true,
      message: 'ESG Policy deleted successfully.',
      data: policy,
    });
  } catch (error) {
    next(error);
  }
}

// Wrapper to avoid duplicate declaration error when calling deletePolicy
async function handleDeletePolicyHelper(id: number) {
  return deletePolicy(id);
}
