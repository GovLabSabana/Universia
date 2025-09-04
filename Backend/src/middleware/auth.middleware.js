import { supabase } from "../config/supabase.js";
import { sendAuthError } from "../utils/response.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendAuthError(res, "Access token required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return sendAuthError(res, "Access token required");
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return sendAuthError(res, "Invalid or expired token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return sendAuthError(res, "Authentication failed");
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    req.user = error ? null : user;
    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    req.user = null;
    next();
  }
};
