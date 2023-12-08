'use strict';

// Routes for jobs.

const jsonschema = require('jsonschema');
const express = require('express');

const { ensureLoggedIn, ensureUserIsAdmin } = require('../middleware/auth');
const Job = require('../models/job');

const jobNewSchema = require('../schemas/jobNew.json');
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

module.exports = router;
