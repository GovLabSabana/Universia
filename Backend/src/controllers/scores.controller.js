import { supabase } from "../config/supabase.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const createScore = async (req, res) => {
  try {
    const { university_id, criterion_id, score, comment } = req.body;

    if (!university_id || !criterion_id || !score) {
      return sendError(res, "VALIDATION_ERROR", "university_id, criterion_id and score are required", 400);
    }

    if (score < 1 || score > 5) {
      return sendError(res, "VALIDATION_ERROR", "Score must be between 1 and 5", 400);
    }

    const { data, error } = await supabase
      .from("scores")
      .insert({
        university_id,
        criterion_id,
        score,
        comment,
        evaluated_by: req.user?.id || null
      })
      .select()
      .single();

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "Score added successfully", 201);
  } catch (err) {
    console.error("Error creating score:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};

export const getScoresByUniversity = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("scores")
      .select("*, criteria(name, dimension)")
      .eq("university_id", id);

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "Scores retrieved successfully");
  } catch (err) {
    console.error("Error fetching scores:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};
