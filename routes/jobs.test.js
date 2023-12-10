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
} = require('./_testCommon');
const { createToken } = require('../helpers/tokens');
const Test = require('supertest/lib/test');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// GET /jobs
describe('GET /jobs', () => {
    test('Returns all jobs', async () => {
        const response = await request(app).get('/jobs');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            jobs: [
                {
                    title: 'Software Engineer',
                    salary: 200000,
                    equity: '0.5',
                    companyHandle: 'c1',
                },
            ],
        });
    });
});
