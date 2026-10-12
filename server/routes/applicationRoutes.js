const express = require('express');
const {
  createApplication,
  listMyApplications,
  getApplication,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/applicationController');
const authenticateUser = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  applicationIdValidator,
  createApplicationValidator,
  updateStatusValidator
} = require('../validators/applicationValidators');

const router = express.Router();

router.use(authenticateUser);
router.post(
  '/',
  authorizeRole('candidate'),
  createApplicationValidator,
  validateRequest,
  asyncHandler(createApplication)
);
router.get('/my', authorizeRole('candidate'), asyncHandler(listMyApplications));
router.get('/:id', applicationIdValidator, validateRequest, asyncHandler(getApplication));
router.put(
  '/:id/status',
  authorizeRole('recruiter', 'admin'),
  applicationIdValidator,
  updateStatusValidator,
  validateRequest,
  asyncHandler(updateApplicationStatus)
);
router.delete('/:id', applicationIdValidator, validateRequest, asyncHandler(deleteApplication));

module.exports = router;
