'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');

class Job {
    /**
     * Create a job (from data), update db, return new job data.
     *
     * data should be {title, salary, equity, companyHandle}
     *
     * Returns {title, salary, equity, companyHandle}
     */
    static async create({ title, salary, equity, companyHandle }) {
        const result = await db.query(
            `
            INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNNG title, salary, equity, company_handle AS "companyHandle"
            `,
            [title, salary, equity, companyHandle]
        );

        const job = result.rows[0];

        return job;
    }

    /**
     * Find all jobs.
     *
     * Returns [{title, salary, equity, companyHandle}, ...]
     *
     */
    static async findAll() {
        const jobs = await db.query(
            `
            SELECT title, salary, equity, company_handle AS "companyHandle" FROM jobs
            `
        );

        return jobs.rows;
    }

    /**
     * Given a job id, return data about job.
     *
     * Returns {title, salary, equity, companyHandle}
     *
     * Throws NotFoundError if not found.
     */
    static async get(id) {
        const jobRes = await db.query(
            `
            SELECT title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1
            `,
            [id]
        );

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }
}

module.exports = Job;
