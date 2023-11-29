const jsonwebtoken = require('jsonwebtoken');
const { sqlForPartialUpdate } = require('./sql');
const { BadRequestError } = require('../expressError');

describe('sqlForPartialUpdate', () => {
    test('works: generating SQL for updating a single item', () => {
        const result = sqlForPartialUpdate(
            { firstName: 'Aliya' },
            { firstName: 'first_name' }
        );
        expect(result).toEqual({
            setCols: '"first_name"=$1',
            values: ['Aliya'],
        });
    });

    test('works: generating SQL for updating multiple items', () => {
        const result = sqlForPartialUpdate(
            { firstName: 'Aliya', age: 32 },
            { firstName: 'first_name' }
        );
        expect(result).toEqual({
            setCols: '"first_name"=$1, "age"=$2',
            values: ['Aliya', 32],
        });
    });

    test('throws BadRequestError if no data is provided', () => {
        expect(() => {
            sqlForPartialUpdate({}, {});
        }).toThrow(BadRequestError);
    });
});
