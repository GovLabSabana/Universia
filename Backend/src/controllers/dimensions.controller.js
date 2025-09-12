import { supabase } from "../config/supabase.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * @swagger
 * /dimensions:
 *   get:
 *     tags:
 *       - Dimensions
 *     summary: Get all evaluation dimensions
 *     description: Retrieve the list of all evaluation dimensions (Governance, Social, Environmental)
 *     responses:
 *       200:
 *         description: List of dimensions retrieved successfully
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
 *                   example: Dimensions retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Governance
 *                       code:
 *                         type: string
 *                         example: governance
 *                       description:
 *                         type: string
 *                         example: Governance dimension evaluation
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
export const getDimensions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("dimensions")
      .select("*")
      .order("id");

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "Dimensions retrieved successfully");
  } catch (err) {
    console.error("Error fetching dimensions:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};

/**
 * @swagger
 * /dimensions/{id}:
 *   get:
 *     tags:
 *       - Dimensions
 *     summary: Get a specific dimension
 *     description: Retrieve details of a specific evaluation dimension by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the dimension to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Dimension retrieved successfully
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
 *                   example: Dimension retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Governance
 *                     code:
 *                       type: string
 *                       example: governance
 *                     description:
 *                       type: string
 *                       example: Governance dimension evaluation
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-01T10:00:00Z
 *       404:
 *         description: Dimension not found
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
export const getDimension = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("dimensions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return sendError(res, "NOT_FOUND", "Dimension not found", 404);
      }
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "Dimension retrieved successfully");
  } catch (err) {
    console.error("Error fetching dimension:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};