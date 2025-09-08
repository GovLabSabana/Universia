import { supabase } from "../config/supabase.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getCriteria = async (req, res) => {
  try {
    const { data, error } = await supabase.from("criteria").select("*");

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "Criteria retrieved successfully");
  } catch (err) {
    console.error("Error fetching criteria:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};
