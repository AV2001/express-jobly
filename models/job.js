'use strict';

const db = require('../db');
const { BadRequestError } = require('../expressError');

class Job {
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
}

module.exports = Job;
