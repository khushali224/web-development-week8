const express = require('express');
const { register, login, me, logout } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const validateRequest = require('../middleware/validationMiddleware');
const authenticateUser = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/register', registerValidator, validateRequest, asyncHandler(register));
router.post('/login', loginValidator, validateRequest, asyncHandler(login));
router.get('/me', authenticateUser, asyncHandler(me));
router.post('/logout', authenticateUser, asyncHandler(logout));

module.exports = router;
