import { createAcknowledgement, deleteAcknowledgement, getAllAcknowledgements, getAcknowledgementById, getAcknowledgementsByEmployee, getAcknowledgementsByPolicy, } from '../services/policyAcknowledgement.service.js';
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function parsePositiveInteger(value, fieldName) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw createError(`${fieldName} must be a positive integer.`, 400);
    }
    return id;
}
function getRequiredInteger(value, fieldName) {
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
        throw createError(`${fieldName} is required and must be a positive integer.`, 400);
    }
    return value;
}
export async function handleGetAcknowledgements(_req, res, next) {
    try {
        const data = await getAllAcknowledgements();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetAcknowledgementById(req, res, next) {
    try {
        const id = parsePositiveInteger(req.params.id, 'id');
        const data = await getAcknowledgementById(id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetAcknowledgementsByEmployee(req, res, next) {
    try {
        const employeeId = parsePositiveInteger(req.params.employeeId, 'employeeId');
        const data = await getAcknowledgementsByEmployee(employeeId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetAcknowledgementsByPolicy(req, res, next) {
    try {
        const policyId = parsePositiveInteger(req.params.policyId, 'policyId');
        const data = await getAcknowledgementsByPolicy(policyId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
export async function handleCreateAcknowledgement(req, res, next) {
    try {
        const body = req.body;
        const employeeId = getRequiredInteger(body.employeeId, 'employeeId');
        const policyId = getRequiredInteger(body.policyId, 'policyId');
        const data = await createAcknowledgement(employeeId, policyId);
        res.status(201).json({
            success: true,
            message: 'Policy acknowledged successfully.',
            data,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleDeleteAcknowledgement(req, res, next) {
    try {
        const id = parsePositiveInteger(req.params.id, 'id');
        const data = await deleteAcknowledgement(id);
        res.status(200).json({
            success: true,
            message: 'Policy acknowledgement deleted successfully.',
            data,
        });
    }
    catch (error) {
        next(error);
    }
}
