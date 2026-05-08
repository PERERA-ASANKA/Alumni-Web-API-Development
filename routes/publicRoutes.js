const router     = require('express').Router();
const publicCtrl = require('../controllers/publicController');

/**
 * @swagger
 * tags:
 *   name: Public
 *   description: Public analytics endpoints
 */

/**
 * @swagger
 * /api/public/alumni-of-the-day:
 *   get:
 *     summary: Get today's featured alumni influencer
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Featured alumni profile for today
 *       404:
 *         description: No featured alumni today
 */
router.get('/alumni-of-the-day', publicCtrl.getAlumniOfTheDay);

/**
 * @swagger
 * /api/public/alumni:
 *   get:
 *     summary: Get all alumni with filtering
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: industrySector
 *         schema:
 *           type: string
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: string
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of alumni
 */
router.get('/alumni', publicCtrl.getAlumni);

/**
 * @swagger
 * /api/public/analytics:
 *   get:
 *     summary: Get analytics data
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Analytics dashboard data
 */
router.get('/analytics', publicCtrl.getAnalytics);

/**
 * @swagger
 * /api/public/skills-gaps:
 *   get:
 *     summary: Get skill gaps analysis
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Skill gaps data
 */
router.get('/skills-gaps', publicCtrl.getSkillsGaps);

/**
 * @swagger
 * /api/public/course-stats:
 *   get:
 *     summary: Get course completion statistics
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Course statistics
 */
router.get('/course-stats', publicCtrl.getCourseStats);

/**
 * @swagger
 * /api/public/industry-sectors:
 *   get:
 *     summary: Get all industry sectors
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of industry sectors
 */
router.get('/industry-sectors', publicCtrl.getIndustrySectors);

/**
 * @swagger
 * /api/public/programs:
 *   get:
 *     summary: Get all academic programs
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of programs
 */
router.get('/programs', publicCtrl.getPrograms);

/**
 * @swagger
 * /api/public/job-titles:
 *   get:
 *     summary: Get top job titles
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of top job titles
 */
router.get('/job-titles', publicCtrl.getJobTitles);

/**
 * @swagger
 * /api/public/top-employers:
 *   get:
 *     summary: Get top employers
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of top employers
 */
router.get('/top-employers', publicCtrl.getTopEmployers);

/**
 * @swagger
 * /api/public/geographic:
 *   get:
 *     summary: Get geographic distribution
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Geographic distribution data
 */
router.get('/geographic', publicCtrl.getGeographicData);

module.exports = router;