// ============================================================
// Admin Routes — Login & Token Verification
// MaHaKalyanam Wedding Server (MongoDB/Mongoose)
// ============================================================

import { Router } from 'express';
import { verifyToken, signToken, ADMIN_PASSWORD } from '../middleware/auth.js';

const router = Router();

// ------------------------------------------------------------------
// POST /api/admin/login
// Body: { password: string }
// Returns a signed JWT on success.
// ------------------------------------------------------------------
router.post('/login', (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required.',
      });
    }

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password.',
      });
    }

    const token = signToken({ loggedInAt: new Date().toISOString() });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
});

// ------------------------------------------------------------------
// GET /api/admin/verify
// Headers: Authorization: Bearer <token>
// Verifies that the provided JWT is still valid.
// ------------------------------------------------------------------
router.get('/verify', verifyToken, (_req, res) => {
  return res.json({
    success: true,
    message: 'Token is valid.',
  });
});

export default router;
