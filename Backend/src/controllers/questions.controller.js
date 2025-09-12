import { supabase } from "../config/supabase.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * @swagger
 * /dimensions/{dimensionId}/questions:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get questions for a specific dimension
 *     description: Retrieve all evaluation questions for a specific dimension, ordered by their index
 *     parameters:
 *       - in: path
 *         name: dimensionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the dimension to get questions for
 *         example: 1
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Questions retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       dimension_id:
 *                         type: integer
 *                         example: 1
 *                       text:
 *                         type: string
 *                         example: How would you rate the university's governance transparency?
 *                       order_index:
 *                         type: integer
 *                         example: 1
 *                       scale_descriptions:
 *                         type: object
 *                         example: {"1": "Poor transparency", "2": "Fair transparency", "3": "Good transparency", "4": "Very good transparency", "5": "Excellent transparency"}
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-01T10:00:00Z
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getQuestionsByDimension = async (req, res) => {
  try {
    const { dimensionId } = req.params;

    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("dimension_id", dimensionId)
      .order("order_index");

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "Questions retrieved successfully");
  } catch (err) {
    console.error("Error fetching questions:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get a specific question
 *     description: Retrieve details of a specific question including its dimension information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Question retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     dimension_id:
 *                       type: integer
 *                       example: 1
 *                     text:
 *                       type: string
 *                       example: How would you rate the university's governance transparency?
 *                     order_index:
 *                       type: integer
 *                       example: 1
 *                     scale_descriptions:
 *                       type: object
 *                       example: {"1": "Poor transparency", "2": "Fair transparency", "3": "Good transparency", "4": "Very good transparency", "5": "Excellent transparency"}
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-01T10:00:00Z
 *                     dimensions:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Governance
 *                         code:
 *                           type: string
 *                           example: governance
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("questions")
      .select("*, dimensions(name, code)")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return sendError(res, "NOT_FOUND", "Question not found", 404);
      }
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "Question retrieved successfully");
  } catch (err) {
    console.error("Error fetching question:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};