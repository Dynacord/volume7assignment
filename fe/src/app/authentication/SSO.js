import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { sso } from '../../engine/service'
export default function SSO() {
    const [ssoSucceed, setSsoSucceed] = useState()
    useEffect(() => {
        const doSso = async () => {
            const { err, response } = await sso()
            if (!err && response) {
                setSsoSucceed(true)
            } else {
                setSsoSucceed(false)
            }
        }
        doSso()
    }, [])

    return (
        <div>
            {ssoSucceed === true && <Redirect to="/dashboard" />}
            {ssoSucceed === false && <Redirect to="/signup" />}
        </div>
    )
}