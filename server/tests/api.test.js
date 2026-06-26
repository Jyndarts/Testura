process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ENCRYPTION_KEY = 'test-encryption-key';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Project = require('../src/models/project.model');
const TestCase = require('../src/models/testCase.model');
const TestRun = require('../src/models/testRun.model');
const TestExecution = require('../src/models/testExecution.model');
const Bug = require('../src/models/bug.model');
const Counter = require('../src/models/counter.model');

let mongoServer;
let userToken;
let otherUserToken;
let projectId;
let otherProjectId;
let testCaseId;
let runId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const registerUser = async (name, email, password) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password });
  return res.body.data.token;
};

describe('Auth', () => {
  test('register creates a user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.name).toBe('Alice');
  });

  test('register rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice 2', email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('login returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  test('login rejects invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('getMe returns authenticated user', async () => {
    const token = await registerUser('getme', 'getme@test.com', 'password123');
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('getme@test.com');
  });

  test('getMe rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('Project access', () => {
  beforeAll(async () => {
    userToken = await registerUser('owner', 'owner@test.com', 'password123');
    otherUserToken = await registerUser('intruder', 'intruder@test.com', 'password123');

    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'My Project', key: 'MP' });

    projectId = projectRes.body.data._id;

    const otherProjectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ name: 'Other Project', key: 'OP' });

    otherProjectId = otherProjectRes.body.data._id;
  });

  test('project owner can access project', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('My Project');
  });

  test('non-member gets 403 on project', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('non-member gets 403 on nested test-cases', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/test-cases`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
  });

  test('non-member gets 403 on nested test-runs', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/test-runs`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
  });

  test('non-member gets 403 on nested bugs', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/bugs`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
  });
});

describe('Test case CRUD', () => {
  beforeAll(async () => {
    userToken = await registerUser('tester', 'tester@test.com', 'password123');

    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'TC Project', key: 'TCP' });

    projectId = projectRes.body.data._id;
  });

  test('create test case', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/test-cases`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Login works', module: 'Auth', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Login works');
    expect(res.body.data.module).toBe('Auth');
    testCaseId = res.body.data._id;
  });

  test('list test cases', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/test-cases`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('get single test case', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/test-cases/${testCaseId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(testCaseId);
  });

  test('get test case returns 404 for unknown id', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/test-cases/000000000000000000000000`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
  });

  test('update test case', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/test-cases/${testCaseId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Login works updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Login works updated');
  });

  test('delete test case', async () => {
    const tc = await request(app)
      .post(`/api/projects/${projectId}/test-cases`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Temp case' });

    const res = await request(app)
      .delete(`/api/projects/${projectId}/test-cases/${tc.body.data._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Run execution flow', () => {
  beforeAll(async () => {
    userToken = await registerUser('runner', 'runner@test.com', 'password123');

    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Run Project', key: 'RP' });

    projectId = projectRes.body.data._id;

    const tc1 = await request(app)
      .post(`/api/projects/${projectId}/test-cases`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Case A' });

    const tc2 = await request(app)
      .post(`/api/projects/${projectId}/test-cases`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Case B' });

    testCaseId = tc1.body.data._id;

    const runRes = await request(app)
      .post(`/api/projects/${projectId}/test-runs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Smoke run',
        type: 'smoke',
        testCases: [tc1.body.data._id, tc2.body.data._id],
      });

    runId = runRes.body.data._id;
  });

  test('start run creates executions', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/test-runs/${runId}/start`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(201);
    expect(res.body.data.resumed).toBe(false);

    const execRes = await request(app)
      .get(`/api/projects/${projectId}/test-runs/${runId}/executions`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(execRes.body.data.length).toBe(2);
  });

  test('starting an already started run returns resumed', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/test-runs/${runId}/start`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.resumed).toBe(true);
  });

  test('update execution status', async () => {
    const execRes = await request(app)
      .get(`/api/projects/${projectId}/test-runs/${runId}/executions`)
      .set('Authorization', `Bearer ${userToken}`);

    const execId = execRes.body.data[0]._id;

    const res = await request(app)
      .put(`/api/projects/${projectId}/test-runs/${runId}/executions/${execId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'pass' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('pass');
  });

  test('complete run', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/test-runs/${runId}/complete`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.counts).toBeDefined();
  });
});

describe('Bug creation', () => {
  beforeAll(async () => {
    userToken = await registerUser('bugger', 'bugger@test.com', 'password123');

    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Bug Project', key: 'BP' });

    projectId = projectRes.body.data._id;
  });

  test('create bug assigns a Bug ID', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/bugs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Button not working',
        description: 'The submit button does nothing',
        severity: 'high',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.bugKey).toBeDefined();
    expect(res.body.data.bugKey).toMatch(/^BR-\d{3}$/);
    expect(res.body.data.title).toBe('Button not working');
    expect(res.body.data.severity).toBe('high');
  });

  test('second bug gets incremented Bug ID', async () => {
    await request(app)
      .post(`/api/projects/${projectId}/bugs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Bug 2', description: 'Second bug' });

    await request(app)
      .post(`/api/projects/${projectId}/bugs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Bug 3', description: 'Third bug' });

    const listRes = await request(app)
      .get(`/api/projects/${projectId}/bugs`)
      .set('Authorization', `Bearer ${userToken}`);

    const keys = listRes.body.data.map((b) => b.bugKey).sort();
    expect(keys).toContain('BR-002');
    expect(keys).toContain('BR-003');
  });

  test('list bugs', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/bugs`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });

  test('get single bug', async () => {
    const listRes = await request(app)
      .get(`/api/projects/${projectId}/bugs`)
      .set('Authorization', `Bearer ${userToken}`);

    const bugId = listRes.body.data[0]._id;

    const res = await request(app)
      .get(`/api/projects/${projectId}/bugs/${bugId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(bugId);
  });

  test('update bug', async () => {
    const listRes = await request(app)
      .get(`/api/projects/${projectId}/bugs`)
      .set('Authorization', `Bearer ${userToken}`);

    const bugId = listRes.body.data[0]._id;

    const res = await request(app)
      .put(`/api/projects/${projectId}/bugs/${bugId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ severity: 'critical' });

    expect(res.status).toBe(200);
    expect(res.body.data.severity).toBe('critical');
  });

  test('change bug status', async () => {
    const listRes = await request(app)
      .get(`/api/projects/${projectId}/bugs`)
      .set('Authorization', `Bearer ${userToken}`);

    const bugId = listRes.body.data[0]._id;

    const res = await request(app)
      .patch(`/api/projects/${projectId}/bugs/${bugId}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
  });

  test('delete bug', async () => {
    const bug = await request(app)
      .post(`/api/projects/${projectId}/bugs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Delete me', description: 'Temp bug' });

    const res = await request(app)
      .delete(`/api/projects/${projectId}/bugs/${bug.body.data._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });
});

describe('Bug report export', () => {
  beforeAll(async () => {
    userToken = await registerUser('exporter', 'exporter@test.com', 'password123');

    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Export Project', key: 'EP' });

    projectId = projectRes.body.data._id;

    await request(app)
      .post(`/api/projects/${projectId}/bugs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Export bug', description: 'For export test' });
  });

  test('export returns xlsx attachment', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/bugs/export`)
      .set('Authorization', `Bearer ${userToken}`)
      .buffer(true)
      .parse((res, cb) => {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => cb(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(res.headers['content-disposition']).toContain('qa-bug-report.xlsx');
    expect(res.body).toBeInstanceOf(Buffer);
  });
});

describe('Validation', () => {
  beforeAll(async () => {
    userToken = await registerUser('val', 'val@test.com', 'password123');

    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Val Project', key: 'VP' });

    projectId = projectRes.body.data._id;
  });

  test('rejects test case without title', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/test-cases`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ module: 'Auth' });

    expect(res.status).toBe(400);
  });

  test('rejects run without name', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/test-runs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'smoke' });

    expect(res.status).toBe(400);
  });

  test('rejects bug without description', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/bugs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'No desc' });

    expect(res.status).toBe(400);
  });
});
