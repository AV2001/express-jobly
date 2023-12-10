'use strict';

process.env.NODE_ENV = 'test';

const request = require('supertest');

const db = require('../db');
const app = require('../app');

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJob,
    u1Token,
} = require('./_testCommon');
const { createToken } = require('../helpers/tokens');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// GET /jobs
describe('GET /jobs', () => {
    test('Returns all jobs', async () => {
        const response = await request(app).get('/jobs');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ jobs: [testJob()] });
    });
});

// GET /jobs/:id
describe('GET /jobs/:id', () => {
    test('Return a job', async () => {
        const response = await request(app).get(`/jobs/${testJob().id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ job: testJob() });
    });

    test('Returns 404 if invalid id is passed', async () => {
        const response = await request(app).get('/jobs/0');
        expect(response.statusCode).toBe(404);
    });
});

// POST /jobs
describe('POST /jobs', () => {
    test('Create a job as an admin', async () => {
        const newJob = {
            title: 'Software Engineer',
            salary: 200000,
            equity: 0.1,
            companyHandle: 'c1',
        };
        const response = await request(app)
            .post('/jobs')
            .send(newJob)
            .set('authorization', `Bearer ${u1Token}`);
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            job: {
                ...newJob,
                id: expect.any(Number),
                equity: expect.any(String),
            },
        });
    });

    test('Returns 400 if missing job data', async () => {
        const response = await request(app)
            .post('/jobs')
            .set('authorization', `Bearer ${u1Token}`);
        expect(response.statusCode).toBe(400);
    });

    test('Returns 400 if invalid companyHandle is provided', async () => {
        const newJob = {
            salary: 200000,
            equity: 0.1,
            companyHandle: 'google',
        };
        const response = await request(app)
            .post('/jobs')
            .send(newJob)
            .set('authorization', `Bearer ${u1Token}`);
        expect(response.statusCode).toBe(400);
    });

    test('Returns 401 if non-admin user creates a job', async () => {
        const newUserToken = createToken({ username: 'user', isAdmin: false });
        const newJob = {
            title: 'Software Engineer',
            salary: 200000,
            equity: 0.1,
            companyHandle: 'c1',
        };
        const response = await request(app)
            .post('/jobs')
            .send(newJob)
            .set('authorization', `Bearer ${newUserToken}`);
        expect(response.statusCode).toBe(401);
    });
});
