import { createAudit, deleteAudit, getAllAudits, getAuditById, updateAudit, } from '../services/audit.service.js';
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function parseAuditId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw createError('Audit id must be a positive integer.', 400);
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
export async function handleGetAudits(req, res, next) {
    try {
        const { status, auditDate, title } = req.query;
        const filters = {};
        if (status !== undefined) {
            filters.status = status;
        }
        if (auditDate !== undefined) {
            const parsed = new Date(auditDate);
            if (Number.isNaN(parsed.getTime())) {
                throw createError('auditDate query parameter must be a valid date string.', 400);
            }
            filters.auditDate = parsed;
        }
        if (title !== undefined) {
            filters.title = title;
        }
        const audits = await getAllAudits(filters);
        res.status(200).json({ success: true, data: audits });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetAuditById(req, res, next) {
    try {
        const id = parseAuditId(req.params.id);
        const audit = await getAuditById(id);
        res.status(200).json({ success: true, data: audit });
    }
    catch (error) {
        next(error);
    }
}
export async function handleCreateAudit(req, res, next) {
    try {
        const body = req.body;
        const title = getRequiredString(body.title, 'title');
        const description = getRequiredString(body.description, 'description');
        const auditDate = getRequiredDate(body.auditDate, 'auditDate');
        const status = getOptionalString(body.status, 'status');
        const audit = await createAudit({
            title,
            description,
            auditDate,
            ...(status !== undefined ? { status } : {}),
        });
        res.status(201).json({
            success: true,
            message: 'Audit created successfully.',
            data: audit,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleUpdateAudit(req, res, next) {
    try {
        const id = parseAuditId(req.params.id);
        const body = req.body;
        const data = {};
        const title = getOptionalString(body.title, 'title');
        const description = getOptionalString(body.description, 'description');
        const auditDate = getOptionalDate(body.auditDate, 'auditDate');
        const status = getOptionalString(body.status, 'status');
        if (title !== undefined) {
            data.title = title;
        }
        if (description !== undefined) {
            data.description = description;
        }
        if (auditDate !== undefined) {
            data.auditDate = auditDate;
        }
        if (status !== undefined) {
            data.status = status;
        }
        if (Object.keys(data).length === 0) {
            throw createError('At least one field must be provided for update.', 400);
        }
        const audit = await updateAudit(id, data);
        res.status(200).json({
            success: true,
            message: 'Audit updated successfully.',
            data: audit,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleDeleteAudit(req, res, next) {
    try {
        const id = parseAuditId(req.params.id);
        const audit = await deleteAudit(id);
        res.status(200).json({
            success: true,
            message: 'Audit deleted successfully.',
            data: audit,
        });
    }
    catch (error) {
        next(error);
    }
}
