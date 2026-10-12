const express = require('express');
const { getProfile, updateProfile, deleteProfile } = require('../controllers/userController');
const authenticateUser = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(authenticateUser);
router.get('/profile', asyncHandler(getProfile));
router.put(
  '/profile',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }),
    body('bio').optional().isString().trim().isLength({ max: 2000 }),
    body('skills').optional().isArray({ max: 50 }).withMessage('Skills must be an array of at most 50 items'),
    body('skills.*').optional().isString().trim().isLength({ min: 1, max: 60 })
  ],
  validateRequest,
  asyncHandler(updateProfile)
);
router.delete('/profile', asyncHandler(deleteProfile));

module.exports = router;
