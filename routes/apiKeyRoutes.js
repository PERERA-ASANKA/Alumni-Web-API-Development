const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const ctrl   = require('../controllers/apiKeyController');

/**
 * @swagger
 * tags:
 *   name: API Keys
 *   description: Manage developer API keys for AR client access
 */

/**
 * @swagger
 * /api/keys:
 *   post:
 *     summary: Generate a new API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Analytics Dashboard
 *     responses:
 *       201:
 *         description: Key generated — copy it now, it will not be shown again
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key: { type: string }
 *                 id:  { type: integer }
 */
router.post('/', auth, ctrl.generateKey);

/**
 * @swagger
 * /api/keys:
 *   get:
 *     summary: List all your API keys
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Array of API keys (hashes hidden) }
 */
router.get('/', auth, ctrl.listKeys);

/**
 * @swagger
 * /api/keys/{id}:
 *   put:
 *     summary: Update an API key name or permissions
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Key updated }
 */
router.put('/:id', auth, ctrl.updateKey);

/**
 * @swagger
 * /api/keys/{id}/stats:
 *   get:
 *     summary: View usage statistics for a specific key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Key usage logs with timestamps and endpoints }
 */
router.get('/:id/stats', auth, ctrl.getStats);

/**
 * @swagger
 * /api/keys/{id}:
 *   delete:
 *     summary: Delete an API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Key deleted }
 */
router.delete('/:id', auth, ctrl.deleteKey);

/**
 * @swagger
 * /api/keys/{id}/revoke:
 *   patch:
 *     summary: Revoke an API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Key revoked }
 */
router.patch('/:id/revoke', auth, ctrl.revokeKey);

module.exports = router;