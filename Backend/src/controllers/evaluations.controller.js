import { supabase } from "../config/supabase.js";
import { sendSuccess, sendError, sendValidationError } from "../utils/response.js";

/**
 * @swagger
 * /evaluations:
 *   get:
 *     tags:
 *       - Evaluations
 *     summary: Get user's evaluations
 *     description: Retrieve all evaluations created by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Evaluations retrieved successfully
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
 *                   example: Evaluations retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                         example: 123e4567-e89b-12d3-a456-426614174000
 *                       university_id:
 *                         type: integer
 *                         example: 1
 *                       dimension_id:
 *                         type: integer
 *                         example: 1
 *                       status:
 *                         type: string
 *                         enum: [draft, submitted]
 *                         example: draft
 *                       comments:
 *                         type: string
 *                         example: Overall good governance practices
 *                       submitted_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: 2024-01-01T10:00:00Z
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-01T09:00:00Z
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-01T09:30:00Z
 *                       universities:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Universidad Nacional
 *                           city:
 *                             type: string
 *                             example: Bogotá
 *                           department:
 *                             type: string
 *                             example: Cundinamarca
 *                       dimensions:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Governance
 *                           code:
 *                             type: string
 *                             example: governance
 *       401:
 *         description: Authentication required
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
export const getEvaluations = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("evaluations")
      .select(`
        *,
        universities(name, city, department),
        dimensions(name, code)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "Evaluations retrieved successfully");
  } catch (err) {
    console.error("Error fetching evaluations:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};

/**
 * @swagger
 * /evaluations/{id}:
 *   get:
 *     tags:
 *       - Evaluations
 *     summary: Get specific evaluation with responses
 *     description: Retrieve a specific evaluation including all question responses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the evaluation to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Evaluation retrieved successfully
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
 *                   example: Evaluation retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/EvaluationWithResponses'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Evaluation not found
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
export const getEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("evaluations")
      .select(`
        *,
        universities(name, city, department),
        dimensions(name, code),
        evaluation_responses(*, questions(text, scale_descriptions))
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return sendError(res, "NOT_FOUND", "Evaluation not found", 404);
      }
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "Evaluation retrieved successfully");
  } catch (err) {
    console.error("Error fetching evaluation:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};

/**
 * @swagger
 * /evaluations:
 *   post:
 *     tags:
 *       - Evaluations
 *     summary: Create or update evaluation
 *     description: Create a new evaluation or update an existing draft evaluation. Each user can only have one evaluation per university per dimension.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - university_id
 *               - dimension_id
 *               - responses
 *             properties:
 *               university_id:
 *                 type: integer
 *                 description: ID of the university being evaluated
 *                 example: 1
 *               dimension_id:
 *                 type: integer
 *                 description: ID of the dimension being evaluated
 *                 example: 1
 *               responses:
 *                 type: array
 *                 description: Array of question responses
 *                 items:
 *                   type: object
 *                   required:
 *                     - question_id
 *                     - score
 *                   properties:
 *                     question_id:
 *                       type: integer
 *                       description: ID of the question being answered
 *                       example: 1
 *                     score:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 5
 *                       description: Score given to the question (1-5)
 *                       example: 4
 *               comments:
 *                 type: string
 *                 description: Optional overall comments about the evaluation
 *                 example: The university shows strong governance practices with room for improvement in transparency
 *     responses:
 *       200:
 *         description: Evaluation updated successfully
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
 *                   example: Evaluation updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/EvaluationWithResponses'
 *       201:
 *         description: Evaluation created successfully
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
 *                   example: Evaluation created successfully
 *                 data:
 *                   $ref: '#/components/schemas/EvaluationWithResponses'
 *       400:
 *         description: Validation error or trying to modify submitted evaluation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
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
export const createOrUpdateEvaluation = async (req, res) => {
  try {
    const { university_id, dimension_id, responses, comments } = req.body;
    const userId = req.user.id;

    if (!university_id || !dimension_id) {
      return sendValidationError(res, "university_id and dimension_id are required");
    }

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return sendValidationError(res, "responses array is required and cannot be empty");
    }

    for (const response of responses) {
      if (!response.question_id || !response.score) {
        return sendValidationError(res, "Each response must have question_id and score");
      }
      if (response.score < 1 || response.score > 5) {
        return sendValidationError(res, "Score must be between 1 and 5");
      }
    }

    const { data: existingEvaluation } = await supabase
      .from("evaluations")
      .select("id")
      .eq("user_id", userId)
      .eq("university_id", university_id)
      .eq("dimension_id", dimension_id)
      .single();

    let evaluation;

    if (existingEvaluation) {
      if (existingEvaluation.status === "submitted") {
        return sendError(res, "VALIDATION_ERROR", "Cannot modify a submitted evaluation", 400);
      }

      const { data, error } = await supabase
        .from("evaluations")
        .update({
          comments,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingEvaluation.id)
        .select()
        .single();

      if (error) {
        return sendError(res, "DB_ERROR", error.message);
      }

      evaluation = data;

      await supabase
        .from("evaluation_responses")
        .delete()
        .eq("evaluation_id", evaluation.id);
    } else {
      const { data, error } = await supabase
        .from("evaluations")
        .insert({
          user_id: userId,
          university_id,
          dimension_id,
          comments,
          status: "draft"
        })
        .select()
        .single();

      if (error) {
        return sendError(res, "DB_ERROR", error.message);
      }

      evaluation = data;
    }

    const responsesToInsert = responses.map(response => ({
      evaluation_id: evaluation.id,
      question_id: response.question_id,
      score: response.score
    }));

    const { error: responsesError } = await supabase
      .from("evaluation_responses")
      .insert(responsesToInsert);

    if (responsesError) {
      return sendError(res, "DB_ERROR", responsesError.message);
    }

    const { data: finalEvaluation, error: finalError } = await supabase
      .from("evaluations")
      .select(`
        *,
        universities(name, city, department),
        dimensions(name, code),
        evaluation_responses(*, questions(text, scale_descriptions))
      `)
      .eq("id", evaluation.id)
      .single();

    if (finalError) {
      return sendError(res, "DB_ERROR", finalError.message);
    }

    sendSuccess(
      res, 
      finalEvaluation, 
      existingEvaluation ? "Evaluation updated successfully" : "Evaluation created successfully",
      existingEvaluation ? 200 : 201
    );
  } catch (err) {
    console.error("Error creating/updating evaluation:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};

/**
 * @swagger
 * /evaluations/{id}/submit:
 *   put:
 *     tags:
 *       - Evaluations
 *     summary: Submit evaluation
 *     description: Submit a draft evaluation, changing its status to 'submitted' and preventing further modifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the evaluation to submit
 *         example: 1
 *     responses:
 *       200:
 *         description: Evaluation submitted successfully
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
 *                   example: Evaluation submitted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       example: submitted
 *                     submitted_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-01T10:00:00Z
 *                     universities:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Universidad Nacional
 *                     dimensions:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Governance
 *       400:
 *         description: Validation error (already submitted or no responses)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Evaluation not found
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
export const submitEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: evaluation, error: fetchError } = await supabase
      .from("evaluations")
      .select("*, evaluation_responses(*)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return sendError(res, "NOT_FOUND", "Evaluation not found", 404);
      }
      return sendError(res, "DB_ERROR", fetchError.message);
    }

    if (evaluation.status === "submitted") {
      return sendError(res, "VALIDATION_ERROR", "Evaluation is already submitted", 400);
    }

    if (!evaluation.evaluation_responses || evaluation.evaluation_responses.length === 0) {
      return sendError(res, "VALIDATION_ERROR", "Cannot submit evaluation without responses", 400);
    }

    const { data, error } = await supabase
      .from("evaluations")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select(`
        *,
        universities(name, city, department),
        dimensions(name, code)
      `)
      .single();

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "Evaluation submitted successfully");
  } catch (err) {
    console.error("Error submitting evaluation:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};

/**
 * @swagger
 * /evaluations/{id}:
 *   delete:
 *     tags:
 *       - Evaluations
 *     summary: Delete evaluation
 *     description: Delete a draft evaluation. Submitted evaluations cannot be deleted.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the evaluation to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Evaluation deleted successfully
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
 *                   example: Evaluation deleted successfully
 *                 data:
 *                   type: null
 *                   example: null
 *       400:
 *         description: Cannot delete submitted evaluation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Evaluation not found
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
export const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: evaluation, error: fetchError } = await supabase
      .from("evaluations")
      .select("status")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return sendError(res, "NOT_FOUND", "Evaluation not found", 404);
      }
      return sendError(res, "DB_ERROR", fetchError.message);
    }

    if (evaluation.status === "submitted") {
      return sendError(res, "VALIDATION_ERROR", "Cannot delete a submitted evaluation", 400);
    }

    const { error } = await supabase
      .from("evaluations")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, null, "Evaluation deleted successfully");
  } catch (err) {
    console.error("Error deleting evaluation:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};