'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const Job = require('./job');
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// Create
describe('CREATE', () => {
    const newJob = {
        title: 'Software Test Engineer',
        salary: 160000,
        equity: 0,
        companyHandle: 'c1',
    };

    test('works', async () => {
        const job = await Job.create(newJob);
        expect(job).toEqual({ ...newJob, equity: '0', id: expect.any(Number) });
    });
});
