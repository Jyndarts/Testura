const { Router } = require('express');
const {
  connectRepo,
  getConnection,
  disconnect,
  pushBugAsIssue,
  syncRunResult,
} = require('../controllers/github.controller');
const {
  connectRepoSchema,
  syncRunResultSchema,
} = require('../validators/github.validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const projectAccess = require('../middleware/projectAccess');

const router = Router({ mergeParams: true });

router.use(auth);
router.use(projectAccess);

router.post('/connect', validate(connectRepoSchema), connectRepo);
router.get('/connection', getConnection);
router.delete('/disconnect', disconnect);
router.post('/push-bug/:bugId', pushBugAsIssue);
router.post('/sync-run/:runId', validate(syncRunResultSchema), syncRunResult);

module.exports = router;
