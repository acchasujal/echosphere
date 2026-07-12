import { getEnvironmentReport, getEsgSummary, getGovernanceReport, getSocialReport, } from '../services/report.service.js';
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
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
function extractCommonFilters(req) {
    const { departmentId, employeeId, startDate, endDate } = req.query;
    return {
        departmentId: parseOptionalPositiveInt(departmentId, 'departmentId'),
        employeeId: parseOptionalPositiveInt(employeeId, 'employeeId'),
        startDate,
        endDate,
    };
}
export async function handleGetEnvironmentReport(req, res, next) {
    try {
        const { departmentId, startDate, endDate } = extractCommonFilters(req);
        const report = await getEnvironmentReport({ departmentId, startDate, endDate });
        res.status(200).json({
            success: true,
            data: report,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetSocialReport(req, res, next) {
    try {
        const { departmentId, employeeId, startDate, endDate } = extractCommonFilters(req);
        const report = await getSocialReport({ departmentId, employeeId, startDate, endDate });
        res.status(200).json({
            success: true,
            data: report,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetGovernanceReport(req, res, next) {
    try {
        const { departmentId, startDate, endDate } = extractCommonFilters(req);
        const report = await getGovernanceReport({ departmentId, startDate, endDate });
        res.status(200).json({
            success: true,
            data: report,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetEsgSummary(req, res, next) {
    try {
        const { departmentId, employeeId, startDate, endDate } = extractCommonFilters(req);
        const summary = await getEsgSummary({ departmentId, employeeId, startDate, endDate });
        res.status(200).json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        next(error);
    }
}
