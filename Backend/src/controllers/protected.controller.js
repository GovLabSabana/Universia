import { sendSuccess } from '../utils/response.js';

/**
 * @swagger
 * /protected:
 *   get:
 *     tags:
 *       - Protected
 *     summary: Protected endpoint
 *     description: Access protected resource - requires authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Protected resource accessed successfully
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
 *                   example: Welcome to the protected area!
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-01T12:00:00Z
 *                     message:
 *                       type: string
 *                       example: This is sensitive information only for authenticated users
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
export const getProtectedData = async (req, res) => {
  try {
    const user = req.user;
    
    sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at
      },
      accessTime: new Date().toISOString(),
      message: 'This is sensitive information only for authenticated users',
      protectedData: {
        secretValue: 'super-secret-data-123',
        userRole: 'authenticated-user',
        permissions: ['read', 'write']
      }
    }, 'Welcome to the protected area!');

  } catch (error) {
    console.error('Protected endpoint error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Internal server error');
  }
};