const express = require('express')
const cors = require('cors')
const { sign, verify, TYPES, refresh } = require('./auth/jwt')
const { DB } = require('./db/db')
const { SQLITE_ERRORS } = require('./utils/errors')
const { isEmail } = require('validator')
const port = 3001

const AUTHORIZATION = 'authorization'
const SESSION = 'SESSION'


//#region Validation

//#region Auth
function validateJWT(type, req, res, next) {
    const jwt = getJWT(req)
    if (jwt) {
        try {
            const payload = verify(jwt, type)
            const db = new DB()
            // Validates that the user exists in DB.
            // This can happen with an oldish JWT from a user
            // That doesn't exists anymore
            if (db.checkUserExistanceById(payload.sub)) {
                res.locals['userId'] = payload.sub
                if (type === TYPES.RESET.name) res.locals['resetCode'] = payload.resetCode
                next()
                return
            }
        } catch (err) {
            FudgedUp(res)
            return
        }
    }
    Unauthorized(res)
}

function validateAuthorizationJWT() {
    return validateJWT.bind(undefined, TYPES.AUTHORIZATION.name)
}

function validateResetJWT() {
    return validateJWT.bind(undefined, TYPES.RESET.name)
}

function refreshJWT(req, res, next) {
    const jwt = getJWT(req)
    if (jwt) {
        const newJwt = refresh(jwt, TYPES.AUTHORIZATION.name)
        if (newJwt) {
            res.cookie('SESSION', newJwt)
            res.set(AUTHORIZATION, `Bearer ${newJwt}`)
            next()
            return
        }
    }
    Unauthorized(res)
}

function validateEmail(req, res, next) {
    const email = req.body.email
    if (email) {
        if (isEmail(email)) {
            next()
            return
        }
    }
    res.status(400).json(SQLITE_ERRORS.INVALIDEMAIL)
}
//#endregion

//#region Reminders
function validateContent(req, res, next) {
    const content = req.body.content
    if (content) {
        if (content.length <= 140) {
            next()
            return
        }
        res.status(400).json(SQLITE_ERRORS.CONTENTTOOLONG)
        return
    }
    BadRequest(res)
}

function validateReminderId(req, res, next) {
    req.params.reminderId ? next() : BadRequest(res)
}
//#endregion

//#endregion

//#region Utilities

//#region Authentication
function clearJWT(res) {
    res.clearCookie(SESSION)
}

function setJWT(jwt, res) {
    res.set(AUTHORIZATION, `Bearer ${jwt}`)
    res.cookie(SESSION, jwt)
}

function getJWT(req) {
    return req.get(AUTHORIZATION)?.split(' ')?.[1]
}

function Logout(res) {
    clearJWT(res)
    OK(res)
}

function Login(jwt, res) {
    setJWT(jwt, res)
    OK(res)
}
//#endregion

//#region Responses

//#region 200
function OK(res) {
    res.status(200).send('OK')
}
//#endregion

//#region 400
function Unauthorized(res) {
    clearJWT(res)
    res.status(401).send('Unauthorized')
}

function NotFound(res) {
    res.status(404).send('Not Found')
}

function BadRequest(res) {
    res.status(400).send('Bad request')
}
//#endregion

//#region 500
function FudgedUp(res) {
    res.status(500).send('500 Internal Server Error')
}
//#endregion

//#endregion

//#endregion

const app = express()
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost'],
    credentials: true
}))
app.use(express.json())

//#region Authentication
app.get(
    '/sso',
    [
        validateAuthorizationJWT()
    ],
    (req, res) => {
        OK(res)
    }
)

app.get(
    '/refresh',
    [
        validateAuthorizationJWT(),
        refreshJWT
    ],
    (req, res) => {
        OK(res)
    }
)

app.post(
    '/signup',
    [
        validateEmail
    ],
    (req, res) => {
        const { email, password } = req.body
        try {
            const db = new DB()
            const userId = db.createUser(email, password)
            const payload = { sub: userId }
            const jwt = sign(payload, TYPES.AUTHORIZATION.name)
            Login(jwt, res)
        } catch (err) {
            if (err === SQLITE_ERRORS.USEREXISTS) {
                res.status(409).json({
                    code: err.code,
                    message: err.message
                })
            } else {
                FudgedUp(res)
            }
        }
    }
)

app.post(
    '/login',
    [
        validateEmail
    ],
    (req, res) => {
        const { email, password } = req.body
        try {
            const db = new DB()
            const user = db.validateUser(email, password)
            if (user) {
                const jwt = sign({ sub: user.id }, TYPES.AUTHORIZATION.name)
                Login(jwt, res)
            } else {
                res.status(404).json(SQLITE_ERRORS.USERNOTFOUND)
            }
        } catch (err) {
            if (err === SQLITE_ERRORS.USERNOTFOUND) {
                res.status(404).json({ code: err.code, message: err.message })
            } else {
                FudgedUp(res)
            }
        }
    }
)

app.delete(
    '/logout',
    (req, res) => {
        try {
            Logout(res)
        } catch (err) {
            FudgedUp(res)
        }
    }
)

app.post(
    '/forgot',
    [
        validateEmail
    ],
    (req, res) => {
        const { email } = req.body
        try {
            const db = new DB()
            const { id, reset_code } = db.getUserByEmail(email)
            const jwt = sign({ sub: id, resetCode: reset_code }, TYPES.RESET.name)
            // TODO send by mail instead

            // TEMP for testing reset without the mail
            res.status(200).send(jwt)
        } catch (err) {
            if (err === SQLITE_ERRORS.USERNOTFOUND) {
                res.status(404).json(err)
            } else {
                FudgedUp(res)
            }
        }
    }
)

app.post(
    '/reset',
    [
        validateResetJWT()
    ],
    (req, res) => {
        const userId = res.locals.userId
        const resetCode = res.locals.resetCode
        const password = req.body.password
        try {
            const db = new DB()
            if (db.resetUserPassword(userId, resetCode, password)) {
                res.status(201).send('Updated')
                return
            }
        } catch (err) {
            if (err === SQLITE_ERRORS.RESETCODEEXPIRED) {
                res.status(403).json(err)
                return
            }
            if (err === SQLITE_ERRORS.USERNOTFOUND) {
                res.status(404).json(err)
                return
            } else {
                FudgedUp(res)
                return
            }
        }
    }
)
//#endregion

//#region Reminders

app.post(
    '/reminders',
    [
        validateAuthorizationJWT(),
        validateContent
    ],
    (req, res) => {
        const content = req.body.content
        const userId = res.locals.userId
        try {
            const db = new DB()
            const newReminder = db.addReminder(userId, content)
            res.status(201).json(newReminder)
        } catch (err) {
            FudgedUp(res)
        }
    }
)

app.get(
    '/reminders',
    [
        validateAuthorizationJWT()
    ],
    (req, res) => {
        const userId = res.locals.userId
        try {
            const db = new DB()
            const reminders = db.getUserReminders(userId)
            res.status(200).json(reminders)
        } catch (err) {
            FudgedUp(res)
        }
    }
)

app.get(
    '/reminders/:reminderId',
    [
        validateAuthorizationJWT(),
        validateReminderId
    ],
    (req, res) => {
        const reminderId = req.params.reminderId
        const userId = res.locals.userId
        try {
            const db = new DB()
            const reminder = db.getUserReminder(userId, reminderId)
            res.status(200).json(reminder)
        } catch (err) {
            if (err === SQLITE_ERRORS.REMINDERNOTFOUND) {
                NotFound(res)
            } else {
                FudgedUp(res)
            }
        }
    }
)

app.patch(
    '/reminders/:reminderId',
    [
        validateAuthorizationJWT(),
        validateReminderId,
        validateContent
    ],
    (req, res) => {
        const reminderId = req.params.reminderId
        const userId = res.locals.userId
        const content = req.body.content
        try {
            const db = new DB()
            const updatedRow = db.updateUserReminder(content, userId, reminderId)
            res.status(200).json(updatedRow)
        } catch (err) {
            if (err === SQLITE_ERRORS.REMINDERNOTFOUND) {
                NotFound(res)
            } else {
                FudgedUp(res)
            }
        }
    }
)

app.delete(
    '/reminders/:reminderId',
    [
        validateAuthorizationJWT(),
        validateReminderId
    ],
    (req, res) => {
        const reminderId = req.params.reminderId
        const userId = res.locals.userId
        try {
            const db = new DB()
            db.deleteUserReminder(userId, reminderId)
            OK(res)
        } catch (err) {
            FudgedUp(res)
        }
    }
)
//#endregion

function sendBatch() {
    const { prepareMail } = require('./sendgrid')
    try {
        const db = new DB()
        const users = db.getAllUsers()
        for (const user of users) {
            const reminders = db.getUserReminders(user.id)
            if (reminders?.length) {
                prepareMail(user.email, reminders)?.send?.()
            }
        }
    } catch (err) {
        console.error("Hey, something happened... Is someone there? It's cold in here...")
        throw err
    }
}

app.post('/sendMail', (req, res) => {
    try {
        sendBatch()
    } catch (err) {
        FudgedUp(res)
        return;
    }
    OK(res)
})

let intervalId
let delay = undefined
app.post('/start', (req, res) => {
    const parsedDelay = parseInt(req.body.delay)
    if (parsedDelay) {
        delay = parsedDelay
        intervalId = setInterval(() => {
            try {
                sendBatch()
            } catch (err) {
                console.error("Everything is fine ...")
                clearInterval(intervalId)
                delay = undefined
                intervalId = undefined
                return;
            }
        }, delay)
        res.status(202).send('Service started. Next batch at ' + new Date(Date.now() + parsedDelay).toTimeString())
    } else {
        BadRequest(res)
        return;
    }
})

app.get('/stop', (req, res) => {
    delay = undefined
    clearInterval(intervalId)
    intervalId = undefined
    res.status(200).send('Automatic mail service stopped')
})

app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
})