const { Router } = require('express');
const {
  create,
  list,
  get,
  update,
  changeStatus,
  remove,
  exportReport,
} = require('../controllers/bug.controller');
const {
  createBugSchema,
  updateBugSchema,
  changeStatusSchema,
} = require('../validators/bug.validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const projectAccess = require('../middleware/projectAccess');

const router = Router({ mergeParams: true });

router.use(auth);
router.use(projectAccess);

router.post('/', validate(createBugSchema), create);
router.get('/', list);
router.get('/export', exportReport);
router.get('/:bugId', get);
router.put('/:bugId', validate(updateBugSchema), update);
router.patch('/:bugId/status', validate(changeStatusSchema), changeStatus);
router.delete('/:bugId', remove);

module.exports = router;
