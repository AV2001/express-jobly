'use strict';

// Routes for jobs.

const jsonschema = require('jsonschema');
const express = require('express');

const Job = require('../models/job');

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

module.exports = router;
