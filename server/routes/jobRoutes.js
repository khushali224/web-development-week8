const express = require('express');
const { listJobs, getJob, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const authenticateUser = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { jobIdValidator, createJobValidator } = require('../validators/jobValidators');

const router = express.Router();

router.get('/', asyncHandler(listJobs));
router.get('/:id', jobIdValidator, validateRequest, asyncHandler(getJob));
router.post(
  '/',
  authenticateUser,
  authorizeRole('recruiter', 'admin'),
  createJobValidator,
  validateRequest,
  asyncHandler(createJob)
);
router.put(
  '/:id',
  authenticateUser,
  authorizeRole('recruiter', 'admin'),
  jobIdValidator,
  createJobValidator,
  validateRequest,
  asyncHandler(updateJob)
);
router.delete(
  '/:id',
  authenticateUser,
  authorizeRole('recruiter', 'admin'),
  jobIdValidator,
  validateRequest,
  asyncHandler(deleteJob)
);

module.exports = router;
