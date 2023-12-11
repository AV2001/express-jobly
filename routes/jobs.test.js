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
    test('returns all jobs', async () => {
        const response = await request(app).get('/jobs');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ jobs: [testJob()] });
    });
});

// GET /jobs/:id
describe('GET /jobs/:id', () => {
    test('return a job', async () => {
        const response = await request(app).get(`/jobs/${testJob().id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ job: testJob() });
    });

    test('returns 404 if invalid id is passed', async () => {
        const response = await request(app).get('/jobs/0');
        expect(response.statusCode).toBe(404);
    });
});

// POST /jobs
describe('POST /jobs', () => {
    test('create a job as an admin', async () => {
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
                equity: '0.1',
            },
        });
    });

    test('returns 400 if missing job data', async () => {
        const response = await request(app)
            .post('/jobs')
            .set('authorization', `Bearer ${u1Token}`);
        expect(response.statusCode).toBe(400);
    });

    test('returns 400 if invalid companyHandle is provided', async () => {
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

    test('returns 401 if non-admin user creates a job', async () => {
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

// PATCH /jobs/:id
describe('PATCH /jobs/:id', () => {
    test('update a job successfully as an admin', async () => {
        const updatedJob = { title: 'Senior Software Engineer' };
        const response = await request(app)
            .patch(`/jobs/${testJob().id}`)
            .send(updatedJob)
            .set('authorization', `Bearer ${u1Token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            job: {
                title: updatedJob.title,
                salary: 200000,
                equity: '0.5',
                companyHandle: 'c1',
            },
        });
    });

    test('returns 400 if id is updated', async () => {
        const updatedJob = { id: 100 };
        const response = await request(app)
            .patch(`/jobs/${testJob().id}`)
            .send(updatedJob)
            .set('authorization', `Bearer ${u1Token}`);
        expect(response.statusCode).toBe(400);
    });

    test('returns 400 if companyHandle is updated', async () => {
        const updatedJob = {
            companyHandle: 'google',
        };
        const response = await request(app)
            .patch(`/jobs/${testJob().id}`)
            .send(updatedJob)
            .set('authorization', `Bearer ${u1Token}`);
        expect(response.statusCode).toBe(400);
    });

    test('returns 400 on invalid data', async () => {
        const updatedJob = { salary: '200000' };
        const response = await request(app)
            .patch(`/jobs/${testJob().id}`)
            .send(updatedJob)
            .set('authorization', `Bearer ${u1Token}`);
        expect(response.statusCode).toBe(400);
    });

    test('returns 400 if job data us empty', async () => {
        const response = await request(app)
            .patch(`/jobs/${testJob().id}`)
            .set('authorization', `Bearer ${u1Token}`);
        expect(response.statusCode).toBe(400);
    });

    test('returns 401 if non-admin updates a job', async () => {
        const newUserToken = createToken({ username: 'user', isAdmin: false });
        const newJob = {
            title: 'Software Engineer',
            salary: 200000,
            equity: 0.1,
            companyHandle: 'c1',
        };
        const response = await request(app)
            .patch(`/jobs/${testJob().id}`)
            .send(newJob)
            .set('authorization', `Bearer ${newUserToken}`);
        expect(response.statusCode).toBe(401);
    });
});

// DELETE /jobs/:id
describe('DELETE /jobs/:id', () => {
    test('admin can delete a job', async () => {
        const response = await request(app)
            .delete(`/jobs/${testJob().id}`)
            .set('authorization', `Bearer ${u1Token}`);
        expect(response.statusCode).toBe(200);
    });

    test('returns 404 if invalid id is provided', async () => {
        const response = await request(app)
            .delete('/jobs/1')
            .set('authorization', `Bearer ${u1Token}`);
        expect(response.statusCode).toBe(404);
    });

    test('returns 401 if non-admin user deletes a job', async () => {
        const newUserToken = createToken({ username: 'user', isAdmin: false });
        const response = await request(app).delete(`/jobs/${testJob().id}`);
        expect(response.statusCode).toBe(401);
    });
});
