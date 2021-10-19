import React, { useEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import {
    Button,
    Card, CardContent, CardHeader
} from '@mui/material'
import Password from '../../components/authentication/Password';
import { Link } from 'react-router-dom';
import { reset } from '../../engine/service'
import './authentication.css';

export default function ResetForm(props) {
    const { jwt } = useParams()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [success, setSuccess] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [redirect, setRedirect] = useState(false)
    const [submitDisabled, setSubmitDisabled] = useState(true)

    useEffect(() => {
        if (!jwt) {
            setRedirect(true)
        }
    }, [])

    useEffect(() => {
        setSubmitDisabled(
            (confirmPassword !== password) ||
            !confirmPassword ||
            !password
        )
    }, [confirmPassword, password])

    useEffect(() => {
        setErrorMessage(submitDisabled ? 'The passwords must match!' : '')
    }, [submitDisabled])

    const onConfirmPasswordChange = (e) => {
        setConfirmPassword(e.currentTarget.value)
    }

    const onSubmit = async (e) => {
        // sanity check
        if (confirmPassword !== password) {
            setSubmitDisabled(true)
            return
        }
        const { err, response } = await reset(password, jwt)
        if (!err && response) {
            setSuccess(true)
            setSuccessMessage("The password has been successfully changed. You can now log in using the new password.")
        } else {
            if (err.status === 401 && !err.message) {
                setErrorMessage("The reset token has expired")
                return
            }
            setErrorMessage(err.message)
        }
    }

    return (
        <div>
            {redirect && <Redirect to="/signup" />}
            <Card raised={true}>
                <CardHeader title="Reset Password" />
                <CardContent classes={{ root: 'form' }} >
                    {errorMessage && <span id="error_message">{errorMessage}</span>}
                    {successMessage && <span id="success_message">{successMessage}</span>}
                    <Password value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
                    <Password value={confirmPassword} onChange={onConfirmPasswordChange} label="confirm password" />
                    <div className="buttons_container">
                        {!success && <Button variant="contained" onClick={onSubmit} disabled={submitDisabled}>Submit</Button>}
                        {success &&
                            <Button variant="contained" className='button_link'>
                                <Link to="/login" className='link_button'>Go to Login</Link>
                            </Button>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}