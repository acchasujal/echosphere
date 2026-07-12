import { getDashboard, getEsgScores } from '../services/dashboard.service.js';
export async function handleGetDashboard(_req, res, next) {
    try {
        const dashboard = await getDashboard();
        res.status(200).json(dashboard);
    }
    catch (error) {
        next(error);
    }
}
export async function handleGetEsgScores(_req, res, next) {
    try {
        const scores = await getEsgScores();
        res.status(200).json({
            success: true,
            data: scores,
        });
    }
    catch (error) {
        next(error);
    }
}
