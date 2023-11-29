const { BadRequestError } = require('../expressError');

/**
 * Generates SQL column assignment string and corresponding values array for a partial update.
 *
 * The function takes an object of data to update and a mapping object to convert JavaScript
 * object keys to SQL column names. It is useful for dynamically creating the SET part
 * of an SQL UPDATE statement.
 *
 * @param {Object} dataToUpdate - An object where keys are object fields to update and values are the new values.
 * @param {Object} jsToSql - A mapping object from JavaScript camelCase keys to SQL snake_case column names.
 * @returns {Object} An object with two properties: `setCols` (String), a comma-separated column assignment string,
 *                   and `values` (Array), an array of values corresponding to the placeholders in `setCols`.
 *
 * @throws {BadRequestError} If `dataToUpdate` is empty.
 *
 * @example
 * returns { setCols: "\"first_name\"=$1, \"age\"=$2", values: ["Aliya", 32] }
 * sqlForPartialUpdate({ firstName: 'Aliya', age: 32 }, { firstName: "first_name" });
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0) throw new BadRequestError('No data');

    // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
    const cols = keys.map(
        (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
    );

    return {
        setCols: cols.join(', '),
        values: Object.values(dataToUpdate),
    };
}

module.exports = { sqlForPartialUpdate };
