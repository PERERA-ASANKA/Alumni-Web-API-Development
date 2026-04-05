const router     = require('express').Router();
const publicCtrl = require('../controllers/publicController');

/**
 * @swagger
 * tags:
 *   name: Public
 *   description: Public endpoints — requires API key via Express Gateway
 */

/**
 * @swagger
 * /api/public/alumni-of-the-day:
 *   get:
 *     summary: Get today's featured alumni influencer
 *     tags: [Public]
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Full profile of today's featured alumnus
 *       404:
 *         description: No featured alumnus today
 */
router.get('/alumni-of-the-day', publicCtrl.getAlumniOfTheDay);

module.exports = router;