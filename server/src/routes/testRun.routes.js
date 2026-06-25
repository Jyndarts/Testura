const { Router } = require('express');
const {
  createRun,
  listRuns,
  getRun,
  updateRun,
  cloneRun,
  deleteRun,
} = require('../controllers/testRun.controller');
const {
  createTestRunSchema,
  updateTestRunSchema,
} = require('../validators/testRun.validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const projectAccess = require('../middleware/projectAccess');

const router = Router({ mergeParams: true });

router.use(auth);
router.use(projectAccess);

router.post('/', validate(createTestRunSchema), createRun);
router.get('/', listRuns);
router.get('/:runId', getRun);
router.put('/:runId', validate(updateTestRunSchema), updateRun);
router.post('/:runId/clone', cloneRun);
router.delete('/:runId', deleteRun);

module.exports = router;
