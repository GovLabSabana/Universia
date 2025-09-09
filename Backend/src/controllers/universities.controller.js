import { supabase } from "../config/supabase.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getUniversities = async (req, res) => {
  try {
    const { data, error } = await supabase.from("universities").select("*");

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "Universities retrieved successfully");
  } catch (err) {
    console.error("Error fetching universities:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};
/**
 * @swagger
 * /universities:
 *   get:
 *     tags:
 *       - Universities
 *     summary: Get all universities
 *     description: Retrieve the list of all universities
 *     responses:
 *       200:
 *         description: List of universities
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
 *                   example: Universities retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       city:
 *                         type: string
 *                       department:
 *                         type: string
 */

export const createUniversity = async (req, res) => {
  try {
    const { name, city, department } = req.body;

    if (!name) {
      return sendError(res, "VALIDATION_ERROR", "University name is required", 400);
    }

    const { data, error } = await supabase
      .from("universities")
      .insert({ name, city, department })
      .select()
      .single();

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "University created successfully", 201);
  } catch (err) {
    console.error("Error creating university:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};

/**
 * @swagger
 * /universities:
 *   post:
 *     tags:
 *       - Universities
 *     summary: Create a university
 *     description: Add a new university
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - city
 *               - department
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: University created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

export const searchUniversities = async (req, res) => {
  const { q } = req.query; 
  try {
    if (!q) {
      return sendError(res, "VALIDATION_ERROR", "Query parameter 'q' is required", 400);
    }

    const { data, error } = await supabase
      .from("universities")
      .select("*")
      .or(`name.ilike.%${q}%,city.ilike.%${q}%,department.ilike.%${q}%`);

    if (error) return sendError(res, "DB_ERROR", error.message);

    sendSuccess(res, data, "Search results");
  } catch (err) {
    console.error(err);
    sendError(res, "INTERNAL_ERROR", "Error searching universities");
  }
};
