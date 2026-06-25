const { Router } = require('express');
const {
  createTestCase,
  getTestCases,
  getTestCase,
  updateTestCase,
  deleteTestCase,
} = require('../controllers/testCase.controller');
const {
  createTestCaseSchema,
  updateTestCaseSchema,
} = require('../validators/testCase.validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const projectAccess = require('../middleware/projectAccess');

const router = Router({ mergeParams: true });

router.use(auth);
router.use(projectAccess);

router.post('/', validate(createTestCaseSchema), createTestCase);
router.get('/', getTestCases);
router.get('/:testCaseId', getTestCase);
router.put('/:testCaseId', validate(updateTestCaseSchema), updateTestCase);
router.delete('/:testCaseId', deleteTestCase);

module.exports = router;
