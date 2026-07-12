import { createPolicy, deletePolicy, getAllPolicies, getPolicyById, updatePolicy, } from '../services/policy.service.js';
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function parsePolicyId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw createError('ESG Policy id must be a positive integer.', 400);
    }
    return id;
}
function getRequiredString(value, fieldName) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw createError(`${fieldName} is required.`, 400);
    }
    return value.trim();
}
function getOptionalString(value, fieldName) {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw createError(`${fieldName} must be a non-empty string.`, 400);
    }
    return value.trim();
}
export async function handleGetPolicies(req, res, next) {
    try {
        const { status, title } = req.query;
        const policies = await getAllPolicies({
            status,
            title,
        });
        res.status(200).json({
            success: true,
            data: policies,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetPolicyById(req, res, next) {
    try {
        const id = parsePolicyId(req.params.id);
        const policy = await getPolicyById(id);
        res.status(200).json({
            success: true,
            data: policy,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleCreatePolicy(req, res, next) {
    try {
        const body = req.body;
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
    }
    catch (error) {
        next(error);
    }
}
export async function handleUpdatePolicy(req, res, next) {
    try {
        const id = parsePolicyId(req.params.id);
        const body = req.body;
        const data = {};
        const title = getOptionalString(body.title, 'title');
        const description = getOptionalString(body.description, 'description');
        const status = getOptionalString(body.status, 'status');
        if (title !== undefined)
            data.title = title;
        if (description !== undefined)
            data.description = description;
        if (status !== undefined)
            data.status = status;
        if (Object.keys(data).length === 0) {
            throw createError('At least one field must be provided for update.', 400);
        }
        const policy = await updatePolicy(id, data);
        res.status(200).json({
            success: true,
            message: 'ESG Policy updated successfully.',
            data: policy,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleDeletePolicy(req, res, next) {
    try {
        const id = parsePolicyId(req.params.id);
        const policy = await handleDeletePolicyHelper(id);
        res.status(200).json({
            success: true,
            message: 'ESG Policy deleted successfully.',
            data: policy,
        });
    }
    catch (error) {
        next(error);
    }
}
// Wrapper to avoid duplicate declaration error when calling deletePolicy
async function handleDeletePolicyHelper(id) {
    return deletePolicy(id);
}
