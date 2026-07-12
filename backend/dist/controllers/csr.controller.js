import { createCSRActivity, deleteCSRActivity, getAllCSRActivities, getCSRActivityById, updateCSRActivity, } from '../services/csr.service.js';
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function parseCSRActivityId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw createError('CSR Activity id must be a positive integer.', 400);
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
function getRequiredInteger(value, fieldName) {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw createError(`${fieldName} is required and must be an integer.`, 400);
    }
    return value;
}
function getOptionalInteger(value, fieldName) {
    if (value === undefined || value === null) {
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
    if (value === undefined || value === null) {
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
function parseOptionalPositiveInt(value, fieldName) {
    if (value === undefined || value === '')
        return undefined;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw createError(`${fieldName} must be a positive integer.`, 400);
    }
    return parsed;
}
export async function handleGetCSRActivities(req, res, next) {
    try {
        const { status, departmentId, startDate, endDate } = req.query;
        const parsedDeptId = parseOptionalPositiveInt(departmentId, 'departmentId');
        const activities = await getAllCSRActivities({
            status,
            departmentId: parsedDeptId,
            startDate,
            endDate,
        });
        res.status(200).json({
            success: true,
            data: activities,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetCSRActivityById(req, res, next) {
    try {
        const id = parseCSRActivityId(req.params.id);
        const activity = await getCSRActivityById(id);
        res.status(200).json({
            success: true,
            data: activity,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleCreateCSRActivity(req, res, next) {
    try {
        const body = req.body;
        const title = getRequiredString(body.title, 'title');
        const description = getRequiredString(body.description, 'description');
        const category = getRequiredString(body.category, 'category');
        const location = getOptionalString(body.location, 'location');
        const startDate = getRequiredDate(body.startDate, 'startDate');
        const endDate = getRequiredDate(body.endDate, 'endDate');
        const status = getRequiredString(body.status, 'status');
        const pointsReward = getOptionalInteger(body.pointsReward, 'pointsReward');
        const activity = await createCSRActivity({
            title,
            description,
            category,
            location,
            startDate,
            endDate,
            status,
            pointsReward,
        });
        res.status(201).json({
            success: true,
            message: 'CSR Activity created successfully.',
            data: activity,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleUpdateCSRActivity(req, res, next) {
    try {
        const id = parseCSRActivityId(req.params.id);
        ;
        const body = req.body;
        const data = {};
        const title = getOptionalString(body.title, 'title');
        const description = getOptionalString(body.description, 'description');
        const category = getOptionalString(body.category, 'category');
        const location = getOptionalString(body.location, 'location');
        const startDate = getOptionalDate(body.startDate, 'startDate');
        const endDate = getOptionalDate(body.endDate, 'endDate');
        const status = getOptionalString(body.status, 'status');
        const pointsReward = getOptionalInteger(body.pointsReward, 'pointsReward');
        if (title !== undefined)
            data.title = title;
        if (description !== undefined)
            data.description = description;
        if (category !== undefined)
            data.category = category;
        if (location !== undefined)
            data.location = location;
        if (startDate !== undefined)
            data.startDate = startDate;
        if (endDate !== undefined)
            data.endDate = endDate;
        if (status !== undefined)
            data.status = status;
        if (pointsReward !== undefined)
            data.pointsReward = pointsReward;
        if (Object.keys(data).length === 0) {
            throw createError('At least one field must be provided for update.', 400);
        }
        const activity = await updateCSRActivity(id, data);
        res.status(200).json({
            success: true,
            message: 'CSR Activity updated successfully.',
            data: activity,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleDeleteCSRActivity(req, res, next) {
    try {
        const id = parseCSRActivityId(req.params.id);
        const activity = await handleDeleteCSRActivityHelper(id);
        res.status(200).json({
            success: true,
            message: 'CSR Activity deleted successfully.',
            data: activity,
        });
    }
    catch (error) {
        next(error);
    }
}
// Wrapper to avoid duplicate declaration error when calling deleteCSRActivity
async function handleDeleteCSRActivityHelper(id) {
    return deleteCSRActivity(id);
}
