const { Router } = require('express');
const {
  startRun,
  getRunExecutions,
  updateExecution,
  completeRun,
} = require('../controllers/testExecution.controller');
const { updateExecutionSchema } = require('../validators/testExecution.validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const projectAccess = require('../middleware/projectAccess');

const router = Router({ mergeParams: true });

router.use(auth);
router.use(projectAccess);

router.post('/start', startRun);
router.get('/executions', getRunExecutions);
router.put('/executions/:executionId', validate(updateExecutionSchema), updateExecution);
router.post('/complete', completeRun);

module.exports = router;
