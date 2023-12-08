'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

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
            RETURNING title, salary, equity, company_handle AS "companyHandle"
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

    /** Update job data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: {title, salary, equity}
     *
     * Returns {title, salary, equity, companyHandle}
     *
     * Throws NotFoundError if not found.
     */
    static async update(id, data) {
        // Exclude fields that should not be updated
        const { companyHandle, ...updateData } = data;
        if (companyHandle) {
            throw new BadRequestError('Updating company handle is not allowed');
        }

        // Check if there's data left to update after removing restricted fields
        if (Object.keys(updateData).length === 0) {
            throw new BadRequestError('No data to update');
        }

        const { setCols, values } = sqlForPartialUpdate(updateData, {});

        const idVarIdx = '$' + (values.length + 1);

        const querySql = `UPDATE jobs
                          SET ${setCols}
                          WHERE id = ${idVarIdx}
                          RETURNING title, salary, equity, company_handle AS "companyHandle"`;

        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }

    /**
     * Delete given job from database; returns undefined.
     *
     * Throws NotFoundError if job not found
     */
    static async remove(id) {
        const result = await db.query(
            `
            DELETE FROM jobs
            WHERE id = $1
            `,
            [id]
        );

        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);
    }
}

module.exports = Job;
