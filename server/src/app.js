const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { success } = require('./utils/apiResponse');

const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json(success({ status: 'ok' }, 'healthy'));
});

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const testCaseRoutes = require('./routes/testCase.routes');
const testRunRoutes = require('./routes/testRun.routes');
const testExecutionRoutes = require('./routes/testExecution.routes');
const bugRoutes = require('./routes/bug.routes');
const githubRoutes = require('./routes/github.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/test-cases', testCaseRoutes);
app.use('/api/projects/:projectId/test-runs/:runId', testExecutionRoutes);
app.use('/api/projects/:projectId/test-runs', testRunRoutes);
app.use('/api/projects/:projectId/bugs', bugRoutes);
app.use('/api/projects/:projectId/github', githubRoutes);
app.use('/api/projects/:projectId/dashboard', dashboardRoutes);

app.use(errorHandler);

module.exports = app;
