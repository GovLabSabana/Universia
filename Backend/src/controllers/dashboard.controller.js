import { supabase } from "../config/supabase.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const getDashboard = async (req, res) => {
  try {

    const { data: scores, error: scoresError } = await supabase
      .from("scores")
      .select("score, university_id, criterion_id");

    if (scoresError) {
      return sendError(res, "DB_ERROR", scoresError.message);
    }


    const { data: criteria, error: criteriaError } = await supabase
      .from("criteria")
      .select("id, name");

    if (criteriaError) {
      return sendError(res, "DB_ERROR", criteriaError.message);
    }


    const { data: universities, error: universitiesError } = await supabase
      .from("universities")
      .select("id, name");

    if (universitiesError) {
      return sendError(res, "DB_ERROR", universitiesError.message);
    }


    const criteriaStats = criteria.map(c => {
      const scoresForCriterion = scores.filter(s => s.criterion_id === c.id);
      const avgScore = scoresForCriterion.length
        ? scoresForCriterion.reduce((acc, s) => acc + s.score, 0) / scoresForCriterion.length
        : 0;
      return { criterion: c.name, average: avgScore.toFixed(2) };
    });


    const uniStats = universities.map(u => {
      const scoresForUni = scores.filter(s => s.university_id === u.id);
      const avgScore = scoresForUni.length
        ? scoresForUni.reduce((acc, s) => acc + s.score, 0) / scoresForUni.length
        : 0;
      return { university: u.name, average: avgScore.toFixed(2) };
    }).sort((a, b) => b.average - a.average);

    sendSuccess(res, {
      totalUniversities: universities.length,
      criteriaAverages: criteriaStats,
      ranking: uniStats
    }, "Dashboard data loaded successfully");
  } catch (error) {
    console.error(error);
    sendError(res, "INTERNAL_ERROR", "Error generating dashboard");
  }
};
/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard statistics
 *     description: Returns aggregated statistics like total universities, criteria averages, and ranking
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUniversities:
 *                       type: integer
 *                     criteriaAverages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           criterion:
 *                             type: string
 *                           average:
 *                             type: string
 *                     ranking:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           university:
 *                             type: string
 *                           average:
 *                             type: string
 */