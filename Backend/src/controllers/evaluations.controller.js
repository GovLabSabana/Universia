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
 *                       comments:
 *                         type: string
 *                         example: Overall good governance practices
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
 *     description: Create a new evaluation or update an existing evaluation. Each user can only have one evaluation per university per dimension.
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
 *         description: Validation error
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

    // Verificar si el usuario ya tiene una universidad asignada
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("assigned_university_id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      return sendError(res, "DB_ERROR", profileError.message);
    }

    // Si no existe el perfil, crearlo con la universidad asignada
    if (!profileData) {
      const { error: createProfileError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          assigned_university_id: university_id
        });

      if (createProfileError) {
        return sendError(res, "DB_ERROR", createProfileError.message);
      }
    }
    // Si el perfil existe pero no tiene universidad asignada, asignarla
    else if (!profileData.assigned_university_id) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ assigned_university_id: university_id })
        .eq("id", userId);

      if (updateError) {
        return sendError(res, "DB_ERROR", updateError.message);
      }
    }
    // Si ya tiene universidad asignada, validar que coincida
    else if (profileData.assigned_university_id !== university_id) {
      return res.status(403).json({
        success: false,
        error: "UNIVERSITY_MISMATCH",
        message: "Solo puedes evaluar la universidad que tienes asignada"
      });
    }

    const { data: existingEvaluation, error: queryError } = await supabase
      .from("evaluations")
      .select("id")
      .eq("user_id", userId)
      .eq("university_id", university_id)
      .eq("dimension_id", dimension_id)
      .maybeSingle();

    if (queryError) {
      return sendError(res, "DB_ERROR", queryError.message);
    }

    if (existingEvaluation) {
      return res.status(409).json({
        success: false,
        error: "EVALUATION_ALREADY_EXISTS",
        message: "Ya has respondido esta evaluación para esta universidad y dimensión"
      });
    }

    const { data: evaluation, error } = await supabase
      .from("evaluations")
      .insert({
        user_id: userId,
        university_id,
        dimension_id,
        comments
      })
      .select()
      .single();

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    // Filtrar duplicados por question_id (mantener el último valor)
    const uniqueResponses = {};
    responses.forEach(response => {
      uniqueResponses[response.question_id] = response;
    });

    const responsesToInsert = Object.values(uniqueResponses).map(response => ({
      evaluation_id: evaluation.id,
      question_id: response.question_id,
      score: response.score
    }));

    const { error: responsesError } = await supabase
      .from("evaluation_responses")
      .upsert(responsesToInsert, {
        onConflict: 'evaluation_id,question_id'
      });

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
 * /evaluations/{id}:
 *   delete:
 *     tags:
 *       - Evaluations
 *     summary: Delete evaluation
 *     description: Delete an evaluation.
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

    // Eliminar la evaluación
    const { error } = await supabase
      .from("evaluations")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    // Verificar si le quedan evaluaciones al usuario
    const { data: remainingEvaluations, error: checkError } = await supabase
      .from("evaluations")
      .select("id")
      .eq("user_id", userId);

    if (checkError) {
      console.error("Error checking remaining evaluations:", checkError);
      // No fallar aquí, solo logear el error
    }

    // Si no tiene más evaluaciones, limpiar universidad asignada
    if (!checkError && (!remainingEvaluations || remainingEvaluations.length === 0)) {
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ assigned_university_id: null })
        .eq("id", userId);

      if (updateProfileError) {
        console.error("Error clearing assigned university:", updateProfileError);
        // No fallar aquí, solo logear el error
      }
    }

    sendSuccess(res, null, "Evaluation deleted successfully");
  } catch (err) {
    console.error("Error deleting evaluation:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};

/**
 * @swagger
 * /evaluations/averages:
 *   get:
 *     tags:
 *       - Evaluations
 *     summary: Get global averages by dimension
 *     description: Retrieve average scores for each dimension across all universities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Global averages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       dimension_id:
 *                         type: integer
 *                       dimension_name:
 *                         type: string
 *                       dimension_code:
 *                         type: string
 *                       average_score:
 *                         type: number
 *                       total_evaluations:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getGlobalAverages = async (req, res) => {
  try {
    const { data: averages, error } = await supabase
      .from("evaluation_responses")
      .select(`
        score,
        evaluations!inner(
          id,
          dimension_id,
          dimensions!inner(name, code)
        )
      `);

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    // Agrupar por dimensión y calcular promedios
    const dimensionStats = {};

    averages.forEach(response => {
      const dimensionId = response.evaluations.dimension_id;
      const dimensionName = response.evaluations.dimensions.name;
      const dimensionCode = response.evaluations.dimensions.code;
      const score = response.score;

      if (!dimensionStats[dimensionId]) {
        dimensionStats[dimensionId] = {
          dimension_id: dimensionId,
          dimension_name: dimensionName,
          dimension_code: dimensionCode,
          scores: [],
          evaluations: new Set()
        };
      }

      dimensionStats[dimensionId].scores.push(score);
      dimensionStats[dimensionId].evaluations.add(response.evaluations.id);
    });

    // Calcular promedios y totales
    const result = Object.values(dimensionStats).map(dimension => ({
      dimension_id: dimension.dimension_id,
      dimension_name: dimension.dimension_name,
      dimension_code: dimension.dimension_code,
      average_score: dimension.scores.length > 0 
        ? parseFloat((dimension.scores.reduce((sum, score) => sum + score, 0) / dimension.scores.length).toFixed(2))
        : null,
      total_evaluations: dimension.evaluations.size
    }));

    sendSuccess(res, result, "Global averages retrieved successfully");
  } catch (err) {
    console.error("Error fetching global averages:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};

/**
 * @swagger
 * /evaluations/ranking:
 *   get:
 *     tags:
 *       - Evaluations
 *     summary: Get top 10 universities ranking
 *     description: Retrieve top 10 universities with best average scores
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dimension
 *         schema:
 *           type: integer
 *         description: Filter by dimension ID (optional). If not provided, shows total average across all dimensions
 *     responses:
 *       200:
 *         description: University ranking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rank:
 *                         type: integer
 *                       university_id:
 *                         type: integer
 *                       university_name:
 *                         type: string
 *                       city:
 *                         type: string
 *                       department:
 *                         type: string
 *                       average_score:
 *                         type: number
 *                       total_evaluations:
 *                         type: integer
 *                       dimension_name:
 *                         type: string
 *                         description: Only present when filtering by dimension
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getUniversitiesRanking = async (req, res) => {
  try {
    const { dimension } = req.query;
    
    let query = supabase
      .from("evaluation_responses")
      .select(`
        score,
        evaluations!inner(
          id,
          university_id,
          dimension_id,
          universities!inner(name, city, department),
          dimensions!inner(name, code)
        )
      `);

    // Filtrar por dimensión si se especifica
    if (dimension) {
      query = query.eq('evaluations.dimension_id', dimension);
    }

    const { data: responses, error } = await query;

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    // Agrupar por universidad
    const universityStats = {};

    responses.forEach(response => {
      const universityId = response.evaluations.university_id;
      const universityName = response.evaluations.universities.name;
      const city = response.evaluations.universities.city;
      const department = response.evaluations.universities.department;
      const dimensionName = response.evaluations.dimensions.name;
      const score = response.score;

      if (!universityStats[universityId]) {
        universityStats[universityId] = {
          university_id: universityId,
          university_name: universityName,
          city,
          department,
          scores: [],
          evaluations: new Set(),
          dimension_name: dimension ? dimensionName : undefined
        };
      }

      universityStats[universityId].scores.push(score);
      universityStats[universityId].evaluations.add(response.evaluations.id);
    });

    // Calcular promedios y crear ranking
    const universities = Object.values(universityStats)
      .map(university => ({
        university_id: university.university_id,
        university_name: university.university_name,
        city: university.city,
        department: university.department,
        average_score: university.scores.length > 0 
          ? parseFloat((university.scores.reduce((sum, score) => sum + score, 0) / university.scores.length).toFixed(2))
          : 0,
        total_evaluations: university.evaluations.size,
        ...(dimension && { dimension_name: university.dimension_name })
      }))
      .sort((a, b) => b.average_score - a.average_score) // Ordenar por promedio descendente
      .slice(0, 10) // Top 10
      .map((university, index) => ({
        rank: index + 1,
        ...university
      }));

    const message = dimension 
      ? "University ranking by dimension retrieved successfully"
      : "University ranking by total average retrieved successfully";

    sendSuccess(res, universities, message);
  } catch (err) {
    console.error("Error fetching university ranking:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};