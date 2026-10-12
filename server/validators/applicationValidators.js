const { body, param } = require('express-validator');

const applicationIdValidator = [
  param('id').isMongoId().withMessage('Invalid application ID')
];

const createApplicationValidator = [
  body('jobId').isMongoId().withMessage('A valid jobId is required'),
  body('coverLetter').optional().isString().trim().isLength({ max: 5000 })
];

const updateStatusValidator = [
  body('status').isIn(['shortlisted', 'selected', 'rejected']).withMessage('Invalid application status')
];

module.exports = {
  applicationIdValidator,
  createApplicationValidator,
  updateStatusValidator
};
