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
