import { supabase } from "../config/supabase.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getUniversities = async (req, res) => {
  try {
    const { include_scores } = req.query;
    
    const { data: universities, error } = await supabase.from("universities").select("*");

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    if (include_scores === 'true') {
      // Get all dimensions
      const { data: dimensions, error: dimensionsError } = await supabase
        .from("dimensions")
        .select("id, name, code");

      if (dimensionsError) {
        return sendError(res, "DB_ERROR", dimensionsError.message);
      }

      // Get aggregated scores for all universities
      const { data: scores, error: scoresError } = await supabase
        .from("evaluation_responses")
        .select(`
          score,
          evaluations!inner(university_id, dimension_id),
          questions!inner(dimension_id)
        `);

      if (scoresError) {
        return sendError(res, "DB_ERROR", scoresError.message);
      }

      // Process universities with their dimension scores
      const universitiesWithScores = universities.map(university => {
        const dimensionScores = dimensions.map(dimension => {
          // Find all scores for this university and dimension
          const universityDimensionScores = scores.filter(score => 
            score.evaluations.university_id === university.id && 
            score.evaluations.dimension_id === dimension.id
          );

          if (universityDimensionScores.length === 0) {
            return {
              dimension_id: dimension.id,
              dimension_name: dimension.name,
              dimension_code: dimension.code,
              average_score: null,
              evaluation_count: 0
            };
          }

          // Calculate average score
          const totalScore = universityDimensionScores.reduce((sum, score) => sum + score.score, 0);
          const averageScore = totalScore / universityDimensionScores.length;

          // Count unique evaluations (not just responses)
          const uniqueEvaluations = new Set(
            universityDimensionScores.map(score => score.evaluations.university_id + '_' + score.evaluations.dimension_id)
          );

          return {
            dimension_id: dimension.id,
            dimension_name: dimension.name,
            dimension_code: dimension.code,
            average_score: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
            evaluation_count: uniqueEvaluations.size
          };
        });

        return {
          ...university,
          dimension_scores: dimensionScores
        };
      });

      sendSuccess(res, universitiesWithScores, "Universities with scores retrieved successfully");
    } else {
      sendSuccess(res, universities, "Universities retrieved successfully");
    }
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
 *     description: Retrieve the list of all universities, optionally including evaluation scores by dimension
 *     parameters:
 *       - in: query
 *         name: include_scores
 *         required: false
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Include average scores by dimension for each university
 *         example: 'true'
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
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Universidad Nacional
 *                       city:
 *                         type: string
 *                         example: Bogotá
 *                       department:
 *                         type: string
 *                         example: Cundinamarca
 *                       dimension_scores:
 *                         type: array
 *                         description: Average scores by dimension (only when include_scores=true)
 *                         items:
 *                           type: object
 *                           properties:
 *                             dimension_id:
 *                               type: integer
 *                               example: 1
 *                             dimension_name:
 *                               type: string
 *                               example: Governance
 *                             dimension_code:
 *                               type: string
 *                               example: governance
 *                             average_score:
 *                               type: number
 *                               nullable: true
 *                               example: 4.25
 *                               description: Average score for this dimension (null if no evaluations)
 *                             evaluation_count:
 *                               type: integer
 *                               example: 3
 *                               description: Number of evaluations for this dimension
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
