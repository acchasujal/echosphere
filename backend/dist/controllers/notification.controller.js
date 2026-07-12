import { createNotification, deleteNotification, getAllNotifications, getEmployeeNotifications, getNotificationById, updateNotification, } from '../services/notification.service.js';
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function parseNotificationId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw createError('Notification id must be a positive integer.', 400);
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
function getOptionalBoolean(value, fieldName) {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'boolean') {
        throw createError(`${fieldName} must be a boolean.`, 400);
    }
    return value;
}
export async function handleGetNotifications(_req, res, next) {
    try {
        const notifications = await getAllNotifications();
        res.status(200).json({
            success: true,
            data: notifications,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetNotificationById(req, res, next) {
    try {
        const id = parseNotificationId(req.params.id);
        const notification = await getNotificationById(id);
        res.status(200).json({
            success: true,
            data: notification,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleCreateNotification(req, res, next) {
    try {
        const body = req.body;
        const employeeId = getRequiredInteger(body.employeeId, 'employeeId');
        const message = getRequiredString(body.message, 'message');
        const read = getOptionalBoolean(body.read, 'read');
        const notification = await createNotification({
            employeeId,
            message,
            ...(read !== undefined ? { read } : {}),
        });
        res.status(201).json({
            success: true,
            message: 'Notification created successfully.',
            data: notification,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleUpdateNotification(req, res, next) {
    try {
        const id = parseNotificationId(req.params.id);
        const body = req.body;
        const data = {};
        const isRead = getOptionalBoolean(body.isRead, 'isRead');
        const read = getOptionalBoolean(body.read, 'read');
        const message = getOptionalString(body.message, 'message');
        const employeeId = getOptionalInteger(body.employeeId, 'employeeId');
        if (isRead !== undefined) {
            data.read = isRead;
        }
        else if (read !== undefined) {
            data.read = read;
        }
        if (message !== undefined) {
            data.message = message;
        }
        if (employeeId !== undefined) {
            data.employeeId = employeeId;
        }
        if (Object.keys(data).length === 0) {
            throw createError('At least one field must be provided for update.', 400);
        }
        const notification = await updateNotification(id, data);
        res.status(200).json({
            success: true,
            message: 'Notification updated successfully.',
            data: notification,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleDeleteNotification(req, res, next) {
    try {
        const id = parseNotificationId(req.params.id);
        const notification = await deleteNotification(id);
        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully.',
            data: notification,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetEmployeeNotifications(req, res, next) {
    try {
        const employeeId = parseEmployeeId(req.params.employeeId);
        const notifications = await getEmployeeNotifications(employeeId);
        res.status(200).json({
            success: true,
            data: notifications,
        });
    }
    catch (error) {
        next(error);
    }
}
