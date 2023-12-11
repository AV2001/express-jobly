'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const Job = require('./job');
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJob,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// create
describe('create', () => {
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

// findAll
describe('findAll', () => {
    test('works: no filter', async () => {
        const jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: 'Software Engineer',
                salary: 200000,
                equity: '0.5',
                companyHandle: 'c1',
            },
        ]);
    });
});

// get
describe('get', () => {
    test('works', async () => {
        const testJobData = testJob().rows[0];
        const job = await Job.get(`${testJobData.id}`);
        expect(job).toEqual({ ...testJobData });
    });

    test('returns 404 if no such company is found', async () => {
        try {
            await Job.get(0);
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

// update
describe('update', () => {
    const updateData = {
        title: 'Senior Software Engineer',
        salary: 260000,
        equity: 0.8,
    };

    test('works', async () => {
        const testJobData = testJob().rows[0];
        const job = await Job.update(testJobData.id, updateData);
        expect(job).toEqual({
            ...updateData,
            companyHandle: 'c1',
            equity: '0.8',
        });
    });

    test('returns 404 if no such company is found', async () => {
        const testJobData = testJob().rows[0];
        try {
            await Job.update(0, updateData);
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test('returns 400 with no data', async () => {
        const testJobData = testJob().rows[0];
        try {
            await Job.update(testJobData.id, {});
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});
