import { createChallenge, deleteChallenge, getAllChallenges, getChallengeById, updateChallenge, } from '../services/challenge.service.js';
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function parseChallengeId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw createError('Challenge id must be a positive integer.', 400);
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
function getRequiredDate(value, fieldName) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw createError(`${fieldName} is required.`, 400);
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw createError(`${fieldName} must be a valid date string.`, 400);
    }
    return date;
}
function getOptionalDate(value, fieldName) {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw createError(`${fieldName} must be a valid date string.`, 400);
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw createError(`${fieldName} must be a valid date string.`, 400);
    }
    return date;
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
export async function handleGetChallenges(_req, res, next) {
    try {
        const challenges = await getAllChallenges();
        res.status(200).json({
            success: true,
            data: challenges,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetChallengeById(req, res, next) {
    try {
        const id = parseChallengeId(req.params.id);
        const challenge = await getChallengeById(id);
        res.status(200).json({
            success: true,
            data: challenge,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleCreateChallenge(req, res, next) {
    try {
        const body = req.body;
        const title = getRequiredString(body.title, 'title');
        const description = getRequiredString(body.description, 'description');
        const xpReward = getRequiredInteger(body.xpReward, 'xpReward');
        const difficulty = getRequiredString(body.difficulty, 'difficulty');
        const deadline = getRequiredDate(body.deadline, 'deadline');
        const status = getRequiredString(body.status, 'status');
        const challenge = await createChallenge({
            title,
            description,
            xpReward,
            difficulty,
            deadline,
            status,
        });
        res.status(201).json({
            success: true,
            message: 'Challenge created successfully.',
            data: challenge,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleUpdateChallenge(req, res, next) {
    try {
        const id = parseChallengeId(req.params.id);
        const body = req.body;
        const data = {};
        const title = getOptionalString(body.title, 'title');
        const description = getOptionalString(body.description, 'description');
        const xpReward = getOptionalInteger(body.xpReward, 'xpReward');
        const difficulty = getOptionalString(body.difficulty, 'difficulty');
        const deadline = getOptionalDate(body.deadline, 'deadline');
        const status = getOptionalString(body.status, 'status');
        if (title !== undefined) {
            data.title = title;
        }
        if (description !== undefined) {
            data.description = description;
        }
        if (xpReward !== undefined) {
            data.xpReward = xpReward;
        }
        if (difficulty !== undefined) {
            data.difficulty = difficulty;
        }
        if (deadline !== undefined) {
            data.deadline = deadline;
        }
        if (status !== undefined) {
            data.status = status;
        }
        if (Object.keys(data).length === 0) {
            throw createError('At least one field must be provided for update.', 400);
        }
        const challenge = await updateChallenge(id, data);
        res.status(200).json({
            success: true,
            message: 'Challenge updated successfully.',
            data: challenge,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleDeleteChallenge(req, res, next) {
    try {
        const id = parseChallengeId(req.params.id);
        const challenge = await deleteChallenge(id);
        res.status(200).json({
            success: true,
            message: 'Challenge deleted successfully.',
            data: challenge,
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
