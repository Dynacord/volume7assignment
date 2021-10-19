const jwt = require('jsonwebtoken')
const TYPES = {
    AUTHORIZATION: {
        name: 'AUTHORIZATION',
        expiresIn: '1d',
        key: 'VmYq3t6w9z$B&E)H@McQfTjWnZr4u7x!'
    },
    RESET: {
        name: 'RESET',
        expiresIn: '1h',
        key: 'cd4b0dcbe0f4538b979fb73664f51abe'
    }
}
function sign(payload, typeEnum) {
    const type = TYPES[typeEnum]
    if (type) {
        return jwt.sign(payload, type.key, {
            expiresIn: type.expiresIn,
            algorithm: 'HS256'
        })
    }
}

function verify(token, type_enum) {
    const type = TYPES[type_enum]
    if (token) {
        return jwt.verify(token, type.key, {
            algorithms: 'HS256'
        })
    }
}

function refresh(token, type_enum) {
    const type = TYPES[type_enum]
    if (token) {
        try {
            const payload = jwt.verify(token, type.key, {
                algorithms: 'HS256'
            })
            delete payload.iat
            delete payload.exp
            return sign(payload, type_enum)
        } catch (err) { }
    }
}

module.exports = { sign, verify, refresh, TYPES }