const { Router } = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', auth, getMe);

module.exports = router;
