import { prepare, BE_URL } from './service'

export async function getUserReminders() {
    const url = `${BE_URL}/reminders`
    try {
        return await prepare(url, 'GET').call()
    } catch (err) {
        return { err }
    }
}

export async function deleteReminder(id) {
    const url = `${BE_URL}/reminders/${id}`
    try {
        return await prepare(url, 'DELETE').call()
    } catch (err) {
        return { err }
    }
}

export async function createReminder(content) {
    const url = `${BE_URL}/reminders`
    const requestBody = { content }
    try {
        return await prepare(url, 'POST', requestBody).call()
    } catch (err) {
        return { err }
    }
}

export async function updateReminder(id, content) {
    const url = `${BE_URL}/reminders/${id}`
    const requestBody = { content }
    try {
        return await prepare(url, 'PATCH', requestBody).call()
    } catch (err) {
        return { err }
    }
}