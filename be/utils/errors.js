function createError(code, message) {
    const err = new Error()
    err.code = code
    err.message = message
    return err
}
const SQLITE_ERRORS = {
    USEREXISTS: createError("USER_EXISTS", "The email provided has already been used."),
    USERNOTFOUND: createError('USER_NOT_FOUND', 'Could not find a user matching the provided credentials.'),
    REMINDERNOTFOUND: createError('REMINDER_NOT_FOUND', "Could not find a reminder matching the provided id."),
    CONTENTTOOLONG: createError('CONTENT_TOO_LONG', "The content field must have less or equal then 140 characters."),
    INVALIDEMAIL: createError('INVALID_EMAIL', 'Please provid a valid email.'),
    RESETCODEEXPIRED: createError('RESET_CODE_EXPIRED', 'The reset token has expired')
}

const BE_ERRORS = {
    "500": createError("PLEASE_DONT_BE_TOO_MAD_AT_THE_DEV", "An error has occured. Blame the dev, he fudged up.")
}

module.exports = {
    createError,
    SQLITE_ERRORS,
    BE_ERRORS
}