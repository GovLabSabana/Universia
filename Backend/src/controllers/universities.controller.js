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
export const searchUniversities = async (req, res) => {
  const { q } = req.query; // palabra clave
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
