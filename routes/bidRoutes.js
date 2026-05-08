const router = require('express').Router();
const { body } = require('express-validator');
const auth     = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const ctrl     = require('../controllers/bidController');

/**
 * @swagger
 * tags:
 *   name: Bidding
 *   description: Bidding system for alumni
 */

/**
 * @swagger
 * /api/bids:
 *   get:
 *     summary: Get all bids for current user
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bids
 */
router.get('/', auth, ctrl.getBids);

/**
 * @swagger
 * /api/bids/status/tomorrow:
 *   get:
 *     summary: Check your current win/lose status for tomorrow
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Win or lose status }
 */
router.get('/status/tomorrow', auth, ctrl.getTomorrowStatus);

/**
 * @swagger
 * /api/bids/monthly-limit:
 *   get:
 *     summary: Check how many monthly slots you have remaining
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Monthly limit status }
 */
router.get('/monthly-limit', auth, ctrl.getMonthlyLimit);

/**
 * @swagger
 * /api/bids/{id}:
 *   get:
 *     summary: Get specific bid
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Bid details
 */
router.get('/:id', auth, ctrl.getBid);

/**
 * @swagger
 * /api/bids:
 *   post:
 *     summary: Place a bid for tomorrow's featured slot
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 250.00
 *     responses:
 *       201:
 *         description: Bid placed — returns winning or losing status
 *       403:
 *         description: Monthly limit reached
 *       409:
 *         description: Bid already exists for tomorrow
 */
router.post('/', auth,
  body('amount')
    .isFloat({ min: 0.01 }).withMessage('Bid amount must be a positive number'),
  validate,
  ctrl.placeBid
);

/**
 * @swagger
 * /api/bids/{id}:
 *   patch:
 *     summary: Increase your bid (only upward allowed)
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *     responses:
 *       200: { description: Bid updated with new win/lose status }
 *       400: { description: New amount must be higher than current }
 */
router.patch('/:id', auth,
  body('amount').isFloat({ min: 0.01 }),
  validate,
  ctrl.updateBid
);

/**
 * @swagger
 * /api/bids/{id}:
 *   delete:
 *     summary: Cancel your bid
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Bid cancelled }
 */
router.delete('/:id', auth, ctrl.cancelBid);

module.exports = router;