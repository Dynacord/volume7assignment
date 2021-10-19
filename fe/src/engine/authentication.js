import { prepare, BE_URL } from './service'

export async function signup(email, password) {
    const url = `${BE_URL}/signup`
    const requestBody = { email, password }
    try {
        return await prepare(url, 'POST', requestBody).call()
    } catch (err) {
        return { err }
    }
}

export async function sso() {
    const url = `${BE_URL}/sso`
    try {
        return await prepare(url, 'GET').call()
    } catch (err) {
        return { err }
    }
}

export async function login(email, password) {
    const url = `${BE_URL}/login`
    const requestBody = {
        email, password
    }
    try {
        return await prepare(url, 'POST', requestBody).call()
    } catch (err) {
        return { err }
    }
}

export async function logout() {
    const url = `${BE_URL}/logout`
    try {
        return await prepare(url, 'DELETE').call()
    } catch (err) {
        return { err }
    }
}

export async function reset(password, jwt) {
    const url = `${BE_URL}/reset`
    const requestBody = { password }
    try {
        return await prepare(url, 'POST', requestBody, {
            Authorization: `Bearer ${jwt}`
        }).call()
    } catch (err) {
        return { err }
    }
}