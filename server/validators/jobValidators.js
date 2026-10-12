const { body, param } = require('express-validator');

const jobIdValidator = [
  param('id').isMongoId().withMessage('Invalid job ID')
];

const createJobValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }),
  body('company').trim().notEmpty().withMessage('Company is required').isLength({ max: 150 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 10000 }),
  body('location').trim().notEmpty().withMessage('Location is required').isLength({ max: 150 }),
  body('type').isIn(['internship', 'full-time', 'part-time', 'contract']).withMessage('Invalid job type'),
  body('skills').optional().isArray({ max: 50 }).withMessage('Skills must be an array of at most 50 items'),
  body('skills.*').optional().isString().trim().isLength({ min: 1, max: 60 }),
  body('deadline').isISO8601().withMessage('A valid deadline is required').toDate()
];

module.exports = { jobIdValidator, createJobValidator };
