const { Router } = require('express');
const { getDashboard } = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');
const projectAccess = require('../middleware/projectAccess');

const router = Router({ mergeParams: true });

router.use(auth);
router.use(projectAccess);

router.get('/', getDashboard);

module.exports = router;
