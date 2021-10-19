const Database = require('better-sqlite3')
const bcrypt = require('bcrypt')
const path = require('path')
const { v4 } = require('uuid')
const { cleanQuery } = require('./utils')
const { SQLITE_ERRORS, BE_ERRORS } = require('../utils/errors')

const TABLES = {
    USER: {
        TABLE_NAME: 'User',
        ID: 'id',
        EMAIL: 'email',
        PASSWORD: 'password',
        RESETCODE: 'reset_code'
    },
    REMINDERS: {
        TABLE_NAME: 'Reminders',
        ID: 'id',
        USER: 'user',
        CONTENT: 'content'
    }
}

const DATABASENAME = 'reminders'
const DBPATH = path.resolve(`${__dirname}/..`, `${DATABASENAME}.db`)

class RemindersDB {
    #dbPath
    #db
    constructor(dbPath = DBPATH) {
        this.#dbPath = dbPath
        this.#db = undefined
        this.#createDB()
    }

    //#region DB initialization
    #createDB() {
        const query = cleanQuery(`
            PRAGMA foreign_keys = ON;
            CREATE TABLE IF NOT EXISTS  ${TABLES.USER.TABLE_NAME} (
                ${TABLES.USER.ID}          TEXT PRIMARY KEY ,
                ${TABLES.USER.EMAIL}       TEXT NOT NULL    ,
                ${TABLES.USER.PASSWORD}    TEXT NOT NULL    ,
                ${TABLES.USER.RESETCODE}   TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS ${TABLES.REMINDERS.TABLE_NAME} (
                ${TABLES.REMINDERS.ID}          TEXT         PRIMARY KEY ,
                ${TABLES.REMINDERS.USER}        TEXT                     ,
                ${TABLES.REMINDERS.CONTENT}     VARCHAR(140)             ,
                FOREIGN KEY(${TABLES.REMINDERS.USER}) REFERENCES ${TABLES.USER.TABLE_NAME}(${TABLES.USER.ID})
            );
        `)
        try {
            this.#open()
            this.#db.exec(query)
            this.#close()
            return true
        } catch (err) {
            throw BE_ERRORS[500]
        }
    }

    #open(readonly = false) {
        !this.#db?.open && (
            this.#db = new Database(this.#dbPath, {
                readonly
            })
        )
    }

    #close() {
        this.#db?.open && this.#db.close()
    }
    //#endregion

    //#region Authentication
    createUser(email, password) {
        const query = cleanQuery(`
            INSERT INTO ${TABLES.USER.TABLE_NAME}
            VALUES (
                ?, ?, ?, ?
            );
        `)
        if (!this.checkUserExistance(email)) {
            const id = v4()
            const resetCode = v4()
            const hash = bcrypt.hashSync(password, 10)
            try {
                this.#open()
                const statement = this.#db.prepare(query)
                const res = statement.run(id, email, hash, resetCode)
                this.#close()
                return res.changes === 1 ? id : false
            } catch (err) {
                throw BE_ERRORS[500]
            }
        }
        throw SQLITE_ERRORS.USEREXISTS
    }

    getUserByEmail(email) {
        const query = cleanQuery(`
            SELECT
                ${TABLES.USER.ID},
                ${TABLES.USER.EMAIL},
                ${TABLES.USER.RESETCODE}
            FROM ${TABLES.USER.TABLE_NAME}
            WHERE ${TABLES.USER.EMAIL}=?
        `)
        try {
            this.#open()
            const statement = this.#db.prepare(query)
            const res = statement.get(email)
            this.#close()
            if (res) {
                return res
            } else {
                throw SQLITE_ERRORS.USERNOTFOUND
            }
        } catch (err) {
            if (err === SQLITE_ERRORS.USERNOTFOUND) throw err
            throw BE_ERRORS[500]
        }
    }

    validateUser(email, password) {
        const query = cleanQuery(`
            SELECT * FROM ${TABLES.USER.TABLE_NAME}
            WHERE ${TABLES.USER.EMAIL}=?
        `)
        try {
            this.#open()
            const statement = this.#db.prepare(query)
            const res = statement.get(email)
            this.#close()
            if (res) {
                const { id, email: userEmail, password: hash } = res
                return bcrypt.compareSync(password, hash) ? { id, email: userEmail } : false
            } else {
                throw SQLITE_ERRORS.USERNOTFOUND
            }
        } catch (err) {
            if (err === SQLITE_ERRORS.USERNOTFOUND) throw err
            throw BE_ERRORS[500]
        }
    }

    checkUserExistance(email) {
        const query = cleanQuery(`
            SELECT EXISTS(
                SELECT 1 FROM ${TABLES.USER.TABLE_NAME} WHERE ${TABLES.USER.EMAIL}=?
            ) as exist;
        `)
        try {
            this.#open()
            const statement = this.#db.prepare(query)
            const result = statement.pluck().get(email)
            const exists = Boolean(result)
            this.#close()
            return exists
        } catch (err) {
            throw BE_ERRORS[500]
        }
    }

    checkUserExistanceById(id) {
        const query = cleanQuery(`
            SELECT EXISTS (
                SELECT 1 FROM ${TABLES.USER.TABLE_NAME} WHERE ${TABLES.USER.ID}=?
            ) as exist;
        `)
        try {
            this.#open()
            const statement = this.#db.prepare(query)
            const exists = Boolean(statement.pluck().get(id))
            this.#close()
            return exists
        } catch (err) {
            throw BE_ERRORS[500]
        }
    }

    #updateUserResetCode(id) {
        const query = cleanQuery(`
            UPDATE ${TABLES.USER.TABLE_NAME}
            SET ${TABLES.USER.RESETCODE}=?
            WHERE ${TABLES.USER.ID}=?
        `)
        try {
            const resetCode = v4()
            this.#open()
            const statement = this.#db.prepare(query)
            const res = statement.run(resetCode, id)
            this.#close()
            return res.changes === 1
        } catch (err) {
            throw BE_ERRORS[500]
        }
    }

    resetUserPassword(id, resetCode, password) {
        const query = cleanQuery(`
            UPDATE ${TABLES.USER.TABLE_NAME}
            SET ${TABLES.USER.PASSWORD}=?
            WHERE (
                ${TABLES.USER.ID}=? AND
                ${TABLES.USER.RESETCODE}=?
            )
        `)
        try {
            if (this.checkUserExistanceById(id)) {
                const hash = bcrypt.hashSync(password, 10)
                this.#open()
                const statement = this.#db.prepare(query)
                const res = statement.run(hash, id, resetCode)
                if (res.changes === 1) {
                    // update the user's reset code, invalidating the reset token.
                    this.#updateUserResetCode(id)
                    return true
                } else {
                    // Reset Code has expired
                    throw SQLITE_ERRORS.RESETCODEEXPIRED
                }
            } else {
                throw SQLITE_ERRORS.USERNOTFOUND
            }
        } catch (err) {
            if (err === SQLITE_ERRORS.RESETCODEEXPIRED) throw err
            if (err === SQLITE_ERRORS.USERNOTFOUND) throw err
            throw BE_ERRORS[500]
        }
    }

    getAllUsers() {
        const query = cleanQuery(`
            SELECT
                ${TABLES.USER.ID},
                ${TABLES.USER.EMAIL}
            FROM ${TABLES.USER.TABLE_NAME}
        `)
        try {
            this.#open()
            const statement = this.#db.prepare(query)
            const users = statement.all()
            this.#close()
            return users;
        } catch (err) {
            throw BE_ERRORS[500]
        }
    }
    //#endregion

    //#region CRUD Reminders
    //#region CREATE
    addReminder(userId, content) {
        const query = cleanQuery(`
            INSERT INTO ${TABLES.REMINDERS.TABLE_NAME} (
                id, user, content
            )
            VALUES (
                ?, ?, ?
            );
        `)
        try {
            const id = v4()
            this.#open()
            const statement = this.#db.prepare(query)
            statement.run(id, userId, content)
            this.#close()
            return this.getUserReminder(userId, id)
        } catch (err) {
            throw BE_ERRORS[500]
        }
    }
    //#endregion

    //#region READ
    //#region USER
    getUserReminders(userId) {
        const query = cleanQuery(`
            SELECT
                ${TABLES.REMINDERS.ID},
                ${TABLES.REMINDERS.CONTENT}
            FROM ${TABLES.REMINDERS.TABLE_NAME}
            WHERE ${TABLES.REMINDERS.USER}=?;
        `)
        try {
            this.#open()
            const statement = this.#db.prepare(query)
            const res = statement.all(userId)
            this.#close()
            return res
        } catch (err) {
            throw BE_ERRORS[500]
        }
    }

    getUserReminder(userId, reminderId) {
        const query = cleanQuery(`
            SELECT
                ${TABLES.REMINDERS.ID},
                ${TABLES.REMINDERS.CONTENT}
            FROM ${TABLES.REMINDERS.TABLE_NAME}
            WHERE (
                ${TABLES.REMINDERS.USER}=? AND
                ${TABLES.REMINDERS.ID}=?
            );
        `)
        try {
            this.#open()
            const statement = this.#db.prepare(query)
            const res = statement.get(userId, reminderId)
            this.#close()
            if (res) return res
            throw SQLITE_ERRORS.REMINDERNOTFOUND
        } catch (err) {
            if (err === SQLITE_ERRORS.REMINDERNOTFOUND) throw err
            throw BE_ERRORS[500]
        }
    }
    //#endregion

    //#region ALL
    getAllReminders() {
        const query = cleanQuery(`
            SELECT
                ${TABLES.REMINDERS.ID},
                ${TABLES.REMINDERS.CONTENT}
            FROM ${TABLES.REMINDERS.TABLE_NAME}
            GROUP BY ${TABLES.REMINDERS.USER}, ${TABLES.REMINDERS.ID}
        `)
        try {
            this.#open()
            const statement = this.#db.prepare(query)
            const res = statement.all()
            this.#close()
            return res
        } catch (err) {
            throw BE_ERRORS[500]
        }
    }
    //#endregion
    //#endregion

    //#region UPDATE
    updateReminder(content, reminderId) {
        // TODO should return the updated reminder
        const query = cleanQuery(`
            UPDATE ${TABLES.REMINDERS.TABLE_NAME}
            SET ${TABLES.REMINDERS.CONTENT}=?
            WHERE ${TABLES.REMINDERS.ID}=?
        `)
        try {
            this.#open()
            const statement = this.#db.prepare(query)
            const res = statement.get(content, reminderId)
            this.#close()
            return res
        } catch (err) {
            throw BE_ERRORS[500]
        }
    }

    updateUserReminder(content, userId, reminderId) {
        // TODO should return the updated reminder
        const query = cleanQuery(`
            UPDATE ${TABLES.REMINDERS.TABLE_NAME}
            SET ${TABLES.REMINDERS.CONTENT}=?
            WHERE (
                ${TABLES.REMINDERS.USER}=? AND
                ${TABLES.REMINDERS.ID}=?
            );
        `)
        try {
            this.#open()
            const statement = this.#db.prepare(query)
            const res = statement.run(content, userId, reminderId)
            this.#close()
            if (res.changes === 1) {
                return this.getUserReminder(userId, reminderId)
            }
            throw SQLITE_ERRORS.REMINDERNOTFOUND
        } catch (err) {
            if (err === SQLITE_ERRORS.REMINDERNOTFOUND) throw err
            throw BE_ERRORS[500]
        }
    }
    //#endregion

    //#region DELETE
    deleteReminder(reminderId) {
        const query = cleanQuery(`
            DELETE FROM ${TABLES.REMINDERS.TABLE_NAME}
            WHERE ${TABLES.REMINDERS.ID}=?
        `)
        try {
            this.#open()
            const statement = this.#db.prepare(query)
            statement.exec(reminderId)
            this.#close()
            return true
        } catch (err) {
            throw BE_ERRORS[500]
        }
    }

    deleteUserReminder(userId, reminderId) {
        const query = cleanQuery(`
            DELETE FROM ${TABLES.REMINDERS.TABLE_NAME}
            WHERE (
                ${TABLES.REMINDERS.USER}=? AND
                ${TABLES.REMINDERS.ID}=?
            );
        `)
        try {
            this.#open()
            const statement = this.#db.prepare(query)
            const res = statement.run(userId, reminderId)
            this.#close()
            if (res.changes === 1) return true
            throw SQLITE_ERRORS.REMINDERNOTFOUND
        } catch (err) {
            if (err === SQLITE_ERRORS.REMINDERNOTFOUND) throw err
            throw BE_ERRORS[500]
        }
    }
    //#endregion
    //#endregion
}

let singleton
function DB(dbPath = DBPATH) {
    return singleton || (singleton = new RemindersDB(dbPath))
}

module.exports = {
    DB
}