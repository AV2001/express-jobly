'use strict';

const db = require('../db');
const { BadRequestError } = require('../expressError');

class Job {
    static async create({ title, salary, equity, companyHandle }) {
        const duplicateCheck = await db.query(
            `
            SELECT company_handle
            FROM jobs
            WHERE company_handle = $1
            `,
            [companyHandle]
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate company: ${companyHandle}`);
        }

        const result = await db.query(
            `
            INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNNG title, salary, equity, company_handle
            `,
            [title, salary, equity, companyHandle]
        );

        const job = result.rows[0];

        return job;
    }
}

module.exports = Job;
