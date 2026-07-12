import type { NextFunction, Request, Response } from 'express';
import { getDashboardInsights } from '../services/dashboardInsights.service.js';

export async function handleGetDashboardInsights(_req: Request, res: Response, next: NextFunction) {
  try {
    console.log('[AI Insights] Controller reached');
    const insights = await getDashboardInsights();
    console.log('[AI Insights] Response returned');

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
}
