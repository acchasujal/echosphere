import { awardEligibleBadgesToEmployee, createBadge, deleteBadge, getAllBadges, getBadgeById, updateBadge, } from '../services/badge.service.js';
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function parseBadgeId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw createError('Badge id must be a positive integer.', 400);
    }
    return id;
}
function parseEmployeeId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw createError('Employee id must be a positive integer.', 400);
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
export async function handleGetBadges(_req, res, next) {
    try {
        const badges = await getAllBadges();
        res.status(200).json({
            success: true,
            data: badges,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetBadgeById(req, res, next) {
    try {
        const id = parseBadgeId(req.params.id);
        const badge = await getBadgeById(id);
        res.status(200).json({
            success: true,
            data: badge,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleCreateBadge(req, res, next) {
    try {
        const body = req.body;
        const name = getRequiredString(body.name, 'name');
        const description = getRequiredString(body.description, 'description');
        const xpRequired = getRequiredInteger(body.xpRequired, 'xpRequired');
        const icon = getRequiredString(body.icon, 'icon');
        const badge = await createBadge({ name, description, xpRequired, icon });
        res.status(201).json({
            success: true,
            message: 'Badge created successfully.',
            data: badge,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleUpdateBadge(req, res, next) {
    try {
        const id = parseBadgeId(req.params.id);
        const body = req.body;
        const data = {};
        const name = getOptionalString(body.name, 'name');
        const description = getOptionalString(body.description, 'description');
        const xpRequired = getOptionalInteger(body.xpRequired, 'xpRequired');
        const icon = getOptionalString(body.icon, 'icon');
        if (name !== undefined) {
            data.name = name;
        }
        if (description !== undefined) {
            data.description = description;
        }
        if (xpRequired !== undefined) {
            data.xpRequired = xpRequired;
        }
        if (icon !== undefined) {
            data.icon = icon;
        }
        if (Object.keys(data).length === 0) {
            throw createError('At least one field must be provided for update.', 400);
        }
        const badge = await updateBadge(id, data);
        res.status(200).json({
            success: true,
            message: 'Badge updated successfully.',
            data: badge,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleDeleteBadge(req, res, next) {
    try {
        const id = parseBadgeId(req.params.id);
        const badge = await deleteBadge(id);
        res.status(200).json({
            success: true,
            message: 'Badge deleted successfully.',
            data: badge,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleAwardBadges(req, res, next) {
    try {
        const employeeId = parseEmployeeId(req.params.employeeId);
        const result = await awardEligibleBadgesToEmployee(employeeId);
        res.status(200).json({
            success: true,
            message: `${result.awarded.length} badge(s) awarded.`,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
