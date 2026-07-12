import { createCarbonTransaction, deleteCarbonTransaction, getAllCarbonTransactions, getCarbonTransactionById, updateCarbonTransaction, } from '../services/carbonTransaction.service.js';
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function parseCarbonTransactionId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw createError('Carbon transaction id must be a positive integer.', 400);
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
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw createError(`${fieldName} must be a non-empty string.`, 400);
    }
    return value.trim();
}
function getRequiredInteger(value, fieldName) {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw createError(`${fieldName} is required and must be an integer.`, 400);
    }
    return value;
}
function getOptionalInteger(value, fieldName) {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw createError(`${fieldName} must be an integer.`, 400);
    }
    return value;
}
function getRequiredPositiveFloat(value, fieldName) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        throw createError(`${fieldName} is required and must be a number.`, 400);
    }
    return value;
}
function getOptionalFloat(value, fieldName) {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'number' || Number.isNaN(value)) {
        throw createError(`${fieldName} must be a number.`, 400);
    }
    return value;
}
export async function handleGetCarbonTransactions(_req, res, next) {
    try {
        const transactions = await getAllCarbonTransactions();
        res.status(200).json({
            success: true,
            data: transactions,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetCarbonTransactionById(req, res, next) {
    try {
        const id = parseCarbonTransactionId(req.params.id);
        const transaction = await getCarbonTransactionById(id);
        res.status(200).json({
            success: true,
            data: transaction,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleCreateCarbonTransaction(req, res, next) {
    try {
        const body = req.body;
        const departmentId = getRequiredInteger(body.departmentId, 'departmentId');
        const source = getRequiredString(body.source, 'source');
        const quantity = getRequiredPositiveFloat(body.quantity, 'quantity');
        const co2Amount = getRequiredPositiveFloat(body.co2Amount, 'co2Amount');
        const transaction = await createCarbonTransaction({
            departmentId,
            source,
            quantity,
            co2Amount,
        });
        res.status(201).json({
            success: true,
            message: 'Carbon transaction created successfully.',
            data: transaction,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleUpdateCarbonTransaction(req, res, next) {
    try {
        const id = parseCarbonTransactionId(req.params.id);
        const body = req.body;
        const data = {};
        const departmentId = getOptionalInteger(body.departmentId, 'departmentId');
        const source = getOptionalString(body.source, 'source');
        const quantity = getOptionalFloat(body.quantity, 'quantity');
        const co2Amount = getOptionalFloat(body.co2Amount, 'co2Amount');
        if (departmentId !== undefined) {
            data.departmentId = departmentId;
        }
        if (source !== undefined) {
            data.source = source;
        }
        if (quantity !== undefined) {
            data.quantity = quantity;
        }
        if (co2Amount !== undefined) {
            data.co2Amount = co2Amount;
        }
        if (Object.keys(data).length === 0) {
            throw createError('At least one field must be provided for update.', 400);
        }
        const transaction = await updateCarbonTransaction(id, data);
        res.status(200).json({
            success: true,
            message: 'Carbon transaction updated successfully.',
            data: transaction,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleDeleteCarbonTransaction(req, res, next) {
    try {
        const id = parseCarbonTransactionId(req.params.id);
        const transaction = await deleteCarbonTransaction(id);
        res.status(200).json({
            success: true,
            message: 'Carbon transaction deleted successfully.',
            data: transaction,
        });
    }
    catch (error) {
        next(error);
    }
}
