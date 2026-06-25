const { Router } = require('express');
const {
  createProject,
  getMyProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/project.controller');
const {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} = require('../validators/project.validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const projectAccess = require('../middleware/projectAccess');

const router = Router();

router.use(auth);

router.post('/', validate(createProjectSchema), createProject);
router.get('/', getMyProjects);

router.get('/:projectId', projectAccess, getProject);
router.put('/:projectId', projectAccess, validate(updateProjectSchema), updateProject);
router.delete('/:projectId', projectAccess, deleteProject);
router.post('/:projectId/members', projectAccess, validate(addMemberSchema), addMember);
router.delete('/:projectId/members/:userId', projectAccess, removeMember);

module.exports = router;
