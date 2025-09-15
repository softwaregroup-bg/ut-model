module.exports = () => ({
    /**
     * Trims all string values in a record while preserving other data types
     * @param {Array} record - Array of values to process
     * @returns {Array} - Array with trimmed string values
     */
    trimRecord: record => record.map(value => 
        typeof value === 'string' ? value.trim() : value
    )
});
