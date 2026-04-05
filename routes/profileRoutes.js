const router = require('express').Router();
const { body } = require('express-validator');
const auth     = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const upload   = require('../middleware/upload');
const ctrl     = require('../controllers/profileController');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Alumni profile management
 */

// ── Core profile ──────────────────────────────────────

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create your alumni profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:    { type: string }
 *               bio:          { type: string }
 *               linkedin_url: { type: string }
 *     responses:
 *       201: { description: Profile created }
 *       409: { description: Profile already exists }
 */
router.post('/', auth,
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('linkedin_url').optional().isURL().withMessage('Invalid LinkedIn URL'),
  validate,
  ctrl.createProfile
);

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get your full profile with all sub-items
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Profile data }
 *       404: { description: Profile not found }
 */
router.get('/me', auth, ctrl.getMyProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update your core profile info
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:    { type: string }
 *               bio:          { type: string }
 *               linkedin_url: { type: string }
 *     responses:
 *       200: { description: Profile updated }
 */
router.put('/', auth,
  body('linkedin_url').optional().isURL().withMessage('Invalid LinkedIn URL'),
  validate,
  ctrl.updateProfile
);

/**
 * @swagger
 * /api/profile/image:
 *   post:
 *     summary: Upload profile image
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: Image uploaded }
 */
router.post('/image', auth, upload.single('image'), ctrl.uploadImage);

// ── Degrees ───────────────────────────────────────────

/**
 * @swagger
 * /api/profile/degrees:
 *   post:
 *     summary: Add a degree
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:           { type: string }
 *               university:      { type: string }
 *               url:             { type: string }
 *               completion_date: { type: string, format: date }
 *     responses:
 *       201: { description: Degree added }
 */
router.post('/degrees',      auth, body('title').notEmpty(), body('url').isURL(), validate, ctrl.addDegree);
router.put('/degrees/:id',   auth, ctrl.updateDegree);
router.delete('/degrees/:id', auth, ctrl.deleteDegree);

// ── Certifications ────────────────────────────────────

/**
 * @swagger
 * /api/profile/certifications:
 *   post:
 *     summary: Add a certification
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:           { type: string }
 *               issuer:          { type: string }
 *               url:             { type: string }
 *               completion_date: { type: string, format: date }
 *     responses:
 *       201: { description: Certification added }
 */
router.post('/certifications',       auth, body('title').notEmpty(), body('url').isURL(), validate, ctrl.addCertification);
router.put('/certifications/:id',    auth, ctrl.updateCertification);
router.delete('/certifications/:id', auth, ctrl.deleteCertification);

// ── Licences ──────────────────────────────────────────

/**
 * @swagger
 * /api/profile/licences:
 *   post:
 *     summary: Add a licence
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:           { type: string }
 *               issuing_body:    { type: string }
 *               url:             { type: string }
 *               completion_date: { type: string, format: date }
 *     responses:
 *       201: { description: Licence added }
 */
router.post('/licences',       auth, body('title').notEmpty(), body('url').isURL(), validate, ctrl.addLicence);
router.put('/licences/:id',    auth, ctrl.updateLicence);
router.delete('/licences/:id', auth, ctrl.deleteLicence);

// ── Courses ───────────────────────────────────────────

/**
 * @swagger
 * /api/profile/courses:
 *   post:
 *     summary: Add a professional course
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:           { type: string }
 *               provider:        { type: string }
 *               url:             { type: string }
 *               completion_date: { type: string, format: date }
 *     responses:
 *       201: { description: Course added }
 */
router.post('/courses',       auth, body('title').notEmpty(), body('url').isURL(), validate, ctrl.addCourse);
router.put('/courses/:id',    auth, ctrl.updateCourse);
router.delete('/courses/:id', auth, ctrl.deleteCourse);

// ── Employment ────────────────────────────────────────

/**
 * @swagger
 * /api/profile/employment:
 *   post:
 *     summary: Add an employment history entry
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:    { type: string }
 *               role:       { type: string }
 *               start_date: { type: string, format: date }
 *               end_date:   { type: string, format: date }
 *     responses:
 *       201: { description: Employment added }
 */
router.post('/employment',       auth, body('company').notEmpty(), body('role').notEmpty(), validate, ctrl.addEmployment);
router.put('/employment/:id',    auth, ctrl.updateEmployment);
router.delete('/employment/:id', auth, ctrl.deleteEmployment);

module.exports = router;