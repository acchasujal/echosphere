import { createParticipation, deleteParticipation, getAllParticipations, getParticipationById, updateParticipation, } from '../services/participation.service.js';
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function parseParticipationId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw createError('Participation id must be a positive integer.', 400);
    }
    return id;
}
function getRequiredInteger(value, fieldName) {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw createError(`${fieldName} is required and must be an integer.`, 400);
    }
    return value;
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
export async function handleGetParticipations(_req, res, next) {
    try {
        const participations = await getAllParticipations();
        res.status(200).json({
            success: true,
            data: participations,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetParticipationById(req, res, next) {
    try {
        const id = parseParticipationId(req.params.id);
        const participation = await getParticipationById(id);
        res.status(200).json({
            success: true,
            data: participation,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleCreateParticipation(req, res, next) {
    try {
        const body = req.body;
        const employeeId = getRequiredInteger(body.employeeId, 'employeeId');
        const challengeId = getRequiredInteger(body.challengeId, 'challengeId');
        const status = getRequiredString(body.status, 'status');
        const proof = getOptionalString(body.proof, 'proof');
        const participation = await createParticipation({
            employeeId,
            challengeId,
            status,
            ...(proof !== undefined ? { proof } : {}),
        });
        res.status(201).json({
            success: true,
            message: 'Participation created successfully.',
            data: participation,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleUpdateParticipation(req, res, next) {
    try {
        const id = parseParticipationId(req.params.id);
        const body = req.body;
        const data = {};
        const status = getOptionalString(body.status, 'status');
        const proof = getOptionalString(body.proof, 'proof');
        if (status !== undefined) {
            data.status = status;
        }
        if (proof !== undefined) {
            data.proof = proof;
        }
        if (Object.keys(data).length === 0) {
            throw createError('At least one field must be provided for update.', 400);
        }
        const participation = await updateParticipation(id, data);
        res.status(200).json({
            success: true,
            message: 'Participation updated successfully.',
            data: participation,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleDeleteParticipation(req, res, next) {
    try {
        const id = parseParticipationId(req.params.id);
        const participation = await deleteParticipation(id);
        res.status(200).json({
            success: true,
            message: 'Participation deleted successfully.',
            data: participation,
        });
    }
    catch (error) {
        next(error);
    }
}
