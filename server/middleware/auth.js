// ============================================================
// Auth Middleware — JWT Verification
// MaHaKalyanam Wedding Server
// ============================================================

import jwt from 'jsonwebtoken';

/** Secret used to sign & verify JWTs */
const JWT_SECRET = process.env.JWT_SECRET || 'mahakalyanam-secret-2026';

/** Default admin password (override via ADMIN_PASSWORD env var) */
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

/**
 * Express middleware that protects admin routes.
 * Expects header:  Authorization: Bearer <token>
 *
 * On success → attaches `req.admin = { role: 'admin' }` and calls next().
 * On failure → responds with 401.
 */
export function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded payload to the request for downstream handlers
    req.admin = decoded;
    next();
  } catch (error) {
    // Differentiate between expired and malformed tokens
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
}

/**
 * Helper — sign a new JWT for an authenticated admin session.
 * Token expires in 24 hours by default.
 */
export function signToken(payload = {}, expiresIn = '24h') {
  return jwt.sign({ ...payload, role: 'admin' }, JWT_SECRET, { expiresIn });
}

export default { verifyToken, signToken, ADMIN_PASSWORD };
