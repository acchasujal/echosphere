import { createReward, deleteReward, getAllRewards, getRewardById, redeemReward, updateReward, } from '../services/reward.service.js';
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function parseRewardId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw createError('Reward id must be a positive integer.', 400);
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
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
        throw createError(`${fieldName} is required and must be a non-negative integer.`, 400);
    }
    return value;
}
function getOptionalInteger(value, fieldName) {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
        throw createError(`${fieldName} must be a non-negative integer.`, 400);
    }
    return value;
}
function getErrorResponse(error) {
    if (error instanceof Error) {
        const statusCode = error.statusCode ?? 500;
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
export async function handleGetRewards(_req, res, next) {
    try {
        const rewards = await getAllRewards();
        res.status(200).json({
            success: true,
            data: rewards,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetRewardById(req, res, next) {
    try {
        const id = parseRewardId(req.params.id);
        const reward = await getRewardById(id);
        res.status(200).json({
            success: true,
            data: reward,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleCreateReward(req, res, next) {
    try {
        const body = req.body;
        const name = getRequiredString(body.name, 'name');
        const description = getRequiredString(body.description, 'description');
        const pointsRequired = getRequiredInteger(body.pointsRequired, 'pointsRequired');
        const stock = getRequiredInteger(body.stock, 'stock');
        const reward = await createReward({
            name,
            description,
            pointsRequired,
            stock,
        });
        res.status(201).json({
            success: true,
            message: 'Reward created successfully.',
            data: reward,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleUpdateReward(req, res, next) {
    try {
        const id = parseRewardId(req.params.id);
        const body = req.body;
        const data = {};
        const name = getOptionalString(body.name, 'name');
        const description = getOptionalString(body.description, 'description');
        const pointsRequired = getOptionalInteger(body.pointsRequired, 'pointsRequired');
        const stock = getOptionalInteger(body.stock, 'stock');
        if (name !== undefined) {
            data.name = name;
        }
        if (description !== undefined) {
            data.description = description;
        }
        if (pointsRequired !== undefined) {
            data.pointsRequired = pointsRequired;
        }
        if (stock !== undefined) {
            data.stock = stock;
        }
        if (Object.keys(data).length === 0) {
            throw createError('At least one field must be provided for update.', 400);
        }
        const reward = await updateReward(id, data);
        res.status(200).json({
            success: true,
            message: 'Reward updated successfully.',
            data: reward,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleDeleteReward(req, res, next) {
    try {
        const id = parseRewardId(req.params.id);
        const reward = await deleteReward(id);
        res.status(200).json({
            success: true,
            message: 'Reward deleted successfully.',
            data: reward,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleRedeemReward(req, res, next) {
    try {
        const rewardId = parseRewardId(req.params.id);
        const body = req.body;
        const employeeId = getRequiredInteger(body.employeeId, 'employeeId');
        const redemption = await redeemReward(rewardId, employeeId);
        res.status(201).json({
            success: true,
            message: 'Reward redeemed successfully.',
            data: redemption,
        });
    }
    catch (error) {
        next(error);
    }
}
export function handleError(error, _req, res, _next) {
    const { statusCode, message } = getErrorResponse(error);
    res.status(statusCode).json({
        success: false,
        message,
    });
}
