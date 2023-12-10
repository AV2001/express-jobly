'use strict';

// Routes for jobs.

const jsonschema = require('jsonschema');
const express = require('express');

const { ensureLoggedIn, ensureUserIsAdmin } = require('../middleware/auth');
const Job = require('../models/job');

const jobNewSchema = require('../schemas/jobNew.json');
const jobUpdateSchema = require('../schemas/jobUpdate.json');
const { BadRequestError } = require('../expressError');

const router = express.Router();

/**
 * GET / =>
 * {jobs: [{title, salary, equity, companyHandle}, ...]}
 *
 * Authorization required: none
 */
router.get('/', async (req, res, next) => {
    try {
        const jobs = await Job.findAll();
        return res.json({ jobs });
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /:id => {job}
 *
 * Job is {title, salary, equity, companyHandle}
 *
 * Authorization required: none
 */
router.get('/:id', async (req, res, next) => {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/**
 * POST / {job} => {job}
 *
 * job should be {title, salary, equity, companyHandle}
 *
 * Returns {title, salary, equity, companyHandle}
 *
 * Authorization required: login
 */
router.post('/', ensureUserIsAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errors = validator.errors.map((e) => e.stack);
            throw new BadRequestError(errors);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});

/**
 * PATCH /:id {field1, field2, ...} => {job}
 *
 * Patches job data.
 *
 * Fields can be: {title, salary, equity}
 *
 * Returns {title, salary, equity, companyHandle}
 *
 * Authorization required: login
 */
router.patch('/:id', ensureUserIsAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errors = validator.errors.map((e) => e.stack);
            throw new BadRequestError(errors);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/**
 * DELETE /:id => {delete: id}
 *
 * Authorization required: login
 */
router.delete('/:id', ensureUserIsAdmin, async (req, res, next) => {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
