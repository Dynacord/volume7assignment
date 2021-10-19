export const BE_URL = 'http://localhost:3001'

export function getSession() {
    const sCookie = document.cookie
    const oCookie = sCookie.split(';').reduce((acc, current) => {
        const [key, value] = current.split('=')
        acc[key] = value
        return acc
    }, {})
    return oCookie.SESSION
}

export function call(request) {
    return fetch(request).then(async res => {
        const contentType = res.headers.get('content-type')
        let body
        if (contentType.includes('application/json')) body = await res.json()
        else body = await res.text()
        let err, response
        err = res.ok ? undefined : {
            code: body.code,
            message: body.message,
            status: res.status,
            statusText: res.statusText
        }
        response = !res.ok ? undefined : {
            status: res.status,
            statusText: res.statusText,
            body
        }

        return {
            err,
            response
        }
    })
}

export function prepare(url, method, body, headers = {}) {
    const lBody = typeof body === "object" ? JSON.stringify(body) : body
    const session = getSession()
    if (session) {
        headers['authorization'] = `Bearer ${session}`
    }
    if (!headers['content-type'] && typeof body === 'object') {
        headers['content-type'] = 'application/json'
    }

    const request = new Request(url, {
        method,
        body: lBody,
        headers,
        credentials: 'include'
    })

    return { call: call.bind(null, request) }
}

export * from './authentication'
export * from './reminders'