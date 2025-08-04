const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validate, schemas } = require('../middlewares/validationMiddleware');

router.post('/register', validate(schemas.usuario), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.get('/verify', authenticateToken, authController.verify);
router.get('/debug', authController.debug);
router.post('/create-test-user', authController.createTestUser);

module.exports = router; 