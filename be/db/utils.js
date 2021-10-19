function cleanQuery(sqlString) {
    // replace the "control characters" first
    // then replace white spaces to single spaces
    // then trim
    return sqlString.replace(/[\n\r\t]/g, ' ').replace(/[\s]{2,}/g, ' ').trim()
}

module.exports = {
    cleanQuery
}